"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Factory, Plus, RefreshCw, Layers, TrendingUp, Clock, 
  CheckCircle2, AlertTriangle, Truck, Eye, Play, Sparkles, Filter, 
  Gauge, Package, ShieldCheck
} from "lucide-react";

export default function ProductionManagementHub() {
  const [plans, setPlans] = useState<any[]>([]);
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [plantFilter, setPlantFilter] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, [statusFilter, plantFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let plansUrl = "/api/production/plans?";
      if (statusFilter !== "ALL") plansUrl += `status=${statusFilter}&`;
      if (plantFilter !== "ALL") plansUrl += `plantId=${plantFilter}&`;

      const [plansRes, plantsRes] = await Promise.all([
        fetch(plansUrl),
        fetch("/api/plants")
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.plans || []);
      }
      if (plantsRes.ok) {
        const plantsData = await plantsRes.json();
        setPlants(plantsData.plants || []);
      }
    } catch (e) {
      console.error("Failed to load production data", e);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const totalVolume = plans.reduce((acc, p) => acc + (p.plannedQuantity || 0), 0);
  const inProgressPlans = plans.filter(p => p.status === "IN_PROGRESS").length;
  const completedPlans = plans.filter(p => p.status === "COMPLETED").length;
  const scheduledPlans = plans.filter(p => ["PLANNED", "SCHEDULED", "READY"].includes(p.status)).length;
  const totalBatches = plans.reduce((acc, p) => acc + (p.batches?.length || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-extrabold text-[11px] rounded-full border border-amber-200 flex items-center gap-1"><Play className="w-3 h-3 text-amber-600 fill-amber-600 animate-pulse" /> In Progress</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case "READY":
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold text-[11px] rounded-full border border-blue-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Ready</span>;
      case "SCHEDULED":
      case "PLANNED":
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-extrabold text-[11px] rounded-full border border-purple-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled</span>;
      default:
        return <span className="px-2.5 py-1 bg-concrete-100 text-concrete-700 font-extrabold text-[11px] rounded-full border border-concrete-300">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black p-4 md:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-accent-orange/10 text-accent-orange font-black text-xs rounded-lg tracking-wider">
              OPERATIONAL ENGINE
            </span>
            <span className="text-xs text-concrete-500 font-semibold">• Veera RMC 2.0</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-charcoal-black mt-2 tracking-tight">
            Production Plant Management System
          </h1>
          <p className="text-xs md:text-sm text-concrete-600 mt-1">
            Real-time batching scheduler, plant capacity utilization, IS 10262 material tracking, and AI demand forecasting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-xl text-xs font-bold transition-all border border-concrete-200"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/production/forecast"
            className="px-4 py-2.5 bg-white border border-concrete-300 text-charcoal-black hover:bg-concrete-50 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> AI Demand Forecast
          </Link>
          <Link
            href="/orders"
            className="px-4 py-2.5 bg-white border border-concrete-300 text-charcoal-black hover:bg-concrete-50 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm"
          >
            <Package className="w-4 h-4 text-accent-orange" /> Approved Orders
          </Link>
          <Link
            href="/production/plans/new"
            className="px-5 py-2.5 bg-accent-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-accent-orange/20"
          >
            <Plus className="w-4 h-4" /> Schedule Production Plan
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-concrete-200 shadow-sm">
          <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">Scheduled Volume</div>
          <div className="text-2xl font-black text-accent-orange mt-1">{totalVolume.toFixed(1)} <span className="text-xs font-bold text-concrete-600">m³</span></div>
          <div className="text-[10px] text-concrete-400 mt-1 font-semibold">Active batching load</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">In Production</div>
          <div className="text-2xl font-black text-amber-800 mt-1">{inProgressPlans}</div>
          <div className="text-[10px] text-amber-600 mt-1 font-semibold">Live mixing on plant scale</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Ready / Scheduled</div>
          <div className="text-2xl font-black text-purple-800 mt-1">{scheduledPlans}</div>
          <div className="text-[10px] text-purple-600 mt-1 font-semibold">Awaiting batch cycle</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Completed Plans</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{completedPlans}</div>
          <div className="text-[10px] text-emerald-600 mt-1 font-semibold">Batched & Dispatched</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-concrete-200 shadow-sm col-span-2 md:col-span-1">
          <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">Total Mixer Batches</div>
          <div className="text-2xl font-black text-charcoal-black mt-1">{totalBatches}</div>
          <div className="text-[10px] text-concrete-400 mt-1 font-semibold">Transit mixer loads</div>
        </div>
      </div>

      {/* Real-time Batching Plant Capacity Gauges */}
      <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2">
            <Gauge className="w-4 h-4 text-accent-orange" /> Real-time Batching Plant Capacities & Load
          </h2>
          <span className="text-xs text-concrete-500 font-bold">Pune Central Grid</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plants.map(p => (
            <div key={p.plantId} className="p-4 bg-concrete-50/75 rounded-xl border border-concrete-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xs text-charcoal-black flex items-center gap-1.5">
                    <Factory className="w-3.5 h-3.5 text-accent-orange" /> {p.plantName}
                  </div>
                  <div className="text-[10px] text-concrete-500 font-medium">{p.plantCode} • {p.capacityPerHour} m³/hr rated</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                  {p.status}
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-concrete-600">Daily Load:</span>
                  <span className={p.utilizationPercent > 80 ? "text-red-600 font-black" : "text-charcoal-black"}>
                    {p.utilizedCapacityM3} / {p.dailyCapacityM3} m³ ({p.utilizationPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-concrete-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      p.utilizationPercent > 80 ? "bg-red-500" : p.utilizationPercent > 60 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${p.utilizationPercent}%` }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-concrete-500 flex items-center justify-between pt-1 border-t border-concrete-200/60 font-semibold">
                <span>Available Today:</span>
                <span className="text-emerald-700 font-bold">{p.availableCapacityM3} m³</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-concrete-500 flex items-center gap-1 px-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {["ALL", "IN_PROGRESS", "READY", "SCHEDULED", "COMPLETED"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                statusFilter === st
                  ? "bg-accent-orange text-white shadow-sm"
                  : "bg-concrete-50 border border-concrete-200 text-concrete-600 hover:bg-concrete-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <select
          value={plantFilter}
          onChange={e => setPlantFilter(e.target.value)}
          className="p-2 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-concrete-700 focus:outline-none"
        >
          <option value="ALL">All Batching Plants</option>
          {plants.map(p => (
            <option key={p.plantId} value={p.plantId}>{p.plantName}</option>
          ))}
        </select>
      </div>

      {/* Production Plans Table */}
      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-concrete-500 text-xs font-semibold flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-accent-orange" />
            Loading production plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Factory className="w-12 h-12 text-concrete-300 mx-auto" />
            <div className="text-sm font-black text-charcoal-black">No production plans found</div>
            <p className="text-xs text-concrete-500 max-w-sm mx-auto">
              Schedule a production plan for an approved customer order to start batching.
            </p>
            <Link
              href="/production/plans/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-orange text-white text-xs font-extrabold rounded-xl shadow-sm hover:bg-orange-600"
            >
              <Plus className="w-3.5 h-3.5" /> Schedule First Plan
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100/75 text-charcoal-black font-extrabold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Plan Number</th>
                  <th className="p-4">Order & Client</th>
                  <th className="p-4">Assigned Plant</th>
                  <th className="p-4">Grade & Volume</th>
                  <th className="p-4">Scheduled Window</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100">
                {plans.map(p => (
                  <tr key={p.id} className="hover:bg-concrete-50/75 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-charcoal-black flex items-center gap-1.5">
                        <Factory className="w-3.5 h-3.5 text-accent-orange" />
                        {p.planNumber}
                      </div>
                      <div className="text-[10px] text-concrete-400 mt-0.5 font-medium">
                        {p.batches?.length || 0} Mixer Batches
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-charcoal-black">{p.order?.customer?.fullName || "Commercial Order"}</div>
                      <div className="text-[10px] text-concrete-500 font-medium truncate max-w-xs">{p.order?.orderNumber || "Direct Plan"}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-charcoal-black">{p.plant?.name || "Central Plant 01"}</div>
                      <div className="text-[10px] text-concrete-500">{p.plant?.city || "Pune"}</div>
                    </td>

                    <td className="p-4">
                      <span className="px-1.5 py-0.5 bg-orange-50 text-accent-orange border border-orange-200 rounded font-black text-[10px]">
                        {p.concreteGrade}
                      </span>
                      <span className="font-extrabold text-charcoal-black ml-1.5">{p.plannedQuantity} m³</span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-charcoal-black">
                        {new Date(p.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-concrete-500">
                        {new Date(p.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(p.scheduledEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="p-4">
                      {getStatusBadge(p.status)}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/production/plans/${p.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-concrete-100 hover:bg-concrete-200 font-bold text-charcoal-black rounded-lg transition-all border border-concrete-300 text-xs shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-accent-orange" /> Batch Control
                      </Link>
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
