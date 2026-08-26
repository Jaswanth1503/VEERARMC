import { NextRequest, NextResponse } from "next/server";
import { CapacityLogisticsForecastingService } from "@/lib/forecasting/services/capacity-logistics-forecasting.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const churn = await CapacityLogisticsForecastingService.forecastCustomerChurn();
    return NextResponse.json({
      success: true,
      customers: churn
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to forecast customer churn" }, { status: 500 });
  }
}
