import { prisma } from "../prisma";
import { TruckRecommendationService } from "./truck-recommendation.service";
import { GradeRecommendationService } from "./grade-recommendation.service";
import { PumpRecommendationService } from "./pump-recommendation.service";
import { PlantRecommendationService } from "./plant-recommendation.service";
import { DeliveryPlannerService } from "./delivery-planner.service";
import { RecommendationAIService } from "./recommendation-ai.service";

export interface GenerateRecommendationInput {
  userId?: string;
  projectId?: string;
  orderId?: string;
  quoteId?: string;
  blueprintAnalysisId?: string;

  projectName?: string;
  projectType?: string;
  floors?: number;
  requiredVolumeM3: number;
  truckCapacityM3?: number;
  pumpRequired?: boolean;
  pouringDate?: Date | string;
  pouringTimeWindow?: string;
  siteCity?: string;
  pincode?: string;
  customerPriority?: "NORMAL" | "HIGH" | "CRITICAL";
  rainProbabilityPercent?: number;
  temperatureCelsius?: number;
}

export class RecommendationService {
  /**
   * Orchestrates multi-module recommendation generation combining database data,
   * deterministic calculation rules, and Gemini qualitative reasoning.
   */
  static async generateRecommendation(input: GenerateRecommendationInput) {
    const volume = Math.max(0.5, input.requiredVolumeM3);
    const floors = input.floors || 1;
    const projectType = input.projectType || "Residential";

    // 1. Grade Recommendation
    const gradeRec = GradeRecommendationService.recommendGrade(projectType, floors);

    // 2. Pump Recommendation
    const pumpRec = PumpRecommendationService.recommendPump(floors, volume, input.pumpRequired ?? true);

    // 3. Plant Recommendation (with DB-offline safety)
    const plantRec = await PlantRecommendationService.recommendPlant(input.siteCity, input.pincode);

    // 4. Delivery Plan & Truck Calculations (Deterministic)
    const deliveryPlanData = DeliveryPlannerService.generateDeliveryPlan({
      requiredVolumeM3: volume,
      truckCapacityM3: input.truckCapacityM3 || 6.0,
      pouringDate: input.pouringDate,
      pouringTimeWindow: input.pouringTimeWindow,
      siteCity: input.siteCity,
      pincode: input.pincode,
      customerPriority: input.customerPriority,
      rainProbabilityPercent: input.rainProbabilityPercent,
      temperatureCelsius: input.temperatureCelsius
    });

    // 5. AI Qualitative Analysis
    const aiReasoning = await RecommendationAIService.analyzePlanningContext({
      projectType,
      floors,
      volumeM3: volume,
      truckCount: deliveryPlanData.logistics.recommendedTruckCount,
      weatherStatus: deliveryPlanData.weather.weatherStatus,
      distanceKm: deliveryPlanData.logistics.distanceKm
    });

    // 6. Save Recommendation & Delivery Plan to PostgreSQL (with DB-offline safety)
    let recommendation: any = null;

    try {
      recommendation = await prisma.recommendation.create({
        data: {
          userId: input.userId || null,
          projectId: input.projectId || null,
          orderId: input.orderId || null,
          quoteId: input.quoteId || null,
          blueprintAnalysisId: input.blueprintAnalysisId || null,
          type: "PROJECT_RECOMMENDATION",
          status: "GENERATED",
          confidence: "HIGH",

          summary: aiReasoning.summary,
          aiExplanation: aiReasoning.explanation,

          // Line Items
          items: {
            create: [
              {
                category: "CONCRETE_GRADE",
                title: `Recommended Concrete Grade: ${gradeRec.recommendedGrade}`,
                recommendedValue: gradeRec.recommendedGrade,
                reason: gradeRec.reason,
                confidence: "HIGH",
                source: "DATABASE"
              },
              {
                category: "PUMP_TYPE",
                title: `Recommended Pump: ${pumpRec.pumpLabel}`,
                recommendedValue: pumpRec.recommendedPumpType,
                reason: pumpRec.reason,
                confidence: "HIGH",
                source: "DETERMINISTIC_RULES"
              },
              {
                category: "TRUCK_COUNT",
                title: `Recommended Truck Fleet: ${deliveryPlanData.logistics.recommendedTruckCount} Trucks`,
                recommendedValue: `${deliveryPlanData.logistics.recommendedTruckCount} Trucks`,
                unit: "Trucks",
                reason: deliveryPlanData.explanation,
                confidence: "HIGH",
                source: "DETERMINISTIC_RULES"
              },
              {
                category: "PLANT_SELECTION",
                title: `Primary Batching Plant: ${plantRec.primaryPlant.name}`,
                recommendedValue: plantRec.primaryPlant.name,
                reason: plantRec.reason,
                confidence: "HIGH",
                source: "DATABASE"
              },
              {
                category: "WEATHER_WINDOW",
                title: `Weather Status: ${deliveryPlanData.weather.weatherStatus}`,
                recommendedValue: deliveryPlanData.weather.weatherStatus,
                reason: deliveryPlanData.weather.recommendationNote,
                confidence: "HIGH",
                source: "WEATHER_API"
              }
            ]
          },

          // Associated Delivery Plan Record
          deliveryPlans: {
            create: [
              {
                projectId: input.projectId || null,
                orderId: input.orderId || null,
                plantId: plantRec.primaryPlant.id || null,
                status: "RECOMMENDED",
                priority: deliveryPlanData.priority,

                requiredVolumeM3: deliveryPlanData.logistics.requiredVolumeM3,
                truckCapacityM3: deliveryPlanData.logistics.truckCapacityM3,
                recommendedTruckCount: deliveryPlanData.logistics.recommendedTruckCount,
                estimatedTrips: deliveryPlanData.logistics.estimatedTrips,
                estimatedTravelTimeMins: deliveryPlanData.logistics.estimatedTravelTimeMins,
                distanceKm: deliveryPlanData.logistics.distanceKm,

                recommendedDispatchTime: deliveryPlanData.schedule.dispatchTime,
                recommendedArrivalStart: deliveryPlanData.schedule.arrivalStart,
                recommendedArrivalEnd: deliveryPlanData.schedule.arrivalEnd,
                pouringWindowMins: deliveryPlanData.logistics.pouringWindowMins,

                weatherStatus: deliveryPlanData.weather.weatherStatus,
                weatherTempCelsius: deliveryPlanData.weather.temperatureCelsius,
                rainProbabilityPercent: deliveryPlanData.weather.rainProbabilityPercent,
                trafficStatus: deliveryPlanData.trafficStatus
              }
            ]
          }
        },
        include: {
          items: true,
          deliveryPlans: {
            include: { plant: true }
          }
        }
      });
    } catch (dbErr) {
      console.warn("[RecommendationService Warning] Database offline during recommendation persistence, returning fallback report:", dbErr);
      recommendation = {
        id: `rec-${Date.now()}`,
        type: "PROJECT_RECOMMENDATION",
        status: "GENERATED",
        confidence: "HIGH",
        summary: aiReasoning.summary,
        aiExplanation: aiReasoning.explanation,
        items: [
          { category: "CONCRETE_GRADE", title: `Recommended Concrete Grade: ${gradeRec.recommendedGrade}`, recommendedValue: gradeRec.recommendedGrade, reason: gradeRec.reason, confidence: "HIGH" },
          { category: "PUMP_TYPE", title: `Recommended Pump: ${pumpRec.pumpLabel}`, recommendedValue: pumpRec.recommendedPumpType, reason: pumpRec.reason, confidence: "HIGH" },
          { category: "TRUCK_COUNT", title: `Recommended Truck Fleet: ${deliveryPlanData.logistics.recommendedTruckCount} Trucks`, recommendedValue: `${deliveryPlanData.logistics.recommendedTruckCount} Trucks`, reason: deliveryPlanData.explanation, confidence: "HIGH" },
          { category: "PLANT_SELECTION", title: `Primary Batching Plant: ${plantRec.primaryPlant.name}`, recommendedValue: plantRec.primaryPlant.name, reason: plantRec.reason, confidence: "HIGH" },
          { category: "WEATHER_WINDOW", title: `Weather Status: ${deliveryPlanData.weather.weatherStatus}`, recommendedValue: deliveryPlanData.weather.weatherStatus, reason: deliveryPlanData.weather.recommendationNote, confidence: "HIGH" }
        ],
        deliveryPlans: [
          {
            plant: plantRec.primaryPlant,
            status: "RECOMMENDED",
            priority: deliveryPlanData.priority,
            requiredVolumeM3: deliveryPlanData.logistics.requiredVolumeM3,
            truckCapacityM3: deliveryPlanData.logistics.truckCapacityM3,
            recommendedTruckCount: deliveryPlanData.logistics.recommendedTruckCount,
            estimatedTrips: deliveryPlanData.logistics.estimatedTrips,
            estimatedTravelTimeMins: deliveryPlanData.logistics.estimatedTravelTimeMins,
            distanceKm: deliveryPlanData.logistics.distanceKm,
            recommendedDispatchTime: deliveryPlanData.schedule.dispatchTime,
            recommendedArrivalStart: deliveryPlanData.schedule.arrivalStart,
            recommendedArrivalEnd: deliveryPlanData.schedule.arrivalEnd,
            pouringWindowMins: deliveryPlanData.logistics.pouringWindowMins,
            weatherStatus: deliveryPlanData.weather.weatherStatus,
            weatherTempCelsius: deliveryPlanData.weather.temperatureCelsius,
            rainProbabilityPercent: deliveryPlanData.weather.rainProbabilityPercent,
            trafficStatus: deliveryPlanData.trafficStatus
          }
        ]
      };
    }

    return {
      recommendation,
      gradeComparison: GradeRecommendationService.getGradeComparisonMatrix(),
      alternativePlan: deliveryPlanData.alternativePlan,
      aiAnalysis: aiReasoning
    };
  }

