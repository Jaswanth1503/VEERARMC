import { generateGeminiResponse } from "@/lib/ai/gemini";
import { ScenarioParameters } from "../types/digital-twin";

export class TwinAIService {

  /**
   * Generates Gemini AI strategic evaluation of simulated Digital Twin results.
   */
  static async evaluateScenarioImpact(
    params: ScenarioParameters,
    results: {
      projectedMonthlyRevenueINR: number;
      revenueGrowthPercent: number;
      projectedGrossMarginPercent: number;
      projectedPlantUtilizationPercent: number;
      fleetShortageCount: number;
      plantBottleneckRisk: boolean;
    }
  ): Promise<{
    executiveVerdict: string;
    operationalFeasibility: "HIGH" | "MODERATE" | "RISKY" | "UNFEASIBLE";
    recommendedMitigations: string[];
    growthOpportunities: string[];
  }> {
    const prompt = `
You are the Chief Enterprise Simulation Officer for Veera RMC 2.0.
Analyze the following Digital Twin simulation run:

Scenario: "${params.scenarioName}"
- Demand Delta: ${params.demandDeltaPercent}%
- Plant Expansion: +${params.plantCapacityExpansionM3} m³
- Fleet Delta: ${params.transitMixerFleetDelta} mixers
- Material Cost Shift: ${params.materialCostDeltaPercent}%
- Projected Monthly Revenue: ₹${(results.projectedMonthlyRevenueINR / 100000).toFixed(1)} Lakh (${results.revenueGrowthPercent >= 0 ? "+" : ""}${results.revenueGrowthPercent}% Growth)
- Projected Margin: ${results.projectedGrossMarginPercent}%
- Plant Utilization: ${results.projectedPlantUtilizationPercent}% (Bottleneck Risk: ${results.plantBottleneckRisk})
- Fleet Shortage: ${results.fleetShortageCount} trucks

Respond with strict JSON:
1. "executiveVerdict": string (2-3 sentences of clear decision verdict for the Board)
2. "operationalFeasibility": "HIGH" | "MODERATE" | "RISKY" | "UNFEASIBLE"
3. "recommendedMitigations": array of strings (2-3 actionable steps to safeguard operations)
4. "growthOpportunities": array of strings (2-3 commercial upsell or margin expansion opportunities)

Return STRICT JSON only.
`;

    try {
      const aiRes = await generateGeminiResponse({
        prompt,
        systemInstruction: "You are an enterprise manufacturing simulation strategist. Output strict JSON only.",
        jsonMode: true,
        temperature: 0.2
      });

      if (!aiRes.isError && aiRes.text) {
        const parsed = JSON.parse(aiRes.text);
        return {
          executiveVerdict: parsed.executiveVerdict || this.getDefaultVerdict(params, results),
          operationalFeasibility: parsed.operationalFeasibility || (results.plantBottleneckRisk || results.fleetShortageCount > 0 ? "RISKY" : "HIGH"),
          recommendedMitigations: parsed.recommendedMitigations || this.getDefaultMitigations(results),
          growthOpportunities: parsed.growthOpportunities || this.getDefaultOpportunities(results)
        };
      }
    } catch (e: any) {
      console.warn("[TwinAIService Warning] Using deterministic simulation synthesis:", e.message);
    }

    return {
      executiveVerdict: this.getDefaultVerdict(params, results),
      operationalFeasibility: results.plantBottleneckRisk || results.fleetShortageCount > 0 ? "RISKY" : "HIGH",
      recommendedMitigations: this.getDefaultMitigations(results),
      growthOpportunities: this.getDefaultOpportunities(results)
    };
  }

  private static getDefaultVerdict(params: ScenarioParameters, res: any): string {
    if (res.plantBottleneckRisk && res.fleetShortageCount > 0) {
      return `Scenario '${params.scenarioName}' yields substantial revenue growth to ₹${(res.projectedMonthlyRevenueINR / 100000).toFixed(1)}L (+${res.revenueGrowthPercent}%), but triggers critical batching and fleet deficits (${res.fleetShortageCount} mixer shortfall). Execution requires leasing 4 mixers and commissioning satellite plant batching.`;
    }
    if (res.plantBottleneckRisk) {
      return `Scenario '${params.scenarioName}' reaches ₹${(res.projectedMonthlyRevenueINR / 100000).toFixed(1)}L revenue but drives plant utilization to ${res.projectedPlantUtilizationPercent}%. Stagger commercial pours to early morning (05:30 AM) to maintain operational stability.`;
    }
    return `Scenario '${params.scenarioName}' is highly feasible with ₹${(res.projectedMonthlyRevenueINR / 100000).toFixed(1)}L revenue (+${res.revenueGrowthPercent}%) and steady ${res.projectedGrossMarginPercent}% gross margin. Plant capacity and fleet buffers remain in safe operational zones.`;
  }

  private static getDefaultMitigations(res: any) {
    const list = [];
    if (res.plantBottleneckRisk) {
      list.push("Shift high-volume commercial foundation pours to 05:30 AM early wave.");
    }
    if (res.fleetShortageCount > 0) {
      list.push(`Lease ${res.fleetShortageCount} temporary 7m³ transit mixers to handle peak hourly return cycles.`);
    }
    list.push("Lock in bulk OPC 53 cement supply contracts with 30-day index pricing protection.");
    return list;
  }

  private static getDefaultOpportunities(res: any) {
    return [
      "Upsell high-early-strength M35/M40 mix packages to accelerate client formwork stripping.",
      "Bundle 42m boom pump leasing with 60+ m³ high-volume residential slab pour orders."
    ];
  }
}
