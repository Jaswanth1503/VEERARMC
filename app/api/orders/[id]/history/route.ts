import { NextRequest, NextResponse } from "next/server";
import { OrderAuditService } from "@/lib/orders/services/order-audit.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const history = await OrderAuditService.getOrderHistory(id);

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error("[GET /api/orders/[id]/history] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch order history" }, { status: 500 });
  }
}
