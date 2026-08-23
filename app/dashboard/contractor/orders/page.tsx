"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HardHat, Plus, Clock, CheckCircle2, Truck, Eye, RefreshCw, Layers } from "lucide-react";

export default function ContractorOrdersPage() {
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
      console.error("Failed to load contractor orders", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <HardHat className="w-6 h-6 text-accent-orange" /> Contractor Project Orders
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Place direct batching requests, monitor structural pours, and schedule mixer truck arrivals.
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
            href="/orders/new"
            className="px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold rounded-xl hover:bg-orange-600 flex items-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Place Batching Order
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-concrete-500 text-xs font-semibold flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-concrete-200">
          <RefreshCw className="w-6 h-6 animate-spin text-accent-orange" />
          Loading project orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-concrete-200 p-12 text-center space-y-4 shadow-sm">
          <HardHat className="w-12 h-12 text-concrete-300 mx-auto" />
          <div className="text-sm font-bold text-charcoal-black">No active contractor orders found</div>
          <p className="text-xs text-concrete-500 max-w-sm mx-auto">
            Place direct batching orders or generate orders from structural blueprint analysis.
          </p>
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-orange text-white text-xs font-bold rounded-xl shadow-md hover:bg-orange-600 transition-all"
          >
            <Plus className="w-4 h-4" /> Place Project Order
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-extrabold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Project Site</th>
                  <th className="p-4">Grade & Quantity</th>
                  <th className="p-4">Delivery Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-concrete-50/50 transition-colors">
                    <td className="p-4 font-bold text-charcoal-black">{o.orderNumber}</td>
                    <td className="p-4 font-medium text-charcoal-black">
                      {o.project?.projectName || o.deliveryAddress || "Active Jobsite"}
                      <div className="text-[10px] text-concrete-500">{o.siteCity || "Pune"}</div>
                    </td>
                    <td className="p-4 font-extrabold text-accent-orange">
                      {o.concreteGrade} • {o.totalQuantity || o.quantity} m³
                    </td>
                    <td className="p-4 font-bold text-charcoal-black">
                      {new Date(o.requestedDeliveryDate || o.deliveryDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-concrete-100 font-extrabold text-[11px] rounded-full border border-concrete-300">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-lg font-bold text-xs border border-concrete-300 transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-accent-orange" /> Track & Manage
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
