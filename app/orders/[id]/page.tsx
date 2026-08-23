"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Package, ArrowLeft, CheckCircle2, Clock, Truck, AlertTriangle, 
  Send, ShieldCheck, Sparkles, Building, Calendar, Phone, Mail, 
  FileText, MessageSquare, Plus, Check, X, RefreshCw, Layers, FileSpreadsheet
} from "lucide-react";

export default function OrderDetailsCommandWorkspace() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // New Comment State
  const [commentText, setCommentText] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedDate, setSchedDate] = useState(new Date().toISOString().split("T")[0]);
  const [schedTime, setSchedTime] = useState("09:00");
  const [schedVolume, setSchedVolume] = useState(6.0);
  const [truckNumber, setTruckNumber] = useState("MH-12-RN-8821");
  const [driverName, setDriverName] = useState("Suresh Patil");
  const [driverPhone, setDriverPhone] = useState("+91 98220 11223");
  const [schedNotes, setSchedNotes] = useState("Transit mixer load 1");

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (e) {
      console.error("Failed to load order details", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = async (endpoint: string, body?: any) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {})
      });
      if (res.ok) {
        await fetchOrder();
      } else {
        const err = await res.json();
        alert(err.error || `Failed to perform action: ${endpoint}`);
      }
    } catch (e: any) {
      alert("Error performing action: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`/api/orders/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: commentText,
          isInternal: isInternalComment
        })
      });

      if (res.ok) {
        setCommentText("");
        await fetchOrder();
      }
    } catch (e) {
      console.error("Failed to post comment", e);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scheduledDateTime = new Date(`${schedDate}T${schedTime}`);
      const estimatedArrival = new Date(scheduledDateTime.getTime() + 45 * 60 * 1000);

      const res = await fetch(`/api/orders/${id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: scheduledDateTime,
          estimatedArrival,
          quantityM3: Number(schedVolume),
          truckNumber,
          driverName,
          driverPhone,
          notes: schedNotes
        })
      });

      if (res.ok) {
        setShowScheduleModal(false);
        await fetchOrder();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to schedule delivery slot.");
      }
    } catch (e: any) {
      alert("Failed to schedule slot: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-concrete-50 p-12 text-center text-xs font-bold text-concrete-500 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-accent-orange" />
        Loading Enterprise Order Details & AI Logistics Plan...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-concrete-50 p-8 text-center space-y-4">
        <div className="text-base font-black text-charcoal-black">Order not found</div>
        <Link href="/orders" className="text-xs font-bold text-accent-orange underline">
          Return to Orders Hub
        </Link>
      </div>
    );
  }

  // Lifecycle Stages
  const stages = [
    { key: "DRAFT", label: "Draft" },
    { key: "SUBMITTED", label: "Submitted" },
    { key: "APPROVED", label: "Approved" },
    { key: "PRODUCTION_SCHEDULED", label: "Scheduled" },
    { key: "IN_PRODUCTION", label: "In Production" },
    { key: "IN_TRANSIT", label: "In Transit" },
    { key: "DELIVERED", label: "Delivered" }
  ];

  const getStageIndex = (status: string) => {
    const idx = stages.findIndex(s => s.key === status);
    if (idx !== -1) return idx;
    if (["READY_FOR_DISPATCH"].includes(status)) return 4;
    return 0;
  };

  const currentStageIdx = getStageIndex(order.status);

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black p-4 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/orders" className="text-xs font-bold text-concrete-500 hover:text-accent-orange flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Orders Hub
            </Link>
            <span className="text-concrete-300">•</span>
            <span className="text-xs font-bold text-accent-orange">{order.orderNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-2xl md:text-3xl font-black text-charcoal-black tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <span className="px-3 py-1 bg-concrete-100 text-charcoal-black font-extrabold text-xs rounded-full border border-concrete-300">
              {order.status}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase ${
              order.priority === "CRITICAL" ? "bg-red-100 text-red-800" : order.priority === "HIGH" ? "bg-amber-100 text-amber-800" : "bg-concrete-100 text-concrete-700"
            }`}>
              {order.priority || "NORMAL"} Priority
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {order.status === "DRAFT" && (
            <button
              onClick={() => handleStatusAction("submit")}
              disabled={actionLoading}
              className="px-4 py-2 bg-accent-orange text-white text-xs font-extrabold rounded-xl hover:bg-orange-600 shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit Order
            </button>
          )}

          {(order.status === "SUBMITTED" || order.status === "UNDER_REVIEW") && (
            <>
              <button
                onClick={() => handleStatusAction("approve", { comments: "Technical and commercial terms verified." })}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-extrabold rounded-xl hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Approve Order
              </button>
              <button
                onClick={() => {
                  const reason = prompt("Enter rejection reason:");
                  if (reason) handleStatusAction("reject", { reason });
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white text-xs font-extrabold rounded-xl hover:bg-red-700 shadow-sm flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Reject Order
              </button>
            </>
          )}

          {["APPROVED", "PRODUCTION_SCHEDULED", "IN_PRODUCTION"].includes(order.status) && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-charcoal-black text-white text-xs font-extrabold rounded-xl hover:bg-black shadow-sm flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-accent-orange" /> Schedule Mixer Dispatch
            </button>
          )}

          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <button
              onClick={() => handleStatusAction("approve", { comments: "Delivered to site." })}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-concrete-100 text-charcoal-black hover:bg-concrete-200 text-xs font-bold rounded-xl border border-concrete-300"
            >
              Mark Delivered
            </button>
          )}
        </div>
      </div>

      {/* Visual Status Lifecycle Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm">
        <h2 className="text-xs font-extrabold text-concrete-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent-orange" /> Order Lifecycle Progress
        </h2>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="hidden md:block absolute top-1/2 left-4 right-4 h-1 bg-concrete-100 -translate-y-1/2 z-0" />

          {stages.map((st, idx) => {
            const isCompleted = idx <= currentStageIdx;
            const isCurrent = idx === currentStageIdx;

            return (
              <div key={st.key} className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 w-full md:w-auto">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  isCurrent
                    ? "bg-accent-orange text-white ring-4 ring-orange-100 shadow-md scale-110"
                    : isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-concrete-200 text-concrete-500"
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="text-left md:text-center">
                  <div className={`text-xs font-extrabold ${isCurrent ? "text-accent-orange" : isCompleted ? "text-charcoal-black" : "text-concrete-400"}`}>
                    {st.label}
                  </div>
                  {isCurrent && (
                    <div className="text-[10px] text-accent-orange font-bold">Active Stage</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Details, AI Card, Schedules, Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items & Logistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Order Intelligence Risk Card */}
          <div className="bg-gradient-to-br from-charcoal-black to-concrete-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-white">Gemini AI Order Intelligence & Risk Assessment</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase ${
                order.aiRiskLevel === "HIGH" || order.aiRiskLevel === "CRITICAL"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : order.aiRiskLevel === "MEDIUM"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {order.aiRiskLevel || "LOW"} RISK
              </span>
            </div>

            <p className="text-xs text-concrete-200 leading-relaxed font-medium">
              {order.aiSummary || "Automated logistics analysis completed. Continuous fleet rotation recommended for this pour."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-concrete-800">
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Identified Operational Risks
                </div>
                <ul className="text-xs text-concrete-300 space-y-1 list-disc list-inside">
                  {(order.aiRisks && order.aiRisks.length > 0 ? order.aiRisks : ["Ensure mixer turning clearance at jobsite."]).map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AI Recommended Actions
                </div>
                <ul className="text-xs text-concrete-300 space-y-1 list-disc list-inside">
                  {(order.aiRecommendations && order.aiRecommendations.length > 0 ? order.aiRecommendations : ["Coordinate with central batching plant 2 hours prior."]).map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Itemized Mix Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-charcoal-black flex items-center gap-2">
              <Package className="w-4 h-4 text-accent-orange" /> Concrete Mix Specifications & Pricing
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-concrete-100 text-charcoal-black font-extrabold border-b border-concrete-200">
                  <tr>
                    <th className="p-3">Grade Code</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-concrete-100 font-medium">
                  {(order.items && order.items.length > 0 ? order.items : [
                    { concreteGrade: order.concreteGrade, quantity: order.totalQuantity || order.quantity, unitPrice: 4500, subtotal: (order.totalQuantity || order.quantity) * 4500 }
                  ]).map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="p-3 font-extrabold text-accent-orange">{it.concreteGrade} Grade RCC</td>
                      <td className="p-3">{it.quantity} {it.unit || "m³"}</td>
                      <td className="p-3">₹{(it.unitPrice || 4500).toLocaleString("en-IN")}/m³</td>
                      <td className="p-3 text-right font-bold text-charcoal-black">
                        ₹{(it.subtotal || (it.quantity * 4500)).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-concrete-50 text-xs font-bold border-t border-concrete-200">
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-concrete-600">GST (18%):</td>
                    <td className="p-3 text-right font-bold">₹{((order.totalAmount || order.estimatedValue || 0) * 0.18 / 1.18).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr className="text-sm">
                    <td colSpan={3} className="p-3 text-right font-black text-charcoal-black">Grand Total:</td>
                    <td className="p-3 text-right font-black text-accent-orange">₹{(order.totalAmount || order.estimatedValue || 0).toLocaleString("en-IN")}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Delivery & Mixer Fleet Dispatch Schedule */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-charcoal-black flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent-orange" /> Delivery Schedules & Mixer Truck Fleet
              </h3>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-3 py-1.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-concrete-300"
              >
                <Plus className="w-3.5 h-3.5" /> Add Dispatch Slot
              </button>
            </div>

            {(!order.deliverySchedules || order.deliverySchedules.length === 0) ? (
              <div className="p-6 bg-concrete-50 rounded-xl border border-concrete-200 text-center text-xs text-concrete-500 font-medium">
                No mixer truck dispatches scheduled yet. Click "Add Dispatch Slot" to schedule transit mixers from central batching plants.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-concrete-100 text-charcoal-black font-extrabold border-b border-concrete-200">
                    <tr>
                      <th className="p-3">Truck Number</th>
                      <th className="p-3">Driver</th>
                      <th className="p-3">Scheduled Time</th>
                      <th className="p-3">Batch Volume</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-concrete-100 font-medium">
                    {order.deliverySchedules.map((s: any, i: number) => (
                      <tr key={s.id || i}>
                        <td className="p-3 font-bold text-charcoal-black">{s.truckNumber || "Transit Mixer"}</td>
                        <td className="p-3">{s.driverName || "Driver Assigned"} ({s.driverPhone || "—"})</td>
                        <td className="p-3">{new Date(s.scheduledDate).toLocaleString()}</td>
                        <td className="p-3 font-bold text-accent-orange">{s.quantityM3} m³</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-200">
                            {s.status}
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

        {/* Right Col: Customer Info, Linked Sources, Comments */}
        <div className="space-y-6">
          {/* Site & Client Details */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-2">
              <Building className="w-4 h-4 text-accent-orange" /> Client & Site Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-concrete-500 font-bold">Customer Name:</span>
                <div className="font-black text-charcoal-black mt-0.5">{order.customer?.fullName || "Enterprise Client"}</div>
                <div className="text-concrete-500 text-[11px]">{order.customer?.email} • {order.customer?.phone || "+91 98220 00112"}</div>
              </div>

              <div>
                <span className="text-concrete-500 font-bold">Delivery Address:</span>
                <div className="font-bold text-charcoal-black mt-0.5">{order.deliveryAddress || "Site Location"}</div>
                <div className="text-concrete-500 text-[11px]">{order.siteCity || "Pune"}, PIN: {order.pincode || "411001"}</div>
              </div>

              <div>
                <span className="text-concrete-500 font-bold">Site Receiver:</span>
                <div className="font-bold text-charcoal-black mt-0.5">{order.siteContactName || "Site Incharge"}</div>
                <div className="text-concrete-500 text-[11px]">{order.siteContactPhone || "—"}</div>
              </div>

              <div>
                <span className="text-concrete-500 font-bold">Pumping Setup:</span>
                <div className="font-bold text-accent-orange mt-0.5">
                  {order.pumpRequired ? `Yes (${order.pumpType || "24m Boom Pump"})` : "No (Direct Chute Pour)"}
                </div>
              </div>
            </div>
          </div>

          {/* Linked Pipeline Sources (Quote / Blueprint) */}
          {(order.quote || order.blueprintAnalysis) && (
            <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-2">
                <Layers className="w-4 h-4 text-emerald-600" /> Traceable Pipeline Source
              </h3>

              {order.quote && (
                <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-200 text-xs">
                  <div className="font-black text-accent-orange flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Converted from Quote #{order.quote.quoteNumber}
                  </div>
                  <div className="text-concrete-600 text-[11px] mt-1">
                    Accepted commercial pricing structure linked directly to this order.
                  </div>
                </div>
              )}

              {order.blueprintAnalysis && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs">
                  <div className="font-black text-emerald-700 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> Generated from Blueprint Analysis
                  </div>
                  <div className="text-concrete-600 text-[11px] mt-1">
                    Structural drawing takeoff data verified.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Order Comments Thread */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-2">
              <MessageSquare className="w-4 h-4 text-accent-orange" /> Stakeholder Communication
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(!order.comments || order.comments.length === 0) ? (
                <div className="text-center text-xs text-concrete-500 py-4">No comments posted yet.</div>
              ) : (
                order.comments.map((c: any, i: number) => (
                  <div key={c.id || i} className={`p-3 rounded-xl border text-xs ${c.isInternal ? "bg-amber-50 border-amber-200" : "bg-concrete-50 border-concrete-200"}`}>
                    <div className="flex items-center justify-between font-bold text-charcoal-black">
                      <span className="flex items-center gap-1">
                        {c.userName} <span className="text-[10px] text-concrete-500 font-normal">({c.userRole})</span>
                      </span>
                      <span className="text-[10px] text-concrete-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-concrete-700 mt-1">{c.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-concrete-100">
              <textarea
                rows={2}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Post dispatch instruction or site update..."
                className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs text-charcoal-black focus:outline-none focus:border-accent-orange"
              />
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-concrete-500 font-medium flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalComment}
                    onChange={e => setIsInternalComment(e.target.checked)}
                    className="w-3.5 h-3.5 accent-accent-orange"
                  />
                  Internal Operations Only
                </label>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-accent-orange hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Post
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Schedule Dispatch Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-concrete-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
              <h3 className="font-black text-sm text-charcoal-black flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent-orange" /> Schedule Mixer Dispatch Slot
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-concrete-400 hover:text-charcoal-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-concrete-700 mb-1">Dispatch Date</label>
                  <input
                    type="date"
                    value={schedDate}
                    onChange={e => setSchedDate(e.target.value)}
                    className="w-full p-2 bg-concrete-50 border border-concrete-200 rounded-lg font-bold text-charcoal-black focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-concrete-700 mb-1">Dispatch Time</label>
                  <input
                    type="time"
                    value={schedTime}
                    onChange={e => setSchedTime(e.target.value)}
                    className="w-full p-2 bg-concrete-50 border border-concrete-200 rounded-lg font-bold text-charcoal-black focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-concrete-700 mb-1">Batch Volume (m³)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={schedVolume}
                    onChange={e => setSchedVolume(Number(e.target.value))}
                    className="w-full p-2 bg-concrete-50 border border-concrete-200 rounded-lg font-bold text-charcoal-black focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-concrete-700 mb-1">Truck License Plate</label>
                  <input
                    type="text"
                    value={truckNumber}
                    onChange={e => setTruckNumber(e.target.value)}
                    className="w-full p-2 bg-concrete-50 border border-concrete-200 rounded-lg font-bold text-charcoal-black focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-concrete-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    className="w-full p-2 bg-concrete-50 border border-concrete-200 rounded-lg text-charcoal-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-concrete-700 mb-1">Driver Phone</label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={e => setDriverPhone(e.target.value)}
                    className="w-full p-2 bg-concrete-50 border border-concrete-200 rounded-lg text-charcoal-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-concrete-700 mb-1">Dispatch Notes</label>
                <input
                  type="text"
                  value={schedNotes}
                  onChange={e => setSchedNotes(e.target.value)}
                  className="w-full p-2 bg-concrete-50 border border-concrete-200 rounded-lg text-charcoal-black focus:outline-none"
                  placeholder="e.g. Slump 120mm batch"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-concrete-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-concrete-100 hover:bg-concrete-200 rounded-xl font-bold text-concrete-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent-orange hover:bg-orange-600 text-white rounded-xl font-extrabold shadow-md shadow-accent-orange/20"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
