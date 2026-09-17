import { NextRequest, NextResponse } from "next/server";
import { ProjectLifecycleService } from "@/lib/projects/services/project-lifecycle.service";
import { ProjectCopilotService } from "@/lib/projects/services/project-copilot.service";
import { ProjectCopilotQuerySchema } from "@/lib/projects/validations/project.schema";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json();

    const parsed = ProjectCopilotQuerySchema.safeParse(body);
    const question = parsed.success ? parsed.data.question : body.question;

    const project = await ProjectLifecycleService.getProjectById(projectId);
    const insights = await ProjectCopilotService.queryCopilot(project, question);

    return NextResponse.json({
      success: true,
      insights
    });
  } catch (error: any) {
    console.error("[POST /api/projects/[id]/copilot] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to query copilot" }, { status: 500 });
  }
}
