import { NextRequest, NextResponse } from "next/server";
import { CopilotAIService } from "@/lib/command-center/services/copilot-ai.service";
import { CopilotQuerySchema } from "@/lib/command-center/validations/command-center.schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CopilotQuerySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const response = await CopilotAIService.queryCopilot(parsed.data);
    return NextResponse.json({
      success: true,
      copilot: response
    });
  } catch (error: any) {
    console.error("[POST /api/command-center/copilot Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to query Operations Copilot" }, { status: 500 });
  }
}
