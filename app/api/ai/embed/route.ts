import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateEmbeddingsBatch } from "@/lib/ai/embeddings";
import { storeEmbeddings } from "@/lib/ai/vector";
import { DocumentParser } from "@/lib/ai/parser";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    // Only Admins should be allowed to upload documents to the global knowledge base
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { text, namespace = "default", metadata = {} } = body;

    if (!text) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 });
    }

    // 1. Chunk Text
    const chunks = DocumentParser.chunkText(text);

    // 2. Generate Embeddings for chunks
    const vectors = await generateEmbeddingsBatch(chunks);

    // 3. Format for Pinecone
    const pineconeRecords = vectors.map((v, i) => ({
      id: crypto.randomUUID(),
      values: v,
      metadata: {
        ...metadata,
        text: chunks[i],
        chunkIndex: i
      }
    }));

    // 4. Store in Vector DB
    await storeEmbeddings(pineconeRecords, namespace);

    return NextResponse.json({ 
      success: true, 
      chunksProcessed: chunks.length 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[POST /api/ai/embed] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
