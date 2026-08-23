export type OrderStatus = 
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "PRODUCTION_SCHEDULED"
  | "IN_PRODUCTION"
  | "READY_FOR_DISPATCH"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED"
  | "ON_HOLD"
  | "FAILED";

export type OrderPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export type ApprovalAction = "APPROVED" | "REJECTED" | "REQUEST_CHANGE";

export type ScheduleStatus = "SCHEDULED" | "DISPATCHED" | "IN_TRANSIT" | "ARRIVED" | "DELIVERED" | "CANCELLED";

export type OrderDocumentType = 
  | "PURCHASE_ORDER"
  | "CONTRACT"
  | "SITE_DRAWING"
  | "DELIVERY_INSTRUCTION"
  | "INVOICE"
  | "OTHER";

export interface OrderItemDTO {
  id?: string;
  concreteGrade: string;
  quantity: number;
  unit?: string;
  mixRecommendationId?: string;
  unitPrice?: number;
  subtotal?: number;
  notes?: string;
}

export interface CreateOrderInput {
  customerId?: string;
  contractorId?: string;
  projectId?: string;
  quoteId?: string;
  blueprintAnalysisId?: string;

  concreteGrade?: string;
  quantity?: number;
  items?: OrderItemDTO[];
  priority?: OrderPriority;

  requestedDeliveryDate: Date | string;
  preferredTimeWindow?: string;
  deliveryAddress: string;
  siteCity?: string;
  pincode?: string;
  siteContactName?: string;
  siteContactPhone?: string;

  pumpRequired?: boolean;
  pumpType?: string;
  specialInstructions?: string;

  status?: OrderStatus;
}

export interface UpdateOrderInput {
  concreteGrade?: string;
  quantity?: number;
  requestedDeliveryDate?: Date | string;
  preferredTimeWindow?: string;
  deliveryAddress?: string;
  siteCity?: string;
  pincode?: string;
  siteContactName?: string;
  siteContactPhone?: string;
  pumpRequired?: boolean;
  pumpType?: string;
  specialInstructions?: string;
  priority?: OrderPriority;
}

export interface OrderFilterParams {
  status?: string;
  customerId?: string;
  projectId?: string;
  concreteGrade?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  role?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface OrderAIAnalysis {
  summary: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  risks: string[];
  recommendations: string[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
  productionFeasibility: string;
  deliveryFeasibility: string;
}
