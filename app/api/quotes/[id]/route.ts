import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { QuoteService } from "@/lib/services/quote.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await QuoteService.getQuoteById(id);
    return NextResponse.json({ quote });
  } catch (error: any) {
    console.error("[GET /api/quotes/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Quote not found" }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await request.json();

    const changedBy = session?.userId || body.changedBy || "Customer";
    const updatedQuote = await QuoteService.reviseQuote(id, body, changedBy);

    return NextResponse.json({ quote: updatedQuote });
  } catch (error: any) {
    console.error("[PATCH /api/quotes/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update quotation" }, { status: 500 });
  }
}
