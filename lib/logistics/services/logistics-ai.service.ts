import { generateGeminiResponse } from "@/lib/ai/gemini";
import { AIRouteOptimizationResult, ETAForecastResult } from "../types/logistics";

export class LogisticsAIService {
  /**
   * Generates AI-optimized route recommendation, traffic risk assessment, and slump loss alerts.
   */
  static async optimizeRoute(params: {
    originPlant: string;
    destinationSite: string;
    distanceKm: number;
    concreteGrade?: string;
  }): Promise<AIRouteOptimizationResult> {
    const prompt = `
You are the Chief AI Logistics & Fleet Dispatch Controller for Veera RMC 2.0.
Analyze the ready-mix concrete transit route in Pune urban traffic:

Transit Parameters:
- Origin Batching Plant: ${params.originPlant}
- Destination Jobsite: ${params.destinationSite}
- Distance: ${params.distanceKm} km
- Concrete Grade: ${params.concreteGrade || "M25"}
- Slump Retention Requirement: IS 4926 compliant (maximum 90-minute transit pour window)

Respond strictly in JSON format:
{
  "originPlant": "${params.originPlant}",
  "destinationSite": "${params.destinationSite}",
  "distanceKm": ${params.distanceKm},
  "estimatedMinutes": 42,
  "recommendedRouteName": "Via Kharadi Bypass & Pune-Nagar Road (Avoid Chandan Nagar junction)",
  "alternativeRouteName": "Via Mundhwa Bridge & Magarpatta Flyover",
  "trafficRiskScore": 25.0,
  "roadCondition": "GOOD",
  "slumpLossRisk": "LOW",
  "aiRecommendations": [
    "Maintain drum agitation at 2-4 rpm during transit.",
    "Dispatch via Kharadi bypass to bypass school traffic zone.",
    "Target site arrival within 45 minutes to preserve 120mm workability."
  ],
  "confidenceScore": 94.5
}
`;

    try {
      const response = await generateGeminiResponse({
        prompt,
        temperature: 0.2,
        jsonMode: true
      });

      if (!response.isError && response.text) {
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            originPlant: parsed.originPlant || params.originPlant,
            destinationSite: parsed.destinationSite || params.destinationSite,
            distanceKm: parsed.distanceKm || params.distanceKm,
            estimatedMinutes: parsed.estimatedMinutes || Math.round(params.distanceKm * 2.8),
            recommendedRouteName: parsed.recommendedRouteName || "Via Pune Arterial Expressway Corridor",
            alternativeRouteName: parsed.alternativeRouteName || "Via Ring Road Outer Bypass",
            trafficRiskScore: parsed.trafficRiskScore || 20.0,
            roadCondition: parsed.roadCondition || "GOOD",
            slumpLossRisk: parsed.slumpLossRisk || (params.distanceKm > 25 ? "MODERATE" : "LOW"),
            aiRecommendations: Array.isArray(parsed.aiRecommendations) ? parsed.aiRecommendations : [
              "Maintain 2-4 rpm drum agitation.",
              "Estimated pour window within 60 minutes."
            ],
            confidenceScore: parsed.confidenceScore || 93.0
          };
        }
      }
    } catch (e) {
      console.warn("[LogisticsAIService Warning] Gemini AI offline, returning deterministic route optimization:", e);
    }

    return this.getFallbackRoute(params);
  }

  /**
   * Generates dynamic ETA and traffic delay forecast.
   */
  static async predictETA(params: {
    distanceKm: number;
    currentTime?: Date;
    peakTrafficMultiplier?: number;
  }): Promise<ETAForecastResult> {
    const now = params.currentTime || new Date();
    const currentHour = now.getHours();
    const isPeak = (currentHour >= 8 && currentHour <= 11) || (currentHour >= 17 && currentHour <= 20);
    const multiplier = params.peakTrafficMultiplier || (isPeak ? 1.45 : 1.15);

    const baseMinutes = Math.round(params.distanceKm * 2.2);
    const transitDuration = Math.round(baseMinutes * multiplier);
    const predictedArrival = new Date(now.getTime() + transitDuration * 60 * 1000);

    return {
      predictedArrival,
      transitDurationMins: transitDuration,
      delayProbabilityPercent: isPeak ? 35.0 : 10.0,
      trafficFactor: isPeak ? "HEAVY" : "MODERATE",
      confidenceScore: 92.0,
      aiExplanation: isPeak
        ? `Peak commute window detected (${currentHour}:00 hrs). Transit time includes +${Math.round(transitDuration - baseMinutes)} min traffic buffer.`
        : "Standard free-flow urban transit window."
    };
  }

  private static getFallbackRoute(params: {
    originPlant: string;
    destinationSite: string;
    distanceKm: number;
    concreteGrade?: string;
  }): AIRouteOptimizationResult {
    const dist = params.distanceKm || 14.5;
    const mins = Math.round(dist * 2.6);

    return {
      originPlant: params.originPlant,
      destinationSite: params.destinationSite,
      distanceKm: dist,
      estimatedMinutes: mins,
      recommendedRouteName: "Primary Express Corridor (Via Magarpatta & Kharadi Bypass)",
      alternativeRouteName: "Secondary Arterial (Via Nagar Highway Outer Ring)",
      trafficRiskScore: 18.0,
      roadCondition: "GOOD",
      slumpLossRisk: dist > 25 ? "MODERATE" : "LOW",
      aiRecommendations: [
        "Maintain transit mixer drum rotation at 2-4 rpm during transit.",
        "Discharge concrete immediately upon jobsite arrival to meet IS 4926 standards.",
        "Notify customer site supervisor 15 minutes before arrival."
      ],
      confidenceScore: 94.0
    };
  }
}
