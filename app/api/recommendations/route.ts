import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { RecommendationService } from "@/lib/services/recommendation.service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const where: any = {};
    if (session?.userId) where.userId = session.userId;

    const recommendations = await prisma.recommendation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        deliveryPlans: { include: { plant: true } }
      }
    });

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error("[GET /api/recommendations] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve recommendations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    if (!body.requiredVolumeM3 || body.requiredVolumeM3 <= 0) {
      return NextResponse.json({ error: "Please enter a valid concrete volume (> 0 m³)." }, { status: 400 });
    }

    const inputData = {
      ...body,
      userId: session?.userId || body.userId || null
    };

    const result = await RecommendationService.generateRecommendation(inputData);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/recommendations] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate recommendation" }, { status: 500 });
  }
}
