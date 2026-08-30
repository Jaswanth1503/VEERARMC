import { NextRequest, NextResponse } from "next/server";
import { OptimizationEngineService } from "@/lib/digital-twin/services/optimization-engine.service";
import { OptimizationActionSchema } from "@/lib/digital-twin/validations/digital-twin.schema";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = OptimizationActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const session = await getSession();
    const userId = session?.user?.name || session?.user?.email || "Executive";

    const result = await OptimizationEngineService.updateRecommendationStatus(
      parsed.data.recommendationId,
      parsed.data.action,
      userId
    );

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error("[POST /api/digital-twin/recommendation Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update recommendation" }, { status: 500 });
  }
}
