import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { QuoteService } from "@/lib/services/quote.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const userId = session?.userId || "customer-session-user";

    const order = await QuoteService.convertQuoteToOrder(id, userId);

    return NextResponse.json({ order, message: "Quotation successfully converted to Order." });
  } catch (error: any) {
    console.error("[POST /api/quotes/[id]/convert] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to convert quote to order" }, { status: 400 });
  }
}
