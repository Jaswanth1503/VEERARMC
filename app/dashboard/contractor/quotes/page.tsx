"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, Search, Download, CheckCircle2, Building, HardHat } from "lucide-react";

export default function ContractorQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quotes");
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes || []);
      }
    } catch (err) {
      console.error("Failed to load contractor quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <HardHat className="w-6 h-6 text-accent-orange" /> Contractor Project Quotes
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Manage bulk project structural quotations, pour schedules, and official pricing proposals.
          </p>
        </div>

        <Link
          href="/quote"
          className="px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold rounded-xl hover:bg-accent-orange/90 flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Create Project Quote
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-concrete-500 text-xs font-medium">Loading project quotes...</div>
      ) : quotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-concrete-200 p-12 text-center space-y-4">
          <Building className="w-12 h-12 text-concrete-300 mx-auto" />
          <div className="text-sm font-bold text-charcoal-black">No project quotes found</div>
          <p className="text-xs text-concrete-500 max-w-sm mx-auto">
            Create multi-pour project quotations for your active commercial or residential contracts.
          </p>
          <Link
            href="/quote"
            className="inline-flex px-5 py-2.5 bg-accent-orange text-white text-xs font-bold rounded-xl hover:bg-accent-orange/90"
          >
            Create Quote Now
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Quote Number</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Volume</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-200">
                {quotes.map(q => (
                  <tr key={q.id} className="hover:bg-concrete-50/50 transition-colors">
                    <td className="p-4 font-bold text-charcoal-black">{q.quoteNumber}</td>
                    <td className="p-4">
                      <div className="font-semibold text-charcoal-black">{q.projectName}</div>
                      <div className="text-[11px] text-concrete-500">{q.siteAddress}</div>
                    </td>
                    <td className="p-4 font-bold">{q.concreteGradeCode}</td>
                    <td className="p-4 font-mono">{q.calculatedVolumeM3} m³</td>
                    <td className="p-4 font-black text-accent-orange">₹{q.totalAmount?.toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-accent-orange/15 text-accent-orange">
                        {q.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={`/api/quotes/${q.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-concrete-100 text-concrete-700 rounded-lg font-semibold hover:bg-concrete-200 text-[11px] inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
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
