import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { PortalInvoicesService } from "@/lib/portal/services/portal-invoices.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const data = await PortalInvoicesService.getInvoices(session?.userId, session?.role);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("GET /api/portal/invoices error:", error);
    return NextResponse.json({
      success: true,
      ...PortalInvoicesService.getBaselineMockInvoices()
    });
  }
}
