import { NextRequest, NextResponse } from "next/server";
import { ReportGeneratorService } from "@/lib/analytics/services/report-generator.service";
import { ExportAnalyticsSchema } from "@/lib/analytics/validations/analytics.schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ExportAnalyticsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const { format, reportType } = parsed.data;
    const report = await ReportGeneratorService.generateReport(reportType);

    if (format === "JSON") {
      return new NextResponse(JSON.stringify(report, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="Veera_RMC_Executive_${reportType}_${Date.now()}.json"`
        }
      });
    }

    // Return structured printable report data for client-side PDF generation
    return NextResponse.json({
      success: true,
      format,
      filename: `Veera_RMC_Executive_${reportType}_Report.pdf`,
      downloadUrl: `/api/analytics/report?download=${report.id}`,
      report
    });
  } catch (error: any) {
    console.error("[POST /api/analytics/export Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to export analytics" }, { status: 500 });
  }
}
