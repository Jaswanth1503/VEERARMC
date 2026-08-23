import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { OrderService } from "@/lib/orders/services/order.service";
import { OrderApprovalSchema } from "@/lib/orders/validations/order.schema";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await request.json().catch(() => ({}));

    const approverId = session?.userId || "00000000-0000-0000-0000-000000000001";
    const role = session?.role || body.role || "OPERATIONS_MANAGER";

    const approved = await OrderService.approveOrder(
      id,
      approverId,
      role,
      body.comments || "Order approved by operations management."
    );

    return NextResponse.json({ order: approved, message: "Order approved for batching and dispatch." });
  } catch (error: any) {
    console.error("[POST /api/orders/[id]/approve] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to approve order" }, { status: 400 });
  }
}
