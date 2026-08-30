import { z } from "zod";

export const ScenarioSimulationSchema = z.object({
  scenarioCode: z.string().optional(),
  scenarioName: z.string().min(2, "Scenario name required").default("Custom Strategy Simulation"),
  description: z.string().optional(),
  demandDeltaPercent: z.number().min(-80).max(300).default(0),
  plantCapacityExpansionM3: z.number().min(0).max(10000).default(0),
  transitMixerFleetDelta: z.number().min(-15).max(100).default(0),
  materialCostDeltaPercent: z.number().min(-50).max(200).default(0),
  sellingPriceDeltaPercent: z.number().min(-50).max(200).default(0),
  customerLossPercent: z.number().min(0).max(100).default(0)
});

export const OptimizationActionSchema = z.object({
  recommendationId: z.string().min(1, "Recommendation ID required"),
  action: z.enum(["ADOPT", "ARCHIVE", "EXECUTE"])
});

export type ScenarioSimulationInput = z.infer<typeof ScenarioSimulationSchema>;
export type OptimizationActionInput = z.infer<typeof OptimizationActionSchema>;
