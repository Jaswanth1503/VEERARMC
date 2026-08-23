export type QualityRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface ConcreteMixInput {
  concreteGrade: string;
  cementKg: number;
  waterKg: number;
  fineAggregateKg: number;
  coarseAggregateKg: number;
  admixtureKg?: number;
  flyAshKg?: number;
  ggbsKg?: number;
  silicaFumeKg?: number;
  targetStrengthMpa: number;
  ageDays?: number;
  slumpMm?: number;
  ambientTempCelsius?: number;
  curingCondition?: string;
  previousTestStrength?: number;
  projectId?: string;
}

export interface CalculatedEngineeringFeatures {
  totalBinderKg: number;
  waterCementRatio: number;
  admixturePercent: number;
  fineAggregatePercent: number;
  coarseAggregatePercent: number;
  totalDensityKgM3: number;
}

export interface FeatureContribution {
  featureName: string;
  impactMpa: number;
  direction: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  description: string;
}

export interface ModelPredictionOutput {
  predictedStrengthMpa: number;
  strengthMarginMpa: number;
  confidenceScorePercent: number;
  riskLevel: QualityRiskLevel;
  modelVersion: string;
  featureContributions: FeatureContribution[];
}

export interface AIQualityExplanation {
  summary: string;
  keyFactors: string[];
  risks: string[];
  recommendations: string[];
  explanation: string;
  aiStatus: "COMPLETED" | "FALLBACK" | "FAILED";
}

export interface FullQualityPredictionReport extends ModelPredictionOutput, AIQualityExplanation {
  id?: string;
  userId?: string;
  projectId?: string;
  inputs: ConcreteMixInput;
  calculatedFeatures: CalculatedEngineeringFeatures;
  createdAt?: Date;
}
