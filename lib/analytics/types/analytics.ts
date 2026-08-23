/**
 * Phase 6A: Business Intelligence & Executive Analytics Types and DTOs
 */

export type AnalyticsTimeRange = "7D" | "30D" | "90D" | "YTD" | "1Y" | "CUSTOM";

export interface KPIMetrics {
  totalRevenue: number;
  revenueGrowthPercent: number;
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  orderConversionRatePercent: number;
  averageOrderValue: number;
  totalVolumeBatchedM3: number;
  plantCapacityUtilizationPercent: number;
  onTimeDeliveryRatePercent: number;
  averageTransitMinutes: number;
  activeFleetCount: number;
  totalFleetCount: number;
  totalCustomers: number;
  newCustomersThisPeriod: number;
  customerRetentionRatePercent: number;
  businessHealthScore: number;
  healthScoreLabel: "CRITICAL" | "MODERATE" | "HEALTHY" | "OPTIMAL";
  healthScoreExplanation: string;
}

export interface RevenueTrendPoint {
  date: string;
  label: string;
  revenue: number;
  volumeM3: number;
  orderCount: number;
}

export interface RevenueByGrade {
  grade: string;
  volumeM3: number;
  revenue: number;
  percentage: number;
}

export interface RevenueByCustomer {
  customerId: string;
  customerName: string;
  companyName?: string;
  orderCount: number;
  totalVolumeM3: number;
  totalRevenue: number;
  contributionPercent: number;
}

export interface RevenueByProject {
  projectId: string;
  projectName: string;
  clientName: string;
  volumeM3: number;
  revenue: number;
  status: string;
}

export interface ProductionAnalyticsData {
  totalBatches: number;
  totalVolumeM3: number;
  averageBatchCycleMins: number;
  plantBreakdown: {
    plantId: string;
    plantName: string;
    capacityM3PerDay: number;
    volumeBatchedM3: number;
    utilizationPercent: number;
  }[];
  materialConsumptionKg: {
    materialName: string;
    plannedKg: number;
    consumedKg: number;
    variancePercent: number;
  }[];
}

export interface LogisticsAnalyticsData {
  totalTrips: number;
  completedTrips: number;
  delayedTrips: number;
  averageTransitMins: number;
  slumpComplianceRatePercent: number;
  topDrivers: {
    driverId: string;
    driverName: string;
    deliveriesCount: number;
    rating: number;
    onTimePercent: number;
  }[];
  vehicleUtilization: {
    vehicleId: string;
    vehicleNumber: string;
    tripsCompleted: number;
    distanceKm: number;
    status: string;
  }[];
}

export interface AIExecutiveInsights {
  strategicSummary: string;
  businessHealthScore: number;
  revenueOutlook: string;
  operationalRisks: {
    riskCategory: "LOGISTICS" | "PRODUCTION" | "REVENUE" | "CUSTOMER" | "INVENTORY";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    title: string;
    description: string;
    mitigationStrategy: string;
  }[];
  growthOpportunities: {
    area: string;
    potentialRevenueImpact: string;
    recommendation: string;
  }[];
  executiveActionItems: {
    priority: "IMMEDIATE" | "THIS_WEEK" | "STRATEGIC";
    action: string;
    targetDepartment: "SALES" | "PLANT_OPERATIONS" | "LOGISTICS" | "EXECUTIVE";
    owner: string;
  }[];
  generatedAt: string;
}

export interface ExecutiveReportData {
  id: string;
  title: string;
  reportType: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL";
  periodStart: string;
  periodEnd: string;
  kpis: KPIMetrics;
  revenueTrends: RevenueTrendPoint[];
  revenueByGrade: RevenueByGrade[];
  topCustomers: RevenueByCustomer[];
  production: ProductionAnalyticsData;
  logistics: LogisticsAnalyticsData;
  aiInsights: AIExecutiveInsights;
}
