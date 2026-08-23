import { NextRequest, NextResponse } from "next/server";
import { BlueprintService } from "@/lib/services/blueprint.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analysis = await BlueprintService.getAnalysisById(id);
    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("[GET /api/blueprints/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Blueprint analysis record not found" }, { status: 404 });
  }
}
