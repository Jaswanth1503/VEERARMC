import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const where: any = {};
    if (session?.userId && session?.role !== "Admin") {
      where.OR = [
        { customerId: session.userId },
        { contractorId: session.userId }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { fullName: true, email: true } },
        contractor: { select: { fullName: true } },
        orders: true,
        quotes: true
      }
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("[GET /api/projects] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    if (!body.projectName) {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    const customerId = session?.userId || body.customerId;
    if (!customerId) {
      return NextResponse.json({ error: "User authentication required." }, { status: 401 });
    }

    const project = await prisma.project.create({
      data: {
        projectName: body.projectName,
        location: body.location || "Pune, MH",
        status: "ACTIVE",
        customerId,
        contractorId: body.contractorId || null
      }
    });

    return NextResponse.json({ project, message: "Project created successfully." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/projects] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 });
  }
}
