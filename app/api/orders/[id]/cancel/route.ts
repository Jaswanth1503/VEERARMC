import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { OrderService } from "@/lib/orders/services/order.service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await request.json().catch(() => ({}));

    const cancelled = await OrderService.cancelOrder(
      id,
      session?.userId,
      session?.fullName,
      body.reason || "Cancelled by client request"
    );

    return NextResponse.json({ order: cancelled, message: "Order cancelled successfully." });
  } catch (error: any) {
    console.error("[POST /api/orders/[id]/cancel] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to cancel order" }, { status: 400 });
  }
}
