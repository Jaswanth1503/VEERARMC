export interface TruckCalculationInput {
  requiredVolumeM3: number;
  truckCapacityM3?: number; // default 6.0 m³
  distanceKm?: number;
  pouringRateM3PerHour?: number; // default 15 m³/hr
}

export interface TruckCalculationResult {
  requiredVolumeM3: number;
  truckCapacityM3: number;
  recommendedTruckCount: number;
  estimatedTrips: number;
  estimatedTransitTimeMins: number;
  unloadingTimeMins: number;
  totalTurnaroundTimeMins: number;
  explanation: string;
}

export class TruckRecommendationService {
  /**
   * Deterministic calculation for required transit mixer trucks.
   * Formula: ceil(Required Volume / Truck Capacity)
   * ALWAYS deterministic arithmetic. AI NEVER calculates arithmetic.
   */
  static calculateTruckRequirements(input: TruckCalculationInput): TruckCalculationResult {
    const volume = Math.max(0.5, Math.round(input.requiredVolumeM3 * 10) / 10);
    const capacity = Math.max(1, input.truckCapacityM3 || 6.0);
    const distance = Math.max(1, input.distanceKm || 15);
    const pourRate = Math.max(5, input.pouringRateM3PerHour || 15);

    // Deterministic truck count
    const recommendedTruckCount = Math.ceil(volume / capacity);
    const estimatedTrips = recommendedTruckCount;

    // Transit & Turnaround calculations
    const estimatedTransitTimeMins = Math.round(Math.max(20, distance * 2.5));
    const unloadingTimeMins = Math.round((capacity / pourRate) * 60);
    const totalTurnaroundTimeMins = (estimatedTransitTimeMins * 2) + unloadingTimeMins + 15; // 15 mins plant wash/batching buffer

    const explanation = `${recommendedTruckCount} standard transit mixer truck${recommendedTruckCount > 1 ? "s" : ""} (${capacity} m³ capacity) recommended for total volume of ${volume} m³. Calculated using deterministic capacity arithmetic (${volume} m³ / ${capacity} m³ = ${recommendedTruckCount} trucks).`;

    return {
      requiredVolumeM3: volume,
      truckCapacityM3: capacity,
      recommendedTruckCount,
      estimatedTrips,
      estimatedTransitTimeMins,
      unloadingTimeMins,
      totalTurnaroundTimeMins,
      explanation
    };
  }
}
