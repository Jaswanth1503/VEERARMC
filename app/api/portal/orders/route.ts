import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { PortalDashboardService } from "@/lib/portal/services/portal-dashboard.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const data = await PortalDashboardService.getDashboardMetrics(session?.userId, session?.role);
    return NextResponse.json({ success: true, orders: data.activeOrders });
  } catch (error: any) {
    console.error("GET /api/portal/orders error:", error);
    const mock = PortalDashboardService.getBaselineMockDashboard();
    return NextResponse.json({ success: true, orders: mock.activeOrders });
  }
}
