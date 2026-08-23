"use client";

import React from "react";
import { BarChart3, Download, TrendingUp, Package, Truck, ShieldCheck } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent-orange" /> Operational & Volume Analytics
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Executive operational reporting, concrete grade breakdown, batching plant yield, and revenue metrics.
          </p>
        </div>

        <button 
          onClick={() => alert("Export Executive PDF feature is scheduled for a future release.")}
          className="px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold rounded-xl hover:bg-accent-orange/90 flex items-center gap-2 shadow-md transition-all"
        >
          <Download className="w-4 h-4" /> Export Executive PDF
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-concrete-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-concrete-500">Total Monthly Volume Dispatched</div>
          <div className="text-3xl font-black text-accent-orange">14,850 m³</div>
          <div className="text-[11px] text-emerald-600 font-bold">+18.5% vs previous month</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-concrete-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-concrete-500">Top Demanded Grade</div>
          <div className="text-3xl font-black text-charcoal-black">M25 Grade</div>
          <div className="text-[11px] text-concrete-500">42% of total production volume</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-concrete-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-concrete-500">Fleet On-Time Delivery Rate</div>
          <div className="text-3xl font-black text-emerald-600">98.4%</div>
          <div className="text-[11px] text-concrete-500">Avg transit delay &lt; 8 mins</div>
        </div>
      </div>
    </div>
  );
}
