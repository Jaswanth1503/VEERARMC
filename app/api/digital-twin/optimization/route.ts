import { NextResponse } from "next/server";
import { OptimizationEngineService } from "@/lib/digital-twin/services/optimization-engine.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const suggestions = await OptimizationEngineService.getOptimizationSuggestions();
    return NextResponse.json({
      success: true,
      suggestions
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to load optimizations" }, { status: 500 });
  }
}
