import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const trucks = await prisma.truck.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        driver: {
          include: {
            user: { select: { fullName: true, phone: true } }
          }
        }
      }
    });

    return NextResponse.json({ trucks });
  } catch (error: any) {
    console.error("[GET /api/fleet] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch fleet" }, { status: 500 });
  }
}
