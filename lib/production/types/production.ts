export type ProductionPlanStatus = 
  | "PLANNED"
  | "SCHEDULED"
  | "READY"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type ProductionBatchStatus = 
  | "PLANNED"
  | "MIXING"
  | "BATCHED"
  | "LOADED"
  | "DISPATCHED"
  | "FAILED";

export type PlantStatus = "ACTIVE" | "MAINTENANCE" | "OFFLINE";

export interface MixDesignProportions {
  grade: string;
  waterCementRatio: number;
  cementKgPerM3: number;
  flyAshKgPerM3: number;
  fineAggKgPerM3: number; // Sand Zone II
  coarseAgg20mmKgPerM3: number;
  coarseAgg10mmKgPerM3: number;
  waterKgPerM3: number;
  admixtureKgPerM3: number;
  slumpRangeMm: string;
}

export interface MaterialRequirementSummary {
  materialName: string;
  category: "BINDER" | "AGGREGATE" | "WATER" | "ADMIXTURE";
  totalPlannedKg: number;
  unit: string;
  costPerKg: number;
  estimatedCost: number;
}

export interface CreateProductionPlanInput {
  orderId: string;
  plantId: string;
  plannedQuantity?: number;
  concreteGrade?: string;
  scheduledDate: Date | string;
  scheduledStartTime: Date | string;
  scheduledEndTime?: Date | string;
  notes?: string;
}

export interface CreateBatchInput {
  productionPlanId: string;
  quantity: number;
  truckNumber?: string;
  operatorName?: string;
  mixingTimeSeconds?: number;
  waterCementRatio?: number;
  slumpMm?: number;
  temperatureCelsius?: number;
}

export interface PlantCapacityOverview {
  plantId: string;
  plantCode: string;
  plantName: string;
  dailyCapacityM3: number;
  capacityPerHour: number;
  utilizedCapacityM3: number;
  availableCapacityM3: number;
  utilizationPercent: number;
  status: PlantStatus;
}

export interface AIDemandForecastResult {
  forecastPeriod: "WEEKLY" | "MONTHLY";
  predictedDemandM3: number;
  highDemandWindows: string[];
  peakGrade: string;
  materialRequirements: {
    cementTons: number;
    flyAshTons: number;
    sandTons: number;
    aggregateTons: number;
    admixtureLiters: number;
    waterKl: number;
  };
  capacityBottlenecks: string[];
  aiRecommendations: string[];
  confidenceScore: number;
}
