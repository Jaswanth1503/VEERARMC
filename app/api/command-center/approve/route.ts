import { NextRequest, NextResponse } from "next/server";
import { WorkflowApprovalService } from "@/lib/command-center/services/workflow-approval.service";
import { RecommendationApprovalSchema } from "@/lib/command-center/validations/command-center.schema";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RecommendationApprovalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const session = await getSession();
    const userId = session?.user?.name || session?.user?.email || "Executive";

    const result = await WorkflowApprovalService.processApproval(
      parsed.data.recommendationId,
      parsed.data.action,
      userId,
      parsed.data.comments
    );

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error("[POST /api/command-center/approve Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process approval" }, { status: 500 });
  }
}
