import { NextRequest, NextResponse } from "next/server";
import { FleetService } from "@/lib/logistics/services/fleet.service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await prisma.fleetVehicle.findUnique({
      where: { id },
      include: {
        drivers: true,
        trips: { take: 5, orderBy: { createdAt: "desc" } },
        maintenanceRecords: { orderBy: { scheduledDate: "desc" } }
      }
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ vehicle });
  } catch (error: any) {
    console.error("[GET /api/logistics/vehicles/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch vehicle" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await FleetService.updateVehicleStatus(id, body.status, body.currentLocation);

    return NextResponse.json({ vehicle: updated, message: "Vehicle status updated." });
  } catch (error: any) {
    console.error("[PUT /api/logistics/vehicles/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update vehicle" }, { status: 400 });
  }
}
