import { NextResponse } from "next/server";
import { HeatmapGeneratorService } from "@/lib/digital-twin/services/heatmap-generator.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const heatmaps = HeatmapGeneratorService.getHeatmaps();
    return NextResponse.json({
      success: true,
      heatmaps
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to load heatmaps" }, { status: 500 });
  }
}
