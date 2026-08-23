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

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error("[GET /api/support] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch support tickets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    if (!body.subject || !body.description) {
      return NextResponse.json({ error: "Subject and description are required." }, { status: 400 });
    }

    const userId = session?.userId || body.userId;
    if (!userId) {
      return NextResponse.json({ error: "User authentication required." }, { status: 401 });
    }

    const count = await prisma.supportTicket.count();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: body.subject,
        description: body.description,
        priority: body.priority || "MEDIUM",
        status: "OPEN",
        userId
      }
    });

    return NextResponse.json({ ticket, message: "Support ticket submitted." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/support] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit ticket" }, { status: 500 });
  }
}
