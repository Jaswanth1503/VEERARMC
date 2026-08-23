import { z } from "zod";
import { generateGeminiResponse } from "../ai/gemini";

export const QuoteAIAnalysisSchema = z.object({
  summary: z.string(),
  recommendedGrade: z.string(),
  quantityExplanation: z.string(),
  deliveryRecommendation: z.string(),
  riskNotes: z.array(z.string()),
  customerNotes: z.array(z.string())
});

export type QuoteAIAnalysis = z.infer<typeof QuoteAIAnalysisSchema>;

export interface QuoteAIInput {
  projectName: string;
  projectType: string;
  constructionStage?: string;
  floors?: number;
  selectedGrade: string;
  calculatedVolumeM3: number;
  siteAddress: string;
  city: string;
  pincode: string;
  pumpRequired: boolean;
  pumpType?: string;
}

export class QuoteAIService {
  /**
   * Generates AI qualitative reasoning & recommendations for a concrete quotation.
   * STRICT RULE: AI NEVER calculates or modifies financial prices/totals.
   */
  static async analyzeQuote(input: QuoteAIInput): Promise<QuoteAIAnalysis> {
    const prompt = `
You are an expert Ready Mix Concrete (RMC) Civil & Structural Engineering AI Advisor for Veera RMC 2.0.
Analyze the following project quotation request and generate a structured qualitative assessment:

Project Details:
- Project Name: ${input.projectName}
- Project Type: ${input.projectType}
- Construction Stage: ${input.constructionStage || "Initial Concrete Pour"}
- Number of Floors: ${input.floors || 1}
- User Selected Grade: ${input.selectedGrade}
- Required Concrete Volume: ${input.calculatedVolumeM3} m³
- Location: ${input.siteAddress}, ${input.city} (Pincode: ${input.pincode})
- Pump Required: ${input.pumpRequired ? `Yes (${input.pumpType || "Line Pump"})` : "No"}

Available Veera RMC Grades:
- M10 (PCC, Pathways, Leveling)
- M15 (Driveways, Sub-base floors)
- M20 (Single-story residential RCC)
- M25 (Multi-story residential foundations, columns, slabs)
- M30 (Commercial structures, water tanks, heavy RCC)
- M35 & M40 (High-rise columns, industrial floors)
- M50 (Ultra-high performance, marine structures)

Instructions:
1. Recommend the ideal structural concrete grade for this project type and floor count.
2. Explain the volume calculation and 5% wastage allowance.
3. Provide site delivery & pumping recommendations.
4. List 2-3 potential site execution risks (e.g. initial set time, transit mixer turning radius, curing).
5. Always state that final structural grade selection should be confirmed by a qualified structural engineer.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "summary": "Short 2-3 sentence executive summary of the quotation.",
  "recommendedGrade": "M25",
  "quantityExplanation": "Explanation of recommended volume including wastage.",
  "deliveryRecommendation": "Recommendations for transit mixer access and pump setup.",
  "riskNotes": ["Risk note 1", "Risk note 2"],
  "customerNotes": ["Important customer field note 1", "Structural engineer disclaimer"]
}
`;

    try {
      const response = await generateGeminiResponse({
        prompt,
        temperature: 0.3,
        jsonMode: true
      });

      if (!response.isError && response.text) {
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const validated = QuoteAIAnalysisSchema.safeParse(parsed);
          if (validated.success) {
            return validated.data;
          }
        }
      }
    } catch (err) {
      console.warn("[QuoteAIService Warning] Gemini API unavailable or parse failed, using fallback qualitative analysis:", err);
    }

    // Fallback Qualitative Analysis (Ensures quote generation NEVER fails due to AI key limits)
    return this.getFallbackAnalysis(input);
  }

  /**
   * Deterministic qualitative fallback when AI API is unavailable.
   */
  private static getFallbackAnalysis(input: QuoteAIInput): QuoteAIAnalysis {
    let recGrade = input.selectedGrade || "M25";
    if (input.projectType === "High-rise" || (input.floors && input.floors > 4)) {
      recGrade = "M35";
    } else if (input.projectType === "Commercial" || (input.floors && input.floors > 2)) {
      recGrade = "M30";
    }

    return {
      summary: `Quotation generated for ${input.projectName} (${input.projectType}). Total recommended concrete volume is ${input.calculatedVolumeM3} m³ using Grade ${recGrade}.`,
      recommendedGrade: recGrade,
      quantityExplanation: `Total estimated volume includes a standard 5% wastage margin to account for pumping line hold-up, shuttering alignment tolerances, and compaction.`,
      deliveryRecommendation: input.pumpRequired
        ? `Ensure a clear 4m wide access road for 10-wheel transit mixers and prepare a clean 6m x 4m area near the pour location for ${input.pumpType || "Line Pump"} setup.`
        : `Ensure clear 3.5m wide access road for transit mixer chute discharge directly into formwork.`,
      riskNotes: [
        "Initial setting time is approximately 90-120 minutes from batching plant dispatch.",
        "Ensure formwork shuttering is clean, oiled, and leak-proof prior to mixer arrival.",
        "Continuous water curing must begin within 4-6 hours of concrete placement."
      ],
      customerNotes: [
        "Note: Final structural grade selection should be verified and approved by a qualified structural engineer.",
        "Pricing valid for 14 days from quote generation date."
      ]
    };
  }
}
