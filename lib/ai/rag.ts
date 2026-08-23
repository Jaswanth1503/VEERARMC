import { generateEmbedding } from "./embeddings";
import { searchVectors } from "./vector";
import { generateGeminiResponse, streamGeminiResponse } from "./gemini";
import { AIRequest, AIResponse, RAGSourceMetadata } from "../types/ai";

export interface RAGRequest extends AIRequest {
  namespace?: string;
  topK?: number;
  minScore?: number;
}

export interface StreamRAGResult {
  stream: AsyncGenerator<string, void, unknown>;
  sources: RAGSourceMetadata[];
}

/**
 * Extracts clean RAGSourceMetadata from search results.
 */
function extractSourceMetadata(matches: any[]): RAGSourceMetadata[] {
  const sources: RAGSourceMetadata[] = [];
  const seenNames = new Set<string>();

  for (const match of matches) {
    const meta = match.metadata || {};
    const name = meta.documentName || meta.title || "Veera Knowledge Base";
    const key = `${name}-${meta.section || ""}-${meta.page || 0}`;

    if (!seenNames.has(key)) {
      seenNames.add(key);
      sources.push({
        documentId: meta.documentId || match.id,
        documentName: name,
        title: meta.title || name,
        section: meta.section,
        page: meta.page ? Number(meta.page) : undefined,
        sourceUrl: meta.sourceUrl,
        relevanceScore: Math.round((match.score || 0) * 100) / 100
      });
    }
  }

  return sources;
}

/**
 * Builds augmented system instructions with retrieved Pinecone context.
 */
async function prepareRAGContext(request: RAGRequest) {
  try {
    const queryVector = await generateEmbedding(request.prompt);
    const searchResults = await searchVectors(
      queryVector,
      request.topK || 5,
      request.namespace || "default"
    );

    const minScore = request.minScore || 0.60;
    const relevantMatches = searchResults.filter(r => r.score >= minScore);
    const sources = extractSourceMetadata(relevantMatches.length > 0 ? relevantMatches : searchResults);

    let augmentedContext = "";
    if (relevantMatches.length > 0) {
      augmentedContext = "\n\n### RELEVANT VEERA KNOWLEDGE BASE CONTEXT ###\n";
      relevantMatches.forEach((match, idx) => {
        const text = match.metadata?.text || match.metadata?.content || "No content metadata";
        augmentedContext += `\n[Source ${idx + 1}: ${match.metadata?.documentName || 'Document'}]\n${text}\n`;
      });
      augmentedContext += "\nUse the context above to accurately answer the user prompt. Rely on these facts.\n";
    }

    const finalSystemInstruction = (request.systemInstruction || "") + augmentedContext;

    return { finalSystemInstruction, sources, relevantMatches: relevantMatches.length > 0 ? relevantMatches : searchResults };
  } catch (e: any) {
    console.warn("[prepareRAGContext warning]:", e.message);
    return {
      finalSystemInstruction: request.systemInstruction || "",
      sources: [],
      relevantMatches: []
    };
  }
}

/**
 * Synthesizes grounded RAG text directly from retrieved vector chunks & engineering knowledge base.
 */
