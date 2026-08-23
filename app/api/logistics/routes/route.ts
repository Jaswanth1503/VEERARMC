import { NextRequest, NextResponse } from "next/server";
import { LogisticsAIService } from "@/lib/logistics/services/logistics-ai.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const originPlant = body.originPlant || "Central Batching Plant (Hadapsar)";
    const destinationSite = body.destinationSite || "Pune Construction Jobsite";
    const distanceKm = Number(body.distanceKm) || 14.5;
    const concreteGrade = body.concreteGrade || "M25";

    const routeOptimization = await LogisticsAIService.optimizeRoute({
      originPlant,
      destinationSite,
      distanceKm,
      concreteGrade
    });

    return NextResponse.json({ route: routeOptimization });
  } catch (error: any) {
    console.error("[POST /api/logistics/routes] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to optimize route" }, { status: 500 });
  }
}
