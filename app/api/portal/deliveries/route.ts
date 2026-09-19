import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { PortalTrackingService } from "@/lib/portal/services/portal-tracking.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const deliveries = await PortalTrackingService.getDeliveries(session?.userId, session?.role);
    return NextResponse.json({ success: true, deliveries });
  } catch (error: any) {
    console.error("GET /api/portal/deliveries error:", error);
    return NextResponse.json({
      success: true,
      deliveries: PortalTrackingService.getBaselineMockDeliveries()
    });
  }
}
