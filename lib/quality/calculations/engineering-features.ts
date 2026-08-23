import { ConcreteMixInput, CalculatedEngineeringFeatures } from "../types/quality";

/**
 * Calculates deterministic engineering indicators from mix quantities.
 * Follows IS 10262 & ACI 211 standard concrete mix proportions.
 */
export function calculateEngineeringFeatures(input: ConcreteMixInput): CalculatedEngineeringFeatures {
  const cement = input.cementKg || 0;
  const flyAsh = input.flyAshKg || 0;
  const ggbs = input.ggbsKg || 0;
  const silicaFume = input.silicaFumeKg || 0;

  const totalBinder = cement + flyAsh + ggbs + silicaFume;
  const water = input.waterKg || 0;
  const fineAgg = input.fineAggregateKg || 0;
  const coarseAgg = input.coarseAggregateKg || 0;
  const admixture = input.admixtureKg || 0;

  const wcRatio = totalBinder > 0 ? Math.round((water / totalBinder) * 1000) / 1000 : 0;
  const admixturePct = totalBinder > 0 ? Math.round((admixture / totalBinder) * 100 * 100) / 100 : 0;

  const totalAgg = fineAgg + coarseAgg;
  const finePct = totalAgg > 0 ? Math.round((fineAgg / totalAgg) * 100 * 10) / 10 : 0;
  const coarsePct = totalAgg > 0 ? Math.round((coarseAgg / totalAgg) * 100 * 10) / 10 : 0;

  const totalDensity = Math.round(totalBinder + water + fineAgg + coarseAgg + admixture);

  return {
    totalBinderKg: totalBinder,
    waterCementRatio: wcRatio,
    admixturePercent: admixturePct,
    fineAggregatePercent: finePct,
    coarseAggregatePercent: coarsePct,
    totalDensityKgM3: totalDensity
  };
}
