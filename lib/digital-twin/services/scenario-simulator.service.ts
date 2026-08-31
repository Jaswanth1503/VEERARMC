import { prisma } from "@/lib/prisma";
import { ScenarioParameters, SimulationResultMetrics, AIOptimizationScores, EnterpriseBestPlans } from "../types/digital-twin";
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

    // 6. Enterprise AI Optimization Scores (Requirement 18)
    let resilience = 92;
    if (plantBottleneckRisk) resilience -= 14;
    if (fleetShortageCount > 0) resilience -= (fleetShortageCount * 4.5);
    if (marginDeltaPercent < -2) resilience -= Math.abs(marginDeltaPercent) * 2.2;
    const resilienceScore = Math.max(30, Math.min(100, Math.round(resilience)));

    const efficiencyScore = Math.round(Math.max(40, Math.min(98, 100 - Math.abs(projectedPlantUtilizationPercent - 75) * 0.8)));
    const growthScore = Math.round(Math.max(30, Math.min(99, 50 + revenueGrowthPercent * 0.8)));
    const scalabilityScore = Math.round(Math.max(25, Math.min(96, 100 - projectedPlantUtilizationPercent * 0.7 + (params.plantCapacityExpansionM3 > 0 ? 15 : 0))));
    const optimizationScore = Math.round((efficiencyScore * 0.35) + (resilienceScore * 0.35) + (scalabilityScore * 0.30));
    const businessReadinessScore = Math.round((optimizationScore * 0.4) + (resilienceScore * 0.3) + (growthScore * 0.3));

    const scores: AIOptimizationScores = {
      efficiencyScore,
      optimizationScore,
      growthScore,
      scalabilityScore,
      resilienceScore,
      businessReadinessScore
    };

    // 7. Enterprise Best Plans (Requirement 7)
    const bestPlans: EnterpriseBestPlans = {
      bestProductionPlan: plantBottleneckRisk
        ? `Shift 35% of foundation batches to 05:30 AM early wave and divert 45 m³/day of M25 residential mix from Plant 2 to Plant 3.`
        : `Operate Plant 1 at 72% load, Plant 2 at 78% load, and Plant 3 on standby reserve for high-slump infrastructure pours.`,
      bestDispatchPlan: fleetShortageCount > 0
        ? `Stagger dispatches into 3 distinct waves (05:30, 09:30, 14:00) and lease ${fleetShortageCount} external 7m³ transit mixers.`
        : `Run dynamic GPS route dispatch with automated 15-minute return buffer intervals.`,
      bestInventoryPlan: `Maintain 650 MT OPC 53 cement and 280 MT fly ash. Auto-trigger 400 MT tanker delivery when buffer reaches 4.5 days.`,
      bestFleetAllocation: `Deploy 10 transit mixers to Hinjewadi Tech corridor, 8 to Kharadi Township, and 6 to Hadapsar industrial belt.`,
      bestCapacityAllocation: `Allocate 450 m³/day for commercial slabs, 300 m³/day for Metro viaduct piers, and 200 m³/day for retail foundations.`
    };

    const simulationId = `sim-twin-${Date.now()}`;

    // 8. AI Impact Synthesis
    const aiStrategicInsights = await TwinAIService.evaluateScenarioImpact(params, {
      projectedMonthlyRevenueINR,
      revenueGrowthPercent,
      projectedGrossMarginPercent,
      projectedPlantUtilizationPercent,
      fleetShortageCount,
      plantBottleneckRisk
    });

    // Attempt DB persistence & Audit Logging (Requirement 24)
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
          aiAnalysisJson: { aiStrategicInsights, scores, bestPlans } as any
        }
      });

      // Audit Logging: Requirement 24
      await prisma.twinEvent.create({
        data: {
          eventType: "SIMULATION_EXECUTED",
          description: `Virtual simulation executed for "${params.scenarioName}" with projected revenue ₹${(projectedMonthlyRevenueINR / 100000).toFixed(1)}L.`,
          payloadJson: { params, revenueGrowthPercent, projectedPlantUtilizationPercent, resilienceScore } as any,
          userId: "Executive"
        }
      });
    } catch (e: any) {
      console.warn("[ScenarioSimulator Warning] Database persistence fallback:", e.message);
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
      overallResilienceScore: resilienceScore,
      scores,
      bestPlans,
      aiStrategicInsights,
      executedAt: new Date().toISOString()
    };
  }
}
