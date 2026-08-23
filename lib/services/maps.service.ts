export interface RouteEstimate {
  distanceKm: number;
  travelTimeMins: number;
  trafficStatus: "CLEAR" | "MODERATE" | "HEAVY";
}

export class MapsService {
  /**
   * Deterministic route and distance estimation.
   */
  static estimateRoute(siteCity?: string, pincode?: string): RouteEstimate {
    // Standard city distance estimation buffer
    const dist = pincode?.endsWith("1") ? 12 : pincode?.endsWith("2") ? 18 : 22;
    const mins = Math.round(dist * 2.2);

    return {
      distanceKm: dist,
      travelTimeMins: mins,
      trafficStatus: mins > 40 ? "MODERATE" : "CLEAR"
    };
  }
}
