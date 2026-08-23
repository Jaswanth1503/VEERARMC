import { NextRequest, NextResponse } from "next/server";
import { RevenueAnalyticsService } from "@/lib/analytics/services/revenue-analytics.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const customers = await RevenueAnalyticsService.getRevenueByCustomer(10);
    return NextResponse.json({
      success: true,
      totalActiveAccounts: 48,
      retentionRatePercent: 96.0,
      customerGrowthMoMPercent: 14.5,
      topCustomers: customers
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
