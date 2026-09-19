import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { PortalSupportService } from "@/lib/portal/services/portal-support.service";
import { createFeedbackSchema } from "@/lib/portal/validations/portal.schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const parsed = createFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const userId = session?.userId || "00000000-0000-0000-0000-000000000001";
    const result = await PortalSupportService.recordFeedback(userId, parsed.data);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/portal/feedback error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record feedback" },
      { status: 500 }
    );
  }
}
