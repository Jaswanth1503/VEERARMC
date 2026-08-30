/**
 * Phase 6D: Digital Twin, Simulation & Self-Optimizing Enterprise Platform Types
 */

export interface DigitalTwinBaseline {
  twinId: string;
  twinName: string;
  monthlyRevenueINR: number;
  monthlyVolumeM3: number;
  activePlantsCount: number;
  totalDailyCapacityM3: number;
  activeFleetCount: number;
  grossMarginPercent: number;
  onTimeDeliveryRatePercent: number;
  materialReservesDays: Record<string, number>;
  syncedAt: string;
}

export interface ScenarioParameters {
  scenarioCode?: string;
  scenarioName: string;
  description?: string;
  demandDeltaPercent: number;        // e.g. +20%, +50%, -20%
  plantCapacityExpansionM3: number;  // e.g. +400 m3
  transitMixerFleetDelta: number;    // e.g. +6 trucks, -3 trucks
  materialCostDeltaPercent: number;  // e.g. +10% cement price hike
  sellingPriceDeltaPercent: number;  // e.g. +5% price adjustment
  customerLossPercent: number;       // e.g. 15% key account churn
}

export interface SimulationResultMetrics {
  simulationId: string;
  scenarioName: string;
  parameters: ScenarioParameters;
  projectedMonthlyRevenueINR: number;
  revenueDeltaINR: number;
  revenueGrowthPercent: number;
  projectedGrossMarginPercent: number;
  marginDeltaPercent: number;
  projectedMonthlyVolumeM3: number;
  projectedPlantUtilizationPercent: number;
  plantBottleneckRisk: boolean;
  projectedFleetUtilizationPercent: number;
  fleetShortageCount: number;
  overallResilienceScore: number;
  aiStrategicInsights: {
    executiveVerdict: string;
    operationalFeasibility: "HIGH" | "MODERATE" | "RISKY" | "UNFEASIBLE";
    recommendedMitigations: string[];
    growthOpportunities: string[];
  };
  executedAt: string;
}

export interface HeatmapCell {
  xLabel: string; // e.g. "Morning 06-10", "Plant 1", "M30 Grade"
  yLabel: string; // e.g. "Khadki", "Hinjewadi", "Zone II Sand"
  value: number;  // 0 - 100 intensity
  status: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  details: string;
}

export interface EnterpriseHeatmap {
  heatmapType: "RISK" | "DEMAND" | "REVENUE" | "CAPACITY" | "OPERATIONAL";
  title: string;
  description: string;
  matrix: HeatmapCell[];
  summaryNote: string;
}

export interface SelfOptimizationSuggestion {
  id: string;
  area: "PRODUCTION" | "LOGISTICS" | "INVENTORY" | "FLEET" | "REVENUE" | "PROCESS";
  title: string;
  currentInefficiency: string;
  optimizedState: string;
  expectedAnnualSavingsINR: number;
  roiPercent: number;
  confidenceScore: number;
  status: "IDENTIFIED" | "ADOPTED" | "ARCHIVED" | "EXECUTED";
  actionPlan: string;
}
