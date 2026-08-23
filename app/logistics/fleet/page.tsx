"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, Users, ArrowLeft, Plus, RefreshCw, Phone, ShieldCheck, 
  Fuel, Gauge, CheckCircle2, AlertTriangle, Layers, MapPin
} from "lucide-react";

export default function FleetAndDriverManagement() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"VEHICLES" | "DRIVERS">("VEHICLES");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, dRes] = await Promise.all([
        fetch("/api/logistics/vehicles"),
        fetch("/api/logistics/drivers")
      ]);

      if (vRes.ok) {
        const vData = await vRes.json();
        setVehicles(vData.vehicles || []);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDrivers(dData.drivers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/logistics" className="text-xs font-bold text-concrete-500 hover:text-accent-orange flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Logistics Hub
            </Link>
            <span className="text-concrete-300">•</span>
            <span className="text-xs font-bold text-accent-orange">Fleet Roster</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-charcoal-black tracking-tight">
            Fleet Vehicles & Professional Drivers
          </h1>
          <p className="text-xs md:text-sm text-concrete-600">
            Manage transit mixers, boom pumps, driver licenses, and vehicle service readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-concrete-100 p-1 rounded-xl border border-concrete-200">
            <button
              onClick={() => setActiveTab("VEHICLES")}
              className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                activeTab === "VEHICLES" ? "bg-accent-orange text-white shadow-sm" : "text-concrete-600"
              }`}
            >
              Transit Mixers ({vehicles.length})
            </button>
            <button
              onClick={() => setActiveTab("DRIVERS")}
              className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                activeTab === "DRIVERS" ? "bg-accent-orange text-white shadow-sm" : "text-concrete-600"
              }`}
            >
              Drivers Roster ({drivers.length})
            </button>
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-xl text-xs font-bold transition-all border border-concrete-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs font-bold text-concrete-500 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-accent-orange" />
          Loading fleet data...
        </div>
      ) : activeTab === "VEHICLES" ? (
        /* Vehicles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(v => (
            <div key={v.id} className="bg-white p-5 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-charcoal-black flex items-center gap-2">
                    <Truck className="w-4 h-4 text-accent-orange" />
                    {v.vehicleNumber}
                  </div>
                  <div className="text-[11px] text-concrete-500 font-semibold">{v.vehicleType} • {v.capacity} m³ Drum</div>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border ${
                  v.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  v.status === "IN_TRANSIT" ? "bg-amber-50 text-amber-800 border-amber-200" :
                  v.status === "LOADING" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  "bg-concrete-100 text-concrete-600 border-concrete-300"
                }`}>
                  {v.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 bg-concrete-50 rounded-xl border border-concrete-200/75">
                  <span className="text-[10px] text-concrete-400 font-bold block">Fuel Level</span>
                  <span className="font-extrabold text-charcoal-black flex items-center gap-1 mt-0.5">
                    <Fuel className="w-3.5 h-3.5 text-emerald-600" /> {v.fuelLevelPercent}%
                  </span>
                </div>
                <div className="p-2.5 bg-concrete-50 rounded-xl border border-concrete-200/75">
                  <span className="text-[10px] text-concrete-400 font-bold block">Odometer</span>
                  <span className="font-extrabold text-charcoal-black flex items-center gap-1 mt-0.5">
                    <Gauge className="w-3.5 h-3.5 text-sky-600" /> {v.odometerKm?.toLocaleString()} km
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-concrete-600 flex items-center gap-1.5 pt-2 border-t border-concrete-100 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                <span className="truncate">{v.currentLocation || "Central Batching Plant"}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Drivers Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map(d => (
            <div key={d.id} className="bg-white p-5 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-charcoal-black flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent-orange" />
                    {d.name}
                  </div>
                  <div className="text-[11px] text-concrete-500 font-semibold">ID: {d.employeeId} • {d.experienceYears} Years Exp</div>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border ${
                  d.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  d.status === "ON_TRIP" ? "bg-amber-50 text-amber-800 border-amber-200" :
                  "bg-concrete-100 text-concrete-600 border-concrete-300"
                }`}>
                  {d.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-concrete-500">Phone Contact:</span>
                  <span className="font-bold text-charcoal-black flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" /> {d.phone}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-concrete-500">Driving License:</span>
                  <span className="font-bold text-charcoal-black">{d.licenseNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-concrete-500">Performance Rating:</span>
                  <span className="font-black text-amber-500">★ {d.rating || 4.8} / 5.0</span>
                </div>
              </div>

              <div className="text-[11px] text-concrete-500 pt-2 border-t border-concrete-100 flex items-center justify-between font-semibold">
                <span>Assigned Mixer:</span>
                <span className="font-bold text-charcoal-black">{d.assignedVehicle?.vehicleNumber || "Rotational"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
