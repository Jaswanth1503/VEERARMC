import { z } from "zod";

export const ForecastFilterSchema = z.object({
  horizon: z.enum(["7D", "30D", "90D", "1Y"]).default("30D"),
  plantId: z.string().optional(),
  concreteGrade: z.string().optional(),
  customerId: z.string().optional()
});

export const WhatIfSimulationSchema = z.object({
  simulationName: z.string().min(2, "Simulation name required").default("Executive Strategy Scenario"),
  demandAdjustmentPercent: z.number().min(-50).max(200).default(0),
  plantCapacityExpansionM3: z.number().min(0).max(5000).default(0),
  transitMixerFleetDelta: z.number().min(-10).max(50).default(0),
  rawMaterialCostChangePercent: z.number().min(-30).max(100).default(0),
  sellingPriceChangePercent: z.number().min(-30).max(100).default(0)
});

export const DecisionReportRequestSchema = z.object({
  horizon: z.enum(["7D", "30D", "90D", "1Y"]).default("30D"),
  title: z.string().optional(),
  includeWhatIfSummary: z.boolean().default(true)
});

export type ForecastFilterInput = z.infer<typeof ForecastFilterSchema>;
export type WhatIfSimulationInputType = z.infer<typeof WhatIfSimulationSchema>;
export type DecisionReportRequestInput = z.infer<typeof DecisionReportRequestSchema>;
