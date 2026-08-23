import { prisma } from "@/lib/prisma";

export class OrderNotificationService {
  /**
   * Dispatches in-app notification to order stakeholders.
   */
  static async notifyOrderStakeholder(params: {
    orderId: string;
    recipientId: string;
    title: string;
    message: string;
    type?: "INFO" | "WARNING" | "SUCCESS" | "ALERT";
    linkUrl?: string;
  }) {
    try {
      // 1. Create order notification record
      await prisma.orderNotification.create({
        data: {
          orderId: params.orderId,
          recipientId: params.recipientId,
          title: params.title,
          message: params.message,
          type: params.type || "INFO"
        }
      });

      // 2. Also create main system notification for navbar alerts
      await prisma.notification.create({
        data: {
          userId: params.recipientId,
          title: params.title,
          message: params.message,
          type: params.type || "INFO",
          linkUrl: params.linkUrl || `/orders/${params.orderId}`
        }
      });
    } catch (e) {
      console.warn("[OrderNotificationService Warning] Database offline, skipped notification persistence:", e);
    }
  }
}
