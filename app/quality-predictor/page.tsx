"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FlaskConical, Sparkles, AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, 
  Info, ArrowRight, History, Download, RefreshCw, Calculator, Layers, Cpu, ChevronDown, ChevronUp, Save
} from "lucide-react";
import { FullQualityPredictionReport } from "@/lib/quality/types/quality";
import { QualityPDFService } from "@/lib/quality/services/quality-pdf.service";

const PRESET_GRADES = [
  { grade: "M20", target: 20, cement: 300, water: 170, fineAgg: 720, coarseAgg: 1160, admixture: 2.0 },
  { grade: "M25", target: 25, cement: 340, water: 170, fineAgg: 710, coarseAgg: 1140, admixture: 3.0 },
  { grade: "M30", target: 30, cement: 380, water: 165, fineAgg: 690, coarseAgg: 1120, admixture: 3.8 },
  { grade: "M35", target: 35, cement: 410, water: 160, fineAgg: 680, coarseAgg: 1100, admixture: 4.5 },
  { grade: "M40", target: 40, cement: 440, water: 155, fineAgg: 660, coarseAgg: 1080, admixture: 5.2 },
  { grade: "M50", target: 50, cement: 470, water: 145, fineAgg: 640, coarseAgg: 1060, admixture: 6.0, silicaFume: 25 }
];

