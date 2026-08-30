import { NextRequest, NextResponse } from "next/server";
import { BriefingGeneratorService } from "@/lib/command-center/services/briefing-generator.service";
import { ExecutiveBriefingRequestSchema } from "@/lib/command-center/validations/command-center.schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ExecutiveBriefingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const briefing = await BriefingGeneratorService.generateBriefing(parsed.data.briefingType);
    return NextResponse.json({
      success: true,
      briefing
    });
  } catch (error: any) {
    console.error("[POST /api/command-center/briefing Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate briefing" }, { status: 500 });
  }
}
