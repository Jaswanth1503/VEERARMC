import { NextRequest, NextResponse } from "next/server";
import { QuoteService } from "@/lib/services/quote.service";
import { QuoteEmailService } from "@/lib/services/quote-email.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const quote = await QuoteService.getQuoteById(id);

    const result = await QuoteEmailService.sendQuoteEmail(quote, body.recipientEmail);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[POST /api/quotes/[id]/send] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to send quote email" }, { status: 500 });
  }
}
