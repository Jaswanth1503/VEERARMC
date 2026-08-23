"use client";

import React, { useState, useEffect } from "react";
import { Truck, ShieldCheck } from "lucide-react";

export default function AdminFleetPage() {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fleet");
      if (res.ok) {
        const data = await res.json();
        setTrucks(data.trucks || []);
      }
    } catch (e) {
      console.error("Failed to load fleet", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <Truck className="w-6 h-6 text-accent-orange" /> Fleet & Transit Mixer Management
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Monitor heavy 10-wheel transit mixer trucks, capacity allocation, driver assignments, and maintenance logs.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-concrete-500 text-xs font-medium">Loading fleet data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
                <tr>
                  <th className="p-4">License Plate</th>
                  <th className="p-4">Capacity (m³)</th>
                  <th className="p-4">Driver Name</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-200">
                {trucks.map(t => (
                  <tr key={t.id} className="hover:bg-concrete-50/50 transition-colors">
                    <td className="p-4 font-bold text-charcoal-black">{t.licensePlate}</td>
                    <td className="p-4 font-extrabold text-accent-orange">{t.capacity} m³</td>
                    <td className="p-4">{t.driver?.user?.fullName || "Assigned Fleet Driver"}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700">
                        {t.status}
                      </span>
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
