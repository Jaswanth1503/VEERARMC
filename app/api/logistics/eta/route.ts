import { NextRequest, NextResponse } from "next/server";
import { ETAPredictionService } from "@/lib/logistics/services/eta-prediction.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const distanceKm = Number(body.distanceKm) || 14.5;
    const departureTime = body.departureTime || new Date();

    const etaForecast = await ETAPredictionService.calculateTripETA(distanceKm, departureTime);

    return NextResponse.json({ eta: etaForecast });
  } catch (error: any) {
    console.error("[POST /api/logistics/eta] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to calculate ETA" }, { status: 500 });
  }
}
