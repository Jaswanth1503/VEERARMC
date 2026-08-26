import { NextRequest, NextResponse } from "next/server";
import { DemandForecastingService } from "@/lib/forecasting/services/demand-forecasting.service";
import { RevenueForecastingService } from "@/lib/forecasting/services/revenue-forecasting.service";
import { MaterialForecastingService } from "@/lib/forecasting/services/material-forecasting.service";
import { CapacityLogisticsForecastingService } from "@/lib/forecasting/services/capacity-logistics-forecasting.service";
import { DecisionAIService } from "@/lib/forecasting/services/decision-ai.service";
import { DecisionReportRequestSchema } from "@/lib/forecasting/validations/forecasting.schema";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = DecisionReportRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const { horizon, title } = parsed.data;

    // Fetch predictive data in parallel
    const [demand, revenue, materials, capacity, churn] = await Promise.all([
      DemandForecastingService.forecastDemand(horizon),
      RevenueForecastingService.forecastRevenue(horizon),
      MaterialForecastingService.forecastMaterials(horizon),
      CapacityLogisticsForecastingService.forecastCapacityAndLogistics(horizon),
      CapacityLogisticsForecastingService.forecastCustomerChurn()
    ]);

    // Generate AI Decision Briefing
    const aiBriefing = await DecisionAIService.generateDecisionBriefing(horizon, demand, revenue);

    const reportTitle = title || `Veera RMC ${horizon} Strategic Forecast & Decision Intelligence Report (${new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })})`;
    const reportId = `fc-rep-${Date.now()}`;

    // Attempt DB persistence
    try {
      await prisma.decisionIntelligenceReport.create({
        data: {
          title: reportTitle,
          reportHorizon: horizon,
          scenariosJson: {
            demand,
            revenue
          } as any,
          risksJson: aiBriefing.revenueRiskRadar as any,
          opportunitiesJson: aiBriefing.growthCatalysts as any,
          aiBriefing: aiBriefing.executiveSummary,
          generatedBy: "Veera AI Decision Engine"
        }
      });
    } catch (e: any) {
      console.warn("[DecisionReport Warning] Database offline, running in-memory report:", e.message);
    }

    return NextResponse.json({
      success: true,
      reportId,
      title: reportTitle,
      horizon,
      demand,
      revenue,
      materials,
      capacity,
      churn,
      aiBriefing
    });
  } catch (error: any) {
    console.error("[POST /api/forecasting/report Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate forecasting report" }, { status: 500 });
  }
}
