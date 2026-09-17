import { ProjectHealthMetrics } from "../types/project";

export class ProjectHealthService {

  /**
   * Calculates a comprehensive 0–100 composite Project Health Score
   * Weighted: Progress (25%), Budget (25%), Timeline (20%), Risks (15%), Deliveries (15%)
   */
  static calculateHealth(params: {
    progressPercentage: number;
    estimatedValue: number;
    actualValue: number;
    delayedMilestonesCount: number;
    criticalRisksCount: number;
    highRisksCount: number;
    ordersCount: number;
    deliveredOrdersCount: number;
    targetDate?: Date | string | null;
  }): ProjectHealthMetrics {
    const {
      progressPercentage,
      estimatedValue,
      actualValue,
      delayedMilestonesCount,
      criticalRisksCount,
      highRisksCount,
      ordersCount,
      deliveredOrdersCount,
      targetDate
    } = params;

    // 1. Progress Score (0 - 100)
    const progressScore = Math.min(100, Math.max(20, Math.round(progressPercentage > 0 ? progressPercentage : 60)));

    // 2. Budget Score (0 - 100)
    let budgetScore = 95;
    if (estimatedValue > 0 && actualValue > estimatedValue) {
      const overrunPercent = ((actualValue - estimatedValue) / estimatedValue) * 100;
      budgetScore = Math.max(30, Math.round(95 - overrunPercent * 2));
    }

    // 3. Timeline / Schedule Score (0 - 100)
    let timelineScore = 98;
    if (delayedMilestonesCount > 0) {
      timelineScore = Math.max(35, Math.round(98 - delayedMilestonesCount * 18));
    }
    if (targetDate && new Date(targetDate) < new Date() && progressPercentage < 100) {
      timelineScore = Math.max(25, timelineScore - 25);
    }

    // 4. Risk Score (0 - 100)
    let riskScore = 95;
    const riskDeduction = (criticalRisksCount * 22) + (highRisksCount * 10);
    riskScore = Math.max(20, Math.round(95 - riskDeduction));

    // 5. Delivery Score (0 - 100)
    let deliveryScore = 90;
    if (ordersCount > 0) {
      const fulfillmentRate = (deliveredOrdersCount / ordersCount) * 100;
      deliveryScore = Math.round(Math.max(40, fulfillmentRate));
    }

    // Composite Weighted Score
    const compositeScore = Number((
      (progressScore * 0.25) +
      (budgetScore * 0.25) +
      (timelineScore * 0.20) +
      (riskScore * 0.15) +
      (deliveryScore * 0.15)
    ).toFixed(1));

    const healthScore = Math.min(100, Math.max(10, compositeScore));

    const status: "OPTIMAL" | "ATTENTION" | "CRITICAL" = 
      healthScore >= 80 ? "OPTIMAL" : healthScore >= 60 ? "ATTENTION" : "CRITICAL";

    const recommendations: string[] = [];
    if (budgetScore < 75) {
      recommendations.push("Review concrete over-pour volumes and pump idle-time charges with site contractor.");
    }
    if (timelineScore < 75) {
      recommendations.push("Authorize early 05:30 AM pour window to recover delayed slab casting milestone.");
    }
    if (riskScore < 75) {
      recommendations.push("Mitigate active critical risks: confirm raw aggregate replenishment with Khadki plant.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Project execution is within target tolerances. Continue monitoring upcoming milestone casting.");
    }

    return {
      healthScore,
      status,
      progressScore,
      budgetScore,
      timelineScore,
      riskScore,
      deliveryScore,
      recommendations
    };
  }
}
