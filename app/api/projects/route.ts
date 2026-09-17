import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProjectLifecycleService } from "@/lib/projects/services/project-lifecycle.service";
import { ProjectAnalyticsService } from "@/lib/projects/services/project-analytics.service";
import { CreateProjectSchema } from "@/lib/projects/validations/project.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const queryParam = searchParams.get("query");

    const where: any = {};
    if (session?.userId && session?.role !== "Admin" && session?.role !== "Project Manager") {
      where.OR = [
        { customerId: session.userId },
        { contractorId: session.userId },
        { projectManagerId: session.userId }
      ];
    }

    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam;
    }

    if (queryParam) {
      where.OR = [
        ...(where.OR || []),
        { projectName: { contains: queryParam, mode: "insensitive" } },
        { projectCode: { contains: queryParam, mode: "insensitive" } },
        { location: { contains: queryParam, mode: "insensitive" } }
      ];
    }

    const [projects, portfolio] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, fullName: true, email: true } },
          contractor: { select: { id: true, fullName: true } },
          orders: { select: { id: true, status: true, totalQuantity: true, totalAmount: true } },
          quotes: { select: { id: true, totalAmount: true } },
          phases: { select: { id: true, phaseName: true, status: true, progress: true } },
          milestones: { select: { id: true, status: true, title: true, targetDate: true } },
          risks: { select: { id: true, severity: true, status: true } }
        }
      }),
      ProjectAnalyticsService.getPortfolioOverview()
    ]);

    return NextResponse.json({
      success: true,
      projects: projects.map(p => ({
        id: p.id,
        projectCode: p.projectCode || `PRJ-${p.id.slice(0, 8).toUpperCase()}`,
        projectName: p.projectName,
        location: p.location || "Pune, MH",
        status: p.status,
        priority: p.priority,
        progressPercentage: p.progressPercentage,
        healthScore: p.healthScore,
        estimatedValue: p.estimatedValue,
        actualValue: p.actualValue,
        startDate: p.startDate?.toISOString() || null,
        targetDate: p.targetDate?.toISOString() || null,
        customerName: p.customer.fullName,
        contractorName: p.contractor?.fullName || null,
        ordersCount: p.orders.length,
        milestonesCount: p.milestones.length,
        activeRisksCount: p.risks.filter(r => r.status !== "RESOLVED").length,
        createdAt: p.createdAt.toISOString()
      })),
      portfolio
    });
  } catch (error: any) {
    console.error("[GET /api/projects] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const currentUserId = session?.userId || "guest-user";
    const currentUserName = session?.user?.name || session?.user?.email || "Executive";

    const project = await ProjectLifecycleService.createProject(parsed.data, currentUserId, currentUserName);

    return NextResponse.json({
      success: true,
      project,
      message: "Enterprise project initialized with 7 phases and standard budget allocation."
    }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/projects] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create project" }, { status: 500 });
  }
}

