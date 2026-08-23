import { NextRequest, NextResponse } from "next/server";
import { QuoteService } from "@/lib/services/quote.service";
import { QuotePDFService } from "@/lib/services/quote-pdf.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await QuoteService.getQuoteById(id);
    const htmlContent = QuotePDFService.generateQuotationHTML(quote);

    return new Response(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  } catch (error: any) {
    console.error("[GET /api/quotes/[id]/pdf] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to render PDF" }, { status: 500 });
  }
}
