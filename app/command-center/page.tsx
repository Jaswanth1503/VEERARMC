"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldAlert, Sparkles, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, 
  Send, Bot, Factory, Truck, Package, DollarSign, TrendingUp, Layers, 
  Check, X, Play, FileText, Download, ShieldCheck, Activity, Clock, ArrowUpRight, Zap
} from "lucide-react";
import { 
  UnifiedBusinessHealth, 
  CommandCenterAlertItem, 
  AutonomousRecommendationItem, 
  ExecutiveBriefingPacket,
  BriefingType,
  CopilotQueryResponse
} from "@/lib/command-center/types/command-center";

export default function CommandCenterHub() {
  const [health, setHealth] = useState<UnifiedBusinessHealth | null>(null);
  const [alerts, setAlerts] = useState<CommandCenterAlertItem[]>([]);
  const [recommendations, setRecommendations] = useState<AutonomousRecommendationItem[]>([]);
  const [briefing, setBriefing] = useState<ExecutiveBriefingPacket | null>(null);
  const [briefingType, setBriefingType] = useState<BriefingType>("MORNING");
  const [loading, setLoading] = useState(true);
  const [briefingLoading, setBriefingLoading] = useState(false);

  // Copilot State
  const [copilotQuestion, setCopilotQuestion] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState<{ q: string; a: CopilotQueryResponse }[]>([]);

  // Approval Processing
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCommandCenterData();
    fetchBriefing("MORNING");
  }, []);

  const fetchCommandCenterData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/command-center/overview");
      if (res.ok) {
        const data = await res.json();
        setHealth(data.health);
        setAlerts(data.alerts || []);
        setRecommendations(data.recommendations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBriefing = async (type: BriefingType) => {
    setBriefingLoading(true);
    setBriefingType(type);
    try {
      const res = await fetch("/api/command-center/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefingType: type })
      });
      if (res.ok) {
        const data = await res.json();
        setBriefing(data.briefing);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBriefingLoading(false);
    }
  };

  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuestion.trim() || copilotLoading) return;

    const q = copilotQuestion;
    setCopilotQuestion("");
    setCopilotLoading(true);

    try {
      const res = await fetch("/api/command-center/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q })
      });
      if (res.ok) {
        const data = await res.json();
        setCopilotHistory(prev => [{ q, a: data.copilot }, ...prev]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleApprovalAction = async (id: string, action: "APPROVE" | "REJECT" | "EXECUTE") => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/command-center/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: id, action })
      });
      if (res.ok) {
        setRecommendations(prev => prev.map(r => {
          if (r.id === id) {
            return { ...r, status: action === "APPROVE" ? "APPROVED" : action === "EXECUTE" ? "EXECUTED" : "REJECTED" };
          }
          return r;
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleExportBriefing = () => {
    if (!briefing) return;
    const blob = new Blob([JSON.stringify(briefing, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Veera_RMC_${briefingType}_Briefing_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-red-500/10 text-red-600 font-black text-xs rounded-lg tracking-wider">
              ENTERPRISE AI COMMAND CENTER
            </span>
            <span className="text-xs text-concrete-500 font-semibold">• Central Autonomous Brain</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-charcoal-black tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-red-600" /> AI Autonomous Operations Center
          </h1>
          <p className="text-xs md:text-sm text-concrete-600">
            Real-time cross-module telemetry, automated incident root cause analysis, human-in-the-loop workflow approvals, and Operations Copilot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchCommandCenterData}
            className="p-2.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-2xl text-xs font-bold transition-all border border-concrete-200 active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Telemetry
          </button>

          <button
            onClick={handleExportBriefing}
            className="px-4 py-2.5 bg-charcoal-black hover:bg-black text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-accent-orange" /> Export {briefingType} Packet
          </button>
        </div>
      </div>

      {/* Unified Business Health Dial & Key Subsystem Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unified 0-100 Health Dial */}
        <div className="lg:col-span-1 bg-charcoal-black text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-black text-concrete-400 uppercase tracking-widest block">Unified Business Health</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black text-emerald-400">{health?.overallHealthScore || 92.8}</span>
              <span className="text-sm font-bold text-concrete-400">/ 100</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-black">
              <CheckCircle2 className="w-3.5 h-3.5" /> STATUS: {health?.healthStatus || "OPTIMAL"}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-concrete-800 text-xs">
            <div className="flex justify-between text-concrete-300">
              <span>Revenue Run-Rate:</span>
              <span className="font-bold text-white">₹4.18 Cr (+16.4%)</span>
            </div>
            <div className="flex justify-between text-concrete-300">
              <span>Batch Output:</span>
              <span className="font-bold text-white">315 m³/day</span>
            </div>
            <div className="flex justify-between text-concrete-300">
              <span>On-Time Dispatch:</span>
              <span className="font-bold text-emerald-400">94.2%</span>
            </div>
          </div>
        </div>

        {/* 6 Subsystem Radar Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(health?.components || []).map((c, idx) => (
            <div key={idx} className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider">{c.componentName}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-black rounded ${
                    c.status === "HEALTHY" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {c.score}/100
                  </span>
                </div>
                <div className="text-base font-black text-charcoal-black mt-0.5">{c.metricValue}</div>
                <span className="text-[10px] text-concrete-500 font-semibold block">{c.metricLabel}</span>
              </div>

              <div className="mt-3 pt-2 border-t border-concrete-100 flex items-center justify-between text-[10px] font-bold">
                <span className={c.trendPercent >= 0 ? "text-emerald-600" : "text-amber-600"}>
                  {c.trendPercent > 0 ? `+${c.trendPercent}%` : `${c.trendPercent}%`} vs Last Period
                </span>
                <div className="w-12 h-1.5 bg-concrete-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${c.status === "HEALTHY" ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Veera Operations Copilot Interactive Assistant */}
      <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-accent-orange/10 flex items-center justify-center text-accent-orange">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-charcoal-black">Veera Operations Copilot</h3>
              <p className="text-xs text-concrete-500 font-medium">Ask natural language questions regarding delays, plant bottlenecks, or strategic decisions</p>
            </div>
          </div>

          {/* Quick Query Pills */}
          <div className="hidden md:flex items-center gap-2">
            {[
              "Why are deliveries delayed?",
              "Which plant is overloaded?",
              "What should management focus on today?"
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setCopilotQuestion(q);
                }}
                className="px-2.5 py-1 bg-concrete-100 hover:bg-concrete-200 text-concrete-700 text-[10px] font-bold rounded-lg transition-all"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Question Input Form */}
        <form onSubmit={handleCopilotSubmit} className="flex gap-2">
          <input
            type="text"
            value={copilotQuestion}
            onChange={e => setCopilotQuestion(e.target.value)}
            placeholder="Ask Copilot (e.g. 'What will happen if demand increases by 20%?' or 'Check cement stock status')..."
            className="flex-1 bg-concrete-50 border border-concrete-200 rounded-2xl px-4 py-3 text-xs font-semibold text-charcoal-black focus:outline-none focus:border-accent-orange transition-all"
          />
          <button
            type="submit"
            disabled={copilotLoading || !copilotQuestion.trim()}
            className="px-5 py-3 bg-accent-orange hover:bg-orange-600 text-white font-black text-xs rounded-2xl shadow-md flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
          >
            {copilotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Ask Copilot</span>
          </button>
        </form>

        {/* Copilot Answers Stream */}
        {copilotHistory.length > 0 && (
          <div className="space-y-3 pt-2">
            {copilotHistory.map((item, idx) => (
              <div key={idx} className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-charcoal-black flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent-orange" /> Q: "{item.q}"
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                    {item.a.confidenceScore}% Confidence
                  </span>
                </div>

                <div className="text-xs font-bold text-concrete-900 bg-white p-3 rounded-xl border border-orange-200/60">
                  {item.a.directAnswerSummary}
                </div>

                <p className="text-xs text-concrete-700 leading-relaxed font-medium">
                  {item.a.answer}
                </p>

                {/* Supporting metrics & Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-orange-100 space-y-1">
                    <span className="text-[10px] font-black text-concrete-400 uppercase tracking-wider block">Telemetry Backing</span>
                    {item.a.supportingData.map((sd, sidx) => (
                      <div key={sidx} className="flex justify-between text-[11px]">
                        <span className="text-concrete-600">{sd.metric}:</span>
                        <span className="font-bold text-charcoal-black">{sd.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-orange-100 space-y-1">
                    <span className="text-[10px] font-black text-concrete-400 uppercase tracking-wider block">Recommended Actions</span>
                    {item.a.recommendedActions.map((ra, raidx) => (
                      <div key={raidx} className="text-[11px] text-accent-orange font-bold flex items-start gap-1">
                        <span>•</span> <span>{ra}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-Col: Live AI Alerts & Autonomous Workflow Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Col 1: Real-Time Alerts & Root Cause Analysis */}
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
            <div>
              <h3 className="font-black text-base text-charcoal-black flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Active Incident & Root Cause Deck
              </h3>
              <p className="text-xs text-concrete-500 font-medium">Correlated multi-module incident detection</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[10px] font-black rounded-lg">
              {alerts.length} Active Alerts
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((a, idx) => (
              <div key={idx} className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${
                      a.severity === "CRITICAL" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {a.category} • {a.severity}
                    </span>
                    <h4 className="font-bold text-xs text-charcoal-black mt-1">{a.title}</h4>
                  </div>
                </div>

                <p className="text-xs text-concrete-600 leading-relaxed font-medium">
                  {a.description}
                </p>

                {a.rootCause && (
                  <div className="bg-white p-3 rounded-xl border border-concrete-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-concrete-500">
                      <span>ROOT CAUSE: {a.rootCause.likelyRootCause}</span>
                      <span className="text-red-600 font-extrabold">Exp: ₹{(a.rootCause.businessExposureINR / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700">
                      💡 Suggested Fix: {a.rootCause.suggestedResolution}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Autonomous Workflow Recommendations (Human-in-the-Loop) */}
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
            <div>
              <h3 className="font-black text-base text-charcoal-black flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent-orange" /> Autonomous Workflow Approvals
              </h3>
              <p className="text-xs text-concrete-500 font-medium">Human-in-the-loop action authorization</p>
            </div>
            <span className="px-2.5 py-1 bg-accent-orange/10 text-accent-orange text-[10px] font-black rounded-lg">
              Strict Human Approval Required
            </span>
          </div>

          <div className="space-y-3">
            {recommendations.map((r) => (
              <div key={r.id} className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 bg-concrete-200 text-charcoal-black font-black text-[9px] rounded uppercase">
                    {r.domain}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                    r.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                    r.status === "EXECUTED" ? "bg-sky-100 text-sky-800" :
                    r.status === "REJECTED" ? "bg-red-100 text-red-800" :
                    "bg-amber-100 text-amber-800"
                  }`}>
                    {r.status.replace("_", " ")}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-charcoal-black">{r.title}</h4>
                  <p className="text-xs text-concrete-600 mt-1 leading-relaxed font-medium">{r.reason}</p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-concrete-100 text-[11px] space-y-1">
                  <div className="text-emerald-700 font-bold">✨ Impact: {r.expectedImpact}</div>
                  <div className="text-concrete-700 font-semibold">⚡ Action: {r.requiredAction}</div>
                </div>

                {/* Approval Control Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {r.status === "PENDING_APPROVAL" && (
                    <>
                      <button
                        onClick={() => handleApprovalAction(r.id, "REJECT")}
                        disabled={processingId === r.id}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleApprovalAction(r.id, "APPROVE")}
                        disabled={processingId === r.id}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Check className="w-3.5 h-3.5" /> Authorize & Queue
                      </button>
                    </>
                  )}

                  {r.status === "APPROVED" && (
                    <button
                      onClick={() => handleApprovalAction(r.id, "EXECUTE")}
                      disabled={processingId === r.id}
                      className="px-4 py-1.5 bg-accent-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5" /> Execute Workflow Now
                    </button>
                  )}

                  {r.status === "EXECUTED" && (
                    <span className="text-xs font-bold text-sky-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Workflow Completed Autonomously
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Executive Briefing Viewer */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-concrete-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-concrete-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-charcoal-black flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-orange" /> Automated Executive Operational Briefings
            </h3>
            <p className="text-xs text-concrete-500 font-medium">Board and C-Suite scheduled operational synthesized summaries</p>
          </div>

          {/* Briefing Switcher */}
          <div className="flex items-center bg-concrete-100 p-1 rounded-2xl border border-concrete-200">
            {(["MORNING", "AFTERNOON", "EOD", "WEEKLY"] as const).map(b => (
              <button
                key={b}
                onClick={() => fetchBriefing(b)}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${
                  briefingType === b
                    ? "bg-accent-orange text-white shadow-xs"
                    : "text-concrete-600 hover:text-charcoal-black"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {briefingLoading ? (
          <div className="py-12 flex items-center justify-center text-concrete-400 gap-2 text-xs font-bold">
            <RefreshCw className="w-4 h-4 animate-spin text-accent-orange" /> Generating {briefingType} Operational Briefing...
          </div>
        ) : briefing && (
          <div className="space-y-6">
            <div>
              <h4 className="text-base md:text-xl font-black text-charcoal-black">{briefing.headline}</h4>
              <p className="text-xs md:text-sm text-concrete-700 mt-2 leading-relaxed font-medium">
                {briefing.executiveSummary}
              </p>
            </div>

            {/* 3-Col Key Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Critical Risks */}
              <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100 space-y-2">
                <span className="text-[10px] font-black text-red-800 uppercase tracking-wider block">Critical Risks & Mitigation</span>
                {briefing.criticalRisks.map((cr, i) => (
                  <div key={i} className="space-y-0.5 border-b border-red-100 pb-2 last:border-0">
                    <p className="font-bold text-red-950">{cr.risk}</p>
                    <p className="text-[11px] text-red-800 font-medium">Fix: {cr.mitigation}</p>
                  </div>
                ))}
              </div>

              {/* Strategic Opportunities */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">Strategic Opportunities</span>
                {briefing.strategicOpportunities.map((so, i) => (
                  <div key={i} className="space-y-0.5 border-b border-emerald-100 pb-2 last:border-0">
                    <p className="font-bold text-emerald-950">{so.opportunity} ({so.upside})</p>
                    <p className="text-[11px] text-emerald-800 font-medium">Action: {so.action}</p>
                  </div>
                ))}
              </div>

              {/* Leadership Action Items */}
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100 space-y-2">
                <span className="text-[10px] font-black text-orange-900 uppercase tracking-wider block">Leadership Action Items</span>
                {briefing.leadershipActionItems.map((la, i) => (
                  <div key={i} className="space-y-0.5 border-b border-orange-100 pb-2 last:border-0">
                    <p className="font-bold text-charcoal-black">{la.action}</p>
                    <p className="text-[11px] text-accent-orange font-extrabold">Owner: {la.owner} [{la.priority}]</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
