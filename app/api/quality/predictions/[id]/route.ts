import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { QualityOrchestratorService } from "@/lib/quality/services/quality-orchestrator.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const prediction = await QualityOrchestratorService.getPredictionById(id, session.userId);

    if (!prediction) {
      return NextResponse.json({ error: "Quality prediction report not found." }, { status: 404 });
    }

    return NextResponse.json({ prediction });
  } catch (error: any) {
    console.error("[GET /api/quality/predictions/:id] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve quality prediction report." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    await QualityOrchestratorService.deletePrediction(id, session.userId);

    return NextResponse.json({ success: true, message: "Prediction report deleted." });
  } catch (error: any) {
    console.error("[DELETE /api/quality/predictions/:id] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete prediction report." },
      { status: 500 }
    );
  }
}
