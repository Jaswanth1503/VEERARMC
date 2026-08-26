/**
 * Phase 6B: AI Forecasting & Decision Intelligence Types and DTOs
 */

export type ForecastHorizon = "7D" | "30D" | "90D" | "1Y";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface DemandForecastPoint {
  date: string;
  label: string;
  expectedDemandM3: number;
  bestCaseM3: number;
  worstCaseM3: number;
  confidencePercent: number;
  contributingFactors: string[];
}

export interface DemandForecastSummary {
  horizon: ForecastHorizon;
  totalPredictedDemandM3: number;
  averageDailyDemandM3: number;
  peakDemandDate: string;
  peakDemandM3: number;
  growthPercentMoM: number;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  confidenceRationale: string;
  trendPoints: DemandForecastPoint[];
}

export interface RevenueForecastSummary {
  horizon: ForecastHorizon;
  expectedRevenueINR: number;
  bestCaseRevenueINR: number;
  worstCaseRevenueINR: number;
  projectedProfitMarginPercent: number;
  revenueAtRiskINR: number;
  upsideOpportunityINR: number;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  confidenceRationale: string;
  timeline: {
    period: string;
    expectedINR: number;
    bestCaseINR: number;
    worstCaseINR: number;
  }[];
}

export interface MaterialDepletionForecast {
  materialName: string;
  category: "BINDER" | "AGGREGATE" | "WATER" | "ADMIXTURE";
  currentStockTon: number;
  dailyConsumptionTon: number;
  projectedDemandTon: number;
  daysUntilDepletion: number;
  reorderLevelTon: number;
  reorderStatus: "SUFFICIENT" | "WARNING" | "CRITICAL_SHORTAGE";
  recommendedOrderDate: string;
  suggestedPurchaseQtyTon: number;
}

export interface CapacityLogisticsForecast {
  horizon: ForecastHorizon;
  projectedPlantUtilizationPercent: number;
  peakHourSlots: { hour: number; projectedLoadM3: number; bottleneckRisk: boolean }[];
  idleCapacityM3PerDay: number;
  requiredTransitMixersCount: number;
  availableTransitMixersCount: number;
  mixerDeficitCount: number;
  driverShiftsRequired: number;
  averageTurnaroundMins: number;
  expansionRecommended: boolean;
  expansionRecommendationDetails?: string;
}

export interface CustomerChurnForecast {
  customerId: string;
  customerName: string;
  companyName?: string;
  lifetimeVolumeM3: number;
  repeatOrderProbabilityPercent: number;
  churnRiskScorePercent: number;
  churnRiskLevel: "LOW" | "MODERATE" | "HIGH";
  primaryRiskReason: string;
  recommendedRetentionAction: string;
}

export interface WhatIfSimulationInput {
  simulationName: string;
  demandAdjustmentPercent: number; // e.g. +25% or -15%
  plantCapacityExpansionM3: number; // e.g. +300 m3
  transitMixerFleetDelta: number; // e.g. +4 trucks or -2
  rawMaterialCostChangePercent: number; // e.g. +10% cement price hike
  sellingPriceChangePercent: number; // e.g. +5% price adjustment
}

export interface WhatIfSimulationResult {
  simulationId: string;
  simulationName: string;
  inputs: WhatIfSimulationInput;
  projectedMonthlyRevenueINR: number;
  revenueVarianceINR: number;
  projectedGrossMarginPercent: number;
  marginVariancePercent: number;
  projectedPlantUtilizationPercent: number;
  plantBottleneckRisk: boolean;
  projectedFleetUtilizationPercent: number;
  fleetDeficitWarning: string | null;
  recommendedAction: string;
}

export interface AIDecisionExecutiveBriefing {
  horizon: ForecastHorizon;
  executiveSummary: string;
  demandForecastInsight: string;
  revenueRiskRadar: {
    riskTitle: string;
    financialExposureINR: number;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    mitigationStrategy: string;
  }[];
  growthCatalysts: {
    opportunityTitle: string;
    upsideRevenueINR: number;
    actionPlan: string;
  }[];
  strategicActionItems: {
    priority: "URGENT_TODAY" | "THIS_WEEK" | "MONTHLY_STRATEGY";
    action: string;
    department: "SALES" | "PLANT_OPERATIONS" | "LOGISTICS" | "PROCUREMENT";
    impact: string;
  }[];
  generatedAt: string;
}
