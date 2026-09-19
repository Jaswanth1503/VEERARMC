"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, Navigation, Phone, MapPin, Thermometer, Clock, 
  RefreshCw, CheckCircle2, ChevronRight, Gauge, AlertTriangle, ShieldCheck
} from "lucide-react";
import { PortalDeliveryItem } from "@/lib/portal/types/portal";

export default function PortalDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<PortalDeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<PortalDeliveryItem | null>(null);

  const fetchDeliveries = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/portal/deliveries");
      const json = await res.json();
      if (json.success && json.deliveries) {
        setDeliveries(json.deliveries);
        if (!selectedTrip && json.deliveries.length > 0) {
          setSelectedTrip(json.deliveries[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load deliveries", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 15000); // 15s auto-poll
    return () => clearInterval(interval);
  }, []);

  const activeTrip = selectedTrip || deliveries[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/portal" className="text-xs text-gray-400 hover:text-white">Portal</Link>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-accent-orange font-medium">Live Deliveries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Live Transit Mixer Fleet & GPS Telemetry
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time GPS coordinates, vehicle speed, mix temperature, and slump retention window.
          </p>
        </div>

        <button
          onClick={fetchDeliveries}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-semibold border border-neutral-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-accent-orange" : ""}`} />
          Refresh GPS Stream
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : deliveries.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-gray-400">
          <Truck className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <h3 className="text-lg font-bold text-white mb-1">No Active Mixers In Transit</h3>
          <p className="text-sm">There are currently no transit mixer trips dispatched for your sites.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Transit Mixer Trip Selector List */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Active Transit Dispatches ({deliveries.length})
            </h3>

            {deliveries.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedTrip(d)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  activeTrip?.id === d.id
                    ? "bg-neutral-800/90 border-accent-orange shadow-lg shadow-orange-500/10"
                    : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-accent-orange bg-neutral-950 px-2 py-0.5 rounded">
                    {d.truckNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    d.status === "IN_TRANSIT" ? "bg-sky-500/20 text-sky-400 animate-pulse" :
                    d.status === "LOADING" ? "bg-amber-500/20 text-amber-400" :
                    d.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-gray-400"
                  }`}>
                    {d.status}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h4 className="text-sm font-bold text-white truncate">{d.projectName}</h4>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{d.orderNumber}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-accent-orange" />
                    ETA: <strong className="text-white">{d.etaMinutes} min</strong>
                  </span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-sky-400" />
                    <strong className="text-white">{d.concreteTempC}°C</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right 2 Columns: Deep Telemetry & Live Interactive Route Map */}
          {activeTrip && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Map & Live Geolocation Visualizer */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                {/* Visual Route Simulator Header */}
                <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-accent-orange animate-pulse" />
                    <span className="text-xs font-bold text-white">Live GPS Tracker: {activeTrip.truckNumber}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    GPS: {activeTrip.currentLocation.lat.toFixed(4)}° N, {activeTrip.currentLocation.lng.toFixed(4)}° E
                  </div>
                </div>

                {/* Simulated Radar / Map Viewport */}
                <div className="h-64 sm:h-80 bg-neutral-950 relative flex items-center justify-center overflow-hidden border-b border-neutral-800">
                  {/* Grid lines background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>
                  
                  {/* Plant Origin Marker */}
                  <div className="absolute left-10 top-12 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-neutral-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                      🏢
                    </div>
                    <span className="text-[11px] font-bold text-gray-300 mt-1">Veera Plant #1</span>
                    <span className="text-[9px] text-gray-500">Departure 10:20 AM</span>
                  </div>

                  {/* Route Line */}
                  <div className="absolute left-20 top-16 right-20 h-1 bg-gradient-to-r from-neutral-700 via-accent-orange to-neutral-700 border-t border-dashed border-accent-orange/40"></div>

                  {/* Live Mixer Position Pulse */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-10 flex flex-col items-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-accent-orange/20 animate-ping absolute -inset-0"></div>
                      <div className="w-12 h-12 rounded-2xl bg-accent-orange text-white flex items-center justify-center shadow-lg relative z-10">
                        <Truck className="w-6 h-6" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-accent-orange mt-2 bg-neutral-900/90 px-2 py-0.5 rounded border border-orange-500/30">
                      {activeTrip.speedKmh} km/h • ETA {activeTrip.etaMinutes}m
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{activeTrip.currentLocation.address}</span>
                  </div>

                  {/* Site Destination Marker */}
                  <div className="absolute right-10 bottom-10 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-400 shadow-md">
                      📍
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 mt-1">Pour Site</span>
                    <span className="text-[9px] text-gray-400 truncate max-w-[120px]">{activeTrip.pourDestination}</span>
                  </div>
                </div>

                {/* Telemetry Sensor Dashboard */}
                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-900">
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-accent-orange" />
                      Transit Speed
                    </span>
                    <span className="text-2xl font-bold text-white mt-1 block">
                      {activeTrip.speedKmh} <span className="text-xs text-gray-500 font-normal">km/h</span>
                    </span>
                    <span className="text-[10px] text-emerald-400">Normal Highway Speed</span>
                  </div>

                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-sky-400" />
                      Concrete Temp
                    </span>
                    <span className="text-2xl font-bold text-white mt-1 block">
                      {activeTrip.concreteTempC}°C
                    </span>
                    <span className="text-[10px] text-sky-400">Optimal (&lt; 32°C limit)</span>
                  </div>

                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Slump Window
                    </span>
                    <span className="text-2xl font-bold text-white mt-1 block">
                      {activeTrip.slumpRetentionMinRemaining} <span className="text-xs text-gray-500 font-normal">min</span>
                    </span>
                    <span className="text-[10px] text-emerald-400">Stable Workability</span>
                  </div>

                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Drum Rotation
                    </span>
                    <span className="text-2xl font-bold text-white mt-1 block">
                      3.2 <span className="text-xs text-gray-500 font-normal">RPM</span>
                    </span>
                    <span className="text-[10px] text-gray-400">Agitating Mode</span>
                  </div>
                </div>

                {/* Driver Contact & Dispatch Info */}
                <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-gray-400">Designated Mixer Operator:</span>
                    <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                      {activeTrip.driverName}
                      <span className="text-xs text-gray-400 font-normal">({activeTrip.truckNumber})</span>
                    </div>
                  </div>

                  <a
                    href={`tel:${activeTrip.driverPhone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-orange hover:bg-orange-600 text-white text-xs font-semibold shadow-md transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Driver ({activeTrip.driverPhone})
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
