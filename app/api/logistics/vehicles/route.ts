import { NextRequest, NextResponse } from "next/server";
import { FleetService } from "@/lib/logistics/services/fleet.service";
import { VehicleSchema } from "@/lib/logistics/validations/logistics.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;

    const vehicles = await FleetService.getVehicles(status, type);

    return NextResponse.json({ vehicles });
  } catch (error: any) {
    console.error("[GET /api/logistics/vehicles] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = VehicleSchema.parse(body);

    const vehicle = await FleetService.createVehicle(validated);

    return NextResponse.json({ vehicle, message: "Vehicle registered into fleet." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/logistics/vehicles] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to register vehicle" }, { status: 400 });
  }
}
