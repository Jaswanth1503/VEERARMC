import { NextRequest, NextResponse } from "next/server";
import { MaterialForecastingService } from "@/lib/forecasting/services/material-forecasting.service";
import { ForecastHorizon } from "@/lib/forecasting/types/forecasting";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const horizon = (searchParams.get("horizon") || "30D") as ForecastHorizon;

    const materials = await MaterialForecastingService.forecastMaterials(horizon);
    return NextResponse.json({
      success: true,
      horizon,
      materials
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to forecast materials" }, { status: 500 });
  }
}
