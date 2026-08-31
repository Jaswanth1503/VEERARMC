import { EnterpriseHeatmap } from "../types/digital-twin";

export class HeatmapGeneratorService {

  /**
   * Generates all 5 enterprise heatmaps for strategic executive visualization:
   * 1. Capacity Heatmap
   * 2. Demand Heatmap
   * 3. Revenue Heatmap
   * 4. Risk Heatmap
   * 5. Operational Heatmap
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
          { xLabel: "M40 / M50", yLabel: "Kharadi Corridor", value: 90, status: "CRITICAL", details: "Metro Line 3 viaduct piers" },
          { xLabel: "M20 / M25", yLabel: "Chakan Corridor", value: 65, status: "NORMAL", details: "Factory warehouse floors" },
          { xLabel: "M30 / M35", yLabel: "Chakan Corridor", value: 70, status: "NORMAL", details: "Heavy equipment foundations" },
          { xLabel: "M40 / M50", yLabel: "Chakan Corridor", value: 50, status: "LOW", details: "Automotive test track beds" }
        ],
        summaryNote: "Highest volumetric demand is concentrated in high-strength M30/M35 mixes in Hinjewadi and M40/M50 for infrastructure in Kharadi."
      },
      REVENUE: {
        heatmapType: "REVENUE",
        title: "Enterprise Revenue & Margin Density Heatmap",
        description: "Revenue realization and gross margin yields across customer categories and order volumes",
        matrix: [
          { xLabel: "0 - 50 m³ (Retail)", yLabel: "Residential Self-Builders", value: 72, status: "NORMAL", details: "₹4,850/m³ (28% margin)" },
          { xLabel: "50 - 200 m³ (Mid)", yLabel: "Residential Self-Builders", value: 85, status: "HIGH", details: "₹4,650/m³ (25% margin)" },
          { xLabel: "200 - 1000 m³ (Bulk)", yLabel: "Commercial Developers", value: 94, status: "CRITICAL", details: "₹4,200/m³ (22% margin) - Top Cashflow" },
          { xLabel: "> 1000 m³ (Mega)", yLabel: "Commercial Developers", value: 91, status: "HIGH", details: "₹4,050/m³ (19% margin) - Volume Anchor" },
          { xLabel: "200 - 1000 m³ (Bulk)", yLabel: "Infrastructure Contractors", value: 88, status: "HIGH", details: "₹4,400/m³ (24% margin) - Strict QC" },
          { xLabel: "> 1000 m³ (Mega)", yLabel: "Infrastructure Contractors", value: 96, status: "CRITICAL", details: "₹4,150/m³ (21% margin) - ₹1.8 Cr Runrate" }
        ],
        summaryNote: "Top revenue velocity is anchored in Commercial Bulk & Infra Mega pours. Retaining high-margin retail (>25%) protects platform gross yield."
      },
      RISK: {
        heatmapType: "RISK",
        title: "Enterprise Operational & Risk Heatmap",
        description: "Comprehensive risk exposure matrix across operational, financial, supply chain, and logistics domains",
        matrix: [
          { xLabel: "Supply Chain", yLabel: "OPC 53 Cement", value: 88, status: "CRITICAL", details: "4.2 days reserve left (₹32L exposure)" },
          { xLabel: "Supply Chain", yLabel: "Zone II River Sand", value: 65, status: "NORMAL", details: "5.9 days reserve (Safe buffer)" },
          { xLabel: "Logistics", yLabel: "Peak Transit Bottleneck", value: 82, status: "HIGH", details: "Bypass highway traffic delay risk" },
          { xLabel: "Plant Assets", yLabel: "Plant 2 Batcher Wear", value: 74, status: "HIGH", details: "Nearing 500-hour service interval" },
          { xLabel: "Financial", yLabel: "Customer Receivable Dwell", value: 68, status: "NORMAL", details: "Avg 34 days DSO (Within 45d limit)" },
          { xLabel: "Market Risk", yLabel: "Cement Price Volatility", value: 76, status: "HIGH", details: "₹15/bag price hike anticipated" }
        ],
        summaryNote: "Top operational risks: Cement silo buffer burnout (₹32L exposure) and Highway transit delays. Mitigated by auto-replenishment & early dispatch wave."
      },
      OPERATIONAL: {
        heatmapType: "OPERATIONAL",
        title: "Logistics & Fleet Turnaround Operational Heatmap",
        description: "Turnaround cycle latency and mixer dwell times across plants and delivery clusters",
        matrix: [
          { xLabel: "Loading Dock Dwell", yLabel: "Plant 1 (Khadki)", value: 42, status: "LOW", details: "14 mins avg dock dwell" },
          { xLabel: "Highway Transit Dwell", yLabel: "Plant 1 (Khadki)", value: 75, status: "NORMAL", details: "38 mins avg transit time" },
          { xLabel: "Site Unloading Dwell", yLabel: "Plant 1 (Khadki)", value: 60, status: "NORMAL", details: "32 mins pour & pump time" },
          { xLabel: "Loading Dock Dwell", yLabel: "Plant 2 (Hinjewadi)", value: 86, status: "CRITICAL", details: "26 mins dock wait during peak" },
          { xLabel: "Highway Transit Dwell", yLabel: "Plant 2 (Hinjewadi)", value: 92, status: "CRITICAL", details: "54 mins traffic delay on Hinjewadi Flyover" },
          { xLabel: "Site Unloading Dwell", yLabel: "Plant 2 (Hinjewadi)", value: 58, status: "NORMAL", details: "29 mins pump discharge" },
          { xLabel: "Loading Dock Dwell", yLabel: "Plant 3 (Hadapsar)", value: 30, status: "LOW", details: "11 mins dock dwell (Ultra-efficient)" },
          { xLabel: "Highway Transit Dwell", yLabel: "Plant 3 (Hadapsar)", value: 62, status: "NORMAL", details: "35 mins steady transit" },
          { xLabel: "Site Unloading Dwell", yLabel: "Plant 3 (Hadapsar)", value: 50, status: "LOW", details: "25 mins pour discharge" }
        ],
        summaryNote: "Plant 2 exhibits severe transit dwell (54 mins) and dock queuing (26 mins). Enacting early-morning dispatch staggering saves 42 mixer-hours daily."
      }
    };
  }
}
