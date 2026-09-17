import { z } from "zod";

export const CreateProjectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters").max(100),
  location: z.string().optional().default("Pune, Maharashtra"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  estimatedValue: z.number().min(0).default(0),
  customerId: z.string().optional(),
  contractorId: z.string().optional().nullable(),
  projectManagerId: z.string().optional().nullable(),
  initialConcreteVolumeM3: z.number().optional().default(200)
});

export const UpdateProjectSchema = z.object({
  projectName: z.string().min(3).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  completedDate: z.string().optional().nullable(),
  estimatedValue: z.number().min(0).optional(),
  actualValue: z.number().min(0).optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  projectManagerId: z.string().optional().nullable()
});

export const CreateProjectTaskSchema = z.object({
  milestoneId: z.string().optional().nullable(),
  title: z.string().min(3, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"]).default("TODO"),
  dueDate: z.string().optional(),
  assignedToName: z.string().optional().default("Operations Lead"),
  estimatedHours: z.number().min(0).optional().default(8)
});

export const CreateProjectMilestoneSchema = z.object({
  title: z.string().min(3, "Milestone title is required"),
  description: z.string().optional(),
  targetDate: z.string().min(1, "Target date is required"),
  concreteVolumeM3: z.number().min(0).optional().default(50),
  ownerName: z.string().optional().default("Site In-Charge")
});

export const CreateProjectRiskSchema = z.object({
  riskType: z.enum(["OPERATIONAL", "FINANCIAL", "SCHEDULE", "LOGISTICS", "PRODUCTION", "CUSTOMER"]).default("OPERATIONAL"),
  title: z.string().min(3, "Risk title is required"),
  description: z.string().optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  probability: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  mitigationPlan: z.string().optional()
});

export const ProjectCopilotQuerySchema = z.object({
  question: z.string().min(2, "Please ask an operational project question"),
  focusArea: z.enum(["GENERAL", "SCHEDULE", "BUDGET", "RISKS", "DELIVERY"]).default("GENERAL")
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type CreateProjectTaskInput = z.infer<typeof CreateProjectTaskSchema>;
export type CreateProjectMilestoneInput = z.infer<typeof CreateProjectMilestoneSchema>;
export type CreateProjectRiskInput = z.infer<typeof CreateProjectRiskSchema>;
export type ProjectCopilotQueryInput = z.infer<typeof ProjectCopilotQuerySchema>;
