import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ConversationService } from "@/lib/services/conversations";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await ConversationService.getUserConversations(session.userId);
    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("[GET /api/ai/conversations] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const conversation = await ConversationService.createConversation(session.userId, body.title);
    
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/ai/conversations] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
