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
    const body = await request.json();

    if (!body.reason) {
      return NextResponse.json({ error: "Rejection reason is mandatory." }, { status: 400 });
    }

    const rejectorId = session?.userId || "00000000-0000-0000-0000-000000000001";
    const role = session?.role || "OPERATIONS_MANAGER";

    const rejected = await OrderService.rejectOrder(
      id,
      rejectorId,
      role,
      body.reason
    );

    return NextResponse.json({ order: rejected, message: "Order rejected." });
  } catch (error: any) {
    console.error("[POST /api/orders/[id]/reject] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to reject order" }, { status: 400 });
  }
}
