import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { PortalDocumentsService } from "@/lib/portal/services/portal-documents.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;

    const documents = await PortalDocumentsService.getDocuments(session?.userId, { type, search });
    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    console.error("GET /api/portal/documents error:", error);
    return NextResponse.json({
      success: true,
      documents: PortalDocumentsService.getBaselineMockDocuments()
    });
  }
}
