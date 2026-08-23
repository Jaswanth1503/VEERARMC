"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, Truck, Building, Layers, CheckCircle2, Clock, 
  AlertCircle, ShieldCheck, Sun, CloudRain, ArrowRight, 
  MapPin, Check, ChevronRight, FileText, Calculator, ShieldAlert,
  AlertTriangle, RefreshCw
} from "lucide-react";

export default function RecommendationsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // Input State
  const [formData, setFormData] = useState({
    projectName: "Expressway Office Tower Pour",
    projectType: "Commercial",
    floors: 4,
    requiredVolumeM3: 24,
    truckCapacityM3: 6,
    pumpRequired: true,
    siteCity: "Pune",
    pincode: "411033",
    customerPriority: "NORMAL" as "NORMAL" | "HIGH" | "CRITICAL",
    rainProbabilityPercent: 10,
    temperatureCelsius: 28
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate recommendation.");
      }

      const data = await res.json();
      setResultData(data);
    } catch (err: any) {
      alert(`Error: ${err.message || "Failed to generate recommendation."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!resultData?.recommendation?.id) return;
    try {
      const res = await fetch(`/api/recommendations/${resultData.recommendation.id}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        alert("🎉 Recommendation & Delivery Plan officially approved!");
        handleGenerate(); // refresh
      }
    } catch (e) {
      alert("Failed to approve plan.");
    }
  };

  const handleOverride = async () => {
    const reason = prompt("Enter mandatory dispatcher audit reason for override:");
    if (!reason) return;
    
    const planId = resultData?.recommendation?.deliveryPlans?.[0]?.id;
    if (!planId) return;

    try {
      const res = await fetch(`/api/recommendations/${planId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrideReason: reason })
      });
      if (res.ok) {
        alert("✅ Delivery plan overridden. Reason logged in audit history.");
        handleGenerate();
      }
    } catch (e) {
      alert("Failed to override delivery plan.");
    }
  };

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black font-sans pb-16">
      {/* Top Header Navbar */}
      <header className="bg-white border-b border-concrete-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-black tracking-tighter flex items-baseline text-lg">
              <span className="text-[#DA291C] italic mr-1">VEERA</span>
              <span className="text-[#008C45]">CONCRETE</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold font-mono">
              AI Recommendation & Delivery Planner 2.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/quote"
              className="text-xs px-3.5 py-1.5 rounded-xl bg-concrete-100 border border-concrete-200 text-concrete-700 font-semibold hover:text-accent-orange transition-all"
            >
              Quote Generator
            </Link>
            <Link
              href="/blueprint-analyzer"
              className="text-xs px-3.5 py-1.5 rounded-xl bg-concrete-100 border border-concrete-200 text-concrete-700 font-semibold hover:text-accent-orange transition-all"
            >
              Blueprint Analyzer
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Intelligent RMC Optimization Engine
          </div>
          <h1 className="text-3xl font-black tracking-tight text-charcoal-black">
            AI Project Recommendation & Delivery Planner
          </h1>
          <p className="text-xs text-concrete-600">
            Combine verified database product data, deterministic logistics rules, weather forecasts, and Gemini AI reasoning for optimal Ready Mix Concrete planning.
          </p>
        </div>

        {/* Input Control Card */}
        <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-charcoal-black flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent-orange" /> Configure Project & Pour Logistics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-concrete-700 mb-1">Concrete Volume (m³)</label>
              <input
                type="number"
                value={formData.requiredVolumeM3}
                onChange={e => setFormData({ ...formData, requiredVolumeM3: Number(e.target.value) })}
                className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-sm font-bold text-accent-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 mb-1">Building Height / Floors</label>
              <input
                type="number"
                value={formData.floors}
                onChange={e => setFormData({ ...formData, floors: Number(e.target.value) })}
                className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 mb-1">Project Type</label>
              <select
                value={formData.projectType}
                onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none"
              >
                {["Residential", "Commercial", "Industrial", "High-rise", "Infrastructure"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 mb-1">Truck Capacity (m³)</label>
              <select
                value={formData.truckCapacityM3}
                onChange={e => setFormData({ ...formData, truckCapacityM3: Number(e.target.value) })}
                className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-sm font-semibold focus:outline-none"
              >
                <option value={6}>6 m³ Standard Mixer</option>
                <option value={8}>8 m³ Heavy Mixer</option>
                <option value={10}>10 m³ High Capacity</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-concrete-200">
            <div className="flex items-center gap-4 text-xs font-bold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pumpRequired}
                  onChange={e => setFormData({ ...formData, pumpRequired: e.target.checked })}
                  className="accent-accent-orange w-4 h-4"
                />
                Pump Equipment Required
              </label>

              <div className="flex items-center gap-1">
                <span>Rain Forecast:</span>
                <input
                  type="number"
                  value={formData.rainProbabilityPercent}
                  onChange={e => setFormData({ ...formData, rainProbabilityPercent: Number(e.target.value) })}
                  className="w-14 p-1 text-center bg-concrete-50 border border-concrete-200 rounded-lg text-xs"
                />
                <span>%</span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-3 bg-accent-orange text-white font-extrabold text-sm rounded-xl hover:bg-accent-orange/90 flex items-center gap-2 shadow-md transition-all"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Optimizing Logistics...
                </>
              ) : (
                <>
                  Generate AI Recommendation & Delivery Plan <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* RESULTS DASHBOARD */}
        {resultData && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Result Card */}
            <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-concrete-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-charcoal-black">Recommendation Summary</h2>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-extrabold border ${
                      resultData.recommendation?.status === "APPROVED"
                        ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-700 border-amber-500/30"
                    }`}>
                      {resultData.recommendation?.status}
                    </span>
                  </div>
                  <p className="text-xs text-concrete-600 mt-1">
                    {resultData.recommendation?.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOverride}
                    className="px-3.5 py-2 rounded-xl bg-concrete-100 border border-concrete-200 text-concrete-700 text-xs font-bold hover:bg-concrete-200 transition-all"
                  >
                    Dispatcher Override
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-1.5 hover:bg-emerald-700 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Plan
                  </button>
                </div>
              </div>

              {/* Multi-Module Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-concrete-50 border border-concrete-200">
                  <div className="text-[11px] font-bold text-concrete-500">Concrete Grade</div>
                  <div className="text-lg font-black text-charcoal-black mt-0.5">
                    {resultData.recommendation?.items?.find((i: any) => i.category === "CONCRETE_GRADE")?.recommendedValue || "M25"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-concrete-50 border border-concrete-200">
                  <div className="text-[11px] font-bold text-concrete-500">Required Fleet (Deterministic)</div>
                  <div className="text-lg font-black text-accent-orange mt-0.5">
                    {resultData.recommendation?.items?.find((i: any) => i.category === "TRUCK_COUNT")?.recommendedValue || "4 Trucks"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-concrete-50 border border-concrete-200">
                  <div className="text-[11px] font-bold text-concrete-500">Equipment Selection</div>
                  <div className="text-sm font-extrabold text-charcoal-black mt-1">
                    {resultData.recommendation?.items?.find((i: any) => i.category === "PUMP_TYPE")?.recommendedValue || "BOOM_PUMP_24M"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-concrete-50 border border-concrete-200">
                  <div className="text-[11px] font-bold text-concrete-500">Weather Status</div>
                  <div className="text-sm font-extrabold text-emerald-700 mt-1 flex items-center gap-1">
                    <Sun className="w-4 h-4" /> {resultData.recommendation?.items?.find((i: any) => i.category === "WEATHER_WINDOW")?.recommendedValue || "GOOD_WINDOW"}
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Delivery Schedule Timeline */}
            <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-charcoal-black flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-orange" /> Optimized Dispatch & Pouring Timeline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs relative">
                <div className="p-4 rounded-xl bg-concrete-50 border border-concrete-200">
                  <div className="text-concrete-500 font-bold">1. Plant Batching</div>
                  <div className="text-sm font-black text-charcoal-black mt-1">07:30 AM</div>
                  <div className="text-[11px] text-concrete-500 mt-0.5">Central Plant 01 Batching</div>
                </div>

                <div className="p-4 rounded-xl bg-concrete-50 border border-concrete-200">
                  <div className="text-concrete-500 font-bold">2. Transit Mixer Transit</div>
                  <div className="text-sm font-black text-charcoal-black mt-1">08:00 AM</div>
                  <div className="text-[11px] text-concrete-500 mt-0.5">Est. 45 Mins Transit Time</div>
                </div>

                <div className="p-4 rounded-xl bg-accent-orange/10 border border-accent-orange/30">
                  <div className="text-accent-orange font-bold">3. Site Arrival</div>
                  <div className="text-sm font-black text-accent-orange mt-1">08:45 AM</div>
                  <div className="text-[11px] text-concrete-600 mt-0.5">24M Boom Pump Discharge</div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-emerald-800 font-bold">4. Pour Completion</div>
                  <div className="text-sm font-black text-emerald-700 mt-1">10:45 AM</div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">120 Mins Pour Window</div>
                </div>
              </div>
            </div>

            {/* Grade Comparison Matrix */}
            {resultData.gradeComparison && (
              <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-charcoal-black flex items-center gap-2">
                  <Layers className="w-5 h-5 text-accent-orange" /> Database Multi-Grade Comparison Matrix
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
                      <tr>
                        <th className="p-3">Grade</th>
                        <th className="p-3">Strength (MPa)</th>
                        <th className="p-3">Typical Application</th>
                        <th className="p-3">Base Price</th>
                        <th className="p-3">Suitable Types</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-concrete-200">
                      {resultData.gradeComparison.map((g: any) => (
                        <tr key={g.gradeCode} className="hover:bg-concrete-50/50">
                          <td className="p-3 font-extrabold text-charcoal-black">{g.gradeCode}</td>
                          <td className="p-3 font-mono">{g.compressiveStrengthMPa} MPa</td>
                          <td className="p-3 text-concrete-700">{g.typicalApplication}</td>
                          <td className="p-3 font-bold text-accent-orange">₹{g.relativeCostPerM3}/m³</td>
                          <td className="p-3 text-concrete-600">{g.suitableProjectTypes.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Engineer Disclaimer */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Structural & Operations Disclaimer:</strong> AI recommendations are generated combining verified database data and deterministic rules. Final structural concrete mix selection and dispatch approvals must be confirmed by a qualified engineer and plant dispatcher.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
