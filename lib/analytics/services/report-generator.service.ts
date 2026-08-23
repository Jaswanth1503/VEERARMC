import { prisma } from "@/lib/prisma";
import { KPICalculatorService } from "./kpi-calculator.service";
import { RevenueAnalyticsService } from "./revenue-analytics.service";
import { ProductionLogisticsAnalyticsService } from "./production-logistics-analytics.service";
import { ExecutiveAIService } from "./executive-ai.service";
import { ExecutiveReportData } from "../types/analytics";

export class ReportGeneratorService {

  /**
   * Builds an end-to-end Executive Business Intelligence Report with real-time data & AI insights.
   */
  static async generateReport(
    reportType: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL" = "MONTHLY",
    title?: string
  ): Promise<ExecutiveReportData> {
    const timeRange = reportType === "DAILY" ? "7D" : reportType === "WEEKLY" ? "7D" : reportType === "MONTHLY" ? "30D" : reportType === "QUARTERLY" ? "90D" : "1Y";
    
    // Fetch parallel analytics data
    const [kpis, revenueTrends, revenueByGrade, topCustomers, production, logistics] = await Promise.all([
      KPICalculatorService.calculateKPIs(timeRange),
      RevenueAnalyticsService.getRevenueTrends(timeRange),
      RevenueAnalyticsService.getRevenueByGrade(timeRange),
      RevenueAnalyticsService.getRevenueByCustomer(5),
      ProductionLogisticsAnalyticsService.getProductionAnalytics(),
      ProductionLogisticsAnalyticsService.getLogisticsAnalytics()
    ]);

    // Generate AI Leadership Insights
    const aiInsights = await ExecutiveAIService.generateExecutiveInsights(kpis);

    const now = new Date();
    const periodStart = new Date(now.getTime() - (reportType === "DAILY" ? 1 : reportType === "WEEKLY" ? 7 : reportType === "MONTHLY" ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString();
    const periodEnd = now.toISOString();

    const reportTitle = title || `Veera RMC ${reportType} Executive Performance & Intelligence Briefing (${now.toLocaleDateString("en-IN", { month: "short", year: "numeric" })})`;
    const reportId = `rep-${Date.now()}`;

    // Attempt DB persistence
    try {
      await prisma.executiveReport.create({
        data: {
          reportType,
          title: reportTitle,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          totalRevenue: kpis.totalRevenue,
          totalVolumeM3: kpis.totalVolumeBatchedM3,
          totalOrders: kpis.totalOrders,
          deliveredOrders: kpis.deliveredOrders,
          healthScore: kpis.businessHealthScore,
          aiSummary: aiInsights.strategicSummary,
          metricsJson: {
            kpis,
            revenueByGrade,
            topCustomers
          } as any,
          actionItemsJson: aiInsights.executiveActionItems as any,
          generatedBy: "Executive AI Engine"
        }
      });
    } catch (e: any) {
      console.warn("[ReportGenerator Warning] Database offline, generated in-memory report:", e.message);
    }

    return {
      id: reportId,
      title: reportTitle,
      reportType,
      periodStart,
      periodEnd,
      kpis,
      revenueTrends,
      revenueByGrade,
      topCustomers,
      production,
      logistics,
      aiInsights
    };
  }
}
