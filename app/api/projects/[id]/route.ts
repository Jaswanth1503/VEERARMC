import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProjectLifecycleService } from "@/lib/projects/services/project-lifecycle.service";
import { UpdateProjectSchema } from "@/lib/projects/validations/project.schema";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await ProjectLifecycleService.getProjectById(id);
    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error(`[GET /api/projects/[id]] Error:`, error);
    return NextResponse.json({ success: false, error: error.message || "Project not found" }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSession();
    const body = await request.json();

    const parsed = UpdateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const updated = await ProjectLifecycleService.updateProject(
      id,
      parsed.data,
      session?.userId,
      session?.user?.name || "User"
    );

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    console.error(`[PUT /api/projects/[id]] Error:`, error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.project.update({
      where: { id },
      data: { status: "CLOSED" }
    });
    return NextResponse.json({ success: true, message: "Project closed and archived." });
  } catch (error: any) {
    console.error(`[DELETE /api/projects/[id]] Error:`, error);
    return NextResponse.json({ success: false, error: error.message || "Failed to close project" }, { status: 500 });
  }
}
