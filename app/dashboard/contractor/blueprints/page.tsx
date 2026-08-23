"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileUp, FileText, Download, HardHat } from "lucide-react";

export default function ContractorBlueprintsPage() {
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
      console.error("Failed to load contractor blueprint analyses", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <HardHat className="w-6 h-6 text-accent-orange" /> Contractor Blueprint & Structural Workspace
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Analyze structural plans, column schedules, and export volume estimates directly to project quotes.
          </p>
        </div>

        <Link
          href="/blueprint-analyzer"
          className="px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold rounded-xl hover:bg-accent-orange/90 flex items-center gap-2 shadow-md transition-all"
        >
          <FileUp className="w-4 h-4" /> Upload Blueprint Drawing
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-concrete-500 text-xs font-medium">Loading blueprint records...</div>
      ) : analyses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-concrete-200 p-12 text-center space-y-4">
          <FileUp className="w-12 h-12 text-concrete-300 mx-auto" />
          <div className="text-sm font-bold text-charcoal-black">No project blueprints uploaded yet</div>
          <p className="text-xs text-concrete-500 max-w-sm mx-auto">
            Upload structural drawings to extract column, beam, and slab quantities.
          </p>
          <Link
            href="/blueprint-analyzer"
            className="inline-flex px-5 py-2.5 bg-accent-orange text-white text-xs font-bold rounded-xl hover:bg-accent-orange/90"
          >
            Upload Drawing Now
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Title / Document</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Estimated Volume</th>
                  <th className="p-4">Grade</th>
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
        </div>
      )}
    </div>
  );
}
