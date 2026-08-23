import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ConcreteExpertAgent } from "@/lib/agents/chatbot";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Request
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Payload
    const body = await request.json();
    const { prompt, history } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 3. Call Agent (Using Concrete Expert as default for this endpoint)
    const response = await ConcreteExpertAgent.ask(prompt, history || []);

    if (response.isError) {
      return NextResponse.json({ error: response.errorMessage }, { status: 500 });
    }

    return NextResponse.json({ 
      text: response.text,
      tokensUsed: response.tokensUsed 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[POST /api/ai/chat] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
