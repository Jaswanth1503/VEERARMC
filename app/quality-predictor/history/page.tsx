"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  History, ArrowLeft, Trash2, Eye, ShieldCheck, ShieldAlert, 
  FlaskConical, Download, Layers, Sparkles, RefreshCw
} from "lucide-react";

export default function QualityHistoryPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    fetchSession();
    fetchHistory();
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

  const fetchHistory = async () => {
    setLoading(true);
    let serverItems: any[] = [];
    let localItems: any[] = [];

    try {
      const localStr = localStorage.getItem("veera_quality_predictions");
      if (localStr) localItems = JSON.parse(localStr);
    } catch (e) {}

    try {
      const res = await fetch("/api/quality/predictions");
      if (res.ok) {
        const data = await res.json();
        serverItems = data.predictions || [];
      }
    } catch (e) {
      console.error("Failed to load quality prediction server history", e);
    }

    // Merge server and local items (deduplicate by id)
    const map = new Map<string, any>();
    localItems.forEach(item => map.set(item.id, item));
    serverItems.forEach(item => map.set(item.id, item));

    const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setPredictions(merged);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prediction record?")) return;
    
    // Remove from local storage
    try {
      const localStr = localStorage.getItem("veera_quality_predictions");
      if (localStr) {
        const localItems = JSON.parse(localStr);
        const updated = localItems.filter((item: any) => item.id !== id);
        localStorage.setItem("veera_quality_predictions", JSON.stringify(updated));
      }
    } catch (e) {}

    // Delete from server if server record
    try {
      await fetch(`/api/quality/predictions/${id}`, { method: "DELETE" });
    } catch (e) {}

    setPredictions(prev => prev.filter(p => p.id !== id));
    if (selectedReport?.id === id) setSelectedReport(null);
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
              <History className="w-3.5 h-3.5" /> Quality History & Analytics
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/quality-predictor"
              className="text-xs px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:bg-purple-700"
            >
              <FlaskConical className="w-3.5 h-3.5" /> New Quality Prediction
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <Link href="/quality-predictor" className="text-xs text-concrete-500 hover:text-purple-700 flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Quality Predictor Workspace
            </Link>
            <h1 className="text-2xl font-black text-charcoal-black">
              Concrete Quality & Strength Predictions History
            </h1>
          </div>

          <button
            onClick={fetchHistory}
            className="px-4 py-2 bg-white border border-concrete-200 rounded-xl text-xs font-bold text-concrete-700 hover:bg-concrete-50 transition-colors flex items-center gap-1.5 self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh History
          </button>
        </div>

        {/* Prediction Table */}
        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-concrete-400 font-medium">
              Loading prediction records...
            </div>
          ) : predictions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FlaskConical className="w-12 h-12 text-concrete-300 mx-auto" />
              <p className="text-sm font-semibold text-charcoal-black">No prediction records found.</p>
              <p className="text-xs text-concrete-500">Run a mix simulation on the Quality Predictor workspace to save historical records.</p>
              <Link
                href="/quality-predictor"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors"
              >
                Go to Predictor
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-concrete-50 border-b border-concrete-200 text-concrete-600 uppercase font-mono tracking-wider">
                  <tr>
                    <th className="p-4">Grade</th>
                    <th className="p-4">Cement / Water</th>
                    <th className="p-4">w/c Ratio</th>
                    <th className="p-4">Predicted / Target</th>
                    <th className="p-4">Margin</th>
                    <th className="p-4">Risk Level</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-concrete-100 font-medium">
                  {predictions.map((p) => {
                    const isPass = p.strengthMarginMpa >= 0;
                    return (
                      <tr key={p.id} className="hover:bg-concrete-50/50 transition-colors">
                        <td className="p-4 font-extrabold text-charcoal-black font-mono">
                          {p.concreteGrade}
                        </td>
                        <td className="p-4 text-concrete-600">
                          {p.cementKg}kg / {p.waterKg}kg
                        </td>
                        <td className="p-4 font-mono font-bold">
                          {p.waterCementRatio.toFixed(2)}
                        </td>
                        <td className="p-4 font-bold text-charcoal-black">
                          {p.predictedStrengthMpa} / {p.targetStrengthMpa} MPa
                        </td>
                        <td className={`p-4 font-bold font-mono ${isPass ? 'text-emerald-700' : 'text-red-600'}`}>
                          {isPass ? `+${p.strengthMarginMpa}` : p.strengthMarginMpa} MPa
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            p.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-800' :
                            p.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {p.riskLevel === 'LOW' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            {p.riskLevel}
                          </span>
                        </td>
                        <td className="p-4 text-concrete-500 font-mono">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedReport(p)}
                            className="p-1.5 hover:bg-concrete-100 rounded-lg text-purple-600 transition-colors"
                            title="View Full Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Record Modal Detail View */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-charcoal-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-concrete-200 max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-purple-700">
                    {selectedReport.concreteGrade} Quality Report
                  </span>
                  <h3 className="text-xl font-black text-charcoal-black">Prediction Findings Details</h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1 text-concrete-400 hover:text-charcoal-black rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-[10px] font-bold text-purple-700 block uppercase">Predicted</span>
                  <span className="text-xl font-black text-purple-950">{selectedReport.predictedStrengthMpa} MPa</span>
                </div>
                <div className="p-3 bg-concrete-50 rounded-xl border border-concrete-200">
                  <span className="text-[10px] font-bold text-concrete-500 block uppercase">Target</span>
                  <span className="text-xl font-black text-charcoal-black">{selectedReport.targetStrengthMpa} MPa</span>
                </div>
                <div className="p-3 bg-concrete-50 rounded-xl border border-concrete-200">
                  <span className="text-[10px] font-bold text-concrete-500 block uppercase">w/c Ratio</span>
                  <span className="text-xl font-black text-charcoal-black">{selectedReport.waterCementRatio}</span>
                </div>
                <div className="p-3 bg-concrete-50 rounded-xl border border-concrete-200">
                  <span className="text-[10px] font-bold text-concrete-500 block uppercase">Risk Level</span>
                  <span className="text-sm font-black text-purple-800">{selectedReport.riskLevel}</span>
                </div>
              </div>

              {selectedReport.summary && (
                <div className="p-3 bg-concrete-50 rounded-xl border border-concrete-200 text-xs">
                  <span className="font-bold text-purple-700 block mb-0.5">Summary:</span>
                  {selectedReport.summary}
                </div>
              )}

              {selectedReport.explanation && (
                <div className="p-3 bg-white rounded-xl border border-concrete-200 text-xs text-concrete-700 space-y-2">
                  <span className="font-bold text-charcoal-black block">AI Reasoning Breakdown:</span>
                  <p>{selectedReport.explanation}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-concrete-100 text-charcoal-black rounded-xl text-xs font-bold hover:bg-concrete-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
