import { NextRequest, NextResponse } from "next/server";
import { ReportGeneratorService } from "@/lib/analytics/services/report-generator.service";
import { ReportGenerateSchema } from "@/lib/analytics/validations/analytics.schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ReportGenerateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const { reportType, title } = parsed.data;
    const report = await ReportGeneratorService.generateReport(reportType, title);

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error: any) {
    console.error("[POST /api/analytics/report Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate report" }, { status: 500 });
  }
}
