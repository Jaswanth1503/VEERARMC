import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { OrderService } from "@/lib/orders/services/order.service";
import { CreateOrderSchema } from "@/lib/orders/validations/order.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get("status") || undefined;
    const customerId = searchParams.get("customerId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const concreteGrade = searchParams.get("concreteGrade") || undefined;
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await OrderService.getOrders({
      status,
      customerId,
      projectId,
      concreteGrade,
      search,
      startDate,
      endDate,
      page,
      limit,
      userId: session?.userId,
      role: session?.role
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[GET /api/orders] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    const validated = CreateOrderSchema.parse(body);

    const customerId = validated.customerId || session?.userId || "00000000-0000-0000-0000-000000000000";

    const order = await OrderService.createOrder({
      ...validated,
      customerId
    }, session?.fullName || "Enterprise Client", session?.role || "CUSTOMER");

    return NextResponse.json({ order, message: "Order placed and AI risk analysis generated successfully." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/orders] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 400 });
  }
}
