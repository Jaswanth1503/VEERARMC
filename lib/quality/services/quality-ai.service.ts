import { z } from "zod";
import { generateGeminiResponse } from "../../ai/gemini";
import { ConcreteMixInput, CalculatedEngineeringFeatures, ModelPredictionOutput, AIQualityExplanation } from "../types/quality";

export const AIQualitySchema = z.object({
  summary: z.string(),
  keyFactors: z.array(z.string()),
  risks: z.array(z.string()),
  recommendations: z.array(z.string()),
  explanation: z.string()
});

export class QualityAIService {
  /**
   * Generates Gemini qualitative explanations for concrete quality & strength predictions.
   * STRICT RULE: AI NEVER calculates or alters the numerical compressive strength or water-cement ratio.
   */
  static async explainPrediction(
    input: ConcreteMixInput,
    features: CalculatedEngineeringFeatures,
    prediction: ModelPredictionOutput
  ): Promise<AIQualityExplanation> {
    const prompt = `
You are a Senior Concrete Technology Specialist & Quality Control Expert for Veera RMC 2.0.
Explain the following calculated concrete strength prediction result to the plant manager/engineer:

Mix Proportions & Parameters:
- Concrete Grade: ${input.concreteGrade}
- Target Compressive Strength: ${input.targetStrengthMpa} MPa
- Cement: ${input.cementKg} kg/m³
- Water: ${input.waterKg} kg/m³
- Total Binder: ${features.totalBinderKg} kg/m³
- Water-Cement/Binder Ratio (w/c): ${features.waterCementRatio}
- Admixture Dosage: ${features.admixturePercent}% (${input.admixtureKg || 0} kg/m³)
- Fine Aggregate: ${input.fineAggregateKg} kg/m³ (${features.fineAggregatePercent}%)
- Coarse Aggregate: ${input.coarseAggregateKg} kg/m³ (${features.coarseAggregatePercent}%)
- Supplementary Materials: Fly Ash ${input.flyAshKg || 0}kg, GGBS ${input.ggbsKg || 0}kg, Silica Fume ${input.silicaFumeKg || 0}kg
- Testing Age: ${input.ageDays || 28} days

Engineering Model Prediction Result:
- Predicted Compressive Strength: ${prediction.predictedStrengthMpa} MPa
- Target Strength: ${input.targetStrengthMpa} MPa
- Strength Margin: ${prediction.strengthMarginMpa >= 0 ? '+' : ''}${prediction.strengthMarginMpa} MPa
- Evaluated Risk Level: ${prediction.riskLevel}
- Model Confidence Score: ${prediction.confidenceScorePercent}%

Instructions:
1. Provide a concise 2-sentence executive summary of the predicted strength vs target.
2. List 3 key technical factors driving this result (e.g. w/c ratio, binder content, curing age).
3. Identify 2-3 quality risks or mix parameter anomalies (e.g. high water content, segregation risk, low margin).
4. Provide 3 practical engineering recommendations (e.g. adjust admixture, verify slump, conduct 7-day cube testing).
5. Provide a detailed 1-paragraph explainable AI reasoning breakdown.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "summary": "2-sentence executive summary.",
  "keyFactors": [
    "Factor 1",
    "Factor 2",
    "Factor 3"
  ],
  "risks": [
    "Risk 1",
    "Risk 2"
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ],
  "explanation": "Detailed engineering explanation paragraph."
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
          const validated = AIQualitySchema.safeParse(parsed);
          if (validated.success) {
            return {
              ...validated.data,
              aiStatus: "COMPLETED"
            };
          }
        }
      }
    } catch (err) {
      console.warn("[QualityAIService Warning] Gemini AI service error, falling back to deterministic explanation:", err);
    }

    return this.getFallbackExplanation(input, features, prediction);
  }

  private static getFallbackExplanation(
    input: ConcreteMixInput,
    features: CalculatedEngineeringFeatures,
    prediction: ModelPredictionOutput
  ): AIQualityExplanation {
    const isPass = prediction.strengthMarginMpa >= 0;
    return {
      summary: `The baseline prediction estimates a ${input.ageDays || 28}-day compressive strength of ${prediction.predictedStrengthMpa} MPa against the target of ${input.targetStrengthMpa} MPa (${isPass ? 'Meets target' : 'Below target'}).`,
      keyFactors: [
        `Water-cement ratio of ${features.waterCementRatio.toFixed(2)} controls paste porosity.`,
        `Total binder content of ${features.totalBinderKg} kg/m³ provides baseline hydration strength.`,
        `Curing age of ${input.ageDays || 28} days provides standard strength maturity.`
      ],
      risks: [
        features.waterCementRatio > 0.50 ? "High water-cement ratio increases capillary void volume." : "Ensure thorough compaction to prevent honeycomb voids.",
        prediction.strengthMarginMpa < 2.0 ? "Low strength margin reserves; slight site batching variations could cause non-conformance." : "Verify batching plant scale calibration."
      ],
      recommendations: [
        "Conduct standard 7-day and 28-day concrete cube compressive strength laboratory testing.",
        "Verify aggregate moisture content prior to plant batching.",
        "Maintain continuous moist curing for at least 7 days post-placement."
      ],
      explanation: `Calculated using Abram's Law and Feret's formulation. The mix with ${features.waterCementRatio.toFixed(2)} w/c ratio and ${features.totalBinderKg} kg/m³ binder yields a predicted strength of ${prediction.predictedStrengthMpa} MPa. AI qualitative interpretation layer is temporarily operating in offline fallback mode.`,
      aiStatus: "FALLBACK"
    };
  }
}
