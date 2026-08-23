import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { DeliveryScheduleService } from "@/lib/orders/services/delivery-schedule.service";
import { OrderService } from "@/lib/orders/services/order.service";
import { OrderScheduleSchema } from "@/lib/orders/validations/order.schema";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await request.json();

    const validated = OrderScheduleSchema.parse(body);

    // 1. Add delivery schedule record
    const schedule = await DeliveryScheduleService.addSchedule({
      orderId: id,
      plantId: validated.plantId,
      scheduledDate: validated.scheduledDate,
      estimatedArrival: validated.estimatedArrival,
      quantityM3: validated.quantityM3,
      truckNumber: validated.truckNumber,
      driverName: validated.driverName,
      driverPhone: validated.driverPhone,
      notes: validated.notes
    });

    // 2. Transition order status to PRODUCTION_SCHEDULED if not already in production
    await OrderService.transitionStatus(
      id,
      "PRODUCTION_SCHEDULED",
      session?.userId,
      session?.fullName || "Plant Dispatcher",
      `Mixer truck ${validated.truckNumber || "Transit Mixer"} scheduled for ${new Date(validated.scheduledDate).toLocaleTimeString()}`
    );

    return NextResponse.json({ schedule, message: "Delivery dispatch slot scheduled successfully." });
  } catch (error: any) {
    console.error("[POST /api/orders/[id]/schedule] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to schedule delivery" }, { status: 400 });
  }
}
