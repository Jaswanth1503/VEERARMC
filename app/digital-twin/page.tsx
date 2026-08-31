"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Cpu, Sparkles, RefreshCw, Play, Sliders, TrendingUp, Layers, 
  Factory, Truck, Package, ShieldCheck, Download, AlertTriangle, 
  CheckCircle2, DollarSign, Activity, Check, ArrowUpRight, ArrowDownRight, Flame,
  FileText, BarChart3, Clock, Compass, ShieldAlert, Target, Zap
} from "lucide-react";
import { 
  DigitalTwinBaseline, 
  ScenarioParameters, 
  SimulationResultMetrics, 
  EnterpriseHeatmap, 
  SelfOptimizationSuggestion,
  StrategicBriefingReport
} from "@/lib/digital-twin/types/digital-twin";

export default function DigitalTwinHub() {
  const [baseline, setBaseline] = useState<DigitalTwinBaseline | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioParameters[]>([]);
  const [selectedScenarioCode, setSelectedScenarioCode] = useState<string>("SCENARIO_A");
  
  // Custom Slider Parameters
  const [customParams, setCustomParams] = useState<ScenarioParameters>({
    scenarioName: "Scenario A: Moderate Demand Surge (+20%)",
    demandDeltaPercent: 20,
    plantCapacityExpansionM3: 0,
    transitMixerFleetDelta: 0,
    materialCostDeltaPercent: 0,
    sellingPriceDeltaPercent: 0,
    customerLossPercent: 0
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResultMetrics | null>(null);
  const [optimizations, setOptimizations] = useState<SelfOptimizationSuggestion[]>([]);
  const [heatmaps, setHeatmaps] = useState<Record<string, EnterpriseHeatmap>>({});
  const [activeHeatmapTab, setActiveHeatmapTab] = useState<"CAPACITY" | "DEMAND" | "REVENUE" | "RISK" | "OPERATIONAL">("CAPACITY");

  // Strategic Briefing State
  const [activeBriefingType, setActiveBriefingType] = useState<"GROWTH" | "RISK" | "EXPANSION" | "OPTIMIZATION">("GROWTH");
  const [strategicBriefing, setStrategicBriefing] = useState<StrategicBriefingReport | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  const [simulating, setSimulating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adoptingId, setAdoptingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialTwinData();
    fetchBriefing("GROWTH");
  }, []);

  const fetchInitialTwinData = async () => {
    setLoading(true);
    try {
      const [scenRes, optRes, hmRes] = await Promise.all([
        fetch("/api/digital-twin/scenarios"),
        fetch("/api/digital-twin/optimization"),
        fetch("/api/digital-twin/heatmaps")
      ]);

      if (scenRes.ok) {
        const d = await scenRes.json();
        setBaseline(d.baseline);
        setScenarios(d.scenarios || []);
        if (d.scenarios?.length > 0) {
          setCustomParams(d.scenarios[0]);
          runSimulation(d.scenarios[0]);
        }
      }
      if (optRes.ok) {
        const o = await optRes.json();
        setOptimizations(o.suggestions || []);
      }
      if (hmRes.ok) {
        const hm = await hmRes.json();
        setHeatmaps(hm.heatmaps || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBriefing = async (type: "GROWTH" | "RISK" | "EXPANSION" | "OPTIMIZATION") => {
    setLoadingBriefing(true);
    setActiveBriefingType(type);
    try {
      const res = await fetch(`/api/digital-twin/briefing?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setStrategicBriefing(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBriefing(false);
    }
  };

  const runSimulation = async (paramsToRun?: ScenarioParameters) => {
    setSimulating(true);
    const body = paramsToRun || customParams;
    try {
      const res = await fetch("/api/digital-twin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
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

  const handleSelectPreset = (scen: ScenarioParameters) => {
    setSelectedScenarioCode(scen.scenarioCode || "CUSTOM");
    setCustomParams(scen);
    runSimulation(scen);
  };

  const handleAdoptOptimization = async (id: string) => {
    setAdoptingId(id);
    try {
      const res = await fetch("/api/digital-twin/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: id, action: "ADOPT" })
      });
      if (res.ok) {
        setOptimizations(prev => prev.map(o => o.id === id ? { ...o, status: "ADOPTED" } : o));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdoptingId(null);
    }
  };

  const handleExportReport = () => {
    if (!simulationResult) return;
    const packet = {
      baseline,
      simulationResult,
      optimizations,
      strategicBriefing,
      heatmaps,
      generatedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Veera_Digital_Twin_Dossier_${simulationResult.scenarioName.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.json`;
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
            <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 font-black text-xs rounded-lg tracking-wider">
              DIGITAL TWIN & SIMULATION PLATFORM
            </span>
            <span className="text-xs text-concrete-500 font-semibold">• Virtual Enterprise Sandbox</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-charcoal-black tracking-tight flex items-center gap-2">
            <Cpu className="w-7 h-7 text-purple-600" /> Digital Twin Scenario Lab
          </h1>
          <p className="text-xs md:text-sm text-concrete-600">
            Simulate demand surges, plant commissioning, fleet expansions, and raw material inflation virtually before committing capital in the real world.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => runSimulation()}
            disabled={simulating}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-2xl shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Run Virtual Simulation</span>
          </button>

          <button
            onClick={handleExportReport}
            className="px-4 py-2.5 bg-charcoal-black hover:bg-black text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-accent-orange" /> Export Twin Dossier
          </button>
        </div>
      </div>

      {/* Real vs Virtual Twin Mirror Status Bar */}
      <div className="bg-charcoal-black text-white p-5 md:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-concrete-400 font-bold uppercase tracking-wider">Live Twin Baseline State</div>
            <div className="text-sm md:text-base font-black text-white">
              ₹4.18 Cr/mo Revenue • 9,450 m³ Volume • 3 Plants (1,200 m³/day) • 24 Transit Mixers
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized with Live Telemetry
          </span>
        </div>
      </div>

      {/* Scenario Lab: Preset Scenario Pills */}
      <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
          <div>
            <h3 className="font-black text-base text-charcoal-black flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-600" /> Executive Scenario Lab
            </h3>
            <p className="text-xs text-concrete-500 font-medium">Select a preset executive shock test or calibrate custom sensitivity parameters</p>
          </div>
          <span className="text-xs font-bold text-concrete-400">6 Strategy Presets</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {scenarios.map((scen, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(scen)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedScenarioCode === scen.scenarioCode
                  ? "bg-purple-50 border-purple-500 shadow-xs"
                  : "bg-concrete-50 border-concrete-200 hover:border-concrete-300"
              }`}
            >
              <span className="text-[10px] font-black text-purple-700 uppercase block">{scen.scenarioCode?.replace("_", " ")}</span>
              <p className="text-xs font-bold text-charcoal-black mt-1 leading-tight">{scen.scenarioName.split(":")[1] || scen.scenarioName}</p>
              <span className="text-[9px] text-concrete-500 font-semibold mt-2 block">
                {scen.demandDeltaPercent !== 0 ? `Demand: ${scen.demandDeltaPercent > 0 ? "+" : ""}${scen.demandDeltaPercent}%` : "Baseline"}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Sensitivity Sliders Sandbox */}
        <div className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-4">
          <div className="text-xs font-black text-charcoal-black uppercase tracking-wider">
            Calibrate Custom Sensitivity Variables:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-bold">
            {/* Slider 1: Demand */}
            <div className="bg-white p-3 rounded-xl border border-concrete-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-concrete-600">Demand Delta:</span>
                <span className={customParams.demandDeltaPercent >= 0 ? "text-emerald-600 font-black" : "text-red-600 font-black"}>
                  {customParams.demandDeltaPercent > 0 ? `+${customParams.demandDeltaPercent}%` : `${customParams.demandDeltaPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="80"
                step="5"
                value={customParams.demandDeltaPercent}
                onChange={e => {
                  const val = Number(e.target.value);
                  setSelectedScenarioCode("CUSTOM");
                  setCustomParams({ ...customParams, scenarioName: "Custom Strategy Simulation", demandDeltaPercent: val });
                }}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Slider 2: Plant Expansion */}
            <div className="bg-white p-3 rounded-xl border border-concrete-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-concrete-600">Plant Expansion:</span>
                <span className="text-purple-600 font-black">+{customParams.plantCapacityExpansionM3} m³</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="100"
                value={customParams.plantCapacityExpansionM3}
                onChange={e => {
                  const val = Number(e.target.value);
                  setSelectedScenarioCode("CUSTOM");
                  setCustomParams({ ...customParams, scenarioName: "Custom Strategy Simulation", plantCapacityExpansionM3: val });
                }}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Slider 3: Fleet Delta */}
            <div className="bg-white p-3 rounded-xl border border-concrete-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-concrete-600">Mixer Fleet Delta:</span>
                <span className="text-accent-orange font-black">
                  {customParams.transitMixerFleetDelta > 0 ? `+${customParams.transitMixerFleetDelta}` : `${customParams.transitMixerFleetDelta}`} Mixers
                </span>
              </div>
              <input
                type="range"
                min="-6"
                max="15"
                step="1"
                value={customParams.transitMixerFleetDelta}
                onChange={e => {
                  const val = Number(e.target.value);
                  setSelectedScenarioCode("CUSTOM");
                  setCustomParams({ ...customParams, scenarioName: "Custom Strategy Simulation", transitMixerFleetDelta: val });
                }}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Slider 4: Material Cost Delta */}
            <div className="bg-white p-3 rounded-xl border border-concrete-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-concrete-600">Material Inflation:</span>
                <span className={customParams.materialCostDeltaPercent <= 0 ? "text-emerald-600 font-black" : "text-amber-600 font-black"}>
                  {customParams.materialCostDeltaPercent > 0 ? `+${customParams.materialCostDeltaPercent}%` : `${customParams.materialCostDeltaPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="30"
                step="2"
                value={customParams.materialCostDeltaPercent}
                onChange={e => {
                  const val = Number(e.target.value);
                  setSelectedScenarioCode("CUSTOM");
                  setCustomParams({ ...customParams, scenarioName: "Custom Strategy Simulation", materialCostDeltaPercent: val });
                }}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Slider 5: Customer Loss */}
            <div className="bg-white p-3 rounded-xl border border-concrete-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-concrete-600">Customer Churn:</span>
                <span className={customParams.customerLossPercent === 0 ? "text-concrete-600 font-black" : "text-red-600 font-black"}>
                  {customParams.customerLossPercent}% Churn
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={customParams.customerLossPercent}
                onChange={e => {
                  const val = Number(e.target.value);
                  setSelectedScenarioCode("CUSTOM");
                  setCustomParams({ ...customParams, scenarioName: "Custom Strategy Simulation", customerLossPercent: val });
                }}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Results Strip */}
      {simulationResult && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Simulated Revenue</span>
            <div className="text-lg md:text-xl font-black text-charcoal-black mt-1">
              ₹{(simulationResult.projectedMonthlyRevenueINR / 100000).toFixed(1)} <span className="text-xs font-bold text-concrete-500">L</span>
            </div>
            <span className={`text-[10px] font-bold ${simulationResult.revenueGrowthPercent >= 0 ? "text-emerald-600" : "text-red-600"} flex items-center gap-0.5 mt-1`}>
              {simulationResult.revenueGrowthPercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {simulationResult.revenueGrowthPercent > 0 ? `+${simulationResult.revenueGrowthPercent}%` : `${simulationResult.revenueGrowthPercent}%`}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Simulated Margin</span>
            <div className="text-lg md:text-xl font-black text-emerald-700 mt-1">
              {simulationResult.projectedGrossMarginPercent}%
            </div>
            <span className="text-[10px] font-bold text-concrete-500 mt-1 block">
              Var: {simulationResult.marginDeltaPercent > 0 ? `+${simulationResult.marginDeltaPercent}%` : `${simulationResult.marginDeltaPercent}%`}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Projected Volume</span>
            <div className="text-lg md:text-xl font-black text-purple-700 mt-1">
              {simulationResult.projectedMonthlyVolumeM3.toLocaleString()} <span className="text-xs font-bold text-concrete-500">m³</span>
            </div>
            <span className="text-[10px] font-bold text-concrete-500 mt-1 block">
              {Math.round(simulationResult.projectedMonthlyVolumeM3 / 30)} m³/day
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Plant Load</span>
            <div className="text-lg md:text-xl font-black text-accent-orange mt-1">
              {simulationResult.projectedPlantUtilizationPercent}%
            </div>
            <span className={`text-[10px] font-black mt-1 block ${simulationResult.plantBottleneckRisk ? "text-amber-600" : "text-emerald-600"}`}>
              {simulationResult.plantBottleneckRisk ? "⚠️ Bottleneck Alert" : "✅ Within Capacity"}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Fleet Utilization</span>
            <div className="text-lg md:text-xl font-black text-sky-600 mt-1">
              {simulationResult.projectedFleetUtilizationPercent}%
            </div>
            <span className={`text-[10px] font-black mt-1 block ${simulationResult.fleetShortageCount > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {simulationResult.fleetShortageCount > 0 ? `${simulationResult.fleetShortageCount} Truck Shortage` : "Fleet Balanced"}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Resilience Score</span>
            <div className="text-lg md:text-xl font-black text-charcoal-black mt-1">
              {simulationResult.overallResilienceScore}/100
            </div>
            <span className="text-[10px] font-bold text-emerald-600 mt-1 block">
              Feasibility: {simulationResult.aiStrategicInsights.operationalFeasibility}
            </span>
          </div>
        </div>
      )}

      {/* Enterprise AI Optimization Scores (Requirement 18) */}
      {simulationResult?.scores && (
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-base text-charcoal-black">AI Optimization Scores & Business Readiness</h3>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-black rounded-xl">
              Readiness: {simulationResult.scores.businessReadinessScore}/100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-concrete-50 rounded-2xl border border-concrete-200">
              <span className="text-[10px] font-bold text-concrete-500 uppercase block">Efficiency Score</span>
              <div className="text-xl font-black text-charcoal-black mt-1">{simulationResult.scores.efficiencyScore}%</div>
              <div className="w-full bg-concrete-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${simulationResult.scores.efficiencyScore}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-concrete-50 rounded-2xl border border-concrete-200">
              <span className="text-[10px] font-bold text-concrete-500 uppercase block">Optimization Score</span>
              <div className="text-xl font-black text-purple-600 mt-1">{simulationResult.scores.optimizationScore}%</div>
              <div className="w-full bg-concrete-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${simulationResult.scores.optimizationScore}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-concrete-50 rounded-2xl border border-concrete-200">
              <span className="text-[10px] font-bold text-concrete-500 uppercase block">Growth Score</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{simulationResult.scores.growthScore}%</div>
              <div className="w-full bg-concrete-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${simulationResult.scores.growthScore}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-concrete-50 rounded-2xl border border-concrete-200">
              <span className="text-[10px] font-bold text-concrete-500 uppercase block">Scalability Score</span>
              <div className="text-xl font-black text-sky-600 mt-1">{simulationResult.scores.scalabilityScore}%</div>
              <div className="w-full bg-concrete-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${simulationResult.scores.scalabilityScore}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-concrete-50 rounded-2xl border border-concrete-200">
              <span className="text-[10px] font-bold text-concrete-500 uppercase block">Resilience Score</span>
              <div className="text-xl font-black text-accent-orange mt-1">{simulationResult.scores.resilienceScore}%</div>
              <div className="w-full bg-concrete-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-accent-orange h-full rounded-full" style={{ width: `${simulationResult.scores.resilienceScore}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-concrete-50 rounded-2xl border border-concrete-200">
              <span className="text-[10px] font-bold text-concrete-500 uppercase block">Readiness Score</span>
              <div className="text-xl font-black text-purple-900 mt-1">{simulationResult.scores.businessReadinessScore}%</div>
              <div className="w-full bg-concrete-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-purple-900 h-full rounded-full" style={{ width: `${simulationResult.scores.businessReadinessScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Best Operating Plans (Requirement 7) */}
      {simulationResult?.bestPlans && (
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-base text-charcoal-black">AI Enterprise Optimal Operating Plans</h3>
            </div>
            <span className="text-xs text-concrete-500 font-bold">5 Core Execution Vectors</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-1">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">Best Production Plan</span>
              <p className="text-concrete-700 font-semibold leading-relaxed">{simulationResult.bestPlans.bestProductionPlan}</p>
            </div>

            <div className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-1">
              <span className="text-[10px] font-black text-sky-700 uppercase tracking-wider block">Best Dispatch Plan</span>
              <p className="text-concrete-700 font-semibold leading-relaxed">{simulationResult.bestPlans.bestDispatchPlan}</p>
            </div>

            <div className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-1">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">Best Inventory Plan</span>
              <p className="text-concrete-700 font-semibold leading-relaxed">{simulationResult.bestPlans.bestInventoryPlan}</p>
            </div>

            <div className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-1">
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">Best Fleet Allocation</span>
              <p className="text-concrete-700 font-semibold leading-relaxed">{simulationResult.bestPlans.bestFleetAllocation}</p>
            </div>

            <div className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-1 md:col-span-2">
              <span className="text-[10px] font-black text-accent-orange uppercase tracking-wider block">Best Capacity Allocation</span>
              <p className="text-concrete-700 font-semibold leading-relaxed">{simulationResult.bestPlans.bestCapacityAllocation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Strategic Impact Analysis Card */}
      {simulationResult && (
        <div className="bg-purple-950 text-white p-6 md:p-8 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-purple-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-black text-white">AI Decision Impact Evaluation</h3>
            </div>
            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs font-black rounded-lg">
              Feasibility: {simulationResult.aiStrategicInsights.operationalFeasibility}
            </span>
          </div>

          <p className="text-xs md:text-sm text-purple-100 leading-relaxed font-medium">
            {simulationResult.aiStrategicInsights.executiveVerdict}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="bg-purple-900/60 p-3.5 rounded-2xl border border-purple-800 space-y-1.5">
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block">Recommended Operational Mitigations</span>
              {simulationResult.aiStrategicInsights.recommendedMitigations.map((m, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-purple-200 font-semibold">
                  <span className="text-accent-orange font-bold">•</span> <span>{m}</span>
                </div>
              ))}
            </div>

            <div className="bg-purple-900/60 p-3.5 rounded-2xl border border-purple-800 space-y-1.5">
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block">Identified Strategic Growth Upside</span>
              {simulationResult.aiStrategicInsights.growthOpportunities.map((g, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-purple-200 font-semibold">
                  <span className="text-emerald-400 font-bold">•</span> <span>{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2-Col: Enterprise Heatmaps (All 5) & Self-Optimizing Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Enterprise Heatmaps (All 5 Types) */}
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-concrete-100 pb-3 gap-2">
            <div>
              <h3 className="font-black text-base text-charcoal-black flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent-orange" /> Enterprise Operational Heatmaps
              </h3>
              <p className="text-xs text-concrete-500 font-medium">5 Correlated Spatial & Time-Series Matrices</p>
            </div>

            {/* All 5 Heatmap Tabs: Requirement 17 */}
            <div className="flex items-center bg-concrete-100 p-1 rounded-xl flex-wrap">
              {(["CAPACITY", "DEMAND", "REVENUE", "RISK", "OPERATIONAL"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveHeatmapTab(tab)}
                  className={`px-2 py-1 text-[9px] font-black rounded-lg transition-all ${
                    activeHeatmapTab === tab ? "bg-white text-charcoal-black shadow-xs" : "text-concrete-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {heatmaps[activeHeatmapTab] && (
            <div className="space-y-3">
              <p className="text-xs text-concrete-600 font-medium">{heatmaps[activeHeatmapTab].description}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {heatmaps[activeHeatmapTab].matrix.map((cell, idx) => (
                  <div key={idx} className="p-3 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-1">
                    <div className="flex justify-between text-[10px] font-black">
                      <span className="text-concrete-500">{cell.xLabel}</span>
                      <span className={cell.status === "CRITICAL" ? "text-red-600" : cell.status === "HIGH" ? "text-amber-600" : "text-emerald-600"}>
                        {cell.value}%
                      </span>
                    </div>
                    <div className="font-bold text-charcoal-black text-xs leading-tight">{cell.yLabel}</div>
                    <span className="text-[9px] text-concrete-500 block truncate">{cell.details}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200/60 text-[11px] text-orange-950 font-medium">
                💡 <span className="font-bold">Summary:</span> {heatmaps[activeHeatmapTab].summaryNote}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Self-Optimizing Enterprise Engine (Requirement 8, 15, 19) */}
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
            <div>
              <h3 className="font-black text-base text-charcoal-black flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" /> Self-Optimizing Enterprise Engine
              </h3>
              <p className="text-xs text-concrete-500 font-medium">Quantified efficiency improvements with verified ROI</p>
            </div>
            <span className="text-xs font-black text-emerald-700">₹88.5L Identified Upside</span>
          </div>

          <div className="space-y-3">
            {optimizations.map((opt) => (
              <div key={opt.id} className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 bg-concrete-200 text-charcoal-black font-black text-[9px] rounded uppercase">
                    {opt.area}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-700">
                      ₹{(opt.expectedAnnualSavingsINR / 100000).toFixed(1)}L/yr Savings
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-md ${
                      opt.status === "ADOPTED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {opt.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-charcoal-black">{opt.title}</h4>
                  <p className="text-xs text-concrete-600 mt-0.5 font-medium">{opt.optimizedState}</p>
                </div>

                {/* Requirement 15: Expected Benefits, Risks, Cost, Revenue Impact */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-semibold bg-white p-2.5 rounded-xl border border-concrete-200">
                  <div>
                    <span className="text-concrete-500 block">Expected Revenue Impact:</span>
                    <span className="text-emerald-700 font-black">+₹{(opt.expectedRevenueImpactINR / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div>
                    <span className="text-concrete-500 block">Implementation Cost:</span>
                    <span className="text-charcoal-black font-bold">₹{(opt.expectedCostINR / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="col-span-2 text-concrete-600">
                    <span className="text-emerald-700 font-bold">Key Benefit:</span> {opt.expectedBenefits?.[0] || "Optimizes resource allocation"}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-concrete-200/60 text-xs">
                  <span className="text-[10px] text-concrete-500 font-bold">ROI: +{opt.roiPercent}% ({opt.confidenceScore}% conf)</span>
                  {opt.status === "IDENTIFIED" ? (
                    <button
                      onClick={() => handleAdoptOptimization(opt.id)}
                      disabled={adoptingId === opt.id}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Adopt Strategy
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Strategy Active in Twin
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Strategic Briefings Panel (Requirement 21) */}
      <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-concrete-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-black text-base text-charcoal-black">Executive Strategic Briefings</h3>
              <p className="text-xs text-concrete-500 font-medium">Synthesized Board-Level Strategy & Decision Intelligence</p>
            </div>
          </div>

          <div className="flex items-center bg-concrete-100 p-1 rounded-xl">
            {(["GROWTH", "RISK", "EXPANSION", "OPTIMIZATION"] as const).map(type => (
              <button
                key={type}
                onClick={() => fetchBriefing(type)}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                  activeBriefingType === type ? "bg-white text-purple-700 shadow-xs" : "text-concrete-500"
                }`}
              >
                {type} REPORT
              </button>
            ))}
          </div>
        </div>

        {strategicBriefing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-charcoal-black">{strategicBriefing.title}</h4>
              <span className="text-[10px] font-bold text-concrete-400">{strategicBriefing.timeline}</span>
            </div>

            <p className="text-xs text-concrete-700 leading-relaxed font-medium bg-concrete-50 p-4 rounded-2xl border border-concrete-200">
              {strategicBriefing.executiveSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                <span className="text-[10px] font-black text-purple-800 uppercase tracking-wider block">Key Projections</span>
                {strategicBriefing.keyProjections.map((p, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-purple-950 font-semibold">
                    <span className="text-purple-600 font-bold">•</span> <span>{p}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">Recommended Executive Decisions</span>
                {strategicBriefing.recommendedDecisions.map((d, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-emerald-950 font-semibold">
                    <span className="text-emerald-600 font-bold">•</span> <span>{d}</span>
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
