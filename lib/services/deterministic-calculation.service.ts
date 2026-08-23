export type InputUnit = "M3" | "CUFT" | "CUYD" | "LITERS";

export interface VolumeCalculationResult {
  baseVolumeM3: number;
  wastagePercent: number;
  wastageVolumeM3: number;
  recommendedVolumeM3: number;
  originalInputQuantity: number;
  originalInputUnit: InputUnit;
}

export interface FinancialCalculationParams {
  gradeCode: string;
  basePricePerM3: number;
  volumeM3: number;
  distanceKm?: number;
  pumpRequired?: boolean;
  pumpType?: string; // "LINE_PUMP" | "BOOM_PUMP_24M" | "BOOM_PUMP_42M"
  discountCode?: string;
  discountPercent?: number;
  taxRatePercent?: number; // default 18.0
}

export interface FinancialCalculationResult {
  gradeCode: string;
  volumeM3: number;
  unitPrice: number;
  concreteSubtotal: number;
  transportCost: number;
  pumpCost: number;
  discountAmount: number;
  taxableAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

export class DeterministicCalculationService {
  /**
   * Deterministic conversion from CUFT, CUYD, or LITERS to Cubic Meters (m³).
   */
  static convertToM3(quantity: number, unit: InputUnit): number {
    if (quantity <= 0) return 0;
    
    switch (unit) {
      case "CUFT":
        // 1 cubic foot = 0.0283168 cubic meters
        return Math.round(quantity * 0.0283168 * 100) / 100;
      case "CUYD":
        // 1 cubic yard = 0.764555 cubic meters
        return Math.round(quantity * 0.764555 * 100) / 100;
      case "LITERS":
        // 1000 liters = 1 cubic meter
        return Math.round((quantity / 1000) * 100) / 100;
      case "M3":
      default:
        return Math.round(quantity * 100) / 100;
    }
  }

  /**
   * Calculate volume from dimensions (Length x Width x Height).
   */
  static calculateVolumeFromDimensions(
    length: number, 
    width: number, 
    height: number, 
    unit: "METERS" | "FEET" = "METERS"
  ): number {
    if (length <= 0 || width <= 0 || height <= 0) return 0;
    const rawVolume = length * width * height;
    
    if (unit === "FEET") {
      return Math.round(rawVolume * 0.0283168 * 100) / 100;
    }
    return Math.round(rawVolume * 100) / 100;
  }

  /**
   * Calculate recommended order volume including wastage factor.
   */
  static calculateWastage(
    inputQuantity: number, 
    inputUnit: InputUnit = "M3", 
    wastagePercent: number = 5.0
  ): VolumeCalculationResult {
    const baseVolumeM3 = this.convertToM3(inputQuantity, inputUnit);
    const validWastagePercent = Math.max(0, Math.min(20, wastagePercent));
    const wastageVolumeM3 = Math.round(baseVolumeM3 * (validWastagePercent / 100) * 100) / 100;
    const recommendedVolumeM3 = Math.round((baseVolumeM3 + wastageVolumeM3) * 10) / 10;

    return {
      baseVolumeM3,
      wastagePercent: validWastagePercent,
      wastageVolumeM3,
      recommendedVolumeM3,
      originalInputQuantity: inputQuantity,
      originalInputUnit: inputUnit
    };
  }

  /**
   * Deterministic financial pricing calculation.
   * NEVER fabricate unit prices or taxes.
   */
  static calculateFinancials(params: FinancialCalculationParams): FinancialCalculationResult {
    const volumeM3 = Math.max(0.1, Math.round(params.volumeM3 * 100) / 100);
    const unitPrice = Math.max(0, params.basePricePerM3);
    const concreteSubtotal = Math.round(volumeM3 * unitPrice);

    // Transport calculation
    let transportCost = 0;
    const distance = params.distanceKm || 15;
    if (distance <= 15) {
      transportCost = Math.max(800, 500 + (10 * distance * (volumeM3 / 6)));
    } else if (distance <= 30) {
      transportCost = Math.max(1200, 800 + (15 * distance * (volumeM3 / 6)));
    } else {
      transportCost = Math.max(2000, 1500 + (20 * distance * (volumeM3 / 6)));
    }
    transportCost = Math.round(transportCost);

    // Pump calculation
    let pumpCost = 0;
    if (params.pumpRequired) {
      const type = params.pumpType || "LINE_PUMP";
      if (type === "BOOM_PUMP_42M") {
        pumpCost = Math.round(9500 + Math.max(0, volumeM3 - 50) * 250);
      } else if (type === "BOOM_PUMP_24M") {
        pumpCost = Math.round(6000 + Math.max(0, volumeM3 - 30) * 200);
      } else {
        // Line pump
        pumpCost = Math.round(3500 + Math.max(0, volumeM3 - 20) * 150);
      }
    }

    // Discount
    let discountAmount = 0;
    if (params.discountPercent && params.discountPercent > 0) {
      discountAmount = Math.round(concreteSubtotal * (params.discountPercent / 100));
    }

    const taxableAmount = Math.max(0, concreteSubtotal + transportCost + pumpCost - discountAmount);
    const taxPercent = params.taxRatePercent ?? 18.0;
    const taxAmount = Math.round(taxableAmount * (taxPercent / 100));
    const totalAmount = taxableAmount + taxAmount;

    return {
      gradeCode: params.gradeCode,
      volumeM3,
      unitPrice,
      concreteSubtotal,
      transportCost,
      pumpCost,
      discountAmount,
      taxableAmount,
      taxPercent,
      taxAmount,
      totalAmount,
      currency: "INR"
    };
  }
}
