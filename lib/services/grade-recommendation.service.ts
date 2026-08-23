export interface GradeComparisonItem {
  gradeCode: string;
  name: string;
  compressiveStrengthMPa: number;
  typicalApplication: string;
  relativeCostPerM3: number;
  suitableProjectTypes: string[];
}

export class GradeRecommendationService {
  /**
   * Database-backed multi-grade comparison matrix (M20 to M50).
   */
  static getGradeComparisonMatrix(): GradeComparisonItem[] {
    return [
      { gradeCode: "M20", name: "Grade M20 Standard RCC", compressiveStrengthMPa: 20, typicalApplication: "Single-story residential RCC columns & beams", relativeCostPerM3: 4400, suitableProjectTypes: ["Residential", "Villa"] },
      { gradeCode: "M25", name: "Grade M25 Premium Structural", compressiveStrengthMPa: 25, typicalApplication: "Multi-story foundations, slabs & columns", relativeCostPerM3: 4800, suitableProjectTypes: ["Residential", "Commercial"] },
      { gradeCode: "M30", name: "Grade M30 High Performance", compressiveStrengthMPa: 30, typicalApplication: "Commercial structures, water tanks, heavy slabs", relativeCostPerM3: 5200, suitableProjectTypes: ["Commercial", "Industrial"] },
      { gradeCode: "M35", name: "Grade M35 Heavy Industrial", compressiveStrengthMPa: 35, typicalApplication: "Industrial floors, pre-stressed girders, flyovers", relativeCostPerM3: 5700, suitableProjectTypes: ["Industrial", "Infrastructure"] },
      { gradeCode: "M40", name: "Grade M40 High Strength Structural", compressiveStrengthMPa: 40, typicalApplication: "High-rise columns, pre-cast members, bridges", relativeCostPerM3: 6300, suitableProjectTypes: ["High-rise", "Infrastructure"] },
      { gradeCode: "M50", name: "Grade M50 Ultra High Performance", compressiveStrengthMPa: 50, typicalApplication: "Marine structures, heavy girders, nuclear plants", relativeCostPerM3: 7200, suitableProjectTypes: ["Marine", "Heavy Civil"] }
    ];
  }

  /**
   * Recommends concrete mix grade based on project type and floors.
   */
  static recommendGrade(projectType: string = "Residential", floors: number = 1) {
    let rec = "M25";
    let reason = "Grade M25 recommended for standard residential multi-story RCC framing.";

    if (floors > 8 || projectType === "High-rise") {
      rec = "M40";
      reason = "Grade M40 high-strength concrete recommended for high-rise columns exceeding 8 stories.";
    } else if (floors > 3 || projectType === "Commercial") {
      rec = "M30";
      reason = "Grade M30 high-performance concrete recommended for multi-story commercial slabs and columns.";
    } else if (projectType === "Industrial") {
      rec = "M35";
      reason = "Grade M35 recommended for heavy load-bearing industrial flooring.";
    }

    return {
      recommendedGrade: rec,
      reason,
      disclaimer: "Final structural concrete grade must be verified and approved by a qualified structural engineer."
    };
  }
}
