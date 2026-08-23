import { NextRequest, NextResponse } from "next/server";
import { RevenueAnalyticsService } from "@/lib/analytics/services/revenue-analytics.service";
import { AnalyticsTimeRange } from "@/lib/analytics/types/analytics";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get("timeRange") || "30D") as AnalyticsTimeRange;

    const [trends, byGrade, byCustomer, byProject] = await Promise.all([
      RevenueAnalyticsService.getRevenueTrends(timeRange),
      RevenueAnalyticsService.getRevenueByGrade(timeRange),
      RevenueAnalyticsService.getRevenueByCustomer(6),
      RevenueAnalyticsService.getRevenueByProject(6)
    ]);

    return NextResponse.json({
      success: true,
      timeRange,
      trends,
      byGrade,
      byCustomer,
      byProject
    });
  } catch (error: any) {
    console.error("[GET /api/analytics/revenue Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch revenue analytics" }, { status: 500 });
  }
}
