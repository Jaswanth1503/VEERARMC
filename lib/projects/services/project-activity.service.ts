import { prisma } from "@/lib/prisma";
import { ActivityType } from "../types/project";

export class ProjectActivityService {

  /**
   * Logs a project event into the audit trail and timeline
   */
  static async logActivity(params: {
    projectId: string;
    activityType: ActivityType;
    description: string;
    userId?: string | null;
    userName?: string | null;
    metadataJson?: any;
    addToTimeline?: boolean;
    timelineEvent?: {
      eventType: string;
      title: string;
    };
  }): Promise<void> {
    try {
      await prisma.projectActivity.create({
        data: {
          projectId: params.projectId,
          activityType: params.activityType,
          description: params.description,
          userId: params.userId || null,
          userName: params.userName || "System",
          metadataJson: params.metadataJson || null
        }
      });

      if (params.addToTimeline && params.timelineEvent) {
        await prisma.projectTimeline.create({
          data: {
            projectId: params.projectId,
            eventType: params.timelineEvent.eventType,
            title: params.timelineEvent.title,
            description: params.description,
            status: "COMPLETED"
          }
        });
      }
    } catch (error: any) {
      console.warn("[ProjectActivityService Warning] Activity log write failed (running resilient fallback):", error.message);
    }
  }
}
