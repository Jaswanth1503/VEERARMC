import { z } from "zod";

export const OrderItemSchema = z.object({
  concreteGrade: z.string().min(1, "Concrete grade is required"),
  quantity: z.number().min(0.5, "Minimum volume is 0.5 m³"),
  unit: z.string().default("M3"),
  mixRecommendationId: z.string().uuid().optional(),
  unitPrice: z.number().min(0).default(4500),
  subtotal: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  contractorId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  blueprintAnalysisId: z.string().uuid().optional(),

  concreteGrade: z.string().optional().default("M25"),
  quantity: z.number().min(0.5, "Minimum quantity is 0.5 m³").optional().default(6.0),
  items: z.array(OrderItemSchema).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).default("NORMAL"),

  requestedDeliveryDate: z.string().or(z.date()),
  preferredTimeWindow: z.string().optional().default("08:00 AM - 12:00 PM"),
  deliveryAddress: z.string().min(3, "Delivery address is required"),
  siteCity: z.string().optional().default("Pune"),
  pincode: z.string().optional(),
  siteContactName: z.string().optional(),
  siteContactPhone: z.string().optional(),

  pumpRequired: z.boolean().default(false),
  pumpType: z.string().optional(),
  specialInstructions: z.string().optional(),
  status: z.enum([
    "DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "PRODUCTION_SCHEDULED",
    "IN_PRODUCTION", "READY_FOR_DISPATCH", "IN_TRANSIT", "DELIVERED",
    "REJECTED", "CANCELLED", "ON_HOLD", "FAILED"
  ]).default("DRAFT"),
});

export const UpdateOrderSchema = z.object({
  concreteGrade: z.string().optional(),
  quantity: z.number().min(0.5).optional(),
  requestedDeliveryDate: z.string().or(z.date()).optional(),
  preferredTimeWindow: z.string().optional(),
  deliveryAddress: z.string().optional(),
  siteCity: z.string().optional(),
  pincode: z.string().optional(),
  siteContactName: z.string().optional(),
  siteContactPhone: z.string().optional(),
  pumpRequired: z.boolean().optional(),
  pumpType: z.string().optional(),
  specialInstructions: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).optional(),
});

export const OrderApprovalSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED", "REQUEST_CHANGE"]),
  comments: z.string().optional(),
  role: z.string().default("SALES_MANAGER"),
});

export const OrderScheduleSchema = z.object({
  plantId: z.string().uuid().optional(),
  scheduledDate: z.string().or(z.date()),
  estimatedArrival: z.string().or(z.date()),
  quantityM3: z.number().min(0.5, "Scheduled batch quantity must be at least 0.5 m³"),
  truckNumber: z.string().optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  notes: z.string().optional(),
});

export const OrderCommentSchema = z.object({
  message: z.string().min(1, "Comment message cannot be empty"),
  isInternal: z.boolean().default(false),
});
