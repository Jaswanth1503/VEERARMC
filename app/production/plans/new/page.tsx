"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Factory, ArrowLeft, Send, Sparkles, Truck, CheckCircle2, 
  Calendar, Clock, AlertTriangle, Layers, Gauge, Package
} from "lucide-react";
import { MaterialCalculationService } from "@/lib/production/services/material-calculation.service";

export default function ScheduleProductionPlanWizard() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [plants, setPlants] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedPlantId, setSelectedPlantId] = useState<string>("");
  const [plannedQuantity, setPlannedQuantity] = useState<number>(30);
  const [concreteGrade, setConcreteGrade] = useState<string>("M25");
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [scheduledStartTime, setScheduledStartTime] = useState<string>("08:00");
  const [notes, setNotes] = useState<string>("High priority morning batch. Maintain 120mm slump.");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setFetching(true);
    try {
      const [ordersRes, plantsRes] = await Promise.all([
        fetch("/api/orders?status=APPROVED"),
        fetch("/api/plants")
      ]);

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData.orders || []);
        if (oData.orders && oData.orders.length > 0) {
          const first = oData.orders[0];
          setSelectedOrderId(first.id);
          setPlannedQuantity(first.totalQuantity || first.quantity || 30);
          setConcreteGrade(first.concreteGrade || "M25");
        }
      }

      if (plantsRes.ok) {
        const pData = await plantsRes.json();
        setPlants(pData.plants || []);
        if (pData.plants && pData.plants.length > 0) {
          setSelectedPlantId(pData.plants[0].plantId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find(o => o.id === orderId);
    if (ord) {
      setPlannedQuantity(ord.totalQuantity || ord.quantity || 30);
      setConcreteGrade(ord.concreteGrade || "M25");
    }
  };

  // Calculations
  const batchSizeM3 = 6.0;
  const totalMixers = Math.ceil(plannedQuantity / batchSizeM3);
  const materials = MaterialCalculationService.calculateMaterialRequirements(concreteGrade, plannedQuantity);
  const totalCost = materials.reduce((acc, m) => acc + m.estimatedCost, 0);

  const selectedPlant = plants.find(p => p.plantId === selectedPlantId);
  const hasCapacity = selectedPlant ? (selectedPlant.availableCapacityM3 >= plannedQuantity) : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return alert("Please select an approved order.");
    if (!selectedPlantId) return alert("Please select a batching plant.");

    setLoading(true);
    try {
      const startDateTime = new Date(`${scheduledDate}T${scheduledStartTime}`);
      const durationMins = totalMixers * 20;
      const endDateTime = new Date(startDateTime.getTime() + durationMins * 60 * 1000);

      const res = await fetch("/api/production/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId,
          plantId: selectedPlantId,
          plannedQuantity: Number(plannedQuantity),
          concreteGrade,
          scheduledDate,
          scheduledStartTime: startDateTime,
          scheduledEndTime: endDateTime,
          notes
        })
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/production/plans/${data.plan.id}`);
      } else {
        alert(data.error || "Failed to schedule production plan.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/production"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-concrete-600 hover:text-accent-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Production Hub
          </Link>
          <span className="text-xs font-extrabold text-concrete-400">IS 10262 Batch Planning</span>
        </div>

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm">
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <Factory className="w-6 h-6 text-accent-orange" /> Schedule Concrete Batching Plan
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Assign batching plant, calculate raw material consumption (IS 10262), and generate transit mixer batch sequences.
          </p>
        </div>

        {fetching ? (
          <div className="bg-white p-12 rounded-2xl border border-concrete-200 text-center text-xs font-bold text-concrete-500">
            Loading approved orders and plant capacities...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Approved Order */}
            <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
                <Package className="w-4 h-4 text-accent-orange" /> 1. Select Approved Customer Order
              </h2>

              {orders.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  No orders currently in APPROVED status. You can schedule direct production or <Link href="/orders" className="underline font-bold">approve an order first</Link>.
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-concrete-700 mb-1">Approved Orders Queue</label>
                  <select
                    value={selectedOrderId}
                    onChange={e => handleOrderChange(e.target.value)}
                    className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none focus:border-accent-orange"
                  >
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} — {o.customer?.fullName || "Client"} ({o.concreteGrade}, {o.totalQuantity || o.quantity} m³, {o.deliveryAddress})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-concrete-700 mb-1">Concrete Grade</label>
                  <select
                    value={concreteGrade}
                    onChange={e => setConcreteGrade(e.target.value)}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-black text-accent-orange focus:outline-none"
                  >
                    {["M10", "M15", "M20", "M25", "M30", "M35", "M40", "M50"].map(g => (
                      <option key={g} value={g}>{g} Grade RCC</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-concrete-700 mb-1">Planned Production Volume (m³)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={plannedQuantity}
                    onChange={e => setPlannedQuantity(Number(e.target.value))}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Plant Assignment & Schedule */}
            <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
                <Factory className="w-4 h-4 text-accent-orange" /> 2. Assign Batching Plant & Shift Timing
              </h2>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Select Batching Plant</label>
                <select
                  value={selectedPlantId}
                  onChange={e => setSelectedPlantId(e.target.value)}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none focus:border-accent-orange"
                >
                  {plants.map(p => (
                    <option key={p.plantId} value={p.plantId}>
                      {p.plantName} — {p.availableCapacityM3} m³ Available Today ({p.utilizationPercent}% Utilized)
                    </option>
                  ))}
                </select>
              </div>

              {!hasCapacity && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Capacity Warning: Selected plant has only {selectedPlant?.availableCapacityM3} m³ available capacity today.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-concrete-700 mb-1">Batching Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-concrete-700 mb-1">Start Time (Shift Slot)</label>
                  <input
                    type="time"
                    value={scheduledStartTime}
                    onChange={e => setScheduledStartTime(e.target.value)}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Batching Notes & Slump Control</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs text-charcoal-black focus:outline-none"
                  placeholder="e.g. Add retarder dosage for 120-minute transit."
                />
              </div>
            </div>

            {/* Step 3: IS 10262 Material Requirements Preview */}
            <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent-orange" /> 3. Material Consumption Requirements (IS 10262)
                  </h2>
                  <p className="text-[11px] text-concrete-500 mt-0.5">
                    Estimated raw materials for {plannedQuantity} m³ of {concreteGrade} concrete ({totalMixers} Transit Mixer Batches).
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-lg border border-emerald-200">
                  {totalMixers} Mixer Loads
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-concrete-100 text-charcoal-black font-extrabold border-b border-concrete-200">
                    <tr>
                      <th className="p-3">Material</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Requirement</th>
                      <th className="p-3 text-right">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-concrete-100 font-medium">
                    {materials.map((m, i) => (
                      <tr key={i}>
                        <td className="p-3 font-bold text-charcoal-black">{m.materialName}</td>
                        <td className="p-3 text-[11px] text-concrete-500">{m.category}</td>
                        <td className="p-3 font-bold text-accent-orange">{m.totalPlannedKg.toLocaleString()} {m.unit}</td>
                        <td className="p-3 text-right text-charcoal-black">₹{m.estimatedCost.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-concrete-50 text-xs font-bold border-t border-concrete-200">
                    <tr>
                      <td colSpan={3} className="p-3 text-right text-concrete-600">Total Raw Material Value:</td>
                      <td className="p-3 text-right font-black text-accent-orange">₹{totalCost.toLocaleString("en-IN")}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Submission Bar */}
            <div className="bg-charcoal-black text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-[11px] font-bold text-concrete-400 uppercase tracking-wider">Scheduled Batching Summary</div>
                <div className="text-2xl font-black text-accent-orange mt-0.5">
                  {plannedQuantity} m³ • {concreteGrade} Grade ({totalMixers} Batches)
                </div>
                <div className="text-xs text-concrete-300 mt-0.5">
                  Assigned Plant: {selectedPlant?.plantName || "Central Plant 01"}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link
                  href="/production"
                  className="px-5 py-3 rounded-xl border border-concrete-700 text-xs font-bold text-concrete-300 hover:bg-concrete-800 transition-all text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-accent-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-orange/30 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Generating Plan & Batches..." : "Confirm & Schedule Plan"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
