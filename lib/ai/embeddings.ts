import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates an embedding vector for a given text string.
 * Uses Google's text-embedding-004 model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY || "";

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await model.embedContent(text);
      if (result.embedding?.values) {
        return result.embedding.values;
      }
    } catch (error: any) {
      console.warn("[Embedding API Warning]", error?.message || error);
    }
  }

  // Fallback: Generate deterministic 768-dimensional vector if API key is restricted or offline
  return generateDeterministicMockVector(text, 768);
}

function generateDeterministicMockVector(text: string, dimensions: number = 768): number[] {
  const vector: number[] = new Array(dimensions);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let i = 0; i < dimensions; i++) {
    const val = Math.sin(hash + i) * Math.cos((hash >> 2) + i);
    vector[i] = val;
  }

  // Normalize
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map(v => v / norm);
}

/**
 * Generates embeddings for multiple text strings in parallel.
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    
    // Batch embeddings to optimize network calls
    const result = await model.batchEmbedContents({
      requests: texts.map((t) => ({
        content: { role: "user", parts: [{ text: t }] },
      })),
    });

    return result.embeddings.map(e => e.values);
  } catch (error: any) {
    console.error("[Batch Embedding Error]", error);
    throw new Error(error.message || "Failed to generate batch embeddings.");
  }
}
