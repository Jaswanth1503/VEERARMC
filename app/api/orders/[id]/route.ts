import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { OrderService } from "@/lib/orders/services/order.service";
import { UpdateOrderSchema } from "@/lib/orders/validations/order.schema";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await OrderService.getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("[GET /api/orders/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch order details" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await request.json();

    const validated = UpdateOrderSchema.parse(body);

    const updated = await OrderService.updateOrder(
      id,
      validated,
      session?.userId,
      session?.fullName
    );

    return NextResponse.json({ order: updated, message: "Order updated successfully." });
  } catch (error: any) {
    console.error("[PUT /api/orders/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const cancelled = await OrderService.cancelOrder(
      id,
      session?.userId,
      session?.fullName,
      "Order cancelled via API"
    );

    return NextResponse.json({ order: cancelled, message: "Order cancelled successfully." });
  } catch (error: any) {
    console.error("[DELETE /api/orders/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to cancel order" }, { status: 400 });
  }
}
