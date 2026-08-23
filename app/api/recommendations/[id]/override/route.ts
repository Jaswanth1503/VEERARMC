import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { RecommendationService } from "@/lib/services/recommendation.service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // deliveryPlanId
    const session = await getSession();
    const body = await request.json();

    if (!body.overrideReason) {
      return NextResponse.json({ error: "Override reason is required for dispatcher audit logging." }, { status: 400 });
    }

    const overriddenBy = session?.userId || body.overriddenBy || "Dispatcher";
    const updatedPlan = await RecommendationService.overrideDeliveryPlan(
      id,
      body.overrideReason,
      overriddenBy,
      body.newPlantId
    );

    return NextResponse.json({ plan: updatedPlan, message: "Delivery plan overridden successfully with audit reason logged." });
  } catch (error: any) {
    console.error("[POST /api/recommendations/[id]/override] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to override delivery plan" }, { status: 500 });
  }
}
