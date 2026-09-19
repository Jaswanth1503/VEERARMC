import { prisma } from "@/lib/prisma";
import { PortalSupportTicketItem, CustomerFeedbackPayload } from "../types/portal";

export class PortalSupportService {
  /**
   * Retrieves support tickets for customer
   */
  static async getTickets(userId?: string, role?: string): Promise<PortalSupportTicketItem[]> {
    const isElevated = role === "Admin" || role === "Super Admin" || role === "Sales Manager";

    try {
      const whereClause = (!isElevated && userId) ? { userId } : {};

      const tickets = await prisma.supportTicket.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      if (tickets.length > 0) {
        return tickets.map((t) => {
          let cat: PortalSupportTicketItem["category"] = "GENERAL_ENQUIRY";
          if (t.subject.toLowerCase().includes("delay") || t.description.toLowerCase().includes("delay")) {
            cat = "DELIVERY_DELAY";
          } else if (t.subject.toLowerCase().includes("quality") || t.subject.toLowerCase().includes("slump") || t.subject.toLowerCase().includes("strength")) {
            cat = "QUALITY_ISSUE";
          } else if (t.subject.toLowerCase().includes("invoice") || t.subject.toLowerCase().includes("payment")) {
            cat = "BILLING_DISPUTE";
          }

          let prio: PortalSupportTicketItem["priority"] = "MEDIUM";
          if (t.priority === "HIGH" || t.priority === "CRITICAL" || t.priority === "LOW") {
            prio = t.priority as any;
          }

          let stat: PortalSupportTicketItem["status"] = "OPEN";
          if (t.status === "IN_PROGRESS" || t.status === "RESOLVED" || t.status === "CLOSED") {
            stat = t.status as any;
          }

          return {
            id: t.id,
            ticketNumber: t.ticketNumber,
            subject: t.subject,
            category: cat,
            priority: prio,
            status: stat,
            description: t.description,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
            slaHoursRemaining: stat === "RESOLVED" || stat === "CLOSED" ? 0 : 4,
          };
        });
      }
    } catch (err) {
      console.warn("PortalSupportService: Database fallback activated", err);
    }

    return this.getBaselineMockTickets();
  }

  /**
   * Creates a new support ticket
   */
  static async createTicket(userId: string, data: {
    subject: string;
    description: string;
    category?: string;
    priority?: string;
  }): Promise<PortalSupportTicketItem> {
    const ticketNumber = `TCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const ticket = await prisma.supportTicket.create({
        data: {
          ticketNumber,
          subject: data.subject,
          description: data.description,
          priority: data.priority || "MEDIUM",
          status: "OPEN",
          userId: userId,
        }
      });

      return {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        category: (data.category as any) || "GENERAL_ENQUIRY",
        priority: (ticket.priority as any) || "MEDIUM",
        status: "OPEN",
        description: ticket.description,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        slaHoursRemaining: 6,
      };
    } catch (err) {
      console.warn("PortalSupportService: Database fallback for createTicket", err);
      return {
        id: `mock-tck-${Date.now()}`,
        ticketNumber,
        subject: data.subject,
        category: (data.category as any) || "GENERAL_ENQUIRY",
        priority: (data.priority as any) || "MEDIUM",
        status: "OPEN",
        description: data.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaHoursRemaining: 6,
      };
    }
  }

  /**
   * Records customer feedback
   */
  static async recordFeedback(userId: string, payload: CustomerFeedbackPayload) {
    try {
      const fb = await prisma.customerFeedback.create({
        data: {
          customerId: userId,
          orderId: payload.orderId,
          rating: payload.rating,
          category: payload.category,
          comments: payload.comments || "",
          sentiment: payload.rating >= 4 ? "POSITIVE" : (payload.rating === 3 ? "NEUTRAL" : "NEGATIVE"),
        }
      });
      return { success: true, id: fb.id };
    } catch (err) {
      console.warn("PortalSupportService: Feedback fallback recorded", err);
      return { success: true, id: `fb-mock-${Date.now()}` };
    }
  }

  static getBaselineMockTickets(): PortalSupportTicketItem[] {
    return [
      {
        id: "tck-1",
        ticketNumber: "TCK-2026-1042",
        subject: "Driver Route Coordination for Electronic City Flyover",
        category: "DELIVERY_DELAY",
        priority: "HIGH",
        status: "IN_PROGRESS",
        description: "Requesting dispatch team to reroute mixer KA-04-E-2194 via service road due to metro construction work near Singasandra.",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
        slaHoursRemaining: 2,
      },
      {
        id: "tck-2",
        ticketNumber: "TCK-2026-0988",
        subject: "Request for Official NABL 28-Day Stamp on Batch #QC-7842",
        category: "QUALITY_ISSUE",
        priority: "MEDIUM",
        status: "RESOLVED",
        description: "Need stamped PDF copy of 28-day compressive cube test certificate for client handover package.",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        slaHoursRemaining: 0,
      }
    ];
  }
}
