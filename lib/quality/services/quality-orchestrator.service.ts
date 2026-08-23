import { prisma } from "@/lib/prisma";
import { ConcreteMixInput, FullQualityPredictionReport } from "../types/quality";
import { ConcreteMixInputSchema } from "../validations/mix-input.schema";
import { calculateEngineeringFeatures } from "../calculations/engineering-features";
import { StrengthPredictionService } from "./strength-prediction.service";
import { QualityAIService } from "./quality-ai.service";

export class QualityOrchestratorService {
  /**
   * Main prediction pipeline:
   * Validate Input → Calculate Engineering Features → Predict Strength & Risk → Generate AI Explanation → Store in DB
   */
  static async runPredictionPipeline(
    inputData: unknown,
    userId: string
  ): Promise<FullQualityPredictionReport> {
    // 1. Zod Validation
    const validatedInput: ConcreteMixInput = ConcreteMixInputSchema.parse(inputData);

    // 2. Engineering Calculations
    const calculatedFeatures = calculateEngineeringFeatures(validatedInput);

    // 3. Model Prediction
    const predictionModel = new StrengthPredictionService();
    const modelOutput = predictionModel.predict(validatedInput, calculatedFeatures);

    // 4. Gemini AI Explanation Layer (with fallback)
    const aiExplanation = await QualityAIService.explainPrediction(
      validatedInput,
      calculatedFeatures,
      modelOutput
    );

    // 5. Persist to PostgreSQL via Prisma (with graceful DB-offline fallback)
    let reportId = `pred-${Date.now()}`;
    let createdAt = new Date();

    try {
      const savedRecord = await prisma.qualityPrediction.create({
        data: {
          userId,
          projectId: validatedInput.projectId || null,
          concreteGrade: validatedInput.concreteGrade,
          cementKg: validatedInput.cementKg,
          waterKg: validatedInput.waterKg,
          fineAggregateKg: validatedInput.fineAggregateKg,
          coarseAggregateKg: validatedInput.coarseAggregateKg,
          admixtureKg: validatedInput.admixtureKg || 0,
          flyAshKg: validatedInput.flyAshKg || 0,
          ggbsKg: validatedInput.ggbsKg || 0,
          silicaFumeKg: validatedInput.silicaFumeKg || 0,
          waterCementRatio: calculatedFeatures.waterCementRatio,
          targetStrengthMpa: validatedInput.targetStrengthMpa,
          ageDays: validatedInput.ageDays || 28,
          slumpMm: validatedInput.slumpMm || null,
          ambientTempCelsius: validatedInput.ambientTempCelsius || null,
          curingCondition: validatedInput.curingCondition || "STANDARD_WATER_CURING",
          previousTestStrength: validatedInput.previousTestStrength || null,
          totalBinderKg: calculatedFeatures.totalBinderKg,
          admixturePercent: calculatedFeatures.admixturePercent,
          fineAggregatePercent: calculatedFeatures.fineAggregatePercent,
          coarseAggregatePercent: calculatedFeatures.coarseAggregatePercent,
          predictedStrengthMpa: modelOutput.predictedStrengthMpa,
          strengthMarginMpa: modelOutput.strengthMarginMpa,
          confidenceScorePercent: modelOutput.confidenceScorePercent,
          riskLevel: modelOutput.riskLevel,
          modelVersion: modelOutput.modelVersion,
          featureContributions: JSON.parse(JSON.stringify(modelOutput.featureContributions)),
          summary: aiExplanation.summary,
          keyFactors: aiExplanation.keyFactors,
          risks: aiExplanation.risks,
          recommendations: aiExplanation.recommendations,
          explanation: aiExplanation.explanation,
          aiStatus: aiExplanation.aiStatus
        }
      });
      reportId = savedRecord.id;
      createdAt = savedRecord.createdAt;
    } catch (dbErr) {
      console.warn("[QualityOrchestratorService] PostgreSQL unavailable for saving record; returning live prediction report:", dbErr);
    }

    return {
      id: reportId,
      userId,
      projectId: validatedInput.projectId || undefined,
      inputs: validatedInput,
      calculatedFeatures,
      predictedStrengthMpa: modelOutput.predictedStrengthMpa,
      strengthMarginMpa: modelOutput.strengthMarginMpa,
      confidenceScorePercent: modelOutput.confidenceScorePercent,
      riskLevel: modelOutput.riskLevel,
      modelVersion: modelOutput.modelVersion,
      featureContributions: modelOutput.featureContributions,
      summary: aiExplanation.summary,
      keyFactors: aiExplanation.keyFactors,
      risks: aiExplanation.risks,
      recommendations: aiExplanation.recommendations,
      explanation: aiExplanation.explanation,
      aiStatus: aiExplanation.aiStatus,
      createdAt
    };
  }

  /**
   * Fetch prediction history for authenticated user.
   */
  static async getPredictionHistory(userId: string) {
    try {
      return await prisma.qualityPrediction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20
      });
    } catch (e) {
      console.warn("[QualityOrchestratorService] Database offline while reading prediction history:", e);
      return [];
    }
  }

  /**
   * Fetch single prediction record by ID.
   */
  static async getPredictionById(id: string, userId: string) {
    try {
      return await prisma.qualityPrediction.findFirst({
        where: { id, userId }
      });
    } catch (e) {
      return null;
    }
  }

  /**
   * Delete prediction record by ID.
   */
  static async deletePrediction(id: string, userId: string) {
    try {
      return await prisma.qualityPrediction.deleteMany({
        where: { id, userId }
      });
    } catch (e) {
      return { count: 0 };
    }
  }
}
