import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { DeliveryTripService } from "@/lib/logistics/services/delivery-trip.service";
import { UpdateTripStatusSchema, LogIssueSchema } from "@/lib/logistics/validations/logistics.schema";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trip = await DeliveryTripService.getTripById(id);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error: any) {
    console.error("[GET /api/logistics/trips/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch trip" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await request.json();

    // Check if logging issue
    if (body.action === "LOG_ISSUE") {
      const validatedIssue = LogIssueSchema.parse({ tripId: id, ...body });
      const issue = await DeliveryTripService.logIssue(validatedIssue as any);
      return NextResponse.json({ issue, message: "Delivery issue logged successfully." });
    }

    const validated = UpdateTripStatusSchema.parse(body);

    const updated = await DeliveryTripService.updateTripStatus(
      id,
      validated.status as any,
      {
        latitude: validated.latitude,
        longitude: validated.longitude,
        locationName: validated.locationName,
        customerFeedback: validated.customerFeedback,
        customerRating: validated.customerRating,
        dispatcherName: session?.fullName || "Driver / Dispatcher"
      }
    );

    return NextResponse.json({ trip: updated, message: `Trip status updated to ${validated.status}.` });
  } catch (error: any) {
    console.error("[PUT /api/logistics/trips/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update trip" }, { status: 400 });
  }
}