export default function QualityPredictorPage() {
  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FullQualityPredictionReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    concreteGrade: "M25",
    cementKg: 340,
    waterKg: 170,
    fineAggregateKg: 710,
    coarseAggregateKg: 1140,
    admixtureKg: 3.0,
    flyAshKg: 0,
    ggbsKg: 0,
    silicaFumeKg: 0,
    targetStrengthMpa: 25,
    ageDays: 28,
    slumpMm: 110,
    ambientTempCelsius: 30,
    curingCondition: "STANDARD_WATER_CURING",
    previousTestStrength: 0
  });

  useEffect(() => {
    fetchSession();
    // Parse URL query parameters if passed from Quote Generator
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const grade = params.get("grade");
      if (grade) {
        const preset = PRESET_GRADES.find(p => p.grade.toUpperCase() === grade.toUpperCase());
        if (preset) {
          applyPreset(preset);
        } else {
          setFormData(prev => ({ ...prev, concreteGrade: grade }));
        }
      }
    }
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUserSession(data.user);
      }
    } catch (e) {}
  };

  const applyPreset = (preset: typeof PRESET_GRADES[0]) => {
    setFormData({
      concreteGrade: preset.grade,
      cementKg: preset.cement,
      waterKg: preset.water,
      fineAggregateKg: preset.fineAgg,
      coarseAggregateKg: preset.coarseAgg,
      admixtureKg: preset.admixture,
      flyAshKg: 0,
      ggbsKg: 0,
      silicaFumeKg: preset.silicaFume || 0,
      targetStrengthMpa: preset.target,
      ageDays: 28,
      slumpMm: 110,
      ambientTempCelsius: 30,
      curingCondition: "STANDARD_WATER_CURING",
      previousTestStrength: 0
    });
  };

  // Live Calculated Engineering Indicators
  const totalBinder = formData.cementKg + formData.flyAshKg + formData.ggbsKg + formData.silicaFumeKg;
  const wcRatio = totalBinder > 0 ? (formData.waterKg / totalBinder).toFixed(3) : "0.000";
  const admixturePct = totalBinder > 0 ? ((formData.admixtureKg / totalBinder) * 100).toFixed(2) : "0.00";
  const totalAgg = formData.fineAggregateKg + formData.coarseAggregateKg;
  const fineRatio = totalAgg > 0 ? ((formData.fineAggregateKg / totalAgg) * 100).toFixed(1) : "0.0";

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/quality/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate quality prediction.");
      }

      setReport(data.report);

      // Save report to localStorage for local history persistence (Online & Offline DB fallback)
      try {
        const localHistory = JSON.parse(localStorage.getItem("veera_quality_predictions") || "[]");
        const newRecord = {
          id: data.report.id || `pred-${Date.now()}`,
          concreteGrade: data.report.inputs.concreteGrade,
          cementKg: data.report.inputs.cementKg,
          waterKg: data.report.inputs.waterKg,
          waterCementRatio: data.report.calculatedFeatures.waterCementRatio,
          predictedStrengthMpa: data.report.predictedStrengthMpa,
          targetStrengthMpa: data.report.inputs.targetStrengthMpa,
          strengthMarginMpa: data.report.strengthMarginMpa,
          riskLevel: data.report.riskLevel,
          summary: data.report.summary,
          explanation: data.report.explanation,
          createdAt: data.report.createdAt || new Date().toISOString()
        };
        const updated = [newRecord, ...localHistory.filter((item: any) => item.id !== newRecord.id)].slice(0, 30);
        localStorage.setItem("veera_quality_predictions", JSON.stringify(updated));
      } catch (e) {}

      // Scroll smoothly to results
      setTimeout(() => {
        document.getElementById("prediction-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err: any) {
      console.error("Prediction Error:", err);
      setErrorMsg(err.message || "Failed to run quality prediction. Please check mix quantities.");
    } finally {
      setLoading(false);
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
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 font-bold font-mono flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5" /> AI Quality Predictor 2.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/quality-predictor/history"
              className="text-xs px-3.5 py-1.5 rounded-xl bg-concrete-100 border border-concrete-200 text-concrete-700 hover:text-accent-orange font-semibold flex items-center gap-1.5 transition-all"
            >
              <History className="w-3.5 h-3.5" /> Prediction History
            </Link>
            {userSession ? (
              <Link
                href={`/dashboard/${userSession.role?.roleName?.toLowerCase() || 'customer'}`}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-accent-orange text-white font-semibold shadow-sm transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs px-3.5 py-1.5 rounded-xl bg-concrete-800 text-white font-semibold shadow-sm transition-all"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Concrete Technology & Strength Intelligence
          </div>
          <h1 className="text-3xl font-black tracking-tight text-charcoal-black">
            AI Concrete Quality & Compressive Strength Predictor
          </h1>
          <p className="text-xs text-concrete-600">
            Predict concrete performance, evaluate water-cement matrix stability, and identify quality risks prior to plant batching or site dispatch.
          </p>
        </div>

        {/* Preset Grade Quick Buttons */}
        <div className="bg-white rounded-2xl border border-concrete-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-concrete-500 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-purple-600" /> Standard Grade Mix Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_GRADES.map(p => (
              <button
                key={p.grade}
                type="button"
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                  formData.concreteGrade === p.grade
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-concrete-50 border-concrete-200 text-charcoal-black hover:bg-concrete-100"
                }`}
              >
                {p.grade} ({p.target} MPa)
              </button>
            ))}
          </div>
        </div>

        {/* Input Form Workspace */}
        <form onSubmit={handlePredict} className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-concrete-100 pb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-charcoal-black flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent-orange" /> Mix Design & Batch Proportions (per m³)
            </h2>
            <span className="text-xs font-mono text-concrete-500">IS 10262 / ACI 211 Proportions</span>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Concrete Grade</label>
              <input
                type="text"
                value={formData.concreteGrade}
                onChange={e => setFormData({ ...formData, concreteGrade: e.target.value })}
                placeholder="e.g. M25"
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Target Strength (MPa)</label>
              <input
                type="number"
                step="0.1"
                value={formData.targetStrengthMpa}
                onChange={e => setFormData({ ...formData, targetStrengthMpa: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Curing Age (Days)</label>
              <select
                value={formData.ageDays}
                onChange={e => setFormData({ ...formData, ageDays: parseInt(e.target.value) || 28 })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600 font-bold bg-white"
              >
                <option value={3}>3 Days (Early Strip)</option>
                <option value={7}>7 Days (Initial Strength)</option>
                <option value={14}>14 Days (Structural Formwork)</option>
                <option value={28}>28 Days (Standard Specification)</option>
                <option value={56}>56 Days (High Volume Pozzolan)</option>
                <option value={90}>90 Days (Long-term Hydration)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Cement Quantity (kg/m³)</label>
              <input
                type="number"
                value={formData.cementKg}
                onChange={e => setFormData({ ...formData, cementKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Water Quantity (kg/m³)</label>
              <input
                type="number"
                value={formData.waterKg}
                onChange={e => setFormData({ ...formData, waterKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Admixture Dosage (kg/m³)</label>
              <input
                type="number"
                step="0.1"
                value={formData.admixtureKg}
                onChange={e => setFormData({ ...formData, admixtureKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Fine Aggregate (Sand) (kg/m³)</label>
              <input
                type="number"
                value={formData.fineAggregateKg}
                onChange={e => setFormData({ ...formData, fineAggregateKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Coarse Aggregate (Gravel) (kg/m³)</label>
              <input
                type="number"
                value={formData.coarseAggregateKg}
                onChange={e => setFormData({ ...formData, coarseAggregateKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Curing Condition</label>
              <select
                value={formData.curingCondition}
                onChange={e => setFormData({ ...formData, curingCondition: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600 bg-white"
              >
                <option value="STANDARD_WATER_CURING">Standard Water Tank Curing (20°C)</option>
                <option value="STEAM_CURING">Accelerated Steam Curing</option>
                <option value="AIR_DRY">Air Drying / Site Ambient Curing</option>
                <option value="NO_CURING">Uncured / Dry Environment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Fly Ash (kg/m³) <span className="text-concrete-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                value={formData.flyAshKg}
                onChange={e => setFormData({ ...formData, flyAshKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">GGBS (Slag) (kg/m³) <span className="text-concrete-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                value={formData.ggbsKg}
                onChange={e => setFormData({ ...formData, ggbsKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Silica Fume (kg/m³) <span className="text-concrete-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                value={formData.silicaFumeKg}
                onChange={e => setFormData({ ...formData, silicaFumeKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Live Calculated Engineering Indicators Bar */}
          <div className="bg-concrete-50 rounded-xl p-4 border border-concrete-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[10px] font-bold text-concrete-500 uppercase tracking-wider block">Water-Binder (w/c)</span>
              <span className={`text-base font-extrabold font-mono ${parseFloat(wcRatio) > 0.55 ? 'text-red-600' : 'text-emerald-700'}`}>
                {wcRatio}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-concrete-500 uppercase tracking-wider block">Total Binder</span>
              <span className="text-base font-extrabold text-charcoal-black font-mono">{totalBinder} kg/m³</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-concrete-500 uppercase tracking-wider block">Admixture %</span>
              <span className="text-base font-extrabold text-charcoal-black font-mono">{admixturePct}%</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-concrete-500 uppercase tracking-wider block">Fine Agg Ratio</span>
              <span className="text-base font-extrabold text-charcoal-black font-mono">{fineRatio}%</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Running Prediction Service...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Predict Concrete Quality & Strength
                </>
              )}
            </button>
          </div>
        </form>

        {/* Prediction Results Workspace */}
        {report && (
          <div id="prediction-results" className="space-y-6">
            {/* Main Result Dashboard Card */}
            <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-concrete-100 pb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {report.inputs.concreteGrade} Grade Report
                    </span>
                    <span className="text-xs text-concrete-500 font-mono">
                      Model: {report.modelVersion}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-charcoal-black mt-1">
                    Quality Prediction & Compressive Strength Report
                  </h2>
                </div>

                {/* Risk Level Badge */}
                <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold text-sm ${
                  report.riskLevel === "LOW" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                  report.riskLevel === "MEDIUM" ? "bg-amber-50 border-amber-200 text-amber-800" :
                  "bg-red-50 border-red-200 text-red-800"
                }`}>
                  {report.riskLevel === "LOW" ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> : <ShieldAlert className="w-5 h-5 text-red-600" />}
                  <span>RISK LEVEL: {report.riskLevel}</span>
                </div>
              </div>

              {/* Metric Hero Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-5 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Predicted Strength</span>
                  <div className="text-4xl font-black text-purple-900 mt-1">{report.predictedStrengthMpa} <span className="text-base font-normal">MPa</span></div>
                  <span className="text-[11px] text-purple-600 mt-1 block">at {report.inputs.ageDays || 28} days curing age</span>
                </div>

                <div className="bg-concrete-50 border border-concrete-200 rounded-2xl p-5 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-concrete-500">Target Strength</span>
                  <div className="text-4xl font-black text-charcoal-black mt-1">{report.inputs.targetStrengthMpa} <span className="text-base font-normal">MPa</span></div>
                  <span className="text-[11px] text-concrete-500 mt-1 block">design specification requirement</span>
                </div>

                <div className={`border rounded-2xl p-5 text-center ${
                  report.strengthMarginMpa >= 0 ? "bg-emerald-50/60 border-emerald-200" : "bg-red-50/60 border-red-200"
                }`}>
                  <span className="text-xs font-bold uppercase tracking-wider text-concrete-600">Strength Margin</span>
                  <div className={`text-4xl font-black mt-1 ${report.strengthMarginMpa >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                    {report.strengthMarginMpa >= 0 ? `+${report.strengthMarginMpa}` : report.strengthMarginMpa} <span className="text-base font-normal">MPa</span>
                  </div>
                  <span className="text-[11px] text-concrete-600 mt-1 block">Predicted − Target buffer</span>
                </div>

                <div className="bg-concrete-50 border border-concrete-200 rounded-2xl p-5 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-concrete-500">Confidence Score</span>
                  <div className="text-4xl font-black text-charcoal-black mt-1">{report.confidenceScorePercent}%</div>
                  <span className="text-[11px] text-concrete-500 mt-1 block">based on mix matrix stability</span>
                </div>
              </div>

              {/* Summary Banner */}
              {report.summary && (
                <div className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-xs text-charcoal-black font-medium leading-relaxed flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-purple-700 block mb-0.5">Executive Summary:</span>
                    {report.summary}
                  </div>
                </div>
              )}

              {/* Visual Analytics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Visual Bar Comparison */}
                <div className="bg-concrete-50 rounded-2xl border border-concrete-200 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-charcoal-black uppercase tracking-wider flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-purple-600" /> Strength vs Target Visual Comparison
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Predicted ({report.predictedStrengthMpa} MPa)</span>
                        <span className="text-purple-700">{((report.predictedStrengthMpa / Math.max(report.predictedStrengthMpa, report.inputs.targetStrengthMpa)) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-3 bg-concrete-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, (report.predictedStrengthMpa / (report.inputs.targetStrengthMpa * 1.3)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Target Requirement ({report.inputs.targetStrengthMpa} MPa)</span>
                        <span className="text-concrete-600">100%</span>
                      </div>
                      <div className="w-full h-3 bg-concrete-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-concrete-700 transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, (report.inputs.targetStrengthMpa / (report.inputs.targetStrengthMpa * 1.3)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Contributions Factors */}
                <div className="bg-concrete-50 rounded-2xl border border-concrete-200 p-5 space-y-3">
                  <h3 className="text-xs font-bold text-charcoal-black uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-600" /> Key Influencing Factors
                  </h3>

                  <div className="space-y-2">
                    {report.featureContributions?.map((fc, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2.5 bg-white rounded-xl border border-concrete-200">
                        <div>
                          <span className="font-bold text-charcoal-black block">{fc.featureName}</span>
                          <span className="text-[11px] text-concrete-500">{fc.description}</span>
                        </div>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          fc.direction === 'POSITIVE' ? 'bg-emerald-100 text-emerald-800' :
                          fc.direction === 'NEGATIVE' ? 'bg-red-100 text-red-800' : 'bg-concrete-100 text-concrete-700'
                        }`}>
                          {fc.impactMpa > 0 ? `+${fc.impactMpa}` : fc.impactMpa} MPa
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Explainable AI Accordion */}
              <div className="border border-concrete-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full bg-concrete-100 p-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-charcoal-black text-left"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" /> Why did the AI make this prediction?
                  </span>
                  {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showExplanation && (
                  <div className="p-5 bg-white space-y-4 text-xs text-concrete-700 leading-relaxed border-t border-concrete-200">
                    <p className="font-medium text-charcoal-black">{report.explanation}</p>

                    {report.risks && report.risks.length > 0 && (
                      <div>
                        <span className="font-bold text-red-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Identified Mix Quality Risks:
                        </span>
                        <ul className="list-disc pl-5 space-y-1 text-red-700">
                          {report.risks.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recommendations Box */}
              {report.recommendations && report.recommendations.length > 0 && (
                <div className="bg-purple-50/50 rounded-2xl border border-purple-200 p-5 space-y-3">
                  <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700" /> Practical Engineering Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {report.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-medium text-purple-950">
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Engineering Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[11px] text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Engineering & Quality Disclaimer:</span>
                  This prediction is an AI-assisted estimate for decision support and does not replace official laboratory cube testing, applicable standard code specifications, or qualified engineering judgment.
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap justify-between items-center pt-2 gap-4">
                <Link
                  href="/quality-predictor/history"
                  className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
                >
                  <History className="w-4 h-4" /> View Saved Predictions History
                </Link>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const pdfWindow = window.open("", "_blank");
                      if (pdfWindow) {
                        const htmlContent = QualityPDFService.generateQualityReportHTML(report);
                        pdfWindow.document.write(htmlContent);
                        pdfWindow.document.close();
                      } else {
                        alert("Please allow popups to open the PDF report print view.");
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Quality Report (PDF)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const jsonBlob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(jsonBlob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `Quality_Report_${report.inputs.concreteGrade}_${Date.now()}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-concrete-100 border border-concrete-200 text-charcoal-black rounded-xl text-xs font-bold hover:bg-concrete-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    Export Raw (JSON)
                  </button>
                  
                  <Link
                    href={`/quote?grade=${report.inputs.concreteGrade}`}
                    className="px-4 py-2 bg-accent-orange text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors flex items-center gap-1.5"
                  >
                    Generate Commercial Quote <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
