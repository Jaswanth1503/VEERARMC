export type VehicleStatus = 
  | "AVAILABLE"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "LOADING"
  | "UNLOADING"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE";

export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "ON_LEAVE";

export type DeliveryTripStatus = 
  | "ASSIGNED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "ARRIVED_AT_SITE"
  | "UNLOADING"
  | "DELIVERED"
  | "CONFIRMED"
  | "CANCELLED";

export type DeliveryIssueType = 
  | "TRAFFIC_DELAY"
  | "VEHICLE_BREAKDOWN"
  | "WEATHER_ISSUE"
  | "CUSTOMER_DELAY"
  | "SITE_ACCESS_PROBLEM"
  | "SLUMP_LOSS";

export interface CreateTripInput {
  orderId: string;
  vehicleId: string;
  driverId: string;
  productionPlanId?: string;
  productionBatchId?: string;
  concreteGrade?: string;
  quantityM3?: number;
  originPlant?: string;
  destinationAddress: string;
  destinationCity?: string;
  destinationPincode?: string;
  distanceKm?: number;
  estimatedArrival?: Date | string;
}

export interface AIRouteOptimizationResult {
  originPlant: string;
  destinationSite: string;
  distanceKm: number;
  estimatedMinutes: number;
  recommendedRouteName: string;
  alternativeRouteName?: string;
  trafficRiskScore: number;
  roadCondition: string;
  slumpLossRisk: "LOW" | "MODERATE" | "HIGH";
  aiRecommendations: string[];
  confidenceScore: number;
}

export interface ETAForecastResult {
  predictedArrival: Date | string;
  transitDurationMins: number;
  delayProbabilityPercent: number;
  trafficFactor: "LOW" | "MODERATE" | "HEAVY" | "SEVERE";
  confidenceScore: number;
  aiExplanation: string;
}
