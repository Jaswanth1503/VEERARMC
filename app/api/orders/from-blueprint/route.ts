import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { OrderService } from "@/lib/orders/services/order.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    if (!body.analysisId) {
      return NextResponse.json({ error: "Blueprint Analysis ID is required" }, { status: 400 });
    }

    const userId = session?.userId || "00000000-0000-0000-0000-000000000000";
    const userName = session?.fullName || "Site Engineer";

    const order = await OrderService.convertBlueprintToOrder(
      body.analysisId,
      userId,
      userName,
      body.overrides
    );

    return NextResponse.json({ order, message: "Order drafted directly from Blueprint Structural Analysis." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/orders/from-blueprint] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to convert blueprint to order" }, { status: 400 });
  }
}
