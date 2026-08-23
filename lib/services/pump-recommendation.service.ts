export class PumpRecommendationService {
  /**
   * Recommends concrete pumping equipment based on building height/floors & site access.
   */
  static recommendPump(floors: number = 1, volumeM3: number = 30, pumpRequired: boolean = true) {
    if (!pumpRequired) {
      return {
        recommendedPumpType: "NONE",
        pumpLabel: "Chute Direct Discharge",
        reason: "Chute discharge selected for ground-level accessible pour.",
        estimatedCost: 0,
        confidence: "HIGH"
      };
    }

    if (floors > 8) {
      return {
        recommendedPumpType: "BOOM_PUMP_42M",
        pumpLabel: "42 Meter High-Reach Boom Pump",
        reason: "Recommended for high-rise structure exceeding 8 floors or 25m height.",
        estimatedCost: 9500,
        confidence: "HIGH"
      };
    } else if (floors > 3) {
      return {
        recommendedPumpType: "BOOM_PUMP_24M",
        pumpLabel: "24 Meter Mobile Boom Pump",
        reason: "Recommended for 3-8 story residential or commercial elevation pour.",
        estimatedCost: 6000,
        confidence: "HIGH"
      };
    } else {
      return {
        recommendedPumpType: "LINE_PUMP",
        pumpLabel: "Stationary Ground Line Pump",
        reason: "Recommended for 1-3 story residential slab, footing, or narrow site access pour.",
        estimatedCost: 3500,
        confidence: "HIGH"
      };
    }
  }
}
