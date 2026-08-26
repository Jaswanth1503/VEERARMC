import { NextRequest, NextResponse } from "next/server";
import { RevenueForecastingService } from "@/lib/forecasting/services/revenue-forecasting.service";
import { ForecastHorizon } from "@/lib/forecasting/types/forecasting";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const horizon = (searchParams.get("horizon") || "30D") as ForecastHorizon;

    const summary = await RevenueForecastingService.forecastRevenue(horizon);
    return NextResponse.json({
      success: true,
      horizon,
      revenue: summary
    });
  } catch (error: any) {
    console.error("[GET /api/forecasting/revenue Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to forecast revenue" }, { status: 500 });
  }
}
