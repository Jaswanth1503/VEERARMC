import { QUALITY_RISK_THRESHOLDS } from "../constants/thresholds";
import { QualityRiskLevel } from "../types/quality";

export class RiskClassificationService {
  /**
   * Deterministically classifies Quality Risk Level based on predicted strength margin and mix parameter thresholds.
   */
  static classifyRisk(params: {
    predictedStrengthMpa: number;
    targetStrengthMpa: number;
    waterCementRatio: number;
    admixturePercent: number;
  }): { riskLevel: QualityRiskLevel; confidenceScorePercent: number } {
    const margin = params.predictedStrengthMpa - params.targetStrengthMpa;
    const { MARGIN, WATER_CEMENT_RATIO, ADMIXTURE_PERCENT } = QUALITY_RISK_THRESHOLDS;

    let riskLevel: QualityRiskLevel = "LOW";
    let confidenceScore = 92;

    // Margin-based evaluation
    if (margin < MARGIN.HIGH_RISK_MAX) {
      riskLevel = "HIGH";
      confidenceScore -= 20;
    } else if (margin < MARGIN.MEDIUM_RISK_MAX) {
      riskLevel = "MEDIUM";
      confidenceScore -= 10;
    }

    // Water-Cement ratio evaluation
    if (params.waterCementRatio > WATER_CEMENT_RATIO.CRITICAL_MAX) {
      riskLevel = "HIGH";
      confidenceScore -= 15;
    } else if (params.waterCementRatio > WATER_CEMENT_RATIO.WARNING_MAX && riskLevel !== "HIGH") {
      riskLevel = "MEDIUM";
      confidenceScore -= 8;
    }

    // Admixture percentage evaluation
    if (params.admixturePercent > ADMIXTURE_PERCENT.WARNING_MAX && riskLevel !== "HIGH") {
      riskLevel = "MEDIUM";
      confidenceScore -= 5;
    }

    // Clamp confidence score between 60% and 98%
    const finalConfidence = Math.max(60, Math.min(98, confidenceScore));

    return {
      riskLevel,
      confidenceScorePercent: finalConfidence
    };
  }
}
