import { NextRequest, NextResponse } from "next/server";
import { BusinessHealthService } from "@/lib/command-center/services/business-health.service";
import { IncidentRootCauseService } from "@/lib/command-center/services/incident-root-cause.service";
import { WorkflowApprovalService } from "@/lib/command-center/services/workflow-approval.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [health, alerts, recommendations] = await Promise.all([
      BusinessHealthService.calculateUnifiedHealth(),
      IncidentRootCauseService.getActiveAlerts(),
      WorkflowApprovalService.getRecommendations()
    ]);

    return NextResponse.json({
      success: true,
      health,
      alerts,
      recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[GET /api/command-center/overview Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load command center overview" }, { status: 500 });
  }
}
