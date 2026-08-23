import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const where: any = {};
    if (session?.userId && session?.role !== "Admin") {
      where.userId = session.userId;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { orderNumber: true, concreteGrade: true } },
        project: { select: { projectName: true } }
      }
    });

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error("[GET /api/invoices] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch invoices" }, { status: 500 });
  }
}
