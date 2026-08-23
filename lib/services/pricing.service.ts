import { prisma } from "../prisma";
import { DeterministicCalculationService, FinancialCalculationResult, InputUnit } from "./deterministic-calculation.service";

export interface QuotePricingInput {
  gradeCode: string;
  quantity: number;
  unit?: InputUnit;
  wastagePercent?: number;
  distanceKm?: number;
  pumpRequired?: boolean;
  pumpType?: string;
  discountCode?: string;
}

export class PricingService {
  /**
   * Fetch all available concrete grades from PostgreSQL database.
   */
  static async getAvailableConcreteGrades() {
    const grades = await prisma.concreteGrade.findMany({
      where: { isAvailable: true },
      orderBy: { compressiveStrength: "asc" }
    });

    if (grades.length === 0) {
      // Fallback default list if database table hasn't been seeded yet
      return [
        { gradeCode: "M10", name: "Grade M10 Standard PCC", compressiveStrength: 10, basePricePerM3: 3800, isAvailable: true },
        { gradeCode: "M15", name: "Grade M15 Medium PCC", compressiveStrength: 15, basePricePerM3: 4100, isAvailable: true },
        { gradeCode: "M20", name: "Grade M20 Standard RCC", compressiveStrength: 20, basePricePerM3: 4400, isAvailable: true },
        { gradeCode: "M25", name: "Grade M25 Premium Structural RCC", compressiveStrength: 25, basePricePerM3: 4800, isAvailable: true },
        { gradeCode: "M30", name: "Grade M30 High Performance Concrete", compressiveStrength: 30, basePricePerM3: 5200, isAvailable: true },
        { gradeCode: "M35", name: "Grade M35 Heavy Industrial Concrete", compressiveStrength: 35, basePricePerM3: 5700, isAvailable: true },
        { gradeCode: "M40", name: "Grade M40 High Strength Structural", compressiveStrength: 40, basePricePerM3: 6300, isAvailable: true },
        { gradeCode: "M50", name: "Grade M50 Ultra High Performance (UHPC)", compressiveStrength: 50, basePricePerM3: 7200, isAvailable: true }
      ];
    }

    return grades;
  }

  /**
   * Fetch single concrete grade details from database.
   */
  static async getConcreteGrade(gradeCode: string) {
    const grade = await prisma.concreteGrade.findUnique({
      where: { gradeCode: gradeCode.toUpperCase() }
    });

    if (!grade) {
      const all = await this.getAvailableConcreteGrades();
      return all.find(g => g.gradeCode.toUpperCase() === gradeCode.toUpperCase()) || all[3]; // default M25
    }

    return grade;
  }

  /**
   * Calculate complete, deterministic quote financial breakdown using trusted DB rates.
   */
  static async calculateQuotePrice(input: QuotePricingInput): Promise<{
    volume: ReturnType<typeof DeterministicCalculationService.calculateWastage>;
    financials: FinancialCalculationResult;
    gradeDetails: any;
  }> {
    const grade = await this.getConcreteGrade(input.gradeCode);
    const volumeResult = DeterministicCalculationService.calculateWastage(
      input.quantity,
      input.unit || "M3",
      input.wastagePercent ?? 5.0
    );

    // Fetch tax rate
    const taxRate = await prisma.taxRate.findFirst({ where: { isDefault: true } });
    const taxPercent = taxRate ? taxRate.ratePercent : 18.0;

    // Check discount code if provided
    let discountPercent = 0;
    if (input.discountCode) {
      const rule = await prisma.discountRule.findUnique({
        where: { code: input.discountCode.toUpperCase(), isActive: true }
      });
      if (rule && volumeResult.recommendedVolumeM3 >= rule.minOrderVolume) {
        discountPercent = rule.discountPercent;
      }
    }

    const financials = DeterministicCalculationService.calculateFinancials({
      gradeCode: grade.gradeCode,
      basePricePerM3: grade.basePricePerM3,
      volumeM3: volumeResult.recommendedVolumeM3,
      distanceKm: input.distanceKm || 15,
      pumpRequired: input.pumpRequired || false,
      pumpType: input.pumpType,
      discountPercent,
      taxRatePercent: taxPercent
    });

    return {
      volume: volumeResult,
      financials,
      gradeDetails: grade
    };
  }
}
