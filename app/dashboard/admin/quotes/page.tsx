"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, Search, Download, CheckCircle2, XCircle, ArrowRight, 
  BarChart3, ShieldCheck, Edit3, Eye, DollarSign
} from "lucide-react";

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      console.error("Failed to load admin quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToOrder = async (quoteId: string) => {
    try {
      const res = await fetch(`/api/quotes/${quoteId}/convert`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        alert(`✅ Order ${data.order.orderNumber} created!`);
        fetchQuotes();
      }
    } catch (e) {
      alert("Failed to convert quote to order.");
    }
  };

  const totalValue = quotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0);
  const acceptedCount = quotes.filter(q => q.status === "ACCEPTED" || q.status === "CONVERTED_TO_ORDER").length;
  const conversionRate = quotes.length > 0 ? Math.round((acceptedCount / quotes.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-accent-orange" /> Admin & Sales Quotation Management
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Review AI generated quotes, inspect deterministic pricing breakdowns, and manage customer approvals.
          </p>
        </div>

        <Link
          href="/quote"
          className="px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold rounded-xl hover:bg-accent-orange/90 flex items-center gap-2 shadow-md transition-all"
        >
          Create Manual Quote
        </Link>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-sm">
          <div className="text-xs font-bold text-concrete-500">Total Quotes Generated</div>
          <div className="text-2xl font-black text-charcoal-black mt-1">{quotes.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-sm">
          <div className="text-xs font-bold text-concrete-500">Total Quotation Value</div>
          <div className="text-2xl font-black text-accent-orange mt-1">₹{totalValue.toLocaleString("en-IN")}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-sm">
          <div className="text-xs font-bold text-concrete-500">Accepted Quotes</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{acceptedCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-sm">
          <div className="text-xs font-bold text-concrete-500">Quote-to-Order Conversion</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{conversionRate}%</div>
        </div>
      </div>

      {/* Table & Controls */}
      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-concrete-200 flex justify-between items-center">
          <span className="font-bold text-xs text-charcoal-black">All Enterprise Quotations</span>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter by quote #, customer..."
              className="pl-9 pr-4 py-1.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-concrete-500 text-xs font-medium">Loading quotations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Quote Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Grade & Volume</th>
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
                      <div className="font-semibold text-charcoal-black">{q.customerName}</div>
                      <div className="text-[11px] text-concrete-500">{q.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-charcoal-black">{q.projectName}</div>
                      <div className="text-[11px] text-concrete-500">{q.city}</div>
                    </td>
                    <td className="p-4 font-bold">
                      {q.concreteGradeCode} • <span className="font-mono text-concrete-600">{q.calculatedVolumeM3} m³</span>
                    </td>
                    <td className="p-4 font-black text-accent-orange">
                      ₹{q.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        q.status === "ACCEPTED" || q.status === "CONVERTED_TO_ORDER"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-amber-500/15 text-amber-700"
                      }`}>
                        {q.status}
                      </span>
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

                      {(q.status === "ACCEPTED" || q.status === "GENERATED") && (
                        <button
                          onClick={() => handleConvertToOrder(q.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 text-[11px] inline-flex items-center gap-1 shadow-xs"
                        >
                          Convert to Order <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
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
