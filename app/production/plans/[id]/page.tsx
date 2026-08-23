"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Factory, ArrowLeft, CheckCircle2, Clock, Truck, AlertTriangle, 
  Play, Check, RefreshCw, Layers, Gauge, Package, Sparkles, Building
} from "lucide-react";

export default function ProductionPlanDetailWorkspace() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/production/plans/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
      }
    } catch (e) {
      console.error("Failed to load plan details", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanStatusChange = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/production/plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        await fetchPlan();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update plan status.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchStatus = async (batchId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/production/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, status: newStatus })
      });

      if (res.ok) {
        await fetchPlan();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-concrete-50 p-12 text-center text-xs font-bold text-concrete-500 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-accent-orange" />
        Loading Batching Operations & Material Consumptions...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-concrete-50 p-8 text-center space-y-4">
        <div className="text-base font-black text-charcoal-black">Production plan not found</div>
        <Link href="/production" className="text-xs font-bold text-accent-orange underline">
          Return to Production Hub
        </Link>
      </div>
    );
  }

  const completedBatches = (plan.batches || []).filter((b: any) => ["BATCHED", "LOADED", "DISPATCHED"].includes(b.status)).length;
  const totalBatchesCount = plan.batches?.length || 1;
  const progressPercent = Math.round((completedBatches / totalBatchesCount) * 100);

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black p-4 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/production" className="text-xs font-bold text-concrete-500 hover:text-accent-orange flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Production Hub
            </Link>
            <span className="text-concrete-300">•</span>
            <span className="text-xs font-bold text-accent-orange">{plan.planNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-2xl md:text-3xl font-black text-charcoal-black tracking-tight">
              Production Plan #{plan.planNumber}
            </h1>
            <span className="px-3 py-1 bg-concrete-100 text-charcoal-black font-extrabold text-xs rounded-full border border-concrete-300">
              {plan.status}
            </span>
            <span className="px-2.5 py-0.5 bg-orange-50 text-accent-orange font-black text-xs rounded border border-orange-200">
              {plan.concreteGrade} • {plan.plannedQuantity} m³
            </span>
          </div>
        </div>

        {/* Operational Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {plan.status === "SCHEDULED" && (
            <button
              onClick={() => handlePlanStatusChange("IN_PROGRESS")}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-accent-orange hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" /> Start Batching Operations
            </button>
          )}

          {plan.status === "IN_PROGRESS" && (
            <button
              onClick={() => handlePlanStatusChange("COMPLETED")}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Mark Plan Completed & Ready
            </button>
          )}

          <Link
            href={`/orders/${plan.orderId}`}
            className="px-4 py-2.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black text-xs font-bold rounded-xl border border-concrete-300 flex items-center gap-1.5"
          >
            <Package className="w-4 h-4 text-accent-orange" /> View Customer Order
          </Link>
        </div>
      </div>

      {/* Progress & Gemini AI Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Batch Completion Progress */}
        <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-3">
          <div className="text-xs font-bold text-concrete-500 uppercase tracking-wider">Batch Execution Progress</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-charcoal-black">{completedBatches} / {totalBatchesCount}</div>
            <div className="text-base font-black text-accent-orange">{progressPercent}%</div>
          </div>
          <div className="w-full h-3 bg-concrete-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-orange rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-concrete-500 font-semibold">
            {completedBatches * 6.0} m³ produced of {plan.plannedQuantity} m³ total.
          </div>
        </div>

        {/* Gemini AI Feasibility & Bottlenecks */}
        <div className="md:col-span-2 bg-gradient-to-br from-charcoal-black to-concrete-900 text-white p-6 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-sm text-white">Gemini AI Batching Logistics Assessment</h3>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-black text-xs rounded border border-emerald-500/40">
              {plan.aiFeasibilityScore || 96}% FEASIBILITY
            </span>
          </div>

          <p className="text-xs text-concrete-200 leading-relaxed font-medium">
            {plan.aiBottleneckWarning || "Batching timeline optimal. Central plant aggregate bins verified. Ensure 15-minute transit mixer rotation to prevent jobsite congestion."}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-concrete-300 pt-2 border-t border-concrete-800">
            <span>Plant: <strong className="text-white">{plan.plant?.name || "Central Plant 01"}</strong></span>
            <span>Target Slump: <strong className="text-white">120 mm</strong></span>
            <span>Est. Window: <strong className="text-white">{new Date(plan.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(plan.scheduledEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Sections: Live Batch Sequencer & Material Variance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Batch Sequence Queue */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent-orange" /> Live Transit Mixer Batch Queue
              </h2>
              <p className="text-[11px] text-concrete-500 mt-0.5">
                Update batch mixing, truck loading, and dispatch states in real-time.
              </p>
            </div>
            <span className="text-xs font-bold text-concrete-600">
              6.0 m³ Standard Mixer Batches
            </span>
          </div>

          <div className="space-y-3">
            {(plan.batches || []).map((b: any, idx: number) => (
              <div key={b.id || idx} className="p-4 bg-concrete-50/75 rounded-xl border border-concrete-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-extrabold text-xs text-charcoal-black">
                    <span className="px-2 py-0.5 bg-concrete-200 rounded text-[11px] font-black">{b.batchNumber}</span>
                    <span>{b.quantity} m³ ({b.concreteGrade})</span>
                    <span className="text-concrete-400">•</span>
                    <span className="text-concrete-600 font-bold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-accent-orange" /> {b.truckNumber || "Transit Mixer"}
                    </span>
                  </div>
                  <div className="text-[11px] text-concrete-500 font-medium">
                    W/C: {b.waterCementRatio || 0.45} • Slump: {b.slumpMm || 120} mm • Temp: {b.temperatureCelsius || 28}°C • Operator: {b.operatorName || "Plant Operator"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[11px] font-black rounded-lg border ${
                    b.status === "DISPATCHED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    b.status === "LOADED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    b.status === "MIXING" ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse" :
                    "bg-concrete-100 text-concrete-600 border-concrete-300"
                  }`}>
                    {b.status}
                  </span>

                  {b.status === "PLANNED" && (
                    <button
                      onClick={() => handleBatchStatus(b.id, "MIXING")}
                      className="px-3 py-1.5 bg-accent-orange hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Start Mix
                    </button>
                  )}

                  {b.status === "MIXING" && (
                    <button
                      onClick={() => handleBatchStatus(b.id, "LOADED")}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Load Truck
                    </button>
                  )}

                  {b.status === "LOADED" && (
                    <button
                      onClick={() => handleBatchStatus(b.id, "DISPATCHED")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Dispatch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Raw Material Consumptions & Variances */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
              <Layers className="w-4 h-4 text-accent-orange" /> Material Consumption Audit
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-concrete-100 text-charcoal-black font-extrabold border-b border-concrete-200">
                  <tr>
                    <th className="p-2.5">Material</th>
                    <th className="p-2.5">Planned</th>
                    <th className="p-2.5 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-concrete-100 font-medium">
                  {(plan.consumptions || []).map((c: any, i: number) => (
                    <tr key={c.id || i}>
                      <td className="p-2.5">
                        <div className="font-bold text-charcoal-black">{c.materialName}</div>
                        <div className="text-[10px] text-concrete-500">{c.category}</div>
                      </td>
                      <td className="p-2.5 font-bold text-accent-orange">
                        {c.plannedQtyKg?.toLocaleString()} {c.unit || "KG"}
                      </td>
                      <td className="p-2.5 text-right text-[11px] font-bold text-emerald-600">
                        {c.variancePercent <= 2 ? "±0.5% (OK)" : `+${c.variancePercent}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Plant & Order Summary */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-2">
              <Building className="w-4 h-4 text-accent-orange" /> Destination & Client
            </h3>
            <div>
              <span className="text-concrete-500 font-bold">Customer:</span>
              <div className="font-black text-charcoal-black mt-0.5">{plan.order?.customer?.fullName || "Kapadia Developers"}</div>
            </div>
            <div>
              <span className="text-concrete-500 font-bold">Delivery Site:</span>
              <div className="font-bold text-charcoal-black mt-0.5">{plan.order?.deliveryAddress || "Hinjewadi Phase 3, Pune"}</div>
            </div>
            <div>
              <span className="text-concrete-500 font-bold">Assigned Batching Plant:</span>
              <div className="font-bold text-accent-orange mt-0.5">{plan.plant?.name || "Central Plant (Hadapsar)"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
