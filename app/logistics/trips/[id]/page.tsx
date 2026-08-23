"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Truck, ArrowLeft, CheckCircle2, Clock, MapPin, AlertTriangle, 
  Play, Check, RefreshCw, Navigation, ShieldCheck, Sparkles, Building, Phone, Factory
} from "lucide-react";

export default function TripLiveTrackingWorkspace() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueType, setIssueType] = useState<string>("TRAFFIC_DELAY");
  const [issueSeverity, setIssueSeverity] = useState<string>("MEDIUM");
  const [issueDescription, setIssueDescription] = useState<string>("");
  const [issueDelayMins, setIssueDelayMins] = useState<number>(15);

  useEffect(() => {
    if (id) fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logistics/trips/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTrip(data.trip);
      }
    } catch (e) {
      console.error("Failed to load trip details", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/logistics/trips/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          latitude: newStatus === "ARRIVED_AT_SITE" ? 18.5913 : 18.5204,
          longitude: newStatus === "ARRIVED_AT_SITE" ? 73.7389 : 73.8567,
          locationName: newStatus === "ARRIVED_AT_SITE" ? "Customer Jobsite (Pune)" : "Transit Corridor"
        })
      });

      if (res.ok) {
        await fetchTrip();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update trip status.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/logistics/trips/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOG_ISSUE",
          issueType,
          severity: issueSeverity,
          description: issueDescription,
          delayMinutes: Number(issueDelayMins)
        })
      });

      if (res.ok) {
        setShowIssueModal(false);
        setIssueDescription("");
        await fetchTrip();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-concrete-50 p-12 text-center text-xs font-bold text-concrete-500 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-accent-orange" />
        Loading Live GPS Telemetry & Transit Coordinates...
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-concrete-50 p-8 text-center space-y-4">
        <div className="text-base font-black text-charcoal-black">Delivery trip not found</div>
        <Link href="/logistics" className="text-xs font-bold text-accent-orange underline">
          Return to Logistics Hub
        </Link>
      </div>
    );
  }

  const STAGES = ["ASSIGNED", "DISPATCHED", "IN_TRANSIT", "ARRIVED_AT_SITE", "UNLOADING", "DELIVERED"];
  const currentStageIndex = STAGES.indexOf(trip.status);

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black p-4 md:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/logistics" className="text-xs font-bold text-concrete-500 hover:text-accent-orange flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Logistics Hub
            </Link>
            <span className="text-concrete-300">•</span>
            <span className="text-xs font-bold text-accent-orange">{trip.tripNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-2xl md:text-3xl font-black text-charcoal-black tracking-tight">
              Transit Trip #{trip.tripNumber}
            </h1>
            <span className="px-3 py-1 bg-concrete-100 text-charcoal-black font-extrabold text-xs rounded-full border border-concrete-300">
              {trip.status}
            </span>
            <span className="px-2.5 py-0.5 bg-orange-50 text-accent-orange font-black text-xs rounded border border-orange-200">
              {trip.concreteGrade} • {trip.quantityM3} m³
            </span>
          </div>
        </div>

        {/* Operational Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {trip.status === "ASSIGNED" && (
            <button
              onClick={() => handleStatusChange("DISPATCHED")}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-accent-orange hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" /> Dispatch Mixer
            </button>
          )}

          {trip.status === "DISPATCHED" && (
            <button
              onClick={() => handleStatusChange("IN_TRANSIT")}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2"
            >
              <Truck className="w-4 h-4" /> Start Transit (On Road)
            </button>
          )}

          {trip.status === "IN_TRANSIT" && (
            <button
              onClick={() => handleStatusChange("ARRIVED_AT_SITE")}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" /> Mark Arrived At Site
            </button>
          )}

          {trip.status === "ARRIVED_AT_SITE" && (
            <button
              onClick={() => handleStatusChange("UNLOADING")}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Start Pouring / Unload
            </button>
          )}

          {trip.status === "UNLOADING" && (
            <button
              onClick={() => handleStatusChange("DELIVERED")}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Mark Delivered & Signed
            </button>
          )}

          <button
            onClick={() => setShowIssueModal(true)}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-red-600" /> Log Delay / Issue
          </button>
        </div>
      </div>

      {/* 6-Stage Visual Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-concrete-500 uppercase tracking-wider">Live Delivery Progression</div>
          <div className="text-xs font-extrabold text-accent-orange">
            ETA: {new Date(trip.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex >= idx;
            const isCurrent = currentStageIndex === idx;

            return (
              <div 
                key={stage}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent 
                    ? "bg-accent-orange text-white border-accent-orange font-black shadow-md"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold"
                    : "bg-concrete-50 text-concrete-400 border-concrete-200 font-semibold"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider">{stage.replace(/_/g, " ")}</div>
                <div className="text-[11px] mt-0.5">
                  {isCompleted ? "✓ Completed" : "Pending"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: GPS Map Simulation & Driver/Vehicle Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live GPS Tracking Simulation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Simulation Box */}
          <div className="bg-charcoal-black text-white p-6 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-concrete-800 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-accent-orange animate-pulse" />
                <div>
                  <h3 className="text-sm font-black text-white">Live GPS Telemetry & Transit Corridor</h3>
                  <div className="text-[10px] text-concrete-400">GPS Status: <strong>ONLINE</strong> • Speed: <strong>38 km/h</strong></div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-lg border border-emerald-500/40">
                {trip.aiEtaConfidence || 94}% ETA ACCURACY
              </span>
            </div>

            {/* Visual Route Corridor */}
            <div className="p-6 bg-concrete-900/80 rounded-xl border border-concrete-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-concrete-300">
                <div className="flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-accent-orange" />
                  <span>{trip.originPlant || "Central Batching Plant"}</span>
                </div>
                <span className="text-concrete-500">• • • {trip.distanceKm} km Transit • • •</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{trip.destinationAddress}</span>
                </div>
              </div>

              {/* Transit Route Name */}
              <div className="p-3 bg-concrete-800/80 rounded-lg text-xs font-semibold text-concrete-200 flex items-center justify-between">
                <span>Recommended Path: <strong>{trip.route?.recommendedRouteName || "Via Primary Express Highway Corridor"}</strong></span>
                <span className="text-emerald-400 font-bold">Free Flow (OK)</span>
              </div>
            </div>

            {/* Recent GPS Breadcrumbs */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-concrete-400 uppercase">Recent GPS Waypoints</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(trip.trackings || []).map((tr: any, idx: number) => (
                  <div key={tr.id || idx} className="p-2.5 bg-concrete-900/60 rounded-lg text-[11px] flex items-center justify-between text-concrete-300 border border-concrete-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3 h-3 text-accent-orange" /> {tr.locationName || "Transit Point"} ({tr.latitude?.toFixed(4)}, {tr.longitude?.toFixed(4)})
                    </span>
                    <span className="font-bold text-concrete-400">{new Date(tr.recordedAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gemini AI Route & Traffic Intelligence Card */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm text-charcoal-black">Gemini AI Dynamic ETA & Slump Retention Assessment</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-orange-50 text-accent-orange font-black text-xs rounded border border-orange-200">
                IS 4926 COMPLIANT
              </span>
            </div>

            <p className="text-xs text-concrete-700 leading-relaxed font-medium">
              Mixer drum rotation operating at recommended 2-4 rpm. Slump workability maintained at 120mm. Target discharge within 45 minutes of departure to prevent cold joint formations.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-concrete-500 pt-2 border-t border-concrete-100 font-bold">
              <span>Traffic Factor: <strong className="text-emerald-700">MODERATE</strong></span>
              <span>Delay Buffer: <strong className="text-charcoal-black">+{trip.aiTrafficDelayMins || 0} mins</strong></span>
              <span>Slump Retention Window: <strong className="text-charcoal-black">90 Mins Max</strong></span>
            </div>
          </div>
        </div>

        {/* Right Col: Driver & Vehicle Specs & Issues */}
        <div className="space-y-6">
          {/* Driver & Transit Mixer Details */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
              <Truck className="w-4 h-4 text-accent-orange" /> Assigned Fleet & Driver
            </h3>

            <div className="p-3 bg-concrete-50 rounded-xl border border-concrete-200 space-y-1">
              <div className="text-[10px] text-concrete-500 font-bold uppercase">Transit Mixer</div>
              <div className="font-black text-sm text-charcoal-black">{trip.vehicle?.vehicleNumber || "MH-12-RN-8821"}</div>
              <div className="text-[11px] text-concrete-500">6.0 m³ Drum Capacity • Fuel: {trip.vehicle?.fuelLevelPercent || 85}%</div>
            </div>

            <div className="p-3 bg-concrete-50 rounded-xl border border-concrete-200 space-y-1">
              <div className="text-[10px] text-concrete-500 font-bold uppercase">Professional Driver</div>
              <div className="font-black text-sm text-charcoal-black">{trip.driver?.name || "Sanjay Pawar"}</div>
              <div className="text-[11px] text-concrete-500 flex items-center gap-1 font-semibold">
                <Phone className="w-3 h-3 text-emerald-600" /> {trip.driver?.phone || "+91 98231 44551"}
              </div>
            </div>

            <div className="p-3 bg-concrete-50 rounded-xl border border-concrete-200 space-y-1">
              <div className="text-[10px] text-concrete-500 font-bold uppercase">Customer Jobsite Contact</div>
              <div className="font-bold text-charcoal-black">{trip.order?.customer?.fullName || "Commercial Client"}</div>
              <div className="text-[11px] text-concrete-500">{trip.destinationAddress}</div>
            </div>
          </div>

          {/* Reported Issues */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Logged Delivery Issues ({trip.issues?.length || 0})
            </h3>

            {(trip.issues || []).length === 0 ? (
              <div className="text-[11px] text-concrete-500 font-medium py-2">
                No delays or vehicle breakdown reported for this trip.
              </div>
            ) : (
              <div className="space-y-2">
                {(trip.issues || []).map((iss: any, i: number) => (
                  <div key={iss.id || i} className="p-3 bg-amber-50/75 rounded-xl border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between font-extrabold text-amber-900">
                      <span>{iss.issueType.replace(/_/g, " ")}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-200 rounded">+{iss.delayMinutes}m</span>
                    </div>
                    <p className="text-[11px] text-amber-800">{iss.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-charcoal-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-concrete-200">
            <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
              <h3 className="font-black text-sm text-charcoal-black flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Log Delivery Delay or Issue
              </h3>
              <button onClick={() => setShowIssueModal(false)} className="text-concrete-400 hover:text-charcoal-black text-xs font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleLogIssue} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-concrete-700 mb-1">Issue Type</label>
                <select
                  value={issueType}
                  onChange={e => setIssueType(e.target.value)}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl font-bold text-charcoal-black focus:outline-none"
                >
                  <option value="TRAFFIC_DELAY">Traffic Congestion</option>
                  <option value="VEHICLE_BREAKDOWN">Vehicle / Tyre Issue</option>
                  <option value="SITE_ACCESS_PROBLEM">Jobsite Access Restriction</option>
                  <option value="WEATHER_ISSUE">Rain / Weather Delay</option>
                  <option value="CUSTOMER_DELAY">Customer Unload Delay</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-concrete-700 mb-1">Estimated Delay (Mins)</label>
                  <input
                    type="number"
                    value={issueDelayMins}
                    onChange={e => setIssueDelayMins(Number(e.target.value))}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl font-bold text-charcoal-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-concrete-700 mb-1">Severity</label>
                  <select
                    value={issueSeverity}
                    onChange={e => setIssueSeverity(e.target.value)}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl font-bold text-charcoal-black focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-concrete-700 mb-1">Description</label>
                <textarea
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-charcoal-black focus:outline-none"
                  placeholder="e.g. Flyover roadwork near Kharadi junction slowing transit."
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 bg-concrete-100 text-concrete-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl"
                >
                  Submit Issue Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
