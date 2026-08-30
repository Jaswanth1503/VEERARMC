import { EnterpriseHeatmap } from "../types/digital-twin";

export class HeatmapGeneratorService {

  /**
   * Generates 5 enterprise heatmaps for strategic executive visualization.
   */
  static getHeatmaps(): Record<string, EnterpriseHeatmap> {
    return {
      CAPACITY: {
        heatmapType: "CAPACITY",
        title: "Plant Capacity Utilization Heatmap",
        description: "Hourly batching intensity across all 3 production units (06:00 AM - 20:00 PM)",
        matrix: [
          { xLabel: "06:00 - 08:00", yLabel: "Plant 1 (Khadki)", value: 45, status: "LOW", details: "Early wave foundation batching" },
          { xLabel: "08:00 - 10:00", yLabel: "Plant 1 (Khadki)", value: 92, status: "CRITICAL", details: "Peak commercial batching slot" },
          { xLabel: "10:00 - 12:00", yLabel: "Plant 1 (Khadki)", value: 85, status: "HIGH", details: "Continuous slab pours" },
          { xLabel: "12:00 - 14:00", yLabel: "Plant 1 (Khadki)", value: 65, status: "NORMAL", details: "Afternoon shift transition" },
          { xLabel: "06:00 - 08:00", yLabel: "Plant 2 (Hinjewadi)", value: 55, status: "NORMAL", details: "IT Park slab pours" },
          { xLabel: "08:00 - 10:00", yLabel: "Plant 2 (Hinjewadi)", value: 96, status: "CRITICAL", details: "Overloaded batch queue" },
          { xLabel: "10:00 - 12:00", yLabel: "Plant 2 (Hinjewadi)", value: 88, status: "HIGH", details: "High-strength M35 viaduct batches" },
          { xLabel: "12:00 - 14:00", yLabel: "Plant 2 (Hinjewadi)", value: 70, status: "NORMAL", details: "Steady batching" },
          { xLabel: "06:00 - 08:00", yLabel: "Plant 3 (Hadapsar)", value: 35, status: "LOW", details: "Idle capacity available" },
          { xLabel: "08:00 - 10:00", yLabel: "Plant 3 (Hadapsar)", value: 68, status: "NORMAL", details: "Moderate residential loading" },
          { xLabel: "10:00 - 12:00", yLabel: "Plant 3 (Hadapsar)", value: 72, status: "NORMAL", details: "Steady output" },
          { xLabel: "12:00 - 14:00", yLabel: "Plant 3 (Hadapsar)", value: 45, status: "LOW", details: "Idle capacity reserve" }
        ],
        summaryNote: "Plant 2 experiences critical peak between 08:00 AM - 10:00 AM (96% load). Rebalancing 45 m³ to Plant 3 normalizes capacity across the network."
      },
      DEMAND: {
        heatmapType: "DEMAND",
        title: "Concrete Mix Grade Demand Heatmap",
        description: "Demand density across concrete grades and geographic project corridors",
        matrix: [
          { xLabel: "M20 / M25", yLabel: "Hinjewadi Corridor", value: 80, status: "HIGH", details: "Residential high-rise floors" },
          { xLabel: "M30 / M35", yLabel: "Hinjewadi Corridor", value: 95, status: "CRITICAL", details: "Commercial tech park foundations" },
          { xLabel: "M40 / M50", yLabel: "Hinjewadi Corridor", value: 60, status: "NORMAL", details: "Heavy column casting" },
          { xLabel: "M20 / M25", yLabel: "Kharadi Corridor", value: 85, status: "HIGH", details: "Residential townships" },
          { xLabel: "M30 / M35", yLabel: "Kharadi Corridor", value: 75, status: "NORMAL", details: "Commercial IT parks" },
          { xLabel: "M40 / M50", yLabel: "Kharadi Corridor", value: 90, status: "CRITICAL", details: "Metro Line 3 viaduct piers" }
        ],
        summaryNote: "Highest volumetric demand is concentrated in high-strength M30/M35 mixes in Hinjewadi and M40/M50 for infrastructure in Kharadi."
      },
      RISK: {
        heatmapType: "RISK",
        title: "Operational & Supply Chain Risk Heatmap",
        description: "Risk exposure matrix across inventory, logistics, and plant assets",
        matrix: [
          { xLabel: "Raw Materials", yLabel: "OPC 53 Cement", value: 88, status: "CRITICAL", details: "4.2 days reserve left" },
          { xLabel: "Raw Materials", yLabel: "River Sand", value: 65, status: "NORMAL", details: "5.9 days reserve" },
          { xLabel: "Logistics", yLabel: "Peak Transit Time", value: 78, status: "HIGH", details: "Highway traffic delay risk" },
          { xLabel: "Plant Operations", yLabel: "Hopper Wear", value: 40, status: "LOW", details: "Scheduled maintenance active" }
        ],
        summaryNote: "Top operational risk: Cement silo buffer burnout (₹32L exposure). Mitigation: Authorize bulk purchase order for 600 MT."
      }
    };
  }
}
