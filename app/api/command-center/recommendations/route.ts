import { NextResponse } from "next/server";
import { WorkflowApprovalService } from "@/lib/command-center/services/workflow-approval.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const recommendations = await WorkflowApprovalService.getRecommendations();
    return NextResponse.json({
      success: true,
      recommendations
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to load recommendations" }, { status: 500 });
  }
}
