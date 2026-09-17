import { generateGeminiResponse } from "@/lib/ai/gemini";
import { ProjectDetailDTO } from "../types/project";

export interface ProjectCopilotResponse {
  healthSummary: string;
  delayRiskScore: number; // 0 - 100
  delayPredictionDays: number;
  costOverrunProbabilityPercent: number;
  identifiedRisks: string[];
  recommendedActions: {
    title: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    reason: string;
    actionType: "SCHEDULE" | "BUDGET" | "LOGISTICS" | "QUALITY";
  }[];
}

export class ProjectCopilotService {

  /**
   * Evaluates project execution status and provides predictive AI insights
   */
  static async queryCopilot(project: ProjectDetailDTO, userQuestion?: string): Promise<ProjectCopilotResponse> {
    const prompt = `
You are the Chief AI Project Copilot for Veera RMC 2.0.
Analyze the following ready-mix concrete project execution state:

Project: "${project.projectName}" (${project.projectCode})
- Status: ${project.status}, Priority: ${project.priority}
- Health Score: ${project.healthScore}/100 (${project.health.status})
- Progress: ${project.progressPercentage}%
- Estimated Contract Value: ₹${(project.estimatedValue / 100000).toFixed(2)} Lakhs
- Actual Spent: ₹${(project.actualValue / 100000).toFixed(2)} Lakhs
- Milestones Count: ${project.milestones.length} (Delayed: ${project.milestones.filter(m => m.status === "DELAYED").length})
- Active Tasks: ${project.tasks.filter(t => t.status !== "DONE").length}
- Active Risks: ${project.risks.filter(r => r.status !== "RESOLVED").length}
- Total Concrete Volume: ${project.totalVolumeM3} m³ across ${project.ordersCount} orders.

${userQuestion ? `User Specific Query: "${userQuestion}"` : "Provide comprehensive project health, delay prediction, cost overrun analysis, and concrete recommended actions."}

Respond with strict JSON adhering to:
{
  "healthSummary": "string (2-3 sentences of clear executive assessment)",
  "delayRiskScore": number (0-100),
  "delayPredictionDays": number (estimated calendar days slip, 0 if on time),
  "costOverrunProbabilityPercent": number (0-100),
  "identifiedRisks": ["string", "string"],
  "recommendedActions": [
    {
      "title": "string",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "reason": "string",
      "actionType": "SCHEDULE" | "BUDGET" | "LOGISTICS" | "QUALITY"
    }
  ]
}
Return STRICT JSON only.
`;

    try {
      const aiRes = await generateGeminiResponse({
        prompt,
        systemInstruction: "You are an enterprise manufacturing and civil project management AI copilot. Output strict JSON only.",
        jsonMode: true,
        temperature: 0.2
      });

      if (!aiRes.isError && aiRes.text) {
        const parsed = JSON.parse(aiRes.text);
        return {
          healthSummary: parsed.healthSummary || this.getDefaultSummary(project),
          delayRiskScore: parsed.delayRiskScore ?? (project.healthScore < 70 ? 65 : 20),
          delayPredictionDays: parsed.delayPredictionDays ?? (project.healthScore < 70 ? 4 : 0),
          costOverrunProbabilityPercent: parsed.costOverrunProbabilityPercent ?? (project.actualValue > project.estimatedValue ? 75 : 18),
          identifiedRisks: parsed.identifiedRisks || this.getDefaultRisks(project),
          recommendedActions: parsed.recommendedActions || this.getDefaultActions(project)
        };
      }
    } catch (e: any) {
      console.warn("[ProjectCopilotService Warning] Using deterministic copilot synthesis:", e.message);
    }

    return {
      healthSummary: this.getDefaultSummary(project),
      delayRiskScore: project.healthScore < 70 ? 65 : 18,
      delayPredictionDays: project.healthScore < 70 ? 4 : 0,
      costOverrunProbabilityPercent: project.actualValue > project.estimatedValue ? 75 : 15,
      identifiedRisks: this.getDefaultRisks(project),
      recommendedActions: this.getDefaultActions(project)
    };
  }

  private static getDefaultSummary(project: ProjectDetailDTO): string {
    if (project.healthScore >= 80) {
      return `Project "${project.projectName}" is executing on schedule with optimal ${project.healthScore}/100 health. Concrete volume dispatches and milestone turnarounds align with the target timeline.`;
    }
    if (project.healthScore >= 60) {
      return `Project "${project.projectName}" requires operational attention (${project.healthScore}/100). Moderate risk detected in milestone schedule buffer or transit turnaround times.`;
    }
    return `Project "${project.projectName}" is at critical risk (${project.healthScore}/100) due to delayed foundation casting milestones or budget variance. Immediate executive intervention recommended.`;
  }

  private static getDefaultRisks(project: ProjectDetailDTO): string[] {
    const list = [];
    if (project.milestones.some(m => m.status === "DELAYED")) {
      list.push("Milestone schedule compression risking sequential slab casting readiness.");
    }
    if (project.actualValue > project.estimatedValue) {
      list.push("Budget burn rate exceeding contractual billing progression.");
    }
    list.push("Peak morning transit congestion along site delivery corridor.");
    return list;
  }

  private static getDefaultActions(project: ProjectDetailDTO) {
    return [
      {
        title: "Lock 05:30 AM Early-Morning Pour Slot",
        priority: "HIGH" as const,
        reason: "Avoids 45-minute highway traffic latency and guarantees IS 456 slump compliance.",
        actionType: "LOGISTICS" as const
      },
      {
        title: "Pre-allocate 42m Concrete Boom Pump",
        priority: "MEDIUM" as const,
        reason: "Ensures seamless continuous pouring for upcoming raft casting milestone.",
        actionType: "SCHEDULE" as const
      },
      {
        title: "Confirm NABL 7-Day & 28-Day Cube Strength Logs",
        priority: "MEDIUM" as const,
        reason: "Accelerates contractor sign-off and intermediate milestone billing release.",
        actionType: "QUALITY" as const
      }
    ];
  }
}
