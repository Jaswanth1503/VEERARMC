"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileUp, Sparkles, Building, Layers, CheckCircle2, AlertCircle, 
  Download, ArrowRight, FileText, Check, RotateCw, HelpCircle, 
  Eye, Calculator, HardHat, Info, ShieldCheck, ShieldAlert
} from "lucide-react";

export default function BlueprintAnalyzerPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [userSession, setUserSession] = useState<any>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUserSession(data.user);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      alert("Please upload at least one blueprint PDF or drawing image.");
      return;
    }

    setIsProcessing(true);
    setProcessingStage("Uploading securely & validating file formats...");

    try {
      const formData = new FormData();
      files.forEach(f => formData.append("files", f));

      setTimeout(() => setProcessingStage("Extracting text pages & classifying document layout..."), 1200);
      setTimeout(() => setProcessingStage("Running deterministic dimension arithmetic for slabs & columns..."), 2500);
      setTimeout(() => setProcessingStage("Generating qualitative AI reasoning & confidence scoring..."), 3800);

      const res = await fetch("/api/blueprints/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to analyze blueprint.");
      }

      const data = await res.json();
      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      alert(`Error: ${err.message || "Blueprint analysis failed."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateQuoteFromBlueprint = async () => {
    if (!analysisResult?.id) return;
    try {
      const res = await fetch(`/api/blueprints/${analysisResult.id}/create-quote`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.redirectUrl;
      }
    } catch (e) {
      alert("Failed to export blueprint data to Quote Generator.");
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
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-orange/10 text-accent-orange font-bold font-mono">
              AI Blueprint Analyzer 2.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/quote"
              className="text-xs px-3.5 py-1.5 rounded-xl bg-concrete-100 border border-concrete-200 text-concrete-700 hover:text-accent-orange font-semibold flex items-center gap-1.5 transition-all"
            >
              <Calculator className="w-3.5 h-3.5" /> Quote Generator
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-orange/10 text-accent-orange text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" /> AI Construction Document Understanding
          </div>
          <h1 className="text-3xl font-black tracking-tight text-charcoal-black">
            AI Blueprint & Structural Plan Analyzer
          </h1>
          <p className="text-xs text-concrete-600">
            Upload architectural drawings, column schedules, or floor plans (PDF/Images) to extract Ready Mix Concrete quantities, grade specifications, and element schedules.
          </p>
        </div>

        {/* Upload Dropzone Workspace */}
        {!analysisResult && (
          <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragActive ? "border-accent-orange bg-accent-orange/5 scale-[0.99]" : "border-concrete-300 hover:border-accent-orange bg-concrete-50/50"
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                className="hidden"
                id="blueprint-file-input"
              />
              <label htmlFor="blueprint-file-input" className="cursor-pointer block space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-accent-orange/10 text-accent-orange flex items-center justify-center mx-auto shadow-sm">
                  <FileUp className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-bold text-charcoal-black">
                    Drag & Drop construction blueprints here, or <span className="text-accent-orange underline">browse files</span>
                  </span>
                  <p className="text-[11px] text-concrete-500 mt-1">
                    Supported formats: PDF, PNG, JPG, JPEG, WEBP (Max 50MB per file)
                  </p>
                </div>
              </label>
            </div>

            {/* Selected File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-concrete-700">Uploaded Documents ({files.length}):</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {files.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-accent-orange shrink-0" />
                        <span className="font-semibold text-charcoal-black truncate">{f.name}</span>
                        <span className="text-[10px] text-concrete-500 font-mono">({Math.round(f.size / 1024)} KB)</span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-concrete-400 hover:text-rose-600 font-bold px-1.5"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleAnalyze}
                disabled={files.length === 0 || isProcessing}
                className="px-8 py-3.5 bg-accent-orange text-white font-extrabold text-sm rounded-xl hover:bg-accent-orange/90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-950/10 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" /> Processing Blueprint...
                  </>
                ) : (
                  <>
                    Analyze Blueprint & Extract Quantities <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Processing Stage Toast */}
            {isProcessing && (
              <div className="p-4 rounded-xl bg-accent-orange/10 border border-accent-orange/30 text-xs text-accent-orange font-bold text-center animate-pulse">
                {processingStage}
              </div>
            )}
          </div>
        )}

        {/* ANALYSIS RESULTS DASHBOARD */}
        {analysisResult && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Action Bar */}
            <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-concrete-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-charcoal-black">{analysisResult.title}</h2>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-accent-orange/15 text-accent-orange font-extrabold border border-accent-orange/30">
                      {analysisResult.documentType}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 font-extrabold border border-emerald-500/30">
                      Confidence: {analysisResult.overallConfidence}
                    </span>
                  </div>
                  <p className="text-xs text-concrete-600 mt-1">
                    Building Type: <strong>{analysisResult.buildingType || 'Residential Structure'}</strong> • Floors: <strong>{analysisResult.floorsDetected}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-concrete-500">Total Calculated RMC Concrete</div>
                  <div className="text-3xl font-black text-accent-orange">{analysisResult.totalConcreteM3} m³</div>
                  <div className="text-[11px] text-concrete-500 mt-0.5">Recommended Grade: {analysisResult.recommendedGrade}</div>
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/blueprints/${analysisResult.id}/report`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-concrete-800 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-concrete-700 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download Analysis PDF
                  </a>
                  <button
                    onClick={() => { setAnalysisResult(null); setFiles([]); }}
                    className="px-4 py-2 rounded-xl bg-concrete-100 text-concrete-700 text-xs font-bold hover:bg-concrete-200 transition-all"
                  >
                    Upload New Blueprint
                  </button>
                </div>

                <button
                  onClick={handleCreateQuoteFromBlueprint}
                  className="px-6 py-2.5 rounded-xl bg-accent-orange text-white text-xs font-extrabold flex items-center gap-1.5 hover:bg-accent-orange/90 transition-all shadow-md"
                >
                  <Calculator className="w-4 h-4" /> Generate Quote from Blueprint <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="bg-white rounded-2xl border border-concrete-200 p-6 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-charcoal-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-orange" /> Executive Summary & Document Understanding
              </h3>
              <p className="text-xs text-concrete-700 leading-relaxed bg-concrete-50 p-3.5 rounded-xl border border-concrete-200">
                {analysisResult.summary}
              </p>
            </div>

            {/* Extracted Structural Elements Table */}
            <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-charcoal-black flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-orange" /> Deterministic Structural Element Quantities
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Element / Label</th>
                      <th className="p-3">Dimensions / Area</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Specified Grade</th>
                      <th className="p-3 text-right">Volume (m³)</th>
                      <th className="p-3 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-concrete-200">
                    {analysisResult.measurements?.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-concrete-50/50 transition-colors">
                        <td className="p-3 font-bold text-charcoal-black">{m.elementCategory}</td>
                        <td className="p-3">{m.label}</td>
                        <td className="p-3 font-mono text-concrete-600">
                          {m.lengthMeters ? `${m.lengthMeters}m x ${m.widthMeters}m x ${m.heightMeters}m` : `${m.areaSqFt} sq ft`}
                        </td>
                        <td className="p-3 font-bold">{m.quantityCount}</td>
                        <td className="p-3 font-extrabold text-charcoal-black">{m.specifiedGrade || 'M25'}</td>
                        <td className="p-3 text-right font-black text-accent-orange">{m.calculatedVolM3} m³</td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.confidence === "HIGH" ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
                          }`}>
                            {m.confidence} (Page {m.sourcePage})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Findings & Risk Notes */}
            {analysisResult.findings?.length > 0 && (
              <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-charcoal-black flex items-center gap-2">
                  <Info className="w-4 h-4 text-accent-orange" /> Identified Notes, Specs & Missing Info
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.findings?.map((f: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-concrete-50 border border-concrete-200 text-xs space-y-1">
                      <div className="font-bold text-charcoal-black flex items-center justify-between">
                        <span>[{f.category}] {f.title}</span>
                        <span className="text-[10px] text-concrete-500 font-mono">Page {f.sourcePage}</span>
                      </div>
                      <p className="text-concrete-600 leading-relaxed">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Engineer Disclaimer */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Human Review & Safety Disclaimer:</strong> This blueprint analysis is generated using AI-assisted document parsing and deterministic arithmetic for Ready Mix Concrete estimation and planning purposes only. It is not a certified structural engineering advice, construction approval, or substitute for review by a qualified professional engineer.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
