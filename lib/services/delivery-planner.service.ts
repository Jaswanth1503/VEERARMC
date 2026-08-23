import { TruckRecommendationService } from "./truck-recommendation.service";
import { WeatherService, WeatherAnalysisResult } from "./weather.service";
import { MapsService } from "./maps.service";

export interface DeliveryPlannerInput {
  requiredVolumeM3: number;
  truckCapacityM3?: number;
  pouringDate?: Date | string;
  pouringTimeWindow?: string;
  distanceKm?: number;
  siteCity?: string;
  pincode?: string;
  customerPriority?: "NORMAL" | "HIGH" | "CRITICAL";
  rainProbabilityPercent?: number;
  temperatureCelsius?: number;
}

export class DeliveryPlannerService {
  /**
   * Deterministic priority score calculation.
   * Priority levels: LOW, NORMAL, HIGH, CRITICAL
   */
  static calculatePriority(volumeM3: number, customerPriority?: string, weatherStatus?: string): "LOW" | "NORMAL" | "HIGH" | "CRITICAL" {
    if (customerPriority === "CRITICAL" || volumeM3 > 100) return "CRITICAL";
    if (customerPriority === "HIGH" || volumeM3 > 50 || weatherStatus === "CAUTION") return "HIGH";
    if (volumeM3 < 10) return "LOW";
    return "NORMAL";
  }

  /**
   * Generates a complete, structured Delivery Plan including Plan A and Alternative Plan B.
   */
  static generateDeliveryPlan(input: DeliveryPlannerInput) {
    const truckInfo = TruckRecommendationService.calculateTruckRequirements({
      requiredVolumeM3: input.requiredVolumeM3,
      truckCapacityM3: input.truckCapacityM3 || 6.0,
      distanceKm: input.distanceKm || 15
    });

    const routeInfo = MapsService.estimateRoute(input.siteCity, input.pincode);
    const weatherInfo = WeatherService.evaluatePourWeather({
      temperatureCelsius: input.temperatureCelsius,
      rainProbabilityPercent: input.rainProbabilityPercent
    });

    const priority = this.calculatePriority(input.requiredVolumeM3, input.customerPriority, weatherInfo.weatherStatus);

    // Schedule dispatch timeline
    const baseDate = input.pouringDate ? new Date(input.pouringDate) : new Date();
    if (!input.pouringDate) baseDate.setDate(baseDate.getDate() + 1);

    const dispatchTime = new Date(baseDate);
    dispatchTime.setHours(7, 30, 0, 0); // 07:30 AM Primary Dispatch

    const arrivalStart = new Date(dispatchTime);
    arrivalStart.setMinutes(arrivalStart.getMinutes() + routeInfo.travelTimeMins);

    const arrivalEnd = new Date(arrivalStart);
    arrivalEnd.setMinutes(arrivalEnd.getMinutes() + 120); // 2 hr pour window

    // Alternative Plan B (Evening / Night window)
    const altDispatchTime = new Date(baseDate);
    altDispatchTime.setHours(16, 0, 0, 0); // 04:00 PM Afternoon Dispatch

    const altArrivalStart = new Date(altDispatchTime);
    altArrivalStart.setMinutes(altArrivalStart.getMinutes() + routeInfo.travelTimeMins);

    return {
      logistics: {
        requiredVolumeM3: truckInfo.requiredVolumeM3,
        truckCapacityM3: truckInfo.truckCapacityM3,
        recommendedTruckCount: truckInfo.recommendedTruckCount,
        estimatedTrips: truckInfo.estimatedTrips,
        estimatedTravelTimeMins: routeInfo.travelTimeMins,
        distanceKm: routeInfo.distanceKm,
        pouringWindowMins: 120
      },
      schedule: {
        dispatchTime,
        arrivalStart,
        arrivalEnd,
        pouringWindow: "08:00 AM - 10:30 AM"
      },
      alternativePlan: {
        name: "Alternative Afternoon Dispatch (Plan B)",
        dispatchTime: altDispatchTime,
        arrivalStart: altArrivalStart,
        pouringWindow: "04:30 PM - 07:00 PM",
        reason: "Recommended if morning site traffic or formwork preparations require additional buffer."
      },
      weather: weatherInfo,
      trafficStatus: routeInfo.trafficStatus,
      priority,
      explanation: truckInfo.explanation
    };
  }
}
