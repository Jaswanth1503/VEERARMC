import { NextRequest, NextResponse } from "next/server";
import { IncidentRootCauseService } from "@/lib/command-center/services/incident-root-cause.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "ALL";
    const severity = searchParams.get("severity") || "ALL";

    const alerts = await IncidentRootCauseService.getActiveAlerts(category, severity);
    return NextResponse.json({
      success: true,
      alerts
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to load alerts" }, { status: 500 });
  }
}
