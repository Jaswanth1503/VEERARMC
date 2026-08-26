import { NextRequest, NextResponse } from "next/server";
import { CapacityLogisticsForecastingService } from "@/lib/forecasting/services/capacity-logistics-forecasting.service";
import { ForecastHorizon } from "@/lib/forecasting/types/forecasting";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const horizon = (searchParams.get("horizon") || "30D") as ForecastHorizon;

    const data = await CapacityLogisticsForecastingService.forecastCapacityAndLogistics(horizon);
    return NextResponse.json({
      success: true,
      horizon,
      logistics: data
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to forecast logistics" }, { status: 500 });
  }
}
