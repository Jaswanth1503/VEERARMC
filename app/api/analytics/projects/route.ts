import { NextRequest, NextResponse } from "next/server";
import { RevenueAnalyticsService } from "@/lib/analytics/services/revenue-analytics.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const projects = await RevenueAnalyticsService.getRevenueByProject(10);
    return NextResponse.json({
      success: true,
      totalActiveProjects: 18,
      completedProjectsCount: 34,
      totalProjectDemandM3: 28400,
      projects
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
