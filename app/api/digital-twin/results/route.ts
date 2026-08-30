import { NextResponse } from "next/server";
import { ScenarioSimulatorService } from "@/lib/digital-twin/services/scenario-simulator.service";
import { TwinEngineService } from "@/lib/digital-twin/services/twin-engine.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const presets = TwinEngineService.getPresetScenarios();
    const defaultRun = await ScenarioSimulatorService.simulateScenario(presets[0]);

    return NextResponse.json({
      success: true,
      latestRun: defaultRun
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to load simulation results" }, { status: 500 });
  }
}
