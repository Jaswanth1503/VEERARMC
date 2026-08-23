import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ConversationService } from "@/lib/services/conversations";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, rating, feedbackText } = body;

    if (!messageId || !rating || (rating !== "POSITIVE" && rating !== "NEGATIVE")) {
      return NextResponse.json({ error: "Invalid rating payload" }, { status: 400 });
    }

    const feedback = await ConversationService.submitFeedback(
      messageId,
      session.userId,
      rating,
      feedbackText
    );

    return NextResponse.json({ success: true, feedback }, { status: 200 });

  } catch (error: any) {
    console.error("[POST /api/ai/feedback] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
