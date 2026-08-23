"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HardHat, Send, ArrowRight } from "lucide-react";

export default function ContractorOrderPage() {
  const router = useRouter();
  const [concreteGrade, setConcreteGrade] = useState("M25");
  const [quantity, setQuantity] = useState(30);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) return alert("Please enter valid quantity.");

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concreteGrade, quantity, deliveryAddress })
      });

      if (res.ok) {
        alert("🎉 Concrete order placed successfully.");
        router.push("/dashboard/contractor");
      }
    } catch (e) {
      alert("Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <HardHat className="w-6 h-6 text-accent-orange" /> Contractor Direct Order
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Place direct batching requests for active project sites.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-concrete-700 mb-1">Concrete Grade</label>
            <select
              value={concreteGrade}
              onChange={e => setConcreteGrade(e.target.value)}
              className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl font-bold text-accent-orange focus:outline-none"
            >
              {["M20", "M25", "M30", "M35", "M40", "M50"].map(g => (
                <option key={g} value={g}>{g} Grade Concrete</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-concrete-700 mb-1">Quantity (m³)</label>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-sm font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-concrete-700 mb-1">Site Delivery Address</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              placeholder="e.g. Plot 42, Hinjewadi Phase 3, Pune"
              className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-orange text-white font-extrabold rounded-xl hover:bg-accent-orange/90 flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {loading ? "Submitting Order..." : "Confirm & Dispatch Order"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
