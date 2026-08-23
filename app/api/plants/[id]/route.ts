import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plant = await prisma.batchingPlant.findUnique({
      where: { id },
      include: {
        productionPlans: { take: 5, orderBy: { scheduledStartTime: "desc" } }
      }
    });

    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    return NextResponse.json({ plant });
  } catch (error: any) {
    console.error("[GET /api/plants/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch plant" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.batchingPlant.update({
      where: { id },
      data: {
        status: body.status || undefined,
        dailyCapacityM3: body.dailyCapacityM3 || undefined,
        capacityPerHour: body.capacityPerHour || undefined,
        contactPhone: body.contactPhone || undefined,
        managerName: body.managerName || undefined
      }
    });

    return NextResponse.json({ plant: updated, message: "Plant settings updated." });
  } catch (error: any) {
    console.error("[PUT /api/plants/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update plant" }, { status: 400 });
  }
}
