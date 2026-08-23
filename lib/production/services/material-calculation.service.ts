import { MixDesignProportions, MaterialRequirementSummary } from "../types/production";

/**
 * Standard Mix Proportion Matrix compliant with IS 10262:2019 standards for Ready Mix Concrete.
 */
const IS_10262_MIX_DESIGNS: Record<string, MixDesignProportions> = {
  "M10": {
    grade: "M10",
    waterCementRatio: 0.58,
    cementKgPerM3: 220,
    flyAshKgPerM3: 60,
    fineAggKgPerM3: 880,
    coarseAgg20mmKgPerM3: 710,
    coarseAgg10mmKgPerM3: 470,
    waterKgPerM3: 160,
    admixtureKgPerM3: 1.5,
    slumpRangeMm: "75-100 mm"
  },
  "M15": {
    grade: "M15",
    waterCementRatio: 0.55,
    cementKgPerM3: 260,
    flyAshKgPerM3: 70,
    fineAggKgPerM3: 840,
    coarseAgg20mmKgPerM3: 720,
    coarseAgg10mmKgPerM3: 480,
    waterKgPerM3: 165,
    admixtureKgPerM3: 2.0,
    slumpRangeMm: "100-120 mm"
  },
  "M20": {
    grade: "M20",
    waterCementRatio: 0.50,
    cementKgPerM3: 310,
    flyAshKgPerM3: 80,
    fineAggKgPerM3: 810,
    coarseAgg20mmKgPerM3: 720,
    coarseAgg10mmKgPerM3: 480,
    waterKgPerM3: 170,
    admixtureKgPerM3: 2.8,
    slumpRangeMm: "100-130 mm"
  },
  "M25": {
    grade: "M25",
    waterCementRatio: 0.45,
    cementKgPerM3: 350,
    flyAshKgPerM3: 90,
    fineAggKgPerM3: 780,
    coarseAgg20mmKgPerM3: 730,
    coarseAgg10mmKgPerM3: 490,
    waterKgPerM3: 175,
    admixtureKgPerM3: 3.5,
    slumpRangeMm: "120-150 mm"
  },
  "M30": {
    grade: "M30",
    waterCementRatio: 0.42,
    cementKgPerM3: 380,
    flyAshKgPerM3: 100,
    fineAggKgPerM3: 750,
    coarseAgg20mmKgPerM3: 740,
    coarseAgg10mmKgPerM3: 490,
    waterKgPerM3: 175,
    admixtureKgPerM3: 4.2,
    slumpRangeMm: "120-150 mm"
  },
  "M35": {
    grade: "M35",
    waterCementRatio: 0.38,
    cementKgPerM3: 410,
    flyAshKgPerM3: 110,
    fineAggKgPerM3: 730,
    coarseAgg20mmKgPerM3: 750,
    coarseAgg10mmKgPerM3: 500,
    waterKgPerM3: 170,
    admixtureKgPerM3: 5.0,
    slumpRangeMm: "130-160 mm"
  },
  "M40": {
    grade: "M40",
    waterCementRatio: 0.35,
    cementKgPerM3: 440,
    flyAshKgPerM3: 120,
    fineAggKgPerM3: 700,
    coarseAgg20mmKgPerM3: 760,
    coarseAgg10mmKgPerM3: 510,
    waterKgPerM3: 165,
    admixtureKgPerM3: 6.0,
    slumpRangeMm: "140-170 mm"
  },
  "M50": {
    grade: "M50",
    waterCementRatio: 0.30,
    cementKgPerM3: 490,
    flyAshKgPerM3: 140,
    fineAggKgPerM3: 670,
    coarseAgg20mmKgPerM3: 770,
    coarseAgg10mmKgPerM3: 520,
    waterKgPerM3: 155,
    admixtureKgPerM3: 7.5,
    slumpRangeMm: "150-180 mm"
  }
};

export class MaterialCalculationService {
  /**
   * Returns mix proportions per m³ for given concrete grade.
   */
  static getProportions(grade: string): MixDesignProportions {
    const cleanGrade = grade.toUpperCase().trim();
    return IS_10262_MIX_DESIGNS[cleanGrade] || IS_10262_MIX_DESIGNS["M25"];
  }

  /**
   * Computes exact raw material requirements in kg and estimated costs for a given volume.
   */
  static calculateMaterialRequirements(grade: string, volumeM3: number): MaterialRequirementSummary[] {
    const p = this.getProportions(grade);
    const vol = Math.max(0.1, volumeM3);

    return [
      {
        materialName: "OPC 53 Grade Cement",
        category: "BINDER",
        totalPlannedKg: Math.round(p.cementKgPerM3 * vol),
        unit: "KG",
        costPerKg: 7.2, // ~₹360 per 50kg bag
        estimatedCost: Math.round(p.cementKgPerM3 * vol * 7.2)
      },
      {
        materialName: "Class F Fly Ash (Pozzolan)",
        category: "BINDER",
        totalPlannedKg: Math.round(p.flyAshKgPerM3 * vol),
        unit: "KG",
        costPerKg: 1.8,
        estimatedCost: Math.round(p.flyAshKgPerM3 * vol * 1.8)
      },
      {
        materialName: "Zone II Crushed Sand",
        category: "AGGREGATE",
        totalPlannedKg: Math.round(p.fineAggKgPerM3 * vol),
        unit: "KG",
        costPerKg: 1.2,
        estimatedCost: Math.round(p.fineAggKgPerM3 * vol * 1.2)
      },
      {
        materialName: "20mm Coarse Aggregate",
        category: "AGGREGATE",
        totalPlannedKg: Math.round(p.coarseAgg20mmKgPerM3 * vol),
        unit: "KG",
        costPerKg: 0.9,
        estimatedCost: Math.round(p.coarseAgg20mmKgPerM3 * vol * 0.9)
      },
      {
        materialName: "10mm Coarse Aggregate",
        category: "AGGREGATE",
        totalPlannedKg: Math.round(p.coarseAgg10mmKgPerM3 * vol),
        unit: "KG",
        costPerKg: 0.95,
        estimatedCost: Math.round(p.coarseAgg10mmKgPerM3 * vol * 0.95)
      },
      {
        materialName: "Batching Water",
        category: "WATER",
        totalPlannedKg: Math.round(p.waterKgPerM3 * vol),
        unit: "LITERS",
        costPerKg: 0.05,
        estimatedCost: Math.round(p.waterKgPerM3 * vol * 0.05)
      },
      {
        materialName: "Polycarboxylate Superplasticizer",
        category: "ADMIXTURE",
        totalPlannedKg: Number((p.admixtureKgPerM3 * vol).toFixed(2)),
        unit: "KG",
        costPerKg: 85.0,
        estimatedCost: Math.round(p.admixtureKgPerM3 * vol * 85.0)
      }
    ];
  }
}
