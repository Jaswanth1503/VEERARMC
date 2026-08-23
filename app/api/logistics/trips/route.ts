import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { DeliveryTripService } from "@/lib/logistics/services/delivery-trip.service";
import { CreateTripSchema } from "@/lib/logistics/validations/logistics.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const vehicleId = searchParams.get("vehicleId") || undefined;
    const driverId = searchParams.get("driverId") || undefined;
    const orderId = searchParams.get("orderId") || undefined;

    const trips = await DeliveryTripService.getTrips({
      status,
      vehicleId,
      driverId,
      orderId
    });

    return NextResponse.json({ trips });
  } catch (error: any) {
    console.error("[GET /api/logistics/trips] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    const validated = CreateTripSchema.parse(body);

    const trip = await DeliveryTripService.createTrip(
      validated,
      session?.fullName || "Dispatch Controller"
    );

    return NextResponse.json({ trip, message: "Delivery trip scheduled and mixer vehicle assigned." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/logistics/trips] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create trip" }, { status: 400 });
  }
}
