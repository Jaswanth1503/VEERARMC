"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, Plus, Search, Filter, Download, CheckCircle2, Clock, 
  ArrowRight, Sparkles, AlertCircle, RefreshCw, Eye
} from "lucide-react";

export default function CustomerQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

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
      console.error("Failed to load customer quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      const res = await fetch(`/api/quotes/${quoteId}/accept`, { method: "POST" });
      if (res.ok) {
        alert("🎉 Quote accepted!");
        fetchQuotes();
      }
    } catch (e) {
      alert("Failed to accept quote");
    }
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesStatus = filterStatus === "ALL" || q.status === filterStatus;
    const matchesSearch = 
      q.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.concreteGradeCode?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent-orange" /> Quotations & Estimates
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            View, track, accept, and download PDF copies of your Ready Mix Concrete quotations.
          </p>
        </div>

        <Link
          href="/quote"
          className="px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold rounded-xl hover:bg-accent-orange/90 flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Quote
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["ALL", "GENERATED", "ACCEPTED", "CONVERTED_TO_ORDER", "EXPIRED"].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === st
                  ? "bg-accent-orange text-white shadow-xs"
                  : "bg-concrete-50 text-concrete-600 hover:bg-concrete-100"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by quote # or project..."
            className="pl-9 pr-4 py-2 bg-concrete-50 border border-concrete-200 rounded-xl text-xs focus:outline-none focus:border-accent-orange w-full"
          />
        </div>
      </div>

      {/* Quote List Table */}
      {loading ? (
        <div className="p-12 text-center text-concrete-500 text-xs font-medium">Loading quotations...</div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-concrete-200 p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-concrete-300 mx-auto" />
          <div className="text-sm font-bold text-charcoal-black">No quotations found</div>
          <p className="text-xs text-concrete-500 max-w-sm mx-auto">
            You haven't generated any concrete quotations matching this filter. Click below to create your first quote.
          </p>
          <Link
            href="/quote"
            className="inline-flex px-5 py-2.5 bg-accent-orange text-white text-xs font-bold rounded-xl hover:bg-accent-orange/90"
          >
            Generate Quotation Now
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
                  <th className="p-4">Valid Until</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-200">
                {filteredQuotes.map(q => (
                  <tr key={q.id} className="hover:bg-concrete-50/50 transition-colors">
                    <td className="p-4 font-bold text-charcoal-black">
                      <div className="flex items-center gap-1.5">
                        <span>{q.quoteNumber}</span>
                        {q._count?.versions > 1 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-concrete-200 text-concrete-700 font-mono">
                            v{q.version}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-charcoal-black">{q.projectName}</div>
                      <div className="text-[11px] text-concrete-500">{q.city}, {q.pincode}</div>
                    </td>
                    <td className="p-4 font-bold">{q.concreteGradeCode}</td>
                    <td className="p-4 font-mono">{q.calculatedVolumeM3} m³</td>
                    <td className="p-4 font-black text-accent-orange">
                      ₹{q.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        q.status === "ACCEPTED" || q.status === "CONVERTED_TO_ORDER"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : q.status === "EXPIRED"
                          ? "bg-rose-500/15 text-rose-700"
                          : "bg-amber-500/15 text-amber-700"
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-4 text-concrete-600">
                      {new Date(q.validUntil).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <a
                        href={`/api/quotes/${q.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-concrete-100 text-concrete-700 rounded-lg font-semibold hover:bg-concrete-200 text-[11px] inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </a>

                      {q.status === "GENERATED" && (
                        <button
                          onClick={() => handleAcceptQuote(q.id)}
                          className="px-3 py-1.5 bg-accent-orange text-white rounded-lg font-bold hover:bg-accent-orange/90 text-[11px] inline-flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                        </button>
                      )}
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
