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
    const body = await request.json().catch(() => ({}));

    const acceptedBy = session?.userId || body.acceptedBy || "Customer";
    const acceptedQuote = await QuoteService.acceptQuote(id, acceptedBy);

    return NextResponse.json({ quote: acceptedQuote });
  } catch (error: any) {
    console.error("[POST /api/quotes/[id]/accept] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to accept quotation" }, { status: 400 });
  }
}
