import { NextRequest, NextResponse } from "next/server";
import { FleetService } from "@/lib/logistics/services/fleet.service";
import { DriverSchema } from "@/lib/logistics/validations/logistics.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;

    const drivers = await FleetService.getDrivers(status);

    return NextResponse.json({ drivers });
  } catch (error: any) {
    console.error("[GET /api/logistics/drivers] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = DriverSchema.parse(body);

    const driver = await FleetService.createDriver(validated);

    return NextResponse.json({ driver, message: "Driver added to roster." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/logistics/drivers] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to register driver" }, { status: 400 });
  }
}
