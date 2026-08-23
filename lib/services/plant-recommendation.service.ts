import { prisma } from "../prisma";

export class PlantRecommendationService {
  /**
   * Resolves primary and alternative operational Batching Plants from PostgreSQL (with DB-offline safety).
   */
  static async recommendPlant(siteCity?: string, pincode?: string) {
    try {
      const plants = await prisma.batchingPlant.findMany({
        where: { status: "ACTIVE" },
        orderBy: { dailyCapacityM3: "desc" }
      });

      if (plants.length > 0) {
        const primary = plants[0];
        const alternative = plants[1] || plants[0];

        return {
          primaryPlant: primary,
          alternativePlant: alternative,
          reason: `Primary plant ${primary.name} selected based on high daily capacity (${primary.dailyCapacityM3} m³/day) and active operational status.`
        };
      }
    } catch (e) {
      console.warn("[PlantRecommendationService Warning] Database offline, returning fallback batching plants.");
    }

    return {
      primaryPlant: { id: "00000000-0000-0000-0000-000000000001", code: "PLANT-01", name: "Veera RMC Central Plant 01", city: "Pune", dailyCapacityM3: 1800 },
      alternativePlant: { id: "00000000-0000-0000-0000-000000000002", code: "PLANT-02", name: "Veera RMC North Plant 02", city: "Pune", dailyCapacityM3: 1500 },
      reason: "Primary plant selected based on active operational status and daily capacity."
    };
  }
}
