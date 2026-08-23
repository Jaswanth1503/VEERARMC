import { z } from "zod";

export const CreateProductionPlanSchema = z.object({
  orderId: z.string().uuid("Valid Order ID is required"),
  plantId: z.string().uuid("Valid Plant ID is required"),
  plannedQuantity: z.number().min(0.5, "Planned quantity must be at least 0.5 m³").optional(),
  concreteGrade: z.string().optional(),
  scheduledDate: z.string().or(z.date()),
  scheduledStartTime: z.string().or(z.date()),
  scheduledEndTime: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
});

export const UpdateProductionPlanSchema = z.object({
  status: z.enum(["PLANNED", "SCHEDULED", "READY", "IN_PROGRESS", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
  notes: z.string().optional(),
  actualStartTime: z.string().or(z.date()).optional(),
  actualEndTime: z.string().or(z.date()).optional(),
});

export const CreateBatchSchema = z.object({
  productionPlanId: z.string().uuid("Valid Production Plan ID is required"),
  quantity: z.number().min(0.5, "Batch volume must be at least 0.5 m³").default(6.0),
  truckNumber: z.string().optional(),
  operatorName: z.string().optional().default("Plant Operator"),
  mixingTimeSeconds: z.number().min(30).default(120),
  waterCementRatio: z.number().min(0.2).max(0.8).default(0.45),
  slumpMm: z.number().min(50).max(250).default(120),
  temperatureCelsius: z.number().min(5).max(45).default(28.0),
});

export const PlantSchema = z.object({
  code: z.string().min(2, "Plant code required (e.g. PLANT-01)"),
  name: z.string().min(3, "Plant name required"),
  address: z.string().min(3, "Address required"),
  city: z.string().default("Pune"),
  pincode: z.string().min(6, "Valid 6-digit pincode required"),
  dailyCapacityM3: z.number().min(100).default(1500),
  capacityPerHour: z.number().min(10).default(120),
  status: z.enum(["ACTIVE", "MAINTENANCE", "OFFLINE"]).default("ACTIVE"),
  contactPhone: z.string().optional(),
  managerName: z.string().optional(),
});
