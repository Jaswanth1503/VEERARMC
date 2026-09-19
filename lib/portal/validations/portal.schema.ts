import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum([
    "DELIVERY_DELAY",
    "QUALITY_ISSUE",
    "BILLING_DISPUTE",
    "TECHNICAL_SUPPORT",
    "GENERAL_ENQUIRY",
  ]).default("GENERAL_ENQUIRY"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  orderId: z.string().uuid().optional(),
});

export const createFeedbackSchema = z.object({
  orderId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  category: z.string().min(2),
  comments: z.string().optional(),
});

export const portalAiQuerySchema = z.object({
  question: z.string().min(2, "Question cannot be empty"),
  projectId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
});

export const documentFilterSchema = z.object({
  type: z.string().optional(),
  search: z.string().optional(),
  projectId: z.string().uuid().optional(),
});
