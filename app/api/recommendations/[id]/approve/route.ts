import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { RecommendationService } from "@/lib/services/recommendation.service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const userId = session?.userId || "user-session";

    const approved = await RecommendationService.approveRecommendation(id, userId);

    return NextResponse.json({ recommendation: approved, message: "Recommendation & Delivery Plan officially approved." });
  } catch (error: any) {
    console.error("[POST /api/recommendations/[id]/approve] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to approve recommendation" }, { status: 400 });
  }
}
