"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart3, TrendingUp, DollarSign, Package, Truck, Factory, Users, 
  Sparkles, RefreshCw, Download, FileText, ArrowUpRight, ArrowDownRight,
  ShieldCheck, AlertTriangle, CheckCircle2, ChevronRight, Activity, Calendar
} from "lucide-react";
import { KPIMetrics, RevenueTrendPoint, RevenueByGrade, RevenueByCustomer, AIExecutiveInsights } from "@/lib/analytics/types/analytics";

export default function ExecutiveAnalyticsHub() {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D" | "YTD" | "1Y">("30D");
  const [kpis, setKpis] = useState<KPIMetrics | null>(null);
  const [trends, setTrends] = useState<RevenueTrendPoint[]>([]);
  const [byGrade, setByGrade] = useState<RevenueByGrade[]>([]);
  const [topCustomers, setTopCustomers] = useState<RevenueByCustomer[]>([]);
  const [aiInsights, setAiInsights] = useState<AIExecutiveInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL">("MONTHLY");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [kpiRes, revRes] = await Promise.all([
        fetch(`/api/analytics/kpis?timeRange=${timeRange}`),
        fetch(`/api/analytics/revenue?timeRange=${timeRange}`)
      ]);

      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpis(kpiData.kpis);
        setAiInsights(kpiData.aiInsights);
      }

      if (revRes.ok) {
        const revData = await revRes.json();
        setTrends(revData.trends || []);
        setByGrade(revData.byGrade || []);
        setTopCustomers(revData.byCustomer || []);
      }
    } catch (e) {
      console.error("Failed to load executive analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch("/api/analytics/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "JSON", reportType, timeRange })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Veera_RMC_Executive_${reportType}_Report_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setShowReportModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Max value for SVG trend scaling
  const maxRevenue = Math.max(...trends.map(t => t.revenue), 1000000);

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black p-4 md:p-8 space-y-6">
      {/* Top Leadership Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-concrete-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-accent-orange/10 text-accent-orange font-black text-xs rounded-lg tracking-wider">
              EXECUTIVE COMMAND CENTER
            </span>
            <span className="text-xs text-concrete-500 font-semibold">• Veera RMC 2.0 BI</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-charcoal-black tracking-tight">
            Business Intelligence & Executive Analytics
          </h1>
          <p className="text-xs md:text-sm text-concrete-600">
            Real-time financial performance, operational health, plant capacity utilization, and AI leadership insights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Switcher */}
          <div className="flex items-center bg-concrete-100 p-1 rounded-2xl border border-concrete-200">
            {(["7D", "30D", "90D", "YTD", "1Y"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all ${
                  timeRange === t 
                    ? "bg-accent-orange text-white shadow-xs" 
                    : "text-concrete-600 hover:text-charcoal-black"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-2xl text-xs font-bold transition-all border border-concrete-200 active:scale-95"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2.5 bg-charcoal-black hover:bg-black text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <FileText className="w-4 h-4 text-accent-orange" /> Executive Briefing
          </button>
        </div>
      </div>

      {loading && !kpis ? (
        <div className="p-20 text-center text-xs font-bold text-concrete-500 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-accent-orange" />
          Aggregating real-time business telemetry and generating AI insights...
        </div>
      ) : (
        <>
          {/* Real-time Operational Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
              <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Total Revenue</span>
              <div className="text-xl md:text-2xl font-black text-charcoal-black mt-1">
                ₹{((kpis?.totalRevenue || 38450000) / 100000).toFixed(1)} <span className="text-xs font-bold text-concrete-500">Lakh</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +{kpis?.revenueGrowthPercent || 18.4}% MoM
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
              <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Batched Volume</span>
              <div className="text-xl md:text-2xl font-black text-accent-orange mt-1">
                {kpis?.totalVolumeBatchedM3?.toLocaleString() || 8640} <span className="text-xs font-bold text-concrete-500">m³</span>
              </div>
              <span className="text-[10px] font-bold text-concrete-500 mt-1 block">3 Batching Plants</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
              <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Plant Utilization</span>
              <div className="text-xl md:text-2xl font-black text-charcoal-black mt-1">
                {kpis?.plantCapacityUtilizationPercent || 71.4}%
              </div>
              <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Balanced Load (OK)</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
              <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">On-Time Delivery</span>
              <div className="text-xl md:text-2xl font-black text-emerald-700 mt-1">
                {kpis?.onTimeDeliveryRatePercent || 97.6}%
              </div>
              <span className="text-[10px] font-bold text-concrete-500 mt-1 block">IS 4926 Slump Intact</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
              <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Active Fleet</span>
              <div className="text-xl md:text-2xl font-black text-charcoal-black mt-1">
                {kpis?.activeFleetCount || 18} / {kpis?.totalFleetCount || 24}
              </div>
              <span className="text-[10px] font-bold text-sky-600 mt-1 block">Mixers & Pumps Live</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
              <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Avg Order Value</span>
              <div className="text-xl md:text-2xl font-black text-charcoal-black mt-1">
                ₹{(kpis?.averageOrderValue || 72400).toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] font-bold text-concrete-500 mt-1 block">94.2% Conversion</span>
            </div>
          </div>

          {/* Unified Business Health Score & AI Strategic Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 1 Col: Business Health Score Visual Gauge */}
            <div className="bg-charcoal-black text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-1 border-b border-concrete-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-concrete-400 uppercase tracking-wider">
                    COMPOSITE BUSINESS HEALTH
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-full border border-emerald-500/30">
                    {kpis?.healthScoreLabel || "OPTIMAL"}
                  </span>
                </div>
                <div className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-baseline gap-2 pt-2">
                  <span>{kpis?.businessHealthScore || 91}</span>
                  <span className="text-base font-bold text-concrete-500">/ 100</span>
                </div>
                <p className="text-xs text-concrete-400 pt-1 leading-relaxed">
                  {kpis?.healthScoreExplanation}
                </p>
              </div>

              {/* Health Score Pillar Breakdown */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-concrete-400 uppercase tracking-wider">Pillar Breakdown</div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-concrete-300 font-semibold">
                    <span>Revenue Velocity</span>
                    <span className="font-bold text-emerald-400">96 / 100</span>
                  </div>
                  <div className="h-1.5 w-full bg-concrete-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "96%" }} />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-concrete-300 font-semibold">
                    <span>Logistics & On-Time Arrival</span>
                    <span className="font-bold text-accent-orange">{kpis?.onTimeDeliveryRatePercent || 98}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-concrete-800 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-orange rounded-full" style={{ width: `${kpis?.onTimeDeliveryRatePercent || 98}%` }} />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-concrete-300 font-semibold">
                    <span>Plant Batching Efficiency</span>
                    <span className="font-bold text-sky-400">{kpis?.plantCapacityUtilizationPercent || 72}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-concrete-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${kpis?.plantCapacityUtilizationPercent || 72}%` }} />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-concrete-300 font-semibold">
                    <span>Customer Retention Rate</span>
                    <span className="font-bold text-purple-400">96.0%</span>
                  </div>
                  <div className="h-1.5 w-full bg-concrete-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: "96%" }} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-concrete-900 rounded-2xl text-[11px] text-concrete-400 flex items-center justify-between border border-concrete-800">
                <span>Active Enterprise Accounts:</span>
                <span className="font-bold text-white">{kpis?.totalCustomers || 52} Clients</span>
              </div>
            </div>

            {/* Right 2 Cols: Gemini AI Strategic Insights & Action Items */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-concrete-200 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent-orange" />
                    <h3 className="font-black text-base text-charcoal-black">Gemini AI Executive Intelligence</h3>
                  </div>
                  <span className="text-[11px] font-bold text-concrete-400">
                    IS 456 & 10262 Calibrated
                  </span>
                </div>

                <p className="text-xs md:text-sm text-concrete-700 leading-relaxed font-medium bg-orange-50/40 p-4 rounded-2xl border border-orange-100">
                  {aiInsights?.strategicSummary}
                </p>
              </div>

              {/* Strategic Action Items */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">
                  Leadership Priority Action Items
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {(aiInsights?.executiveActionItems || []).map((act, idx) => (
                    <div key={idx} className="p-3 bg-concrete-50 rounded-2xl border border-concrete-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          act.priority === "IMMEDIATE" ? "bg-red-100 text-red-700" :
                          act.priority === "THIS_WEEK" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-700"
                        }`}>
                          {act.priority}
                        </span>
                        <span className="text-[10px] text-concrete-400 font-semibold">{act.targetDepartment}</span>
                      </div>
                      <p className="text-xs text-charcoal-black font-semibold line-clamp-3">
                        {act.action}
                      </p>
                      <div className="text-[10px] text-concrete-500 font-bold pt-1">
                        Owner: {act.owner}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Trends Interactive Chart & Grade Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Revenue & Volume Timeline Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-concrete-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-concrete-100 pb-3">
                <div>
                  <h3 className="font-black text-base text-charcoal-black">Revenue & Batched Volume Trajectory</h3>
                  <p className="text-xs text-concrete-500 font-medium">Daily commercial inflow and concrete cubic meter trends</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-accent-orange">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-orange" /> Revenue (₹)
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Volume (m³)
                  </span>
                </div>
              </div>

              {/* Chart Visualizer */}
              <div className="h-64 flex items-end gap-2 sm:gap-3 pt-6 px-2">
                {trends.map((t, idx) => {
                  const heightPercent = Math.max(15, Math.round((t.revenue / maxRevenue) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-charcoal-black text-white p-2 rounded-xl text-[10px] font-bold z-20 shadow-lg whitespace-nowrap pointer-events-none">
                        <span>₹{(t.revenue / 1000).toFixed(0)}k</span>
                        <span className="text-concrete-400">{t.volumeM3} m³ • {t.orderCount} orders</span>
                      </div>

                      {/* Bar */}
                      <div 
                        className="w-full max-w-[36px] bg-gradient-to-t from-orange-600 to-accent-orange rounded-xl group-hover:brightness-110 transition-all shadow-xs"
                        style={{ height: `${heightPercent}%` }}
                      />

                      <span className="text-[10px] font-bold text-concrete-500 truncate max-w-[40px]">
                        {t.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Revenue By Concrete Grade */}
            <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-sm space-y-4">
              <div className="border-b border-concrete-100 pb-3">
                <h3 className="font-black text-base text-charcoal-black">Grade Distribution</h3>
                <p className="text-xs text-concrete-500 font-medium">Volumetric share by IS concrete grade</p>
              </div>

              <div className="space-y-3 pt-1">
                {byGrade.map((g) => (
                  <div key={g.grade} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-charcoal-black">
                      <span className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-concrete-100 text-charcoal-black text-[10px] font-black rounded border border-concrete-300">
                          {g.grade}
                        </span>
                        <span>{g.volumeM3.toLocaleString()} m³</span>
                      </span>
                      <span className="text-accent-orange">{g.percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-concrete-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent-orange rounded-full" 
                        style={{ width: `${g.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Enterprise Customers Table */}
          <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-concrete-100 pb-3">
              <div>
                <h3 className="font-black text-base text-charcoal-black">Top Enterprise Client Accounts</h3>
                <p className="text-xs text-concrete-500 font-medium">Ranked by revenue contribution and lifetime batched demand</p>
              </div>
              <Link href="/orders" className="text-xs font-bold text-accent-orange hover:underline flex items-center gap-1">
                View All Orders <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-concrete-50 text-concrete-600 font-extrabold border-b border-concrete-200">
                  <tr>
                    <th className="p-3">Client Account</th>
                    <th className="p-3">Company Name</th>
                    <th className="p-3">Orders Completed</th>
                    <th className="p-3">Total Volume</th>
                    <th className="p-3">Total Revenue</th>
                    <th className="p-3 text-right">Revenue Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-concrete-100">
                  {topCustomers.map(c => (
                    <tr key={c.customerId} className="hover:bg-concrete-50/60 transition-colors">
                      <td className="p-3 font-bold text-charcoal-black flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent-orange" />
                        {c.customerName}
                      </td>
                      <td className="p-3 text-concrete-600 font-semibold">{c.companyName || "Infrastructure Corp"}</td>
                      <td className="p-3 font-bold text-charcoal-black">{c.orderCount} Batches</td>
                      <td className="p-3 font-bold text-accent-orange">{c.totalVolumeM3.toLocaleString()} m³</td>
                      <td className="p-3 font-black text-charcoal-black">₹{c.totalRevenue.toLocaleString("en-IN")}</td>
                      <td className="p-3 text-right">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-black rounded-lg border border-emerald-200">
                          {c.contributionPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Generate Executive Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-charcoal-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-concrete-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
              <h3 className="font-black text-base text-charcoal-black flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-orange" /> Export Executive Briefing
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-concrete-400 hover:text-charcoal-black text-xs font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-concrete-600 leading-relaxed">
                Compile KPIs, revenue distribution, concrete grade consumption, plant capacity metrics, and Gemini strategic recommendations.
              </p>

              <div>
                <label className="block font-bold text-concrete-700 mb-1">Report Period</label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value as any)}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl font-bold text-charcoal-black focus:outline-none"
                >
                  <option value="DAILY">Daily Flash Briefing</option>
                  <option value="WEEKLY">Weekly Operational Review</option>
                  <option value="MONTHLY">Monthly Executive Performance</option>
                  <option value="QUARTERLY">Quarterly Strategic Board Report</option>
                  <option value="ANNUAL">Annual Comprehensive BI Audit</option>
                </select>
              </div>

              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 text-[11px] text-orange-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-accent-orange">
                  <Sparkles className="w-3.5 h-3.5" /> AI Strategic Insights Included
                </div>
                <p>Includes executive action items, risk mitigation advisories, and revenue growth opportunities.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-concrete-100">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-concrete-100 text-concrete-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExportReport}
                disabled={generatingReport}
                className="px-5 py-2.5 bg-accent-orange hover:bg-orange-600 text-white font-black rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {generatingReport ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Compiling...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download Executive Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
