import { NextRequest, NextResponse } from "next/server";
import { BlueprintService } from "@/lib/services/blueprint.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quoteData = await BlueprintService.exportToQuoteData(id);

    return NextResponse.json({
      quoteData,
      redirectUrl: `/quote?blueprintId=${id}&qty=${quoteData.requiredQuantity}&grade=${quoteData.concreteGradeCode}`
    });
  } catch (error: any) {
    console.error("[POST /api/blueprints/[id]/create-quote] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to export blueprint to quote" }, { status: 500 });
  }
}
