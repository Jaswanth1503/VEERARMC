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

    const submitted = await OrderService.submitOrder(
      id,
      session?.userId,
      session?.fullName || "Customer Client"
    );

    return NextResponse.json({ order: submitted, message: "Order submitted for operational review." });
  } catch (error: any) {
    console.error("[POST /api/orders/[id]/submit] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit order" }, { status: 400 });
  }
}
