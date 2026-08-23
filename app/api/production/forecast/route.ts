import { NextRequest, NextResponse } from "next/server";
import { ProductionAIService } from "@/lib/production/services/production-ai.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get("period") || "WEEKLY").toUpperCase() as "WEEKLY" | "MONTHLY";

    const forecast = await ProductionAIService.generateDemandForecast(period);

    return NextResponse.json({ forecast });
  } catch (error: any) {
    console.error("[GET /api/production/forecast] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate demand forecast" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const period = (body.period || "WEEKLY").toUpperCase() as "WEEKLY" | "MONTHLY";

    const forecast = await ProductionAIService.generateDemandForecast(period);

    return NextResponse.json({ forecast, message: "AI demand and material requirement forecast updated." });
  } catch (error: any) {
    console.error("[POST /api/production/forecast] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to run AI forecast" }, { status: 500 });
  }
}
