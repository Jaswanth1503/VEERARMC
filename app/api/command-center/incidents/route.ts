import { NextResponse } from "next/server";
import { IncidentRootCauseService } from "@/lib/command-center/services/incident-root-cause.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const alerts = await IncidentRootCauseService.getActiveAlerts();
    return NextResponse.json({
      success: true,
      incidents: alerts
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to load incidents" }, { status: 500 });
  }
}
