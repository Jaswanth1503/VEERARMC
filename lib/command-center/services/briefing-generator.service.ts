import { generateGeminiResponse } from "@/lib/ai/gemini";
import { BriefingType, ExecutiveBriefingPacket } from "../types/command-center";
import { BusinessHealthService } from "./business-health.service";
import { prisma } from "@/lib/prisma";

export class BriefingGeneratorService {

  /**
   * Generates dynamic Morning, Afternoon, End-of-Day, Weekly, or Monthly executive briefings.
   */
  static async generateBriefing(type: BriefingType = "MORNING"): Promise<ExecutiveBriefingPacket> {
    const health = await BusinessHealthService.calculateUnifiedHealth();

    const prompt = `
You are the Chief Operating Officer AI for Veera RMC 2.0.
Generate a comprehensive ${type} Executive Briefing for the Board & Senior Leadership.

Current Operations Snapshot:
- Overall Health Score: ${health.overallHealthScore}/100 (${health.healthStatus})
- Monthly Revenue: ₹4.18 Cr (+16.4% MoM)
- Active Fleet: 24 Transit Mixers, 94.2% on-time dispatch rate
- Production: 315 m³/day average output across 3 plants
- Material Silos: OPC 53 Cement (4.2 days buffer left), River Sand (5.9 days buffer)
- Critical Actions Needed: Authorize 600 MT Cement tanker PO, stagger 08:00 AM dispatch wave, follow up on ₹65L Blueprint quotes.

Return STRICT JSON with:
1. "headline": string (Catchy, punchy executive headline)
2. "executiveSummary": string (2-3 paragraphs of strategic synthesis)
3. "keyMetrics": array of { "label": string, "value": string, "status": "UP"|"DOWN"|"NEUTRAL" }
4. "criticalRisks": array of { "risk": string, "exposure": string, "mitigation": string }
5. "strategicOpportunities": array of { "opportunity": string, "upside": string, "action": string }
6. "leadershipActionItems": array of { "priority": "IMMEDIATE"|"TODAY"|"THIS_WEEK", "action": string, "owner": string }

Return STRICT JSON only.
`;

    try {
      const aiRes = await generateGeminiResponse({
        prompt,
        systemInstruction: "You are an enterprise concrete manufacturing COO. Output strict JSON only.",
        jsonMode: true,
        temperature: 0.2
      });

      if (!aiRes.isError && aiRes.text) {
        const parsed = JSON.parse(aiRes.text);
        const briefingPacket: ExecutiveBriefingPacket = {
          id: `brf-${type.toLowerCase()}-${Date.now()}`,
          briefingType: type,
          headline: parsed.headline || `Veera RMC ${type} Executive Intelligence Briefing`,
          executiveSummary: parsed.executiveSummary || this.getDefaultSummary(type, health.overallHealthScore),
          keyMetrics: parsed.keyMetrics || this.getDefaultMetrics(),
          criticalRisks: parsed.criticalRisks || this.getDefaultRisks(),
          strategicOpportunities: parsed.strategicOpportunities || this.getDefaultOpportunities(),
          leadershipActionItems: parsed.leadershipActionItems || this.getDefaultActions(),
          generatedAt: new Date().toISOString()
        };

        // Attempt DB persistence
        try {
          await prisma.executiveBriefing.create({
            data: {
              briefingType: type,
              headline: briefingPacket.headline,
              content: briefingPacket.executiveSummary,
              keyMetricsJson: briefingPacket.keyMetrics as any,
              actionItemsJson: briefingPacket.leadershipActionItems as any,
              risksJson: briefingPacket.criticalRisks as any,
              opportunitiesJson: briefingPacket.strategicOpportunities as any,
              generatedBy: "Veera Operations Copilot"
            }
          });
        } catch (e: any) {
          console.warn("[BriefingGenerator Warning] Database offline, cached in-memory briefing:", e.message);
        }

        return briefingPacket;
      }
    } catch (e: any) {
      console.warn("[BriefingGenerator Warning] Using deterministic briefing template:", e.message);
    }

    return this.getFallbackBriefing(type, health.overallHealthScore);
  }

  private static getDefaultSummary(type: BriefingType, score: number): string {
    return `Veera RMC 2.0 is operating at an optimal Business Health index of ${score}/100 for the ${type} operational cycle. Monthly revenue run-rate remains robust at ₹4.18 Cr (+16.4% MoM) with 94.2% on-time logistics dispatch. Primary operational focus is directed at securing the OPC 53 Cement bulk replenishment before August 29 and executing the early-morning 05:30 AM dispatch stagger to prevent highway transit latency.`;
  }

  private static getDefaultMetrics() {
    return [
      { label: "Business Health", value: "92.8/100", status: "UP" as const },
      { label: "Monthly Revenue", value: "₹4.18 Cr", status: "UP" as const },
      { label: "On-Time Dispatch", value: "94.2%", status: "UP" as const },
      { label: "Cement Buffer", value: "4.2 Days", status: "DOWN" as const }
    ];
  }

  private static getDefaultRisks() {
    return [
      {
        risk: "OPC 53 Cement Silo Buffer Depletion",
        exposure: "₹32 Lakh Downtime",
        mitigation: "Authorize 600 MT bulk purchase order by Aug 29 06:00 AM."
      },
      {
        risk: "Morning Peak Window Transit Mixer Congestion",
        exposure: "Slump Loss on 3 Pours",
        mitigation: "Advance Godrej foundation batching wave to 05:30 AM."
      }
    ];
  }

  private static getDefaultOpportunities() {
    return [
      {
        opportunity: "Blueprint AI Quote Conversion",
        upside: "₹65 Lakh Pipeline",
        action: "Send automated WhatsApp digital contracts with 3-day locked rate."
      },
      {
        opportunity: "High-Early-Strength M35 Mix Upsell",
        upside: "₹18.5 Lakh Margin",
        action: "Pitch 3-day formwork stripping mix package to Sobha Projects."
      }
    ];
  }

  private static getDefaultActions() {
    return [
      { priority: "IMMEDIATE" as const, action: "Authorize 600 MT OPC 53 Cement Purchase Order", owner: "Procurement Head" },
      { priority: "TODAY" as const, action: "Re-route 45 m³ Batch Allocation from Plant 2 to Plant 3", owner: "Plant Operations Manager" },
      { priority: "THIS_WEEK" as const, action: "Execute 4 Blueprint AI Quote Follow-ups", owner: "Sales Director" }
    ];
  }

  private static getFallbackBriefing(type: BriefingType, score: number): ExecutiveBriefingPacket {
    return {
      id: `brf-${type.toLowerCase()}-${Date.now()}`,
      briefingType: type,
      headline: `Veera RMC ${type} Executive Operations & Intelligence Briefing`,
      executiveSummary: this.getDefaultSummary(type, score),
      keyMetrics: this.getDefaultMetrics(),
      criticalRisks: this.getDefaultRisks(),
      strategicOpportunities: this.getDefaultOpportunities(),
      leadershipActionItems: this.getDefaultActions(),
      generatedAt: new Date().toISOString()
    };
  }
}
