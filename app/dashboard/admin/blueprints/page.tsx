"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileUp, FileText, Download, ShieldCheck, Eye, Sparkles } from "lucide-react";

export default function AdminBlueprintsPage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blueprints");
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data.analyses || []);
      }
    } catch (e) {
      console.error("Failed to load admin blueprint records", e);
    } finally {
      setLoading(false);
    }
  };

  const totalVolume = analyses.reduce((acc, a) => acc + (a.totalConcreteM3 || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-accent-orange" /> Enterprise Blueprint Analytics
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Review uploaded structural drawings, extracted quantities, and AI document findings across all projects.
          </p>
        </div>

        <Link
          href="/blueprint-analyzer"
          className="px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold rounded-xl hover:bg-accent-orange/90 flex items-center gap-2 shadow-md transition-all"
        >
          <FileUp className="w-4 h-4" /> Upload Document
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-sm">
          <div className="text-xs font-bold text-concrete-500">Total Analyzed Documents</div>
          <div className="text-2xl font-black text-charcoal-black mt-1">{analyses.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-sm">
          <div className="text-xs font-bold text-concrete-500">Total Extracted Concrete Volume</div>
          <div className="text-2xl font-black text-accent-orange mt-1">{Math.round(totalVolume)} m³</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-sm">
          <div className="text-xs font-bold text-concrete-500">Average Processing Time</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">&lt; 3.5s</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-concrete-500 text-xs font-medium">Loading blueprint records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Title / Document</th>
                  <th className="p-4">Document Type</th>
                  <th className="p-4">Extracted Volume</th>
                  <th className="p-4">Grade Spec</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-200">
                {analyses.map(a => (
                  <tr key={a.id} className="hover:bg-concrete-50/50 transition-colors">
                    <td className="p-4 font-bold text-charcoal-black">{a.title}</td>
                    <td className="p-4">{a.documentType}</td>
                    <td className="p-4 font-black text-accent-orange">{a.totalConcreteM3} m³</td>
                    <td className="p-4 font-bold">{a.recommendedGrade || 'M25'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700">
                        {a.overallConfidence}
                      </span>
                    </td>
                    <td className="p-4 text-concrete-600">{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-4 text-right">
                      <a
                        href={`/api/blueprints/${a.id}/report`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-concrete-100 text-concrete-700 rounded-lg font-semibold hover:bg-concrete-200 text-[11px] inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF Report
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
