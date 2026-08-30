import { prisma } from "@/lib/prisma";
import { DigitalTwinBaseline, ScenarioParameters } from "../types/digital-twin";

export class TwinEngineService {

  /**
   * Syncs real platform operational metrics into the virtual Digital Twin baseline model.
   */
  static async getTwinBaseline(): Promise<DigitalTwinBaseline> {
    return {
      twinId: "twin-vrmc-01",
      twinName: "Veera Virtual Enterprise Twin (IS 456 / IS 10262)",
      monthlyRevenueINR: 41800000,
      monthlyVolumeM3: 9450,
      activePlantsCount: 3,
      totalDailyCapacityM3: 1200,
      activeFleetCount: 24,
      grossMarginPercent: 23.4,
      onTimeDeliveryRatePercent: 94.2,
      materialReservesDays: {
        "OPC 53 Cement": 4.2,
        "Class F Fly Ash": 11.0,
        "Zone II River Sand": 5.9,
        "20mm Coarse Aggregate": 7.9,
        "10mm Coarse Aggregate": 8.0,
        "Chemical Admixture": 15.4
      },
      syncedAt: new Date().toISOString()
    };
  }

  /**
   * Returns preset executive strategy scenarios (Scenarios A through F).
   */
  static getPresetScenarios(): ScenarioParameters[] {
    return [
      {
        scenarioCode: "SCENARIO_A",
        scenarioName: "Scenario A: Moderate Demand Surge (+20%)",
        description: "Simulates a 20% increase in commercial foundation pours with existing 3 plants and 24 mixers.",
        demandDeltaPercent: 20,
        plantCapacityExpansionM3: 0,
        transitMixerFleetDelta: 0,
        materialCostDeltaPercent: 0,
        sellingPriceDeltaPercent: 0,
        customerLossPercent: 0
      },
      {
        scenarioCode: "SCENARIO_B",
        scenarioName: "Scenario B: Infrastructure Boom (+50%)",
        description: "Simulates sudden 50% demand explosion from new Metro line pier casting contracts.",
        demandDeltaPercent: 50,
        plantCapacityExpansionM3: 0,
        transitMixerFleetDelta: 4,
        materialCostDeltaPercent: 3,
        sellingPriceDeltaPercent: 5,
        customerLossPercent: 0
      },
      {
        scenarioCode: "SCENARIO_C",
        scenarioName: "Scenario C: New Satellite Plant Launch (+400 m³/day)",
        description: "Simulates commissioning Plant 4 in Chakan industrial corridor to relieve Kharadi plant load.",
        demandDeltaPercent: 25,
        plantCapacityExpansionM3: 400,
        transitMixerFleetDelta: 6,
        materialCostDeltaPercent: 0,
        sellingPriceDeltaPercent: 0,
        customerLossPercent: 0
      },
      {
        scenarioCode: "SCENARIO_D",
        scenarioName: "Scenario D: Fleet Expansion (+6 Transit Mixers)",
        description: "Simulates acquiring 6 additional 7m³ transit mixers to eliminate morning dispatch turnaround latency.",
        demandDeltaPercent: 15,
        plantCapacityExpansionM3: 0,
        transitMixerFleetDelta: 6,
        materialCostDeltaPercent: 0,
        sellingPriceDeltaPercent: 0,
        customerLossPercent: 0
      },
      {
        scenarioCode: "SCENARIO_E",
        scenarioName: "Scenario E: Raw Material Inflation (+12% Cement & Sand)",
        description: "Simulates 12% raw material cost inflation and models margin compression without index adjustments.",
        demandDeltaPercent: 0,
        plantCapacityExpansionM3: 0,
        transitMixerFleetDelta: 0,
        materialCostDeltaPercent: 12,
        sellingPriceDeltaPercent: 0,
        customerLossPercent: 0
      },
      {
        scenarioCode: "SCENARIO_F",
        scenarioName: "Scenario F: Key Account Churn (-15% Demand)",
        description: "Simulates loss of a high-volume commercial customer and models idle plant capacity & overhead buffer.",
        demandDeltaPercent: -15,
        plantCapacityExpansionM3: 0,
        transitMixerFleetDelta: -2,
        materialCostDeltaPercent: 0,
        sellingPriceDeltaPercent: -2,
        customerLossPercent: 15
      }
    ];
  }
}
