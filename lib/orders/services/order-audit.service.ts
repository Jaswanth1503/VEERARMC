import { prisma } from "@/lib/prisma";

export class OrderAuditService {
  /**
   * Records an immutable status transition in OrderStatusHistory.
   */
  static async logStatusChange(params: {
    orderId: string;
    fromStatus: string | null;
    toStatus: string;
    changedById?: string;
    changedByName?: string;
    role?: string;
    notes?: string;
  }) {
    try {
      return await prisma.orderStatusHistory.create({
        data: {
          orderId: params.orderId,
          fromStatus: params.fromStatus,
          toStatus: params.toStatus,
          changedById: params.changedById || null,
          changedByName: params.changedByName || "Operations System",
          role: params.role || "SYSTEM",
          notes: params.notes || `Order status updated to ${params.toStatus}`
        }
      });
    } catch (e) {
      console.warn("[OrderAuditService Warning] Failed to log status history to DB:", e);
      return null;
    }
  }

  /**
   * Retrieves complete status history timeline for an order.
   */
  static async getOrderHistory(orderId: string) {
    try {
      return await prisma.orderStatusHistory.findMany({
        where: { orderId },
        orderBy: { createdAt: "asc" }
      });
    } catch (e) {
      return [];
    }
  }
}
