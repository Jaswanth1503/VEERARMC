import { NextRequest, NextResponse } from "next/server";
import { RecommendationService } from "@/lib/services/recommendation.service";
import { GradeRecommendationService } from "@/lib/services/grade-recommendation.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recommendation = await RecommendationService.getRecommendationById(id);
    const gradeComparison = GradeRecommendationService.getGradeComparisonMatrix();

    return NextResponse.json({ recommendation, gradeComparison });
  } catch (error: any) {
    console.error("[GET /api/recommendations/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Recommendation not found" }, { status: 404 });
  }
}
