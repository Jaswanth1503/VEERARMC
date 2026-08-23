import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ConversationService } from "@/lib/services/conversations";
import { AIService } from "@/lib/services/ai.service";
import { SystemPrompts } from "@/lib/ai/prompts";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { prompt, conversationId: requestedConvId } = body;

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const userId = session?.userId;
    let convId = requestedConvId;
    let isFirstMessage = false;
    let history: any[] = [];

    // Safe conversation persistence attempt (non-blocking if database is unavailable)
    if (userId) {
      try {
        if (!convId) {
          const newConv = await ConversationService.createConversation(userId);
          convId = newConv.id;
          isFirstMessage = true;
        } else {
          const existingConv = await ConversationService.getConversationWithMessages(convId, userId);
          if (existingConv.messages.length === 0) {
            isFirstMessage = true;
          }
        }

        await ConversationService.saveMessage(convId, 'user', prompt);

        const activeConv = await ConversationService.getConversationWithMessages(convId, userId);
        history = activeConv.messages.slice(-10).map(m => ({
          role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
          content: m.content
        }));
      } catch (dbErr: any) {
        console.warn("[Conversation Persistence Warning, continuing stream]:", dbErr.message);
      }
    }

    // Initiate RAG & Stream
    const { stream, sources } = await AIService.streamKnowledgeBase({
      prompt,
      history: history.length > 1 ? history.slice(0, -1) : [],
      systemInstruction: SystemPrompts.VEERA_AI_MAIN,
      topK: 5,
      temperature: 0.3
    });

    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        let fullText = "";

        const metaEvent = `event: metadata\ndata: ${JSON.stringify({ conversationId: convId || null, sources })}\n\n`;
        controller.enqueue(encoder.encode(metaEvent));

        try {
          for await (const chunk of stream) {
            fullText += chunk;
            const tokenEvent = `event: token\ndata: ${JSON.stringify({ token: chunk })}\n\n`;
            controller.enqueue(encoder.encode(tokenEvent));
          }

          if (convId) {
            ConversationService.saveMessage(convId, 'assistant', fullText, sources).catch(() => {});
            if (isFirstMessage) {
              ConversationService.generateAutoTitle(convId, prompt).catch(() => {});
            }
          }

          const doneEvent = `event: done\ndata: ${JSON.stringify({ conversationId: convId || null, fullText })}\n\n`;
          controller.enqueue(encoder.encode(doneEvent));
          controller.close();

        } catch (streamError: any) {
          console.error("[Streaming Error]", streamError);
          const errorEvent = `event: error\ndata: ${JSON.stringify({ message: "AI response generation error." })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
          controller.close();
        }
      }
    });

    return new Response(customReadable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
      }
    });

  } catch (error: any) {
    console.error("[POST /api/ai/chat/stream] Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
