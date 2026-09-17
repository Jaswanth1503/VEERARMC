import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { CreateProjectMilestoneSchema } from "@/lib/projects/validations/project.schema";
import { ProjectActivityService } from "@/lib/projects/services/project-activity.service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const session = await getSession();
    const body = await request.json();

    const parsed = CreateProjectMilestoneSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        targetDate: new Date(parsed.data.targetDate),
        status: "PENDING",
        ownerName: parsed.data.ownerName || "Project Lead",
        concreteVolumeM3: parsed.data.concreteVolumeM3 || 0
      }
    });

    await ProjectActivityService.logActivity({
      projectId,
      activityType: "MILESTONE_UPDATED",
      description: `New milestone "${milestone.title}" scheduled for target date ${new Date(milestone.targetDate).toLocaleDateString()}.`,
      userId: session?.userId,
      userName: session?.user?.name || "User",
      addToTimeline: true,
      timelineEvent: {
        eventType: "MILESTONE_REACHED",
        title: milestone.title
      }
    });

    return NextResponse.json({ success: true, milestone }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/projects/[id]/milestones] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create milestone" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const session = await getSession();
    const body = await request.json();

    if (!body.milestoneId) {
      return NextResponse.json({ success: false, error: "milestoneId is required" }, { status: 400 });
    }

    const data: any = {};
    if (body.status) {
      data.status = body.status;
      if (body.status === "COMPLETED") {
        data.completionDate = new Date();
      }
    }

    const milestone = await prisma.projectMilestone.update({
      where: { id: body.milestoneId },
      data
    });

    await ProjectActivityService.logActivity({
      projectId,
      activityType: "MILESTONE_UPDATED",
      description: `Milestone "${milestone.title}" status updated to ${milestone.status}.`,
      userId: session?.userId,
      userName: session?.user?.name || "User"
    });

    return NextResponse.json({ success: true, milestone });
  } catch (error: any) {
    console.error("[PUT /api/projects/[id]/milestones] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update milestone" }, { status: 500 });
  }
}
