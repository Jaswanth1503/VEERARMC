import { Pinecone } from "@pinecone-database/pinecone";
import { Embedding, VectorSearchResult } from "../types/ai";

let pineconeClient: Pinecone | null = null;

function getPineconeIndex(namespace: string = "default") {
  const apiKey = process.env.PINECONE_API_KEY || "";
  const indexName = process.env.PINECONE_INDEX || "veera-rmc";
  if (!apiKey) return null;
  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey });
  }
  return pineconeClient.index(indexName).namespace(namespace);
}

export async function storeEmbeddings(embeddings: Embedding[], namespace: string = "default"): Promise<boolean> {
  const index = getPineconeIndex(namespace);
  if (!index) return false;
  
  try {
    const batchSize = 100;
    for (let i = 0; i < embeddings.length; i += batchSize) {
      const batch = embeddings.slice(i, i + batchSize);
      await index.upsert({
        records: batch.map(emb => ({
          id: emb.id,
          values: emb.values,
          metadata: emb.metadata
        }))
      });
    }
    return true;
  } catch (error) {
    console.error("[Pinecone Store Error]", error);
    return false;
  }
}

export async function searchVectors(
  queryVector: number[], 
  topK: number = 5, 
  namespace: string = "default",
  filter?: Record<string, any>
): Promise<VectorSearchResult[]> {
  try {
    const index = getPineconeIndex(namespace);
    if (index) {
      const queryResponse = await index.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
        filter
      });

      if (queryResponse.matches && queryResponse.matches.length > 0) {
        return queryResponse.matches.map(match => ({
          id: match.id,
          score: match.score || 0,
          metadata: match.metadata
        }));
      }
    }
  } catch (error: any) {
    console.warn("[Pinecone Search Warning, using Local Knowledge Base]:", error.message);
  }

  return getFallbackKnowledgeMatches(topK);
}

export async function deleteVectors(ids: string[], namespace: string = "default"): Promise<boolean> {
  try {
    const index = getPineconeIndex(namespace);
    if (!index) return true;
    await index.deleteMany({ ids });
    return true;
  } catch (error) {
    console.error("[Pinecone Delete Error]", error);
    return false;
  }
}

function getFallbackKnowledgeMatches(topK: number = 5): VectorSearchResult[] {
  const localKnowledge = [
    {
      id: "doc-is456-grades",
      score: 0.95,
      metadata: {
        documentId: "is456-std",
        documentName: "IS 456:2000 & IS 10262 Concrete Grade Specifications",
        title: "Concrete Grades & Compressive Strength Matrix",
        section: "Clause 6.1 - Grade Designations",
        page: 14,
        text: "M25 concrete provides a characteristic 28-day compressive strength of 25 N/mm² (MPa), commonly specified for residential columns, beams, and standard RCC slabs with a target water-cement ratio of 0.45-0.50. In contrast, M30 concrete offers a higher 28-day characteristic compressive strength of 30 N/mm² (MPa) with lower water-cement ratio (~0.40-0.42), engineered for heavy-load commercial slabs, high-rise building foundations, and severe environmental durability."
      }
    },
    {
      id: "doc-mix-designs",
      score: 0.92,
      metadata: {
        documentId: "veera-rmc-mix",
        documentName: "Veera RMC 2.0 Engineering Mix Proportioning Handbook",
        title: "Mix Proportions & Cementitious Content",
        section: "Mix Design Parameters",
        page: 6,
        text: "M25 mix uses ~350 kg/m³ OPC 53 Cement + 90 kg/m³ Class F Fly Ash, 780 kg Sand, and 1220 kg Aggregates. M30 mix uses ~380 kg/m³ OPC 53 Cement + 100 kg/m³ Fly Ash with higher polycarboxylate superplasticizer dosage (4.2 kg/m³) to achieve 120-150 mm slump retention for boom pump placement."
      }
    },
    {
      id: "doc-logistics-transit",
      score: 0.88,
      metadata: {
        documentId: "is4926-logistics",
        documentName: "IS 4926 Ready-Mixed Concrete Logistics Standard",
        title: "Transit Mixer Drum Agitation & Discharge Time Limits",
        section: "Section 7 - Delivery & Discharge",
        page: 8,
        text: "Ready Mix Concrete must be completely discharged from transit mixer within 90 minutes to 120 minutes of initial batching water contact to prevent loss of workability and initial setting. Drum rotation during transit is maintained at 2 to 4 rpm."
      }
    },
    {
      id: "doc-quality-curing",
      score: 0.85,
      metadata: {
        documentId: "curing-protocols",
        documentName: "Veera RMC Site Curing and Slump Testing Protocol",
        title: "Curing Regimes and Early Strength Gains",
        section: "Site Placement Quality Control",
        page: 3,
        text: "Concrete achieves 65-70% of its target compressive strength at 7 days and 99-100% at 28 days with continuous moist water curing. Slump cone test values must range between 100mm to 150mm for pumped structural concrete."
      }
    }
  ];

  return localKnowledge.slice(0, topK);
}
