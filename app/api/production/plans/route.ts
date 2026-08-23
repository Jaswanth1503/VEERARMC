import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ProductionService } from "@/lib/production/services/production.service";
import { CreateProductionPlanSchema } from "@/lib/production/validations/production.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const plantId = searchParams.get("plantId") || undefined;
    const concreteGrade = searchParams.get("concreteGrade") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const plans = await ProductionService.getProductionPlans({
      status,
      plantId,
      concreteGrade,
      startDate,
      endDate
    });

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error("[GET /api/production/plans] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch production plans" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    const validated = CreateProductionPlanSchema.parse(body);

    const plan = await ProductionService.createProductionPlan(
      validated,
      session?.fullName || "Plant Manager"
    );

    return NextResponse.json({ plan, message: "Production plan scheduled and mixer batches generated." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/production/plans] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create production plan" }, { status: 400 });
  }
}
