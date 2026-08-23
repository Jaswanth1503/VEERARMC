import { z } from "zod";
import { generateGeminiResponse } from "../ai/gemini";

export const AIRecommendationResultSchema = z.object({
  summary: z.string(),
  recommendedWindow: z.object({
    start: z.string(),
    end: z.string()
  }),
  risks: z.array(z.string()),
  alternatives: z.array(z.string()),
  explanation: z.string(),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"])
});

export type AIRecommendationResult = z.infer<typeof AIRecommendationResultSchema>;

export class RecommendationAIService {
  /**
   * Generates Gemini qualitative explanations for delivery planning & site recommendations.
   * STRICT RULE: AI NEVER calculates or modifies truck counts or distance numbers.
   */
  static async analyzePlanningContext(input: {
    projectType: string;
    floors: number;
    volumeM3: number;
    truckCount: number;
    weatherStatus: string;
    distanceKm: number;
  }): Promise<AIRecommendationResult> {
    const prompt = `
You are an expert Ready Mix Concrete Logistics & Structural Planning AI Specialist for Veera RMC 2.0.
Analyze the following project delivery parameters and generate a qualitative planning explanation:

Project Parameters:
- Project Type: ${input.projectType}
- Building Height/Floors: ${input.floors} floors
- Total Required Volume: ${input.volumeM3} m³
- Calculated Truck Count: ${input.truckCount} trucks (6 m³ capacity)
- Estimated Transit Distance: ${input.distanceKm} km
- Weather Window Status: ${input.weatherStatus}

Instructions:
1. Explain the delivery timeline and pour sequence.
2. Highlight 2-3 potential site execution risks (e.g. initial set time, transit mixer turning radius, traffic delays).
3. Suggest an alternative dispatch window if morning traffic occurs.

Respond ONLY with a valid JSON matching this exact structure:
{
  "summary": "Short 2-3 sentence executive summary of the delivery plan.",
  "recommendedWindow": {
    "start": "08:00 AM",
    "end": "10:30 AM"
  },
  "risks": [
    "Initial set time is 90-120 minutes from batching plant load time.",
    "Ensure 4m wide site entry for 10-wheel transit mixers."
  ],
  "alternatives": [
    "Afternoon dispatch (04:00 PM) to avoid peak morning urban traffic."
  ],
  "explanation": "Detailed natural language explanation of the logistics plan.",
  "confidence": "HIGH"
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
          const validated = AIRecommendationResultSchema.safeParse(parsed);
          if (validated.success) {
            return validated.data;
          }
        }
      }
    } catch (err) {
      console.warn("[RecommendationAIService Warning] Gemini API unavailable, using fallback qualitative analysis:", err);
    }

    return this.getFallbackAnalysis(input);
  }

  private static getFallbackAnalysis(input: { volumeM3: number; truckCount: number; floors: number }): AIRecommendationResult {
    return {
      summary: `Delivery plan generated for ${input.volumeM3} m³ concrete pour requiring ${input.truckCount} transit mixer trucks dispatched in staggered 15-minute intervals.`,
      recommendedWindow: { start: "08:00 AM", end: "10:30 AM" },
      risks: [
        "Slump loss may occur if transit mixer detention exceeds 90 minutes.",
        "Ensure pump pipeline is pre-lubricated with cement slurry prior to first truck discharge."
      ],
      alternatives: [
        "Staggered 2-truck batching sequence to match site placing speed."
      ],
      explanation: `Logistics recommendation calculated deterministically based on ${input.volumeM3} m³ order volume and 6 m³ truck capacity.`,
      confidence: "HIGH"
    };
  }
}
