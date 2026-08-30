import { z } from "zod";

export const CopilotQuerySchema = z.object({
  question: z.string().min(3, "Please enter an operational question").max(500),
  contextScope: z.enum(["ALL", "ORDERS", "PRODUCTION", "LOGISTICS", "REVENUE"]).default("ALL")
});

export const RecommendationApprovalSchema = z.object({
  recommendationId: z.string().min(1, "Recommendation ID required"),
  action: z.enum(["APPROVE", "REJECT", "EXECUTE"]),
  comments: z.string().optional()
});

export const ExecutiveBriefingRequestSchema = z.object({
  briefingType: z.enum(["MORNING", "AFTERNOON", "EOD", "WEEKLY", "MONTHLY"]).default("MORNING"),
  forceRefresh: z.boolean().default(false)
});

export const AlertFilterSchema = z.object({
  category: z.enum(["ALL", "ORDERS", "PRODUCTION", "INVENTORY", "LOGISTICS", "REVENUE", "FORECASTING", "SALES", "SYSTEM"]).default("ALL"),
  severity: z.enum(["ALL", "CRITICAL", "WARNING", "INFO"]).default("ALL"),
  unresolvedOnly: z.boolean().default(true)
});

export type CopilotQueryInput = z.infer<typeof CopilotQuerySchema>;
export type RecommendationApprovalInput = z.infer<typeof RecommendationApprovalSchema>;
export type ExecutiveBriefingRequestInput = z.infer<typeof ExecutiveBriefingRequestSchema>;
export type AlertFilterInput = z.infer<typeof AlertFilterSchema>;
