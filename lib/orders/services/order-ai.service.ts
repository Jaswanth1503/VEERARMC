import { generateGeminiResponse } from "@/lib/ai/gemini";
import { OrderAIAnalysis } from "../types/order";

export class OrderAIService {
  /**
   * Evaluates order feasibility, delivery complexity, quantity anomalies, and potential weather/logistic risks.
   */
  static async analyzeOrder(params: {
    orderNumber: string;
    concreteGrade: string;
    totalQuantity: number;
    requestedDeliveryDate: string | Date;
    deliveryAddress: string;
    siteCity?: string;
    pumpRequired?: boolean;
    pumpType?: string;
    specialInstructions?: string;
  }): Promise<OrderAIAnalysis> {
    const prompt = `
You are the Chief Ready Mix Concrete Operations & Logistics Intelligence AI for Veera RMC 2.0.
Analyze the following commercial RMC concrete delivery order and assess risk factors, production schedule feasibility, and dispatch constraints:

Order Details:
- Order Number: ${params.orderNumber}
- Concrete Grade: ${params.concreteGrade}
- Total Volume: ${params.totalQuantity} m³
- Requested Delivery Date: ${params.requestedDeliveryDate}
- Delivery Location: ${params.deliveryAddress}, ${params.siteCity || "Pune"}
- Concrete Pump Required: ${params.pumpRequired ? `Yes (${params.pumpType || "Standard Boom Pump"})` : "No (Chute Pour)"}
- Special Client Instructions: ${params.specialInstructions || "None"}

Provide an operational assessment in JSON format:
{
  "summary": "2-sentence executive operational summary of this order and pour requirements.",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "risks": [
    "Identified risk 1 (e.g. high volume transit window, slump retention, site access, pump setup)",
    "Identified risk 2"
  ],
  "recommendations": [
    "Actionable dispatch or plant recommendation 1",
    "Actionable dispatch or plant recommendation 2",
    "Actionable dispatch or plant recommendation 3"
  ],
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "productionFeasibility": "Clear / Tight / Heavy Load",
  "deliveryFeasibility": "Optimal Transit / Potential Delays"
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
            summary: parsed.summary || `Order ${params.orderNumber} for ${params.totalQuantity} m³ of ${params.concreteGrade} concrete scheduled for ${params.siteCity || "Pune"}.`,
            riskLevel: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(parsed.riskLevel) ? parsed.riskLevel : "LOW",
            risks: Array.isArray(parsed.risks) && parsed.risks.length > 0 ? parsed.risks : ["Ensure site ingress and egress clearance for transit mixer trucks."],
            recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0 ? parsed.recommendations : [
              "Coordinate with batching plant 2 hours prior to scheduled batching.",
              "Verify concrete pump setup and washout pit area before first truck arrives."
            ],
            confidence: ["HIGH", "MEDIUM", "LOW"].includes(parsed.confidence) ? parsed.confidence : "HIGH",
            productionFeasibility: parsed.productionFeasibility || "Clear",
            deliveryFeasibility: parsed.deliveryFeasibility || "Optimal Transit"
          };
        }
      }
    } catch (err) {
      console.warn("[OrderAIService Warning] Gemini AI service offline, using deterministic operational analysis fallback:", err);
    }

    return this.getFallbackAnalysis(params);
  }

  private static getFallbackAnalysis(params: {
    orderNumber: string;
    concreteGrade: string;
    totalQuantity: number;
    pumpRequired?: boolean;
    siteCity?: string;
  }): OrderAIAnalysis {
    const isLargeVolume = params.totalQuantity > 50;
    const isHighGrade = ["M40", "M45", "M50"].includes(params.concreteGrade);

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    const risks: string[] = [];
    const recommendations: string[] = [
      "Ensure dedicated transit mixer turning radius and washout area at site.",
      "Conduct slump and temperature test on each delivery load before discharge."
    ];

    if (isLargeVolume) {
      riskLevel = "MEDIUM";
      risks.push(`Large continuous pour volume (${params.totalQuantity} m³) requires continuous fleet rotation.`);
      recommendations.push("Stagger transit mixer dispatch intervals by 15-20 minutes to prevent site truck bunching.");
    }

    if (isHighGrade) {
      risks.push(`High grade ${params.concreteGrade} requires precise initial slump retention and rapid placement within 90 minutes.`);
      recommendations.push("Verify chemical retarder/superplasticizer dosage at batching plant.");
    }

    if (params.pumpRequired) {
      recommendations.push("Confirm boom pump outrigger stabilization area and overhead electrical clearance.");
    }

    return {
      summary: `Automated operations assessment for Order #${params.orderNumber}: ${params.totalQuantity} m³ ${params.concreteGrade} ready mix concrete for delivery in ${params.siteCity || "Pune"}.`,
      riskLevel,
      risks: risks.length > 0 ? risks : ["Maintain continuous placement to prevent cold joints."],
      recommendations,
      confidence: "HIGH",
      productionFeasibility: isLargeVolume ? "Heavy Load" : "Clear",
      deliveryFeasibility: "Optimal Transit"
    };
  }
}
