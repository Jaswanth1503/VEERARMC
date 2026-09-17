import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { CreateProjectTaskSchema } from "@/lib/projects/validations/project.schema";
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

    const parsed = CreateProjectTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const task = await prisma.projectTask.create({
      data: {
        projectId,
        milestoneId: parsed.data.milestoneId || null,
        title: parsed.data.title,
        description: parsed.data.description || null,
        priority: parsed.data.priority,
        status: parsed.data.status,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        assignedToName: parsed.data.assignedToName || "Site Supervisor",
        estimatedHours: parsed.data.estimatedHours || 8
      }
    });

    await ProjectActivityService.logActivity({
      projectId,
      activityType: "TASK_CREATED",
      description: `New task "${task.title}" created (${task.priority} priority, assigned to ${task.assignedToName}).`,
      userId: session?.userId,
      userName: session?.user?.name || "User"
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/projects/[id]/tasks] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create task" }, { status: 500 });
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

    if (!body.taskId) {
      return NextResponse.json({ success: false, error: "taskId is required" }, { status: 400 });
    }

    const data: any = {};
    if (body.status) data.status = body.status;
    if (body.priority) data.priority = body.priority;
    if (body.title) data.title = body.title;

    const task = await prisma.projectTask.update({
      where: { id: body.taskId },
      data
    });

    if (body.status === "DONE") {
      await ProjectActivityService.logActivity({
        projectId,
        activityType: "TASK_COMPLETED",
        description: `Task "${task.title}" was marked completed by ${session?.user?.name || "User"}.`,
        userId: session?.userId,
        userName: session?.user?.name || "User"
      });
    }

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error("[PUT /api/projects/[id]/tasks] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update task" }, { status: 500 });
  }
}
