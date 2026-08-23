"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, Plus, RefreshCw, Navigation, Clock, CheckCircle2, 
  AlertTriangle, MapPin, Gauge, ShieldCheck, Play, Eye, Filter, Sparkles, Users
} from "lucide-react";

export default function LogisticsFleetHub() {
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let tripsUrl = "/api/logistics/trips?";
      if (statusFilter !== "ALL") tripsUrl += `status=${statusFilter}&`;

      const [tripsRes, vehRes] = await Promise.all([
        fetch(tripsUrl),
        fetch("/api/logistics/vehicles")
      ]);

      if (tripsRes.ok) {
        const tData = await tripsRes.json();
        setTrips(tData.trips || []);
      }
      if (vehRes.ok) {
        const vData = await vehRes.json();
        setVehicles(vData.vehicles || []);
      }
    } catch (e) {
      console.error("Failed to load logistics data", e);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const inTransitTrips = trips.filter(t => t.status === "IN_TRANSIT").length;
  const arrivedTrips = trips.filter(t => t.status === "ARRIVED_AT_SITE" || t.status === "UNLOADING").length;
  const deliveredTrips = trips.filter(t => t.status === "DELIVERED" || t.status === "CONFIRMED").length;
  const activeVehicles = vehicles.filter(v => v.status === "IN_TRANSIT" || v.status === "LOADING" || v.status === "UNLOADING").length;
  const availableVehicles = vehicles.filter(v => v.status === "AVAILABLE").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_TRANSIT":
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-extrabold text-[11px] rounded-full border border-amber-200 flex items-center gap-1"><Truck className="w-3 h-3 text-amber-600 animate-bounce" /> In Transit</span>;
      case "ARRIVED_AT_SITE":
      case "UNLOADING":
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold text-[11px] rounded-full border border-blue-200 flex items-center gap-1"><MapPin className="w-3 h-3" /> At Jobsite</span>;
      case "DELIVERED":
      case "CONFIRMED":
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case "DISPATCHED":
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-extrabold text-[11px] rounded-full border border-purple-200 flex items-center gap-1"><Play className="w-3 h-3" /> Dispatched</span>;
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
              FLEET INTELLIGENCE
            </span>
            <span className="text-xs text-concrete-500 font-semibold">• Veera RMC 2.0</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-charcoal-black mt-2 tracking-tight">
            Logistics & Fleet Intelligence System
          </h1>
          <p className="text-xs md:text-sm text-concrete-600 mt-1">
            Real-time GPS transit tracking, dynamic ETA prediction, AI route optimization, and customer delivery confirmations.
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
            href="/logistics/fleet"
            className="px-4 py-2.5 bg-white border border-concrete-300 text-charcoal-black hover:bg-concrete-50 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm"
          >
            <Users className="w-4 h-4 text-sky-500" /> Fleet & Drivers Roster
          </Link>
          <Link
            href="/logistics/trips/new"
            className="px-5 py-2.5 bg-accent-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-accent-orange/20"
          >
            <Plus className="w-4 h-4" /> Dispatch New Trip
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">In Transit</div>
          <div className="text-2xl font-black text-amber-800 mt-1">{inTransitTrips}</div>
          <div className="text-[10px] text-amber-600 mt-1 font-semibold">Active mixer loads on road</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">At Jobsite / Pouring</div>
          <div className="text-2xl font-black text-blue-800 mt-1">{arrivedTrips}</div>
          <div className="text-[10px] text-blue-600 mt-1 font-semibold">Unloading at site pump</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Delivered Today</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{deliveredTrips}</div>
          <div className="text-[10px] text-emerald-600 mt-1 font-semibold">Customer signed batches</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-concrete-200 shadow-sm">
          <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">Active Fleet Usage</div>
          <div className="text-2xl font-black text-charcoal-black mt-1">{activeVehicles} <span className="text-xs font-bold text-concrete-400">/ {vehicles.length}</span></div>
          <div className="text-[10px] text-concrete-400 mt-1 font-semibold">Mixers & boom pumps</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-concrete-200 shadow-sm col-span-2 md:col-span-1">
          <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">Available at Plant</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{availableVehicles}</div>
          <div className="text-[10px] text-concrete-400 mt-1 font-semibold">Ready for next batch</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-concrete-500 flex items-center gap-1 px-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {["ALL", "IN_TRANSIT", "ARRIVED_AT_SITE", "DELIVERED", "ASSIGNED"].map(st => (
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
      </div>

      {/* Delivery Trips Table */}
      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-concrete-500 text-xs font-semibold flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-accent-orange" />
            Loading live fleet tracking & delivery trips...
          </div>
        ) : trips.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Truck className="w-12 h-12 text-concrete-300 mx-auto" />
            <div className="text-sm font-black text-charcoal-black">No delivery trips found</div>
            <p className="text-xs text-concrete-500 max-w-sm mx-auto">
              Dispatch a transit mixer trip for an approved order or production batch.
            </p>
            <Link
              href="/logistics/trips/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-orange text-white text-xs font-extrabold rounded-xl shadow-sm hover:bg-orange-600"
            >
              <Plus className="w-3.5 h-3.5" /> Dispatch First Trip
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100/75 text-charcoal-black font-extrabold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Trip Number</th>
                  <th className="p-4">Client & Destination</th>
                  <th className="p-4">Assigned Mixer & Driver</th>
                  <th className="p-4">Grade & Volume</th>
                  <th className="p-4">ETA & Route</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100">
                {trips.map(t => (
                  <tr key={t.id} className="hover:bg-concrete-50/75 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-charcoal-black flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-accent-orange" />
                        {t.tripNumber}
                      </div>
                      <div className="text-[10px] text-concrete-400 mt-0.5 font-medium">
                        {t.originPlant || "Central Plant 01"}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-charcoal-black">{t.order?.customer?.fullName || "Commercial Client"}</div>
                      <div className="text-[10px] text-concrete-500 font-medium truncate max-w-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-concrete-400 shrink-0" />
                        {t.destinationAddress}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-charcoal-black flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-accent-orange" /> {t.vehicle?.vehicleNumber || "MH-12-RN-8821"}
                      </div>
                      <div className="text-[10px] text-concrete-500">{t.driver?.name || "Assigned Driver"}</div>
                    </td>

                    <td className="p-4">
                      <span className="px-1.5 py-0.5 bg-orange-50 text-accent-orange border border-orange-200 rounded font-black text-[10px]">
                        {t.concreteGrade}
                      </span>
                      <span className="font-extrabold text-charcoal-black ml-1.5">{t.quantityM3} m³</span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-charcoal-black flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {new Date(t.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] text-concrete-500 truncate max-w-[140px]">
                        {t.route?.recommendedRouteName || `${t.distanceKm} km transit`}
                      </div>
                    </td>

                    <td className="p-4">
                      {getStatusBadge(t.status)}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/logistics/trips/${t.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-concrete-100 hover:bg-concrete-200 font-bold text-charcoal-black rounded-lg transition-all border border-concrete-300 text-xs shadow-sm"
                      >
                        <Navigation className="w-3.5 h-3.5 text-accent-orange" /> Live GPS
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
