"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Truck, MapPin, Clock, CheckCircle2, Navigation } from "lucide-react";

export default function CustomerDeliveriesPage() {
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
      console.error("Failed to load deliveries", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <Truck className="w-6 h-6 text-accent-orange" /> Real-Time Transit Mixer Deliveries
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Monitor live RMC dispatch status, transit mixer location, and site arrival schedules.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-concrete-500 text-xs font-medium">Loading deliveries...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-concrete-200 p-12 text-center space-y-4">
          <Truck className="w-12 h-12 text-concrete-300 mx-auto" />
          <div className="text-sm font-bold text-charcoal-black">No active RMC deliveries</div>
          <p className="text-xs text-concrete-500 max-w-sm mx-auto">
            Place an order to schedule RMC transit mixer dispatches to your construction site.
          </p>
          <Link
            href="/recommendations"
            className="inline-flex px-5 py-2.5 bg-accent-orange text-white text-xs font-bold rounded-xl hover:bg-accent-orange/90"
          >
            Plan Delivery Window
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-2xl border border-concrete-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-charcoal-black text-sm">{o.orderNumber}</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700">
                  {o.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-concrete-50 p-3 rounded-xl">
                <div>
                  <span className="text-concrete-500 font-medium">Concrete Grade:</span>
                  <div className="font-extrabold text-accent-orange">{o.concreteGrade}</div>
                </div>
                <div>
                  <span className="text-concrete-500 font-medium">Volume:</span>
                  <div className="font-black text-charcoal-black">{o.quantity} m³</div>
                </div>
              </div>

              <div className="text-xs text-concrete-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                  <span className="truncate">{o.deliveryAddress || "Site Location"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-concrete-400 shrink-0" />
                  <span>Scheduled Date: {new Date(o.deliveryDate).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
