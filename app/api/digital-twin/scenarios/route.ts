import { NextResponse } from "next/server";
import { TwinEngineService } from "@/lib/digital-twin/services/twin-engine.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [baseline, presetScenarios] = await Promise.all([
      TwinEngineService.getTwinBaseline(),
      TwinEngineService.getPresetScenarios()
    ]);

    return NextResponse.json({
      success: true,
      baseline,
      scenarios: presetScenarios
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to load scenarios" }, { status: 500 });
  }
}
