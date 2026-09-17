import { NextRequest, NextResponse } from "next/server";
import { ProjectAnalyticsService } from "@/lib/projects/services/project-analytics.service";
import { ProjectLifecycleService } from "@/lib/projects/services/project-lifecycle.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const [analytics, project] = await Promise.all([
      ProjectAnalyticsService.getProjectAnalytics(projectId),
      ProjectLifecycleService.getProjectById(projectId)
    ]);

    return NextResponse.json({
      success: true,
      analytics,
      health: project.health
    });
  } catch (error: any) {
    console.error("[GET /api/projects/[id]/analytics] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load analytics" }, { status: 500 });
  }
}
