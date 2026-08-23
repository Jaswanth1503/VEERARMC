import { z } from "zod";

export const AnalyticsFilterSchema = z.object({
  timeRange: z.enum(["7D", "30D", "90D", "YTD", "1Y", "CUSTOM"]).default("30D"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  concreteGrade: z.string().optional(),
  customerId: z.string().optional(),
  projectId: z.string().optional(),
  plantId: z.string().optional(),
  orderStatus: z.string().optional()
});

export const ReportGenerateSchema = z.object({
  reportType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "ANNUAL"]),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  includeAIInsights: z.boolean().default(true),
  title: z.string().optional()
});

export const ExportAnalyticsSchema = z.object({
  format: z.enum(["PDF", "JSON", "CSV"]).default("PDF"),
  reportType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "ANNUAL"]).default("MONTHLY"),
  timeRange: z.enum(["7D", "30D", "90D", "YTD", "1Y", "CUSTOM"]).default("30D")
});

export type AnalyticsFilterInput = z.infer<typeof AnalyticsFilterSchema>;
export type ReportGenerateInput = z.infer<typeof ReportGenerateSchema>;
export type ExportAnalyticsInput = z.infer<typeof ExportAnalyticsSchema>;
