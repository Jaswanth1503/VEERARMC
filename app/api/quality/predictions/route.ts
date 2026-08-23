import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { QualityOrchestratorService } from "@/lib/quality/services/quality-orchestrator.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const predictions = await QualityOrchestratorService.getPredictionHistory(session.userId);
    return NextResponse.json({ predictions });
  } catch (error: any) {
    console.error("[GET /api/quality/predictions] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve quality predictions." },
      { status: 500 }
    );
  }
}
