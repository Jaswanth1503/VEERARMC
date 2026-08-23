import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { OrderService } from "@/lib/orders/services/order.service";
import { OrderCommentSchema } from "@/lib/orders/validations/order.schema";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await request.json();

    const validated = OrderCommentSchema.parse(body);

    const comment = await OrderService.addComment({
      orderId: id,
      userId: session?.userId || "00000000-0000-0000-0000-000000000000",
      userName: session?.fullName || body.userName || "User",
      userRole: session?.role || "CUSTOMER",
      message: validated.message,
      isInternal: validated.isInternal
    });

    return NextResponse.json({ comment, message: "Comment posted." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/orders/[id]/comment] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to add comment" }, { status: 400 });
  }
}
