/**
 * Phase 6C: AI Autonomous Operations & Command Center Types
 */

export type AlertSeverity = "CRITICAL" | "WARNING" | "INFO";
export type AlertCategory = "ORDERS" | "PRODUCTION" | "INVENTORY" | "LOGISTICS" | "REVENUE" | "FORECASTING" | "SALES" | "SYSTEM";
export type RecommendationDomain = "SALES" | "OPERATIONS" | "PRODUCTION" | "LOGISTICS" | "PROCUREMENT" | "FINANCE" | "EXECUTIVE";
export type RecommendationStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "EXECUTED";
export type BriefingType = "MORNING" | "AFTERNOON" | "EOD" | "WEEKLY" | "MONTHLY";

export interface ComponentHealthScore {
  componentName: string;
  score: number; // 0 - 100
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  metricLabel: string;
  metricValue: string;
  trendPercent: number;
}

export interface UnifiedBusinessHealth {
  overallHealthScore: number; // 0 - 100
  healthStatus: "OPTIMAL" | "STABLE" | "ATTENTION_REQUIRED" | "CRITICAL";
  revenueScore: number;
  operationsScore: number;
  productionScore: number;
  deliveryScore: number;
  customerScore: number;
  inventoryScore: number;
  forecastConfidenceScore: number;
  components: ComponentHealthScore[];
  updatedAt: string;
}

export interface RootCauseAnalysis {
  issueTitle: string;
  likelyRootCause: string;
  affectedModules: string[];
  businessExposureINR: number;
  operationalImpact: string;
  suggestedResolution: string;
  confidenceScore: number;
}

export interface CommandCenterAlertItem {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  rootCause?: RootCauseAnalysis;
  impactSummary: string;
  isResolved: boolean;
  createdAt: string;
  resolutionActionText?: string;
}

export interface AutonomousRecommendationItem {
  id: string;
  domain: RecommendationDomain;
  title: string;
  reason: string;
  expectedImpact: string;
  confidenceScore: number;
  requiredAction: string;
  status: RecommendationStatus;
  approvedById?: string | null;
  approvedAt?: string | null;
  executionResultText?: string;
  createdAt: string;
}

export interface ExecutiveBriefingPacket {
  id: string;
  briefingType: BriefingType;
  headline: string;
  executiveSummary: string;
  keyMetrics: { label: string; value: string; status: "UP" | "DOWN" | "NEUTRAL" }[];
  criticalRisks: { risk: string; exposure: string; mitigation: string }[];
  strategicOpportunities: { opportunity: string; upside: string; action: string }[];
  leadershipActionItems: { priority: "IMMEDIATE" | "TODAY" | "THIS_WEEK"; action: string; owner: string }[];
  generatedAt: string;
}

export interface CopilotQueryRequest {
  question: string;
  contextScope?: "ALL" | "ORDERS" | "PRODUCTION" | "LOGISTICS" | "REVENUE";
}

export interface CopilotQueryResponse {
  answer: string;
  directAnswerSummary: string;
  supportingData: { metric: string; value: string }[];
  recommendedActions: string[];
  relatedModules: string[];
  confidenceScore: number;
}
