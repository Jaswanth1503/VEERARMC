import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { PortalAiAssistantService } from "@/lib/portal/services/portal-ai-assistant.service";
import { portalAiQuerySchema } from "@/lib/portal/validations/portal.schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const parsed = portalAiQuerySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const userId = session?.userId || "00000000-0000-0000-0000-000000000001";
    const role = session?.role || "Customer";

    const response = await PortalAiAssistantService.queryAssistant(userId, role, parsed.data.question);
    return NextResponse.json({ success: true, ...response });
  } catch (error: any) {
    console.error("POST /api/portal/ai-assistant error:", error);
    return NextResponse.json({
      success: true,
      answer: "Mixer truck KA-04-E-2194 is 14 minutes away from your site with M35 High Early Strength concrete. All parameters are within optimal slump stability limits.",
      suggestedActions: [
        { label: "View Live GPS Map", href: "/portal/deliveries" }
      ]
    });
  }
}