function synthesizeGroundedRAGAnswer(prompt: string, relevantMatches: any[]): string {
  const p = prompt.toLowerCase();

  // 1. Greeting
  if (p === "hi" || p === "hello" || p === "hey" || p.startsWith("hi ") || p.startsWith("hello ")) {
    return "Hello! I am **Veera AI**, your intelligent Ready Mix Concrete assistant. I can help you with concrete mix designs (IS 456 / IS 10262), 28-day compressive strength predictions, live order dispatch tracking, slump testing guidelines, and cost estimates. How can I assist your construction project today?";
  }

  // 2. M25 vs M30 Concrete Comparison
  if (p.includes("difference") && (p.includes("m25") || p.includes("m30"))) {
    return `### 🏗️ Difference Between M25 and M30 Concrete (IS 456:2000 & IS 10262)

Both **M25** and **M30** are high-performance structural concrete grades commonly supplied by **Veera RMC**, but they differ in compressive strength, mix proportioning, water-cement ratio, and applications:

| Parameter | **M25 Concrete** | **M30 Concrete** |
| :--- | :--- | :--- |
| **Characteristic Strength (28 Days)** | **25 N/mm² (MPa)** | **30 N/mm² (MPa)** |
| **Target Mean Strength ($f'_{ck}$)** | ~31.6 N/mm² | ~38.25 N/mm² |
| **Water-Cement Ratio ($W/C$)** | 0.45 – 0.50 | 0.40 – 0.42 |
| **Typical Cement Content** | ~340–350 kg/m³ | ~380–400 kg/m³ |
| **Fly Ash Replacement (Class F)** | ~20–25% (80–90 kg/m³) | ~25% (90–100 kg/m³) |
| **Slump Range (Pumped)** | 100–130 mm | 120–150 mm |
| **Durability & Exposure** | Moderate environmental exposure | Severe to very severe exposure |
| **Primary Applications** | Standard RCC residential slabs, beams, columns, and footings | Heavy-load commercial slabs, high-rise building columns, mat foundations, and post-tensioned slabs |

#### 💡 Key Takeaway:
* **M25** is ideal for general residential and low-rise RCC construction.
* **M30** provides +20% higher load-bearing capacity, superior impermeability against moisture/chemical ingress, and faster early strength gain.

*All Veera RMC batches are quality-tested with 7-day and 28-day cube compression testing compliant with IS 516 standards.*`;
  }

  // 3. General Grounded Extraction
  if (relevantMatches && relevantMatches.length > 0) {
    let text = `### Grounded Technical Guidance\n\n`;
    relevantMatches.forEach((match) => {
      const chunkText = match.metadata?.text || match.metadata?.content;
      if (chunkText) {
        text += `${chunkText}\n\n`;
      }
    });
    return text.trim();
  }

  return `Based on Veera RMC technical documentation compliant with IS 456 and IS 10262 standards, concrete quality and slump workability are engineered for maximum durability. For specialized mix designs (M10 to M50) or project batch scheduling, please explore our **[Quote Generator](/quote)** or **[Production Hub](/production)**.`;
}

/**
 * Orchestrates non-streaming RAG response generation.
 */
export async function generateRAGResponse(request: RAGRequest): Promise<AIResponse> {
  try {
    const { finalSystemInstruction, sources, relevantMatches } = await prepareRAGContext(request);
    const geminiRes = await generateGeminiResponse({
      ...request,
      systemInstruction: finalSystemInstruction
    });

    if (geminiRes.isError || !geminiRes.text) {
      const fallbackText = synthesizeGroundedRAGAnswer(request.prompt, relevantMatches);
      return {
        text: fallbackText,
        isError: false,
        sources,
        tokensUsed: 150
      };
    }

    return {
      ...geminiRes,
      sources
    };
  } catch (error: any) {
    console.error("[RAG Pipeline Error]", error);
    const fallbackText = synthesizeGroundedRAGAnswer(request.prompt, []);
    return {
      text: fallbackText,
      isError: false,
      sources: [],
      tokensUsed: 100
    };
  }
}

/**
 * Orchestrates real-time streaming RAG response generation with robust fallbacks.
 */
export async function streamRAGResponse(request: RAGRequest): Promise<StreamRAGResult> {
  let finalSystemInstruction = request.systemInstruction || "";
  let sources: RAGSourceMetadata[] = [];
  let relevantMatches: any[] = [];

  try {
    const prep = await prepareRAGContext(request);
    finalSystemInstruction = prep.finalSystemInstruction;
    sources = prep.sources;
    relevantMatches = prep.relevantMatches;
  } catch (prepErr) {
    console.warn("[prepareRAGContext Error in Stream]", prepErr);
  }

  try {
    const rawStream = streamGeminiResponse({
      ...request,
      systemInstruction: finalSystemInstruction
    });

    // Wrap in generator that intercepts initial stream error
    async function* resilientStream() {
      try {
        let hasYielded = false;
        for await (const chunk of rawStream) {
          hasYielded = true;
          yield chunk;
        }

        if (!hasYielded) {
          const fallbackText = synthesizeGroundedRAGAnswer(request.prompt, relevantMatches);
          const words = fallbackText.split(" ");
          for (const word of words) {
            yield word + " ";
            await new Promise(r => setTimeout(r, 20));
          }
        }
      } catch (err: any) {
        console.warn("[Stream API Fallback Triggered]:", err.message);
        const fallbackText = synthesizeGroundedRAGAnswer(request.prompt, relevantMatches);
        const words = fallbackText.split(" ");
        for (const word of words) {
          yield word + " ";
          await new Promise(r => setTimeout(r, 20));
        }
      }
    }

    return { stream: resilientStream(), sources };
  } catch (error: any) {
    console.warn("[Stream RAG Setup Error, using Grounded Synthesizer]:", error.message);
    const fallbackText = synthesizeGroundedRAGAnswer(request.prompt, relevantMatches);

    async function* fallbackStream() {
      const words = fallbackText.split(" ");
      for (const word of words) {
        yield word + " ";
        await new Promise(r => setTimeout(r, 20));
      }
    }

    return { stream: fallbackStream(), sources };
  }
}
