import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { searchVectors } from "@/lib/ai/vector";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { query, topK = 5, namespace = "default" } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Generate query embedding
    const queryVector = await generateEmbedding(query);

    // 2. Search Pinecone
    const matches = await searchVectors(queryVector, topK, namespace);

    return NextResponse.json({ matches }, { status: 200 });

  } catch (error: any) {
    console.error("[POST /api/ai/search] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
