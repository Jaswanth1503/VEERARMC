import { NextRequest, NextResponse } from "next/server";
import { ScenarioSimulatorService } from "@/lib/digital-twin/services/scenario-simulator.service";
import { ScenarioSimulationSchema } from "@/lib/digital-twin/validations/digital-twin.schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ScenarioSimulationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const result = await ScenarioSimulatorService.simulateScenario(parsed.data);
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error("[POST /api/digital-twin/simulate Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Simulation execution failed" }, { status: 500 });
  }
}
