import { NextRequest, NextResponse } from "next/server";
import { ProductionLogisticsAnalyticsService } from "@/lib/analytics/services/production-logistics-analytics.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await ProductionLogisticsAnalyticsService.getLogisticsAnalytics();
    return NextResponse.json({
      success: true,
      logistics: data
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
