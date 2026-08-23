"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Plus, Clock, CheckCircle2, Truck, AlertTriangle, Eye, RefreshCw } from "lucide-react";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Failed to load orders", e);
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
      case "REJECTED":
      case "CANCELLED":
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 font-extrabold text-[11px] rounded-full border border-red-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {status}</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-extrabold text-[11px] rounded-full border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> {status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <Package className="w-6 h-6 text-accent-orange" /> My Orders & Delivery Tracking
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Track active Ready Mix Concrete batching orders, dispatch schedules, and delivery transit updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-xl text-xs font-bold transition-all border border-concrete-200"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/orders/new"
            className="px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold rounded-xl hover:bg-orange-600 flex items-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Place New Order
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-concrete-500 text-xs font-semibold flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-concrete-200">
          <RefreshCw className="w-6 h-6 animate-spin text-accent-orange" />
          Loading your concrete orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-concrete-200 p-12 text-center space-y-4 shadow-sm">
          <Package className="w-12 h-12 text-concrete-300 mx-auto" />
          <div className="text-sm font-bold text-charcoal-black">No active orders found</div>
          <p className="text-xs text-concrete-500 max-w-sm mx-auto">
            Generate a quote or place a direct ready mix concrete order with AI delivery planning.
          </p>
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-orange text-white text-xs font-bold rounded-xl shadow-md hover:bg-orange-600 transition-all"
          >
            <Plus className="w-4 h-4" /> Place Your First Order
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-extrabold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Mix Grade & Volume</th>
                  <th className="p-4">Delivery Site</th>
                  <th className="p-4">Requested Date</th>
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
                      <div className="text-[10px] text-concrete-400 font-normal">
                        Placed on {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-extrabold text-accent-orange">{o.concreteGrade}</span> • {o.totalQuantity || o.quantity} m³
                      <div className="text-[10px] text-concrete-500">
                        ₹{(o.totalAmount || o.estimatedValue || 0).toLocaleString("en-IN")}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-charcoal-black truncate max-w-xs">{o.deliveryAddress || "Site Location"}</div>
                      <div className="text-[10px] text-concrete-500">{o.siteCity || "Pune"}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-charcoal-black">
                        {new Date(o.requestedDeliveryDate || o.deliveryDate).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-concrete-500">{o.preferredTimeWindow || "Morning"}</div>
                    </td>

                    <td className="p-4">
                      {getStatusBadge(o.status)}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-lg font-bold text-xs border border-concrete-300 transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-accent-orange" /> Track Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
