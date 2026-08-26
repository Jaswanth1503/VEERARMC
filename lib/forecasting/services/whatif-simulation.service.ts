import { prisma } from "@/lib/prisma";
import { WhatIfSimulationInput, WhatIfSimulationResult } from "../types/forecasting";

export class WhatIfSimulationService {

  /**
   * Evaluates operational and financial sensitivity scenarios in real time.
   */
  static async runSimulation(input: WhatIfSimulationInput): Promise<WhatIfSimulationResult> {
    const baseRevenue = 41800000; // Baseline monthly revenue: Rs. 4.18 Cr
    const baseMargin = 23.4;      // Baseline margin: 23.4%
    const basePlantCap = 1200;    // Baseline daily capacity: 1200 m3
    const baseFleet = 24;         // Baseline transit mixers: 24
    const baseMonthlyVolume = 9450;

    // 1. Demand & Selling Price adjustments
    const adjustedVolume = Math.round(baseMonthlyVolume * (1 + input.demandAdjustmentPercent / 100));
    const effectivePriceFactor = (1 + input.sellingPriceChangePercent / 100);
    const projectedMonthlyRevenueINR = Math.round(baseRevenue * (1 + input.demandAdjustmentPercent / 100) * effectivePriceFactor);
    const revenueVarianceINR = projectedMonthlyRevenueINR - baseRevenue;

    // 2. Cost & Margin Impact
    const costFactor = 1 + (input.rawMaterialCostChangePercent * 0.65) / 100; // Material is ~65% of COGS
    const costAdjustedMargin = (baseMargin * effectivePriceFactor) / costFactor;
    const projectedGrossMarginPercent = Math.min(45, Math.max(8, Number(costAdjustedMargin.toFixed(1))));
    const marginVariancePercent = Number((projectedGrossMarginPercent - baseMargin).toFixed(1));

    // 3. Plant Utilization Impact
    const effectiveDailyCapacity = basePlantCap + (input.plantCapacityExpansionM3 / 30);
    const requiredDailyOutput = adjustedVolume / 30;
    const projectedPlantUtilizationPercent = Math.min(100, Math.round((requiredDailyOutput / effectiveDailyCapacity) * 100));
    const plantBottleneckRisk = projectedPlantUtilizationPercent >= 88;

    // 4. Fleet Load & Deficit
    const effectiveFleet = baseFleet + input.transitMixerFleetDelta;
    const trucksNeeded = Math.ceil(requiredDailyOutput / 14); // Average 14 m3 / truck / day
    const projectedFleetUtilizationPercent = Math.min(100, Math.round((trucksNeeded / Math.max(1, effectiveFleet)) * 100));
    
    let fleetDeficitWarning: string | null = null;
    if (trucksNeeded > effectiveFleet) {
      fleetDeficitWarning = `Fleet Deficit: Projected daily demand requires ${trucksNeeded} transit mixers, but available fleet is ${effectiveFleet} (${trucksNeeded - effectiveFleet} mixer shortfall).`;
    }

    // 5. Strategic Recommendation
    let recommendedAction = "Scenario is financially and operationally viable with stable plant margins and fleet buffers.";
    if (plantBottleneckRisk && fleetDeficitWarning) {
      recommendedAction = "High-risk scenario: Both plant batching and fleet capacity will exceed 90% utilization. Recommend commissioning additional 300 m³ satellite batching and leasing 4 temporary transit mixers.";
    } else if (plantBottleneckRisk) {
      recommendedAction = "Plant capacity constraint detected. Shift high-volume commercial pours to overnight/early-morning batching slots (4:00 AM - 9:00 AM).";
    } else if (marginVariancePercent < -3) {
      recommendedAction = "Raw material inflation is compressing gross margin by >3%. Recommend triggering index-linked fuel and cement surcharge clauses on commercial contracts.";
    }

    const simulationId = `sim-${Date.now()}`;

    // Attempt DB persistence
    try {
      await prisma.whatIfSimulation.create({
        data: {
          simulationName: input.simulationName || "Executive Strategy Scenario",
          description: `Demand: ${input.demandAdjustmentPercent}%, Fleet: ${input.transitMixerFleetDelta}, Material Cost: ${input.rawMaterialCostChangePercent}%`,
          parametersJson: input as any,
          resultsJson: {
            projectedMonthlyRevenueINR,
            revenueVarianceINR,
            projectedGrossMarginPercent,
            marginVariancePercent,
            projectedPlantUtilizationPercent,
            plantBottleneckRisk,
            projectedFleetUtilizationPercent,
            fleetDeficitWarning,
            recommendedAction
          } as any
        }
      });
    } catch (e: any) {
      console.warn("[WhatIfSimulation Warning] Database offline, running in-memory simulation:", e.message);
    }

    return {
      simulationId,
      simulationName: input.simulationName,
      inputs: input,
      projectedMonthlyRevenueINR,
      revenueVarianceINR,
      projectedGrossMarginPercent,
      marginVariancePercent,
      projectedPlantUtilizationPercent,
      plantBottleneckRisk,
      projectedFleetUtilizationPercent,
      fleetDeficitWarning,
      recommendedAction
    };
  }
}
