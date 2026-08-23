import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { QualityOrchestratorService } from "@/lib/quality/services/quality-orchestrator.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    // Allow prediction calculation; fallback guest ID if unauthenticated session
    const userId = session?.userId || "00000000-0000-0000-0000-000000000000";

    const body = await request.json();
    const report = await QualityOrchestratorService.runPredictionPipeline(body, userId);

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error: any) {
    console.error("[POST /api/quality/predict] Error:", error);

    if (error instanceof ZodError) {
      const issue = error.issues[0];
      return NextResponse.json(
        { error: issue ? `${issue.path.join('.')}: ${issue.message}` : "Invalid concrete mix inputs." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to calculate concrete quality prediction." },
      { status: 500 }
    );
  }
}