  /**
   * Retrieves single Recommendation by ID.
   */
  static async getRecommendationById(id: string) {
    try {
      return await prisma.recommendation.findUnique({
        where: { id },
        include: {
          items: true,
          deliveryPlans: { include: { plant: true } }
        }
      });
    } catch (e) {
      return null;
    }
  }

  /**
   * Overrides or updates recommendation status.
   */
  static async updateRecommendationStatus(id: string, status: "APPROVED" | "OVERRIDDEN" | "REJECTED", overrideReason?: string) {
    try {
      return await prisma.recommendation.update({
        where: { id },
        data: {
          status
        }
      });
    } catch (e) {
      return { id, status };
    }
  }

  /**
   * Approves recommendation and marks status as APPROVED.
   */
  static async approveRecommendation(id: string, userId?: string) {
    return await this.updateRecommendationStatus(id, "APPROVED");
  }

  /**
   * Overrides delivery plan with audit reason.
   */
  static async overrideDeliveryPlan(id: string, overrideReason: string, overriddenBy?: string, newPlantId?: string) {
    try {
      return await prisma.deliveryPlan.update({
        where: { id },
        data: {
          status: "OVERRIDDEN",
          overrideReason,
          plantId: newPlantId || undefined
        }
      });
    } catch (e) {
      return { id, status: "OVERRIDDEN", overrideReason, plantId: newPlantId || null };
    }
  }
}
