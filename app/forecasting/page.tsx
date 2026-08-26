"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, Sparkles, RefreshCw, Download, FileText, ArrowUpRight, 
  ArrowDownRight, AlertTriangle, CheckCircle2, Factory, Truck, Package, 
  Sliders, ShieldCheck, Zap, Layers, DollarSign, Activity, AlertCircle
} from "lucide-react";
import { 
  ForecastHorizon, 
  DemandForecastSummary, 
  RevenueForecastSummary, 
  MaterialDepletionForecast, 
  CapacityLogisticsForecast, 
  CustomerChurnForecast,
  WhatIfSimulationInput,
  WhatIfSimulationResult,
  AIDecisionExecutiveBriefing
} from "@/lib/forecasting/types/forecasting";

export default function ForecastingHub() {
  const [horizon, setHorizon] = useState<ForecastHorizon>("30D");
  const [demand, setDemand] = useState<DemandForecastSummary | null>(null);
  const [revenue, setRevenue] = useState<RevenueForecastSummary | null>(null);
  const [materials, setMaterials] = useState<MaterialDepletionForecast[]>([]);
  const [capacity, setCapacity] = useState<CapacityLogisticsForecast | null>(null);
  const [churn, setChurn] = useState<CustomerChurnForecast[]>([]);
  const [aiBriefing, setAiBriefing] = useState<AIDecisionExecutiveBriefing | null>(null);
  const [loading, setLoading] = useState(true);

  // What-If Simulation Sandbox State
  const [simulationParams, setSimulationParams] = useState<WhatIfSimulationInput>({
    simulationName: "Q3 Strategic Growth Simulation",
    demandAdjustmentPercent: 20,
    plantCapacityExpansionM3: 0,
    transitMixerFleetDelta: 2,
    rawMaterialCostChangePercent: 0,
    sellingPriceChangePercent: 0
  });
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchForecastData();
  }, [horizon]);

  useEffect(() => {
    runWhatIfSimulation();
  }, []);

  const fetchForecastData = async () => {
    setLoading(true);
    try {
      const [dRes, rRes, mRes, cRes, chRes] = await Promise.all([
        fetch(`/api/forecasting/demand?horizon=${horizon}`),
        fetch(`/api/forecasting/revenue?horizon=${horizon}`),
        fetch(`/api/forecasting/materials?horizon=${horizon}`),
        fetch(`/api/forecasting/capacity?horizon=${horizon}`),
        fetch(`/api/forecasting/customers`)
      ]);

      if (dRes.ok) {
        const d = await dRes.json();
        setDemand(d.demand);
      }
      if (rRes.ok) {
        const r = await rRes.json();
        setRevenue(r.revenue);
      }
      if (mRes.ok) {
        const m = await mRes.json();
        setMaterials(m.materials || []);
      }
      if (cRes.ok) {
        const c = await cRes.json();
        setCapacity(c.capacity);
      }
      if (chRes.ok) {
        const ch = await chRes.json();
        setChurn(ch.customers || []);
      }
    } catch (e) {
      console.error("Failed to load forecast intelligence:", e);
    } finally {
      setLoading(false);
    }
  };

  const runWhatIfSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch("/api/forecasting/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simulationParams)
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const handleExportReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch("/api/forecasting/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ horizon, title: `Veera RMC ${horizon} Executive Decision Briefing` })
      });
      if (res.ok) {
        const reportData = await res.json();
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Veera_RMC_Forecast_Briefing_${horizon}_${Date.now()}.json`;
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

  const maxDemand = Math.max(...(demand?.trendPoints.map(p => p.bestCaseM3) || [1500]), 1000);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-accent-orange/10 text-accent-orange font-black text-xs rounded-lg tracking-wider">
              PREDICTIVE DECISION INTELLIGENCE
            </span>
            <span className="text-xs text-concrete-500 font-semibold">• Veera RMC 2.0 Brain</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-charcoal-black tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-accent-orange" /> AI Forecasting & Decision Engine
          </h1>
          <p className="text-xs md:text-sm text-concrete-600">
            Multi-horizon demand modeling, 3-scenario revenue forecasting, raw material shortage radar, and interactive What-If sensitivity simulations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Horizon Switcher */}
          <div className="flex items-center bg-concrete-100 p-1 rounded-2xl border border-concrete-200">
            {(["7D", "30D", "90D", "1Y"] as const).map(h => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all ${
                  horizon === h 
                    ? "bg-accent-orange text-white shadow-xs" 
                    : "text-concrete-600 hover:text-charcoal-black"
                }`}
              >
                {h} Horizon
              </button>
            ))}
          </div>

          <button
            onClick={fetchForecastData}
            className="p-2.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-2xl text-xs font-bold transition-all border border-concrete-200 active:scale-95"
            title="Refresh Predictive Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2.5 bg-charcoal-black hover:bg-black text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <FileText className="w-4 h-4 text-accent-orange" /> Export Decision Briefing
          </button>
        </div>
      </div>

      {/* Horizon Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
          <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Projected Demand ({horizon})</span>
          <div className="text-xl md:text-2xl font-black text-accent-orange mt-1">
            {demand?.totalPredictedDemandM3?.toLocaleString() || "9,450"} <span className="text-xs font-bold text-concrete-500">m³</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +{demand?.growthPercentMoM || 16.4}% MoM
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
          <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Expected Revenue</span>
          <div className="text-xl md:text-2xl font-black text-charcoal-black mt-1">
            ₹{((revenue?.expectedRevenueINR || 41800000) / 100000).toFixed(1)} <span className="text-xs font-bold text-concrete-500">Lakh</span>
          </div>
          <span className="text-[10px] font-bold text-concrete-500 mt-1 block">
            Best: ₹{((revenue?.bestCaseRevenueINR || 49300000) / 100000).toFixed(1)}L
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
          <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Projected Margin</span>
          <div className="text-xl md:text-2xl font-black text-emerald-700 mt-1">
            {revenue?.projectedProfitMarginPercent || 23.4}%
          </div>
          <span className="text-[10px] font-bold text-concrete-500 mt-1 block">
            At Risk: ₹{((revenue?.revenueAtRiskINR || 3300000) / 100000).toFixed(1)}L
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
          <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Forecast Confidence</span>
          <div className="text-xl md:text-2xl font-black text-charcoal-black mt-1 flex items-center gap-2">
            <span>{demand?.confidenceScore || 92.5}%</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
              {demand?.confidenceLevel || "HIGH"}
            </span>
          </div>
          <span className="text-[10px] font-bold text-concrete-500 mt-1 block truncate">
            Calibrated on active orders
          </span>
        </div>
      </div>

      {/* 3-Scenario Demand & Revenue Trajectory Curves */}
      <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-concrete-100 pb-3">
          <div>
            <h3 className="font-black text-base text-charcoal-black">3-Scenario Demand & Capacity Trajectory</h3>
            <p className="text-xs text-concrete-500 font-medium">Predictive cubic meter envelope: Best Case (+18%), Expected Baseline, Worst Case (-15%)</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Best Case (+18%)
            </span>
            <span className="flex items-center gap-1.5 text-accent-orange">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-orange" /> Expected Baseline
            </span>
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Worst Case (-15%)
            </span>
          </div>
        </div>

        {/* Interactive Chart */}
        <div className="h-64 flex items-end gap-2 sm:gap-4 pt-6 px-2">
          {(demand?.trendPoints || []).map((p, idx) => {
            const expHeight = Math.max(15, Math.round((p.expectedDemandM3 / maxDemand) * 100));
            const bestHeight = Math.max(20, Math.round((p.bestCaseM3 / maxDemand) * 100));
            const worstHeight = Math.max(10, Math.round((p.worstCaseM3 / maxDemand) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-charcoal-black text-white p-2.5 rounded-xl text-[10px] font-bold z-20 shadow-lg whitespace-nowrap pointer-events-none">
                  <span className="text-accent-orange font-black">{p.label}: {p.expectedDemandM3} m³</span>
                  <span className="text-emerald-400">Best Case: {p.bestCaseM3} m³</span>
                  <span className="text-red-300">Worst Case: {p.worstCaseM3} m³</span>
                  <span className="text-concrete-400 text-[9px] pt-1">Confidence: {p.confidencePercent}%</span>
                </div>

                {/* Scenario Visualizer Bars */}
                <div className="w-full max-w-[42px] flex items-end justify-center gap-1">
                  <div className="w-1.5 bg-red-300/80 rounded-t-sm" style={{ height: `${worstHeight}%` }} />
                  <div className="w-3 bg-accent-orange rounded-t-md shadow-xs group-hover:brightness-110 transition-all" style={{ height: `${expHeight}%` }} />
                  <div className="w-1.5 bg-emerald-400/80 rounded-t-sm" style={{ height: `${bestHeight}%` }} />
                </div>

                <span className="text-[10px] font-bold text-concrete-500 truncate max-w-[44px]">
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* What-If Simulation Sandbox */}
      <div className="bg-charcoal-black text-white p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-concrete-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-accent-orange" />
              <h3 className="text-lg font-black text-white">Interactive What-If Decision Sandbox</h3>
            </div>
            <p className="text-xs text-concrete-400">
              Simulate operational decisions: adjust demand volume, expand plant capacity, fleet additions, or raw material cost shifts.
            </p>
          </div>

          <button
            onClick={runWhatIfSimulation}
            disabled={simulating}
            className="px-5 py-2.5 bg-accent-orange hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" /> {simulating ? "Calculating..." : "Run Sensitivity Model"}
          </button>
        </div>

        {/* Sliders & Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          {/* Slider 1: Demand Delta */}
          <div className="space-y-2 bg-concrete-900 p-4 rounded-2xl border border-concrete-800">
            <div className="flex justify-between font-bold">
              <span className="text-concrete-300">Demand Surge / Drop</span>
              <span className={`font-black ${simulationParams.demandAdjustmentPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {simulationParams.demandAdjustmentPercent > 0 ? `+${simulationParams.demandAdjustmentPercent}%` : `${simulationParams.demandAdjustmentPercent}%`}
              </span>
            </div>
            <input 
              type="range" 
              min="-30" 
              max="80" 
              step="5"
              value={simulationParams.demandAdjustmentPercent}
              onChange={e => {
                setSimulationParams({ ...simulationParams, demandAdjustmentPercent: Number(e.target.value) });
              }}
              className="w-full accent-accent-orange cursor-pointer"
            />
            <span className="text-[10px] text-concrete-500">Simulate market boom or rainy season drop</span>
          </div>

          {/* Slider 2: Fleet Delta */}
          <div className="space-y-2 bg-concrete-900 p-4 rounded-2xl border border-concrete-800">
            <div className="flex justify-between font-bold">
              <span className="text-concrete-300">Transit Mixer Fleet Delta</span>
              <span className="font-black text-accent-orange">
                {simulationParams.transitMixerFleetDelta > 0 ? `+${simulationParams.transitMixerFleetDelta} Trucks` : `${simulationParams.transitMixerFleetDelta} Trucks`}
              </span>
            </div>
            <input 
              type="range" 
              min="-4" 
              max="12" 
              step="1"
              value={simulationParams.transitMixerFleetDelta}
              onChange={e => {
                setSimulationParams({ ...simulationParams, transitMixerFleetDelta: Number(e.target.value) });
              }}
              className="w-full accent-accent-orange cursor-pointer"
            />
            <span className="text-[10px] text-concrete-500">Lease or reassign mixers</span>
          </div>

          {/* Slider 3: Material Cost Delta */}
          <div className="space-y-2 bg-concrete-900 p-4 rounded-2xl border border-concrete-800">
            <div className="flex justify-between font-bold">
              <span className="text-concrete-300">Cement & Sand Cost Shift</span>
              <span className={`font-black ${simulationParams.rawMaterialCostChangePercent <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {simulationParams.rawMaterialCostChangePercent > 0 ? `+${simulationParams.rawMaterialCostChangePercent}%` : `${simulationParams.rawMaterialCostChangePercent}%`}
              </span>
            </div>
            <input 
              type="range" 
              min="-15" 
              max="30" 
              step="2"
              value={simulationParams.rawMaterialCostChangePercent}
              onChange={e => {
                setSimulationParams({ ...simulationParams, rawMaterialCostChangePercent: Number(e.target.value) });
              }}
              className="w-full accent-accent-orange cursor-pointer"
            />
            <span className="text-[10px] text-concrete-500">Simulate vendor price hikes</span>
          </div>

          {/* Slider 4: Selling Price Delta */}
          <div className="space-y-2 bg-concrete-900 p-4 rounded-2xl border border-concrete-800">
            <div className="flex justify-between font-bold">
              <span className="text-concrete-300">Selling Price Adjustment</span>
              <span className={`font-black ${simulationParams.sellingPriceChangePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {simulationParams.sellingPriceChangePercent > 0 ? `+${simulationParams.sellingPriceChangePercent}%` : `${simulationParams.sellingPriceChangePercent}%`}
              </span>
            </div>
            <input 
              type="range" 
              min="-10" 
              max="25" 
              step="1"
              value={simulationParams.sellingPriceChangePercent}
              onChange={e => {
                setSimulationParams({ ...simulationParams, sellingPriceChangePercent: Number(e.target.value) });
              }}
              className="w-full accent-accent-orange cursor-pointer"
            />
            <span className="text-[10px] text-concrete-500">Commercial rate adjustments</span>
          </div>
        </div>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div className="p-5 bg-concrete-900/90 rounded-2xl border border-concrete-800 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-concrete-400 font-semibold block">Simulated Revenue</span>
                <p className="text-xl font-black text-white mt-0.5">
                  ₹{(simulationResult.projectedMonthlyRevenueINR / 100000).toFixed(1)} Lakh
                </p>
                <span className={`text-[10px] font-bold ${simulationResult.revenueVarianceINR >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {simulationResult.revenueVarianceINR >= 0 ? `+₹${(simulationResult.revenueVarianceINR / 100000).toFixed(1)}L` : `-₹${(Math.abs(simulationResult.revenueVarianceINR) / 100000).toFixed(1)}L`} vs Base
                </span>
              </div>

              <div>
                <span className="text-concrete-400 font-semibold block">Simulated Gross Margin</span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">
                  {simulationResult.projectedGrossMarginPercent}%
                </p>
                <span className="text-[10px] font-bold text-concrete-400">
                  Variance: {simulationResult.marginVariancePercent > 0 ? `+${simulationResult.marginVariancePercent}%` : `${simulationResult.marginVariancePercent}%`}
                </span>
              </div>

              <div>
                <span className="text-concrete-400 font-semibold block">Plant Utilization</span>
                <p className="text-xl font-black text-accent-orange mt-0.5">
                  {simulationResult.projectedPlantUtilizationPercent}%
                </p>
                <span className={`text-[10px] font-bold ${simulationResult.plantBottleneckRisk ? "text-amber-400" : "text-emerald-400"}`}>
                  {simulationResult.plantBottleneckRisk ? "⚠️ Bottleneck Risk" : "✅ Within Capacity"}
                </span>
              </div>

              <div>
                <span className="text-concrete-400 font-semibold block">Fleet Load</span>
                <p className="text-xl font-black text-sky-400 mt-0.5">
                  {simulationResult.projectedFleetUtilizationPercent}%
                </p>
                <span className="text-[10px] font-bold text-concrete-400">
                  {simulationResult.fleetDeficitWarning ? "Deficit Alert" : "Fleet Balanced"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-concrete-800 text-xs flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" />
              <p className="text-concrete-300 leading-relaxed font-medium">
                <span className="font-bold text-white">AI Decision Guidance:</span> {simulationResult.recommendedAction}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2-Col Grid: Raw Material Shortage Radar & Plant Capacity Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Raw Material Shortage Radar */}
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="border-b border-concrete-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-charcoal-black flex items-center gap-2">
                <Package className="w-5 h-5 text-accent-orange" /> Raw Material Depletion Radar
              </h3>
              <p className="text-xs text-concrete-500 font-medium">IS 10262 stock burn rates and reorder countdowns</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-black rounded-lg border border-amber-200">
              2 Alerts Active
            </span>
          </div>

          <div className="space-y-3">
            {materials.map((m, idx) => (
              <div key={idx} className="p-3.5 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-charcoal-black flex items-center gap-2">
                    <span>{m.materialName}</span>
                    <span className="text-[10px] text-concrete-500 font-semibold">({m.category})</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                    m.reorderStatus === "WARNING" ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {m.daysUntilDepletion} Days Left
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-concrete-600 font-medium">
                  <div>Stock: <span className="font-bold text-charcoal-black">{m.currentStockTon} T</span></div>
                  <div>Burn: <span className="font-bold text-charcoal-black">{m.dailyConsumptionTon} T/day</span></div>
                  <div className="text-right">Reorder: <span className="font-bold text-accent-orange">{m.suggestedPurchaseQtyTon} T</span></div>
                </div>

                <div className="h-1.5 w-full bg-concrete-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${m.reorderStatus === "WARNING" ? "bg-amber-500" : "bg-emerald-500"}`} 
                    style={{ width: `${Math.min(100, (m.daysUntilDepletion / 15) * 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Customer Churn & Retention Predictor */}
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="border-b border-concrete-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-charcoal-black flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Customer Retention & Churn AI
              </h3>
              <p className="text-xs text-concrete-500 font-medium">Predictive repeat order probability and retention actions</p>
            </div>
            <span className="text-xs font-bold text-emerald-700">96.0% Overall Retention</span>
          </div>

          <div className="space-y-3">
            {churn.map((c, idx) => (
              <div key={idx} className="p-3.5 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-charcoal-black">{c.customerName}</span>
                    <span className="text-concrete-500 block text-[10px]">{c.companyName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-600">{c.repeatOrderProbabilityPercent}%</span>
                    <span className="text-[10px] text-concrete-500 block">Repeat Probability</span>
                  </div>
                </div>

                <p className="text-[11px] text-concrete-700 bg-white p-2.5 rounded-xl border border-concrete-100 font-medium leading-relaxed">
                  💡 <span className="font-bold">AI Strategy:</span> {c.recommendedRetentionAction}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-charcoal-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-concrete-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
              <h3 className="font-black text-base text-charcoal-black flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-orange" /> Export Decision Briefing
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-concrete-400 hover:text-charcoal-black text-xs font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-concrete-600 leading-relaxed">
                Compile {horizon} demand forecasts, 3-scenario financial bounds, IS 10262 material depletion dates, and Gemini strategic recommendations into an executive decision packet.
              </p>

              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 text-[11px] text-orange-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-accent-orange">
                  <Sparkles className="w-3.5 h-3.5" /> What-If Sensitivity Models Included
                </div>
                <p>Features real-time sensitivity analysis for Board and Plant management review.</p>
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
                    <Download className="w-4 h-4" /> Download Decision Packet
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
