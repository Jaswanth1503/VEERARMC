import { NextRequest, NextResponse } from "next/server";
import { StrategicBriefingService } from "@/lib/digital-twin/services/strategic-briefing.service";
import { z } from "zod";

export const runtime = "nodejs";

const BriefingQuerySchema = z.object({
  type: z.enum(["GROWTH", "RISK", "EXPANSION", "OPTIMIZATION"]).default("GROWTH")
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type") || "GROWTH";
    const parsed = BriefingQuerySchema.safeParse({ type: typeParam });

    const briefingType = parsed.success ? parsed.data.type : "GROWTH";
    const report = await StrategicBriefingService.generateBriefing(briefingType);

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to generate briefing" }, { status: 500 });
  }
}
