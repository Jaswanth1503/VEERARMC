"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Truck, ArrowLeft, Send, Sparkles, Navigation, Clock, 
  MapPin, AlertTriangle, ShieldCheck, CheckCircle2, Factory, Package
} from "lucide-react";

export default function DispatchNewTripWizard() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [quantityM3, setQuantityM3] = useState<number>(6.0);
  const [concreteGrade, setConcreteGrade] = useState<string>("M25");
  const [originPlant, setOriginPlant] = useState<string>("Central Batching Plant (Hadapsar)");
  const [destinationAddress, setDestinationAddress] = useState<string>("Hinjewadi Phase 3, Pune");
  const [distanceKm, setDistanceKm] = useState<number>(18.5);
  const [aiRoute, setAiRoute] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [analyzingRoute, setAnalyzingRoute] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setFetching(true);
    try {
      const [ordersRes, vehRes, drvRes] = await Promise.all([
        fetch("/api/orders?status=APPROVED"),
        fetch("/api/logistics/vehicles?status=AVAILABLE"),
        fetch("/api/logistics/drivers?status=AVAILABLE")
      ]);

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData.orders || []);
        if (oData.orders && oData.orders.length > 0) {
          const first = oData.orders[0];
          setSelectedOrderId(first.id);
          setConcreteGrade(first.concreteGrade || "M25");
          setDestinationAddress(first.deliveryAddress || "Hinjewadi Phase 3, Pune");
        }
      }

      if (vehRes.ok) {
        const vData = await vehRes.json();
        setVehicles(vData.vehicles || []);
        if (vData.vehicles && vData.vehicles.length > 0) {
          setSelectedVehicleId(vData.vehicles[0].id);
        }
      }

      if (drvRes.ok) {
        const dData = await drvRes.json();
        setDrivers(dData.drivers || []);
        if (dData.drivers && dData.drivers.length > 0) {
          setSelectedDriverId(dData.drivers[0].id);
        }
      }

      // Initial AI Route Check
      await checkAIRoute("Central Batching Plant (Hadapsar)", "Hinjewadi Phase 3, Pune", 18.5, "M25");
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const checkAIRoute = async (origin: string, dest: string, dist: number, grade: string) => {
    setAnalyzingRoute(true);
    try {
      const res = await fetch("/api/logistics/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originPlant: origin, destinationSite: dest, distanceKm: dist, concreteGrade: grade })
      });
      if (res.ok) {
        const data = await res.json();
        setAiRoute(data.route);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingRoute(false);
    }
  };

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find(o => o.id === orderId);
    if (ord) {
      setConcreteGrade(ord.concreteGrade || "M25");
      setDestinationAddress(ord.deliveryAddress || "Pune Jobsite");
      checkAIRoute(originPlant, ord.deliveryAddress || "Pune Jobsite", distanceKm, ord.concreteGrade || "M25");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return alert("Please select an approved order.");
    if (!selectedVehicleId) return alert("Please select an available transit mixer.");
    if (!selectedDriverId) return alert("Please select a driver.");

    setLoading(true);
    try {
      const res = await fetch("/api/logistics/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId,
          vehicleId: selectedVehicleId,
          driverId: selectedDriverId,
          concreteGrade,
          quantityM3: Number(quantityM3),
          originPlant,
          destinationAddress,
          distanceKm: Number(distanceKm)
        })
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/logistics/trips/${data.trip.id}`);
      } else {
        alert(data.error || "Failed to create delivery trip.");
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
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/logistics"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-concrete-600 hover:text-accent-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Logistics Hub
          </Link>
          <span className="text-xs font-extrabold text-concrete-400">IS 4926 Dispatch Protocol</span>
        </div>

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm">
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <Truck className="w-6 h-6 text-accent-orange" /> Dispatch Transit Mixer & Schedule Trip
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Assign transit mixer, professional driver, calculate AI-optimized routes, and forecast dynamic arrival ETAs.
          </p>
        </div>

        {fetching ? (
          <div className="bg-white p-12 rounded-2xl border border-concrete-200 text-center text-xs font-bold text-concrete-500">
            Loading active orders, available mixers, and driver roster...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Order & Grade */}
            <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
                <Package className="w-4 h-4 text-accent-orange" /> 1. Select Customer Order & Mix Volume
              </h2>

              {orders.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  No orders currently in APPROVED status. You can schedule direct dispatch or <Link href="/orders" className="underline font-bold">approve an order first</Link>.
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
                        {o.orderNumber} — {o.customer?.fullName || "Client"} ({o.concreteGrade}, {o.deliveryAddress})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-concrete-700 mb-1">Mixer Batch Volume (m³)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={quantityM3}
                    onChange={e => setQuantityM3(Number(e.target.value))}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none"
                    required
                  />
                  <div className="text-[10px] text-concrete-400 mt-1 font-semibold">Standard transit mixer drum capacity: 6.0 m³</div>
                </div>

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
              </div>
            </div>

            {/* Step 2: Vehicle & Driver Assignment */}
            <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
                <Truck className="w-4 h-4 text-accent-orange" /> 2. Vehicle & Licensed Driver Assignment
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-concrete-700 mb-1">Select Available Transit Mixer</label>
                  <select
                    value={selectedVehicleId}
                    onChange={e => setSelectedVehicleId(e.target.value)}
                    className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none focus:border-accent-orange"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.vehicleNumber} ({v.vehicleType} • {v.capacity} m³ • Fuel {v.fuelLevelPercent}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-concrete-700 mb-1">Select Professional Driver</label>
                  <select
                    value={selectedDriverId}
                    onChange={e => setSelectedDriverId(e.target.value)}
                    className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none focus:border-accent-orange"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.employeeId} • {d.experienceYears} yrs exp • {d.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Route & Jobsite Details */}
            <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
                <Navigation className="w-4 h-4 text-accent-orange" /> 3. Transit Corridor & Jobsite Location
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-concrete-700 mb-1">Origin Batching Plant</label>
                  <select
                    value={originPlant}
                    onChange={e => {
                      setOriginPlant(e.target.value);
                      checkAIRoute(e.target.value, destinationAddress, distanceKm, concreteGrade);
                    }}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none"
                  >
                    <option value="Central Batching Plant (Hadapsar)">Central Batching Plant (Hadapsar)</option>
                    <option value="North Batching Plant (Chakan)">North Batching Plant (Chakan)</option>
                    <option value="West Batching Plant (Hinjewadi)">West Batching Plant (Hinjewadi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-concrete-700 mb-1">Transit Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={distanceKm}
                    onChange={e => {
                      setDistanceKm(Number(e.target.value));
                      checkAIRoute(originPlant, destinationAddress, Number(e.target.value), concreteGrade);
                    }}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Jobsite Delivery Address</label>
                <input
                  type="text"
                  value={destinationAddress}
                  onChange={e => {
                    setDestinationAddress(e.target.value);
                    checkAIRoute(originPlant, e.target.value, distanceKm, concreteGrade);
                  }}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs text-charcoal-black focus:outline-none"
                  required
                />
              </div>

              {/* Gemini AI Route Optimization Card */}
              <div className="bg-gradient-to-br from-charcoal-black to-concrete-900 text-white p-5 rounded-xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black">Gemini AI Route & Slump Risk Assessment</span>
                  </div>
                  {analyzingRoute ? (
                    <span className="text-[10px] text-amber-400 font-bold animate-pulse">Analyzing corridor...</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded border border-emerald-500/40">
                      {aiRoute?.confidenceScore || 94}% CONFIDENCE
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-concrete-200">
                  Recommended Route: <strong className="text-white">{aiRoute?.recommendedRouteName || "Via Primary Arterial Bypass"}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-concrete-300 pt-2 border-t border-concrete-800">
                  <span>Est. Travel Time: <strong className="text-white">{aiRoute?.estimatedMinutes || 42} mins</strong></span>
                  <span>Road Condition: <strong className="text-emerald-400">{aiRoute?.roadCondition || "GOOD"}</strong></span>
                  <span>Slump Loss Risk: <strong className="text-amber-400">{aiRoute?.slumpLossRisk || "LOW"}</strong></span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="bg-charcoal-black text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-[11px] font-bold text-concrete-400 uppercase tracking-wider">Ready to Dispatch</div>
                <div className="text-2xl font-black text-accent-orange mt-0.5">
                  {quantityM3} m³ • {concreteGrade} Grade Concrete
                </div>
                <div className="text-xs text-concrete-300 mt-0.5">
                  Trip Distance: {distanceKm} km • Est. Transit: {aiRoute?.estimatedMinutes || 42} mins
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link
                  href="/logistics"
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
                  {loading ? "Dispatching Mixer..." : "Confirm & Dispatch Trip"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
