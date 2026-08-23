export interface StructuralMeasurementInput {
  elementCategory: "SLAB" | "COLUMN" | "BEAM" | "FOOTING" | "FOUNDATION" | "WALL";
  label: string;
  lengthMeters?: number;
  widthMeters?: number;
  heightMeters?: number;
  areaSqFt?: number;
  quantityCount?: number;
  specifiedGrade?: string;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  sourcePage?: number;
}

export interface CalculatedMeasurementResult {
  elementCategory: string;
  label: string;
  lengthMeters: number;
  widthMeters: number;
  heightMeters: number;
  areaSqFt: number;
  quantityCount: number;
  calculatedVolM3: number;
  specifiedGrade: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  sourcePage: number;
}

export class BlueprintCalculationService {
  /**
   * Deterministically converts dimensions in feet/inches/mm to meters.
   */
  static normalizeToMeters(val: number, unit: "MM" | "CM" | "METERS" | "INCH" | "FEET"): number {
    if (!val || val <= 0) return 0;
    switch (unit) {
      case "MM":
        return Math.round((val / 1000) * 1000) / 1000;
      case "CM":
        return Math.round((val / 100) * 1000) / 1000;
      case "INCH":
        return Math.round((val * 0.0254) * 1000) / 1000;
      case "FEET":
        return Math.round((val * 0.3048) * 1000) / 1000;
      case "METERS":
      default:
        return Math.round(val * 1000) / 1000;
    }
  }

  /**
   * Deterministic volume calculation for structural elements.
   * Formula: Volume = Length x Width x Height x Quantity
   * For Slabs: Volume = (Area in SqFt x 0.092903) x Thickness in Meters
   */
  static calculateElementVolume(input: StructuralMeasurementInput): CalculatedMeasurementResult {
    const qty = Math.max(1, input.quantityCount || 1);
    let volM3 = 0;
    let length = input.lengthMeters || 0;
    let width = input.widthMeters || 0;
    let height = input.heightMeters || 0;
    let areaSqFt = input.areaSqFt || 0;

    if (input.elementCategory === "SLAB" && areaSqFt > 0) {
      const areaM2 = areaSqFt * 0.092903;
      const thicknessM = height > 0 ? height : 0.15; // default 150mm (0.15m) slab if unspecified
      volM3 = areaM2 * thicknessM * qty;
    } else if (length > 0 && width > 0 && height > 0) {
      volM3 = length * width * height * qty;
      areaSqFt = Math.round(length * width * 10.7639);
    } else if (length > 0 && width > 0) {
      const defaultH = input.elementCategory === "FOOTING" ? 0.6 : input.elementCategory === "BEAM" ? 0.45 : 0.15;
      volM3 = length * width * defaultH * qty;
      areaSqFt = Math.round(length * width * 10.7639);
    }

    volM3 = Math.round(volM3 * 10) / 10;

    return {
      elementCategory: input.elementCategory,
      label: input.label,
      lengthMeters: length,
      widthMeters: width,
      heightMeters: height,
      areaSqFt,
      quantityCount: qty,
      calculatedVolM3: volM3,
      specifiedGrade: input.specifiedGrade || "M25",
      confidence: input.confidence || (volM3 > 0 ? "HIGH" : "MEDIUM"),
      sourcePage: input.sourcePage || 1
    };
  }

  /**
   * Calculates total project concrete volume by summing all structural element measurements.
   */
  static calculateTotalConcreteVolume(measurements: CalculatedMeasurementResult[]): {
    totalConcreteM3: number;
    volumeByElement: Record<string, number>;
    volumeByGrade: Record<string, number>;
  } {
    let total = 0;
    const volumeByElement: Record<string, number> = {};
    const volumeByGrade: Record<string, number> = {};

    for (const m of measurements) {
      const vol = m.calculatedVolM3 || 0;
      total += vol;

      volumeByElement[m.elementCategory] = (volumeByElement[m.elementCategory] || 0) + vol;
      volumeByGrade[m.specifiedGrade] = (volumeByGrade[m.specifiedGrade] || 0) + vol;
    }

    // Rounding
    total = Math.round(total * 10) / 10;
    for (const k in volumeByElement) volumeByElement[k] = Math.round(volumeByElement[k] * 10) / 10;
    for (const k in volumeByGrade) volumeByGrade[k] = Math.round(volumeByGrade[k] * 10) / 10;

    return {
      totalConcreteM3: total,
      volumeByElement,
      volumeByGrade
    };
  }
}
