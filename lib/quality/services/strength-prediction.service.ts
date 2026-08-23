import { ConcreteMixInput, CalculatedEngineeringFeatures, ModelPredictionOutput, FeatureContribution } from "../types/quality";
import { calculateEngineeringFeatures } from "../calculations/engineering-features";
import { RiskClassificationService } from "./risk-classification.service";

export interface IPredictionModel {
  modelVersion: string;
  predict(input: ConcreteMixInput, features: CalculatedEngineeringFeatures): ModelPredictionOutput;
}

/**
 * Baseline Concrete Compressive Strength Prediction Model.
 * Formulated on Abram's Water-Cement Ratio Law + Feret's Void-Binder Formulation + IS 10262 Curing Age Curve.
 * Designed with a modular interface (`IPredictionModel`) so future ML models (XGBoost / Random Forest)
 * can easily replace this implementation without frontend or database schema changes.
 */
export class StrengthPredictionService implements IPredictionModel {
  public modelVersion = "baseline-abrams-feret-v1.0";

  public predict(input: ConcreteMixInput, features: CalculatedEngineeringFeatures): ModelPredictionOutput {
    const wc = features.waterCementRatio;
    const binder = features.totalBinderKg;
    const ageDays = input.ageDays || 28;

    // 1. Base 28-day Compressive Strength calculation using Abram's Law (S = A / B^(1.5 * w/c))
    // A = 95 MPa (cement quality factor), B = 4.0
    let baseStrength28Day = 95 / Math.pow(4.0, 1.5 * wc);

    // Supplementary Pozzolanic Modifications
    const silicaFumeBonus = (input.silicaFumeKg || 0) > 0 ? 2.5 : 0;
    const flyAshContribution = (input.flyAshKg || 0) * 0.015; // gradual pozzolanic gain
    const ggbsContribution = (input.ggbsKg || 0) * 0.012;

    baseStrength28Day += silicaFumeBonus + flyAshContribution + ggbsContribution;

    // 2. Age-dependent Maturity Adjustment Curve (IS 456 / ACI 209)
    // S_t = S_28 * (t / (4 + 0.85 * t))
    const ageFactor = ageDays / (4 + 0.85 * ageDays);
    let predictedStrength = baseStrength28Day * ageFactor;

    // Environmental / Curing Adjustments
    if (input.curingCondition === "AIR_DRY" || input.curingCondition === "NO_CURING") {
      predictedStrength *= 0.82; // 18% strength loss for uncured concrete
    }
    if (input.ambientTempCelsius && input.ambientTempCelsius > 40) {
      predictedStrength *= 0.92; // High ambient temp rapid hydration penalty
    }

    predictedStrength = Math.round(predictedStrength * 10) / 10;
    const margin = Math.round((predictedStrength - input.targetStrengthMpa) * 10) / 10;

    // 3. Feature Contribution Breakdown
    const featureContributions: FeatureContribution[] = [
      {
        featureName: "Water-Cement Ratio (w/c)",
        impactMpa: Math.round((0.45 - wc) * 25 * 10) / 10,
        direction: wc <= 0.48 ? "POSITIVE" : "NEGATIVE",
        description: `w/c ratio of ${wc.toFixed(2)} ${wc <= 0.48 ? 'provides dense matrix hydration' : 'increases capillary porosity'}.`
      },
      {
        featureName: "Total Binder Content",
        impactMpa: Math.round(((binder - 340) / 100) * 3.5 * 10) / 10,
        direction: binder >= 320 ? "POSITIVE" : "NEGATIVE",
        description: `Binder density of ${binder} kg/m³ ${binder >= 320 ? 'ensures rich paste cohesion' : 'may limit maximum strength'}.`
      },
      {
        featureName: "Curing Age Maturity",
        impactMpa: Math.round((predictedStrength - baseStrength28Day) * 10) / 10,
        direction: ageDays >= 28 ? "POSITIVE" : "NEUTRAL",
        description: `Hydration maturity at ${ageDays} days (${(ageFactor * 100).toFixed(0)}% of 28-day standard).`
      }
    ];

    if (input.silicaFumeKg && input.silicaFumeKg > 0) {
      featureContributions.push({
        featureName: "Silica Fume Densification",
        impactMpa: 2.5,
        direction: "POSITIVE",
        description: "Micro-silica fills interfacial transition zone voids."
      });
    }

    // 4. Deterministic Risk Classification
    const riskResult = RiskClassificationService.classifyRisk({
      predictedStrengthMpa: predictedStrength,
      targetStrengthMpa: input.targetStrengthMpa,
      waterCementRatio: wc,
      admixturePercent: features.admixturePercent
    });

    return {
      predictedStrengthMpa: predictedStrength,
      strengthMarginMpa: margin,
      confidenceScorePercent: riskResult.confidenceScorePercent,
      riskLevel: riskResult.riskLevel,
      modelVersion: this.modelVersion,
      featureContributions
    };
  }
}
