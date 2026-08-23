import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ProductionService } from "@/lib/production/services/production.service";
import { UpdateProductionPlanSchema } from "@/lib/production/validations/production.schema";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await ProductionService.getProductionPlanById(id);

    if (!plan) {
      return NextResponse.json({ error: "Production plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("[GET /api/production/plans/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch production plan" }, { status: 500 });
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

    const validated = UpdateProductionPlanSchema.parse(body);

    const updated = await ProductionService.updatePlanStatus(
      id,
      validated.status as any,
      session?.fullName || "Plant Operator",
      validated.notes
    );

    return NextResponse.json({ plan: updated, message: "Production plan status updated." });
  } catch (error: any) {
    console.error("[PUT /api/production/plans/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update production plan" }, { status: 400 });
  }
}
