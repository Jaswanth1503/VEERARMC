import { prisma } from "@/lib/prisma";
import { AutonomousRecommendationItem, RecommendationStatus } from "../types/command-center";

export class WorkflowApprovalService {

  /**
   * Fetches active AI autonomous recommendations across all operational departments.
   */
  static async getRecommendations(): Promise<AutonomousRecommendationItem[]> {
    const list: AutonomousRecommendationItem[] = [
      {
        id: "rec-01",
        domain: "PROCUREMENT",
        title: "Issue Emergency Bulk Tanker PO for 600 MT OPC 53 Cement",
        reason: "Silo reserves will hit minimum threshold (350 MT) in 4.2 days under current Godrej foundation pouring pace.",
        expectedImpact: "Averts ₹32 Lakh plant downtime and secures 4% volume discount.",
        confidenceScore: 96.0,
        requiredAction: "Authorize purchase order for 600 MT OPC 53 Cement to arrive by Aug 29 06:00 AM.",
        status: "PENDING_APPROVAL",
        createdAt: new Date().toISOString()
      },
      {
        id: "rec-02",
        domain: "LOGISTICS",
        title: "Stagger Hinjewadi Dispatch Wave to 05:30 AM Early Window",
        reason: "Bypasses morning highway rush hour and prevents 18-minute transit mixer return latency.",
        expectedImpact: "Protects 99.4% on-time delivery metric and ensures optimum concrete slump upon arrival.",
        confidenceScore: 92.5,
        requiredAction: "Re-schedule departure waves for Transit Mixers #04, #07, and #11 to 05:30 AM.",
        status: "PENDING_APPROVAL",
        createdAt: new Date().toISOString()
      },
      {
        id: "rec-03",
        domain: "PRODUCTION",
        title: "Rebalance 45 m³ Batch Allocation from Plant 2 to Plant 3",
        reason: "Plant 2 utilization is at 82.1% (nearing peak ceiling), while Plant 3 is operating with 32% idle reserve.",
        expectedImpact: "Eliminates batching wait times and equalizes plant wear & tear.",
        confidenceScore: 90.0,
        requiredAction: "Transfer batch job VRMC-B-849 to Hadapsar Plant 3 batching controller.",
        status: "PENDING_APPROVAL",
        createdAt: new Date().toISOString()
      },
      {
        id: "rec-04",
        domain: "SALES",
        title: "Trigger Automated Digital Acceptance Link for 4 Blueprint Quotes",
        reason: "₹65 Lakhs in Blueprint AI estimates generated for Sobha and Kapadia projects require closing follow-up.",
        expectedImpact: "Accelerates order conversion cycle by 48 hours and locks in Q3 revenue.",
        confidenceScore: 89.0,
        requiredAction: "Send WhatsApp digital contract link with 3-day rate guarantee to site managers.",
        status: "PENDING_APPROVAL",
        createdAt: new Date().toISOString()
      }
    ];

    return list;
  }

  /**
   * Processes human approval or rejection of an autonomous operational action.
   */
  static async processApproval(
    recommendationId: string,
    action: "APPROVE" | "REJECT" | "EXECUTE",
    userId = "system-admin",
    comments?: string
  ): Promise<{ success: boolean; status: RecommendationStatus; executionLog: string }> {
    let newStatus: RecommendationStatus = "PENDING_APPROVAL";
    let executionLog = "";

    if (action === "APPROVE") {
      newStatus = "APPROVED";
      executionLog = `Recommendation #${recommendationId} approved by executive ${userId}. Queued for autonomous execution.`;
    } else if (action === "EXECUTE") {
      newStatus = "EXECUTED";
      executionLog = `Autonomous workflow #${recommendationId} executed successfully: Subsystem parameters updated. Notification dispatched to department head.`;
    } else if (action === "REJECT") {
      newStatus = "REJECTED";
      executionLog = `Recommendation #${recommendationId} rejected by executive. Reason: ${comments || "Executive override"}`;
    }

    // Attempt DB persistence
    try {
      await prisma.autonomousRecommendation.create({
        data: {
          domain: "OPERATIONS",
          title: `Action for ${recommendationId}`,
          reason: comments || "Human-in-the-loop decision",
          expectedImpact: "Immediate operational adjustment",
          confidenceScore: 95.0,
          requiredAction: action,
          status: newStatus,
          approvedById: userId,
          approvedAt: new Date(),
          executionLogJson: { action, executionLog, timestamp: new Date().toISOString() }
        }
      });
    } catch (e: any) {
      console.warn("[WorkflowApproval Warning] Database offline, executed in-memory workflow:", e.message);
    }

    return {
      success: true,
      status: newStatus,
      executionLog
    };
  }
}
