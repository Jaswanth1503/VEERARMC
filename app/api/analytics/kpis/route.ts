import { NextRequest, NextResponse } from "next/server";
import { KPICalculatorService } from "@/lib/analytics/services/kpi-calculator.service";
import { ExecutiveAIService } from "@/lib/analytics/services/executive-ai.service";
import { AnalyticsTimeRange } from "@/lib/analytics/types/analytics";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get("timeRange") || "30D") as AnalyticsTimeRange;

    const kpis = await KPICalculatorService.calculateKPIs(timeRange);
    const aiInsights = await ExecutiveAIService.generateExecutiveInsights(kpis);

    return NextResponse.json({
      success: true,
      timeRange,
      kpis,
      aiInsights
    });
  } catch (error: any) {
    console.error("[GET /api/analytics/kpis Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to calculate KPIs" }, { status: 500 });
  }
}
