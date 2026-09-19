"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, Truck, ChevronRight, Search, Clock, CheckCircle2, 
  AlertCircle, MapPin, Navigation, Phone, Star, Send, X, Layers
} from "lucide-react";
import { PortalOrderItem } from "@/lib/portal/types/portal";

export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<PortalOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Feedback Modal State
  const [feedbackOrder, setFeedbackOrder] = useState<PortalOrderItem | null>(null);
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState("DELIVERY");
  const [comments, setComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/portal/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch((err) => console.error("Failed to load orders", err))
      .finally(() => setLoading(false));
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackOrder) return;
    setSubmittingFeedback(true);

    try {
      const res = await fetch("/api/portal/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: feedbackOrder.id,
          rating,
          category,
          comments,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackSuccess(true);
        setTimeout(() => {
          setFeedbackSuccess(false);
          setFeedbackOrder(null);
          setComments("");
        }, 1500);
      }
    } catch (e) {
      console.error("Failed to submit feedback", e);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                          o.projectName.toLowerCase().includes(search.toLowerCase()) ||
                          o.concreteGrade.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/portal" className="text-xs text-gray-400 hover:text-white">Portal</Link>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-accent-orange font-medium">Orders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Concrete Orders & Pour Schedules
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track batch status, mix specifications, and live transit mixer dispatch progress.
          </p>
        </div>

        <Link
          href="/portal/deliveries"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-semibold border border-neutral-700 transition"
        >
          <Navigation className="w-4 h-4 text-accent-orange" />
          Live Fleet GPS Tracker
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number (ORD-...), project name, or mix grade..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent-orange"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {["ALL", "IN_TRANSIT", "BATCHING", "PLACED", "COMPLETED"].map((stat) => (
            <button
              key={stat}
              onClick={() => setStatusFilter(stat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                statusFilter === stat
                  ? "bg-accent-orange text-white"
                  : "bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800"
              }`}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <h3 className="text-lg font-bold text-white mb-1">No Orders Found</h3>
          <p className="text-sm">There are no concrete pour orders matching the filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isDelivering = order.status === "IN_TRANSIT" || order.status === "POURING";
            return (
              <div
                key={order.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-white bg-neutral-800 px-2.5 py-0.5 rounded-md">
                        {order.orderNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                        order.status === "IN_TRANSIT" ? "bg-sky-500/20 text-sky-400 animate-pulse" :
                        order.status === "BATCHING" ? "bg-amber-500/20 text-amber-400" :
                        order.status === "POURING" ? "bg-emerald-500/20 text-emerald-400 animate-pulse" :
                        order.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-gray-400"
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-gray-400">• Scheduled Pour: {new Date(order.pourDateTime).toLocaleString()}</span>
                    </div>
                    <div className="text-sm font-bold text-gray-200">
                      {order.projectName} <span className="text-xs text-gray-400 font-normal">({order.projectCode})</span>
                    </div>
                  </div>

                  {/* Action Shortcuts */}
                  <div className="flex items-center gap-2">
                    {isDelivering && (
                      <Link
                        href="/portal/deliveries"
                        className="px-3 py-1.5 rounded-xl bg-accent-orange hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Track Mixer ({order.activeMixerTruckNumber || "KA-04-E-2194"})
                      </Link>
                    )}

                    {order.status === "COMPLETED" && (
                      <button
                        onClick={() => setFeedbackOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-200 text-xs font-semibold border border-neutral-700 flex items-center gap-1.5 transition"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        Rate Delivery
                      </button>
                    )}
                  </div>
                </div>

                {/* Specs and Quantities Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                  <div>
                    <span className="text-gray-400 block">Concrete Grade</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{order.concreteGrade}</span>
                    <span className="text-[11px] text-gray-500">Slump: {order.slumpMm} mm</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block">Volume Progress</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {order.quantityDelivered} / {order.quantityOrdered} m³
                    </span>
                    <div className="w-full bg-neutral-800 rounded-full h-1 mt-1 overflow-hidden">
                      <div
                        className="bg-accent-orange h-1 rounded-full"
                        style={{ width: `${Math.min(100, (order.quantityDelivered / order.quantityOrdered) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block">Batching Facility</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{order.plantName}</span>
                    <span className="text-[11px] text-emerald-400">Automated Batching</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block">Site Delivery Address</span>
                    <span className="text-xs text-gray-300 mt-0.5 block truncate" title={order.deliveryAddress}>
                      {order.deliveryAddress}
                    </span>
                  </div>
                </div>

                {/* Assigned Driver and Mixer info if active */}
                {order.activeDriverName && isDelivering && (
                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-accent-orange" />
                      <span className="text-gray-400">Assigned Transit Mixer:</span>
                      <span className="text-white font-bold">{order.activeMixerTruckNumber}</span>
                      <span className="text-gray-400">({order.activeDriverName})</span>
                    </div>

                    <a
                      href={`tel:${order.activeDriverPhone || "+919845012345"}`}
                      className="text-accent-orange hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <Phone className="w-3 h-3" />
                      {order.activeDriverPhone || "+91 98450 12345"}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delivery Feedback Modal */}
      {feedbackOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setFeedbackOrder(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Rate Concrete Delivery</h3>
            <p className="text-xs text-gray-400 mb-4">
              Order #{feedbackOrder.orderNumber} ({feedbackOrder.concreteGrade})
            </p>

            {feedbackSuccess ? (
              <div className="p-6 text-center text-emerald-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                <p className="font-bold">Feedback Recorded!</p>
                <p className="text-xs text-gray-400 mt-1">Thank you for helping us maintain top quality.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Rating (1 to 5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1.5 focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-neutral-700"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                  >
                    <option value="DELIVERY">Delivery Punctuality & Pour Rate</option>
                    <option value="QUALITY">Concrete Workability & Slump</option>
                    <option value="DRIVER">Mixer Driver Professionalism</option>
                    <option value="OVERALL">Overall Satisfaction</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Comments (Optional)</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    placeholder="Provide details about slump, cube samples taken, or driver speed..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-gray-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackOrder(null)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-4 py-2 rounded-xl bg-accent-orange hover:bg-orange-600 text-white text-xs font-semibold shadow-md"
                  >
                    {submittingFeedback ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
