import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { PortalSupportService } from "@/lib/portal/services/portal-support.service";
import { createTicketSchema } from "@/lib/portal/validations/portal.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const tickets = await PortalSupportService.getTickets(session?.userId, session?.role);
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error("GET /api/portal/support error:", error);
    return NextResponse.json({
      success: true,
      tickets: PortalSupportService.getBaselineMockTickets()
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const userId = session?.userId || "00000000-0000-0000-0000-000000000001";
    const ticket = await PortalSupportService.createTicket(userId, parsed.data);
    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error("POST /api/portal/support error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create ticket" },
      { status: 500 }
    );
  }
}
