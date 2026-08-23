import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { OrderService } from "@/lib/orders/services/order.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    if (!body.quoteId) {
      return NextResponse.json({ error: "Quote ID is required" }, { status: 400 });
    }

    const userId = session?.userId || "00000000-0000-0000-0000-000000000000";
    const userName = session?.fullName || "Valued Client";

    const order = await OrderService.convertQuoteToOrder(body.quoteId, userId, userName);

    return NextResponse.json({ order, message: "Quotation successfully converted to Order with AI risk intelligence." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/orders/from-quote] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to convert quote to order" }, { status: 400 });
  }
}
