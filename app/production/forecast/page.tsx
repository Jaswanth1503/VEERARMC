"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, ArrowLeft, RefreshCw, TrendingUp, Calendar, 
  Layers, AlertTriangle, CheckCircle2, Factory, Package
} from "lucide-react";

export default function ProductionForecastingDashboard() {
  const [period, setPeriod] = useState<"WEEKLY" | "MONTHLY">("WEEKLY");
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecast();
  }, [period]);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/production/forecast?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setForecast(data.forecast);
      }
    } catch (e) {
      console.error("Failed to load forecast", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black p-4 md:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/production" className="text-xs font-bold text-concrete-500 hover:text-accent-orange flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Production Hub
            </Link>
            <span className="text-concrete-300">•</span>
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Gemini AI Intelligence
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-charcoal-black mt-1 tracking-tight">
            AI Demand & Material Forecasting Dashboard
          </h1>
          <p className="text-xs md:text-sm text-concrete-600">
            Predict concrete demand surges, plant bottleneck risks, and raw material inventory consumption.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-concrete-100 p-1 rounded-xl border border-concrete-200">
            <button
              onClick={() => setPeriod("WEEKLY")}
              className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                period === "WEEKLY" ? "bg-accent-orange text-white shadow-sm" : "text-concrete-600 hover:text-charcoal-black"
              }`}
            >
              7-Day Forecast
            </button>
            <button
              onClick={() => setPeriod("MONTHLY")}
              className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                period === "MONTHLY" ? "bg-accent-orange text-white shadow-sm" : "text-concrete-600 hover:text-charcoal-black"
              }`}
            >
              30-Day Forecast
            </button>
          </div>

          <button
            onClick={fetchForecast}
            className="p-2.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-xl text-xs font-bold transition-all border border-concrete-200"
            title="Recalculate AI Forecast"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-xs font-bold text-concrete-500 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-concrete-200">
          <RefreshCw className="w-8 h-8 animate-spin text-accent-orange" />
          Generating Gemini AI Demand Models & Material Projections...
        </div>
      ) : !forecast ? (
        <div className="bg-white p-12 rounded-2xl border border-concrete-200 text-center text-xs font-bold text-concrete-500">
          Failed to generate forecast.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-concrete-200 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">Projected Demand</div>
              <div className="text-3xl font-black text-accent-orange mt-1">
                {forecast.predictedDemandM3?.toLocaleString()} <span className="text-sm font-bold text-concrete-600">m³</span>
              </div>
              <div className="text-[11px] text-concrete-400 font-semibold">{period === "WEEKLY" ? "Next 7 Days" : "Next 30 Days"}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-concrete-200 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">Peak Concrete Grade</div>
              <div className="text-3xl font-black text-charcoal-black mt-1">
                {forecast.peakGrade || "M25"}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">Standard commercial RCC</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-concrete-200 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">Required Cement Stock</div>
              <div className="text-3xl font-black text-charcoal-black mt-1">
                {forecast.materialRequirements?.cementTons} <span className="text-sm font-bold text-concrete-600">Tons</span>
              </div>
              <div className="text-[11px] text-concrete-400 font-semibold">OPC 53 Grade</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-concrete-200 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">AI Model Confidence</div>
              <div className="text-3xl font-black text-emerald-600 mt-1">
                {forecast.confidenceScore || 92}%
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">High predictive accuracy</div>
            </div>
          </div>

          {/* High Demand Windows & AI Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* High Demand Windows */}
            <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
                <Calendar className="w-4 h-4 text-accent-orange" /> Predicted High Demand Windows
              </h2>
              <div className="space-y-2.5">
                {(forecast.highDemandWindows || []).map((w: string, i: number) => (
                  <div key={i} className="p-3.5 bg-orange-50/50 rounded-xl border border-orange-200 text-xs font-bold text-charcoal-black flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-orange shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Operational Recommendations */}
            <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI Supply Chain Recommendations
              </h2>
              <div className="space-y-2.5">
                {(forecast.aiRecommendations || []).map((r: string, i: number) => (
                  <div key={i} className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs font-medium text-concrete-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raw Material Inventory Requirements Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
              <Layers className="w-4 h-4 text-accent-orange" /> Projected Raw Material Requirements Breakdown
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-center space-y-1">
                <div className="text-[11px] font-bold text-concrete-500">OPC Cement</div>
                <div className="text-xl font-black text-charcoal-black">{forecast.materialRequirements?.cementTons}</div>
                <div className="text-[10px] text-concrete-400 font-bold">Metric Tons</div>
              </div>

              <div className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-center space-y-1">
                <div className="text-[11px] font-bold text-concrete-500">Class F Fly Ash</div>
                <div className="text-xl font-black text-charcoal-black">{forecast.materialRequirements?.flyAshTons}</div>
                <div className="text-[10px] text-concrete-400 font-bold">Metric Tons</div>
              </div>

              <div className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-center space-y-1">
                <div className="text-[11px] font-bold text-concrete-500">Zone II Sand</div>
                <div className="text-xl font-black text-charcoal-black">{forecast.materialRequirements?.sandTons}</div>
                <div className="text-[10px] text-concrete-400 font-bold">Metric Tons</div>
              </div>

              <div className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-center space-y-1">
                <div className="text-[11px] font-bold text-concrete-500">20mm/10mm Agg</div>
                <div className="text-xl font-black text-charcoal-black">{forecast.materialRequirements?.aggregateTons}</div>
                <div className="text-[10px] text-concrete-400 font-bold">Metric Tons</div>
              </div>

              <div className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-center space-y-1">
                <div className="text-[11px] font-bold text-concrete-500">Admixture</div>
                <div className="text-xl font-black text-charcoal-black">{forecast.materialRequirements?.admixtureLiters?.toLocaleString()}</div>
                <div className="text-[10px] text-concrete-400 font-bold">Liters</div>
              </div>

              <div className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-center space-y-1">
                <div className="text-[11px] font-bold text-concrete-500">Batching Water</div>
                <div className="text-xl font-black text-charcoal-black">{forecast.materialRequirements?.waterKl}</div>
                <div className="text-[10px] text-concrete-400 font-bold">kL (1000L)</div>
              </div>
            </div>
          </div>

          {/* Plant Bottleneck Alerts */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-3">
            <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Plant Capacity Bottlenecks & Operational Constraints
            </h2>
            <div className="space-y-2">
              {(forecast.capacityBottlenecks || []).map((b: string, i: number) => (
                <div key={i} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
