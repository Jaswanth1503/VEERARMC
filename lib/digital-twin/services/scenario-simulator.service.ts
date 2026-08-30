import { prisma } from "@/lib/prisma";
import { ScenarioParameters, SimulationResultMetrics } from "../types/digital-twin";
import { TwinEngineService } from "./twin-engine.service";
import { TwinAIService } from "./twin-ai.service";

export class ScenarioSimulatorService {

  /**
   * Executes a virtual multi-variable scenario simulation on the Digital Twin without touching production tables.
   */
  static async simulateScenario(params: ScenarioParameters): Promise<SimulationResultMetrics> {
    const baseline = await TwinEngineService.getTwinBaseline();

    // 1. Effective demand delta including customer loss
    const netDemandFactor = 1 + (params.demandDeltaPercent - params.customerLossPercent) / 100;
    const projectedMonthlyVolumeM3 = Math.round(baseline.monthlyVolumeM3 * netDemandFactor);
    const dailyVolumeNeeded = projectedMonthlyVolumeM3 / 30;

    // 2. Revenue & Financials
    const priceFactor = 1 + (params.sellingPriceDeltaPercent / 100);
    const projectedMonthlyRevenueINR = Math.round(baseline.monthlyRevenueINR * netDemandFactor * priceFactor);
    const revenueDeltaINR = projectedMonthlyRevenueINR - baseline.monthlyRevenueINR;
    const revenueGrowthPercent = Number((((projectedMonthlyRevenueINR - baseline.monthlyRevenueINR) / baseline.monthlyRevenueINR) * 100).toFixed(1));

    // 3. Margin Analysis (Materials are ~65% of COGS)
    const costFactor = 1 + (params.materialCostDeltaPercent * 0.65) / 100;
    const adjustedMargin = (baseline.grossMarginPercent * priceFactor) / costFactor;
    const projectedGrossMarginPercent = Number(Math.min(45, Math.max(5, adjustedMargin)).toFixed(1));
    const marginDeltaPercent = Number((projectedGrossMarginPercent - baseline.grossMarginPercent).toFixed(1));

    // 4. Plant Capacity Simulation (Standard 500 m3/day shift nominal)
    const effectiveDailyCapacity = Math.max(400, (baseline.totalDailyCapacityM3 * 0.4) + params.plantCapacityExpansionM3);
    const projectedPlantUtilizationPercent = Number(Math.min(100, (dailyVolumeNeeded / effectiveDailyCapacity) * 100).toFixed(1));
    const plantBottleneckRisk = projectedPlantUtilizationPercent >= 85;

    // 5. Fleet Logistics Simulation
    const effectiveFleet = baseline.activeFleetCount + params.transitMixerFleetDelta;
    const trucksRequired = Math.ceil(dailyVolumeNeeded / 14); // ~14 m3/truck/day
    const projectedFleetUtilizationPercent = Number(Math.min(100, (trucksRequired / Math.max(1, effectiveFleet)) * 100).toFixed(1));
    const fleetShortageCount = Math.max(0, trucksRequired - effectiveFleet);

    // 6. Enterprise Resilience Score (0 - 100)
    let resilienceScore = 92;
    if (plantBottleneckRisk) resilienceScore -= 12;
    if (fleetShortageCount > 0) resilienceScore -= (fleetShortageCount * 4);
    if (marginDeltaPercent < -2) resilienceScore -= Math.abs(marginDeltaPercent) * 2;
    const overallResilienceScore = Math.max(35, Math.min(100, Math.round(resilienceScore)));

    const simulationId = `sim-twin-${Date.now()}`;

    // 7. AI Impact Synthesis
    const aiStrategicInsights = await TwinAIService.evaluateScenarioImpact(params, {
      projectedMonthlyRevenueINR,
      revenueGrowthPercent,
      projectedGrossMarginPercent,
      projectedPlantUtilizationPercent,
      fleetShortageCount,
      plantBottleneckRisk
    });

    // Attempt DB persistence
    try {
      await prisma.simulationRun.create({
        data: {
          scenarioName: params.scenarioName,
          parametersJson: params as any,
          projectedRevenueINR: Number(projectedMonthlyRevenueINR),
          revenueDeltaINR: Number(revenueDeltaINR),
          projectedGrossMarginPercent: Number(projectedGrossMarginPercent),
          marginDeltaPercent: Number(marginDeltaPercent),
          projectedPlantUtilization: Number(projectedPlantUtilizationPercent),
          plantBottleneckPercent: plantBottleneckRisk ? (projectedPlantUtilizationPercent - 85) : 0,
          projectedFleetUtilization: Number(projectedFleetUtilizationPercent),
          fleetDeficitCount: Number(fleetShortageCount),
          aiAnalysisJson: aiStrategicInsights as any
        }
      });
    } catch (e: any) {
      console.warn("[ScenarioSimulator Warning] Database offline, running in-memory simulation:", e.message);
    }

    return {
      simulationId,
      scenarioName: params.scenarioName,
      parameters: params,
      projectedMonthlyRevenueINR,
      revenueDeltaINR,
      revenueGrowthPercent,
      projectedGrossMarginPercent,
      marginDeltaPercent,
      projectedMonthlyVolumeM3,
      projectedPlantUtilizationPercent,
      plantBottleneckRisk,
      projectedFleetUtilizationPercent,
      fleetShortageCount,
      overallResilienceScore,
      aiStrategicInsights,
      executedAt: new Date().toISOString()
    };
  }
}
