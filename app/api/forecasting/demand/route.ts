import { NextRequest, NextResponse } from "next/server";
import { DemandForecastingService } from "@/lib/forecasting/services/demand-forecasting.service";
import { ForecastHorizon } from "@/lib/forecasting/types/forecasting";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const horizon = (searchParams.get("horizon") || "30D") as ForecastHorizon;

    const summary = await DemandForecastingService.forecastDemand(horizon);
    return NextResponse.json({
      success: true,
      horizon,
      demand: summary
    });
  } catch (error: any) {
    console.error("[GET /api/forecasting/demand Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to forecast demand" }, { status: 500 });
  }
}
