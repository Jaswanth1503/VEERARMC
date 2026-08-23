import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { BlueprintService } from "@/lib/services/blueprint.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const analyses = await BlueprintService.getUserAnalyses(session?.userId);
    return NextResponse.json({ analyses });
  } catch (error: any) {
    console.error("[GET /api/blueprints] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve blueprint analyses" }, { status: 500 });
  }
}
