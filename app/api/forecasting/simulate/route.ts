import { NextRequest, NextResponse } from "next/server";
import { WhatIfSimulationService } from "@/lib/forecasting/services/whatif-simulation.service";
import { WhatIfSimulationSchema } from "@/lib/forecasting/validations/forecasting.schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = WhatIfSimulationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const result = await WhatIfSimulationService.runSimulation(parsed.data);
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error("[POST /api/forecasting/simulate Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to execute simulation" }, { status: 500 });
  }
}
