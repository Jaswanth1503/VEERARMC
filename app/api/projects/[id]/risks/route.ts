import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { CreateProjectRiskSchema } from "@/lib/projects/validations/project.schema";
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

    const parsed = CreateProjectRiskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const risk = await prisma.projectRisk.create({
      data: {
        projectId,
        riskType: parsed.data.riskType,
        title: parsed.data.title,
        description: parsed.data.description || null,
        severity: parsed.data.severity,
        probability: parsed.data.probability,
        mitigationPlan: parsed.data.mitigationPlan || null,
        status: "IDENTIFIED"
      }
    });

    await ProjectActivityService.logActivity({
      projectId,
      activityType: "RISK_FLAGGED",
      description: `New ${risk.severity} risk logged: "${risk.title}". Mitigation plan: ${risk.mitigationPlan || "Pending"}.`,
      userId: session?.userId,
      userName: session?.user?.name || "User"
    });

    return NextResponse.json({ success: true, risk }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/projects/[id]/risks] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to log risk" }, { status: 500 });
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

    if (!body.riskId) {
      return NextResponse.json({ success: false, error: "riskId is required" }, { status: 400 });
    }

    const data: any = {};
    if (body.status) data.status = body.status;
    if (body.mitigationPlan) data.mitigationPlan = body.mitigationPlan;
    if (body.severity) data.severity = body.severity;

    const risk = await prisma.projectRisk.update({
      where: { id: body.riskId },
      data
    });

    await ProjectActivityService.logActivity({
      projectId,
      activityType: "RISK_FLAGGED",
      description: `Risk "${risk.title}" status updated to ${risk.status}.`,
      userId: session?.userId,
      userName: session?.user?.name || "User"
    });

    return NextResponse.json({ success: true, risk });
  } catch (error: any) {
    console.error("[PUT /api/projects/[id]/risks] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update risk" }, { status: 500 });
  }
}
