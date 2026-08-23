"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ShieldCheck, Plus, Clock, CheckCircle2, Truck, AlertTriangle, Eye, RefreshCw, Layers } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = "/api/orders?";
      if (statusFilter !== "ALL") url += `status=${statusFilter}&`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Failed to load admin orders", e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case "IN_TRANSIT":
      case "READY_FOR_DISPATCH":
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold text-[11px] rounded-full border border-blue-200 flex items-center gap-1"><Truck className="w-3 h-3" /> In Transit</span>;
      case "PRODUCTION_SCHEDULED":
      case "IN_PRODUCTION":
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-extrabold text-[11px] rounded-full border border-purple-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled</span>;
      case "DELIVERED":
        return <span className="px-2.5 py-1 bg-concrete-100 text-charcoal-black font-extrabold text-[11px] rounded-full border border-concrete-300 flex items-center gap-1">✓ Delivered</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-extrabold text-[11px] rounded-full border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> {status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-accent-orange" /> Enterprise Order Management
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Review incoming contractor orders, approve commercial terms, and schedule central plant batching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-xl text-xs font-bold transition-all border border-concrete-200"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/orders"
            className="px-4 py-2.5 bg-charcoal-black text-white text-xs font-extrabold rounded-xl hover:bg-black flex items-center gap-2 shadow-sm transition-all"
          >
            <Layers className="w-4 h-4 text-accent-orange" /> Open Command Hub
          </Link>
          <Link
            href="/orders/new"
            className="px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold rounded-xl hover:bg-orange-600 flex items-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Create Order
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["ALL", "SUBMITTED", "APPROVED", "PRODUCTION_SCHEDULED", "DELIVERED"].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
              statusFilter === st
                ? "bg-accent-orange text-white shadow-sm"
                : "bg-white border border-concrete-200 text-concrete-600 hover:bg-concrete-50"
            }`}
          >
            {st === "PRODUCTION_SCHEDULED" ? "SCHEDULED" : st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-concrete-500 text-xs font-semibold flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-accent-orange" />
            Loading enterprise orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-concrete-500 font-medium">
            No orders found for the selected status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-extrabold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Grade & Volume</th>
                  <th className="p-4">Delivery Date</th>
                  <th className="p-4">AI Risk</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-concrete-50/50 transition-colors">
                    <td className="p-4 font-bold text-charcoal-black">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-accent-orange" />
                        {o.orderNumber}
                      </div>
                    </td>

                    <td className="p-4 font-medium text-charcoal-black">
                      {o.customer?.fullName || "Enterprise Client"}
                      <div className="text-[10px] text-concrete-500 truncate max-w-xs">{o.project?.projectName || o.deliveryAddress}</div>
                    </td>

                    <td className="p-4">
                      <span className="font-extrabold text-accent-orange">{o.concreteGrade}</span> • {o.totalQuantity || o.quantity} m³
                      <div className="text-[10px] text-concrete-500">₹{(o.totalAmount || o.estimatedValue || 0).toLocaleString("en-IN")}</div>
                    </td>

                    <td className="p-4 font-bold text-charcoal-black">
                      {new Date(o.requestedDeliveryDate || o.deliveryDate).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        o.aiRiskLevel === "HIGH" ? "bg-red-50 text-red-700" : o.aiRiskLevel === "MEDIUM" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {o.aiRiskLevel || "LOW"}
                      </span>
                    </td>

                    <td className="p-4">
                      {getStatusBadge(o.status)}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-lg font-bold text-xs border border-concrete-300 transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-accent-orange" /> Manage
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
