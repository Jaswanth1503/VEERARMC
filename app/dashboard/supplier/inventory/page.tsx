"use client";

import React, { useState, useEffect } from "react";
import { Briefcase } from "lucide-react";

export default function SupplierInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error("Failed to load supplier inventory", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-accent-orange" /> Raw Material Stock Levels
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Monitor plant stock levels and refill thresholds for aggregate, cement, and chemical supplies.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-concrete-500 text-xs font-medium">Loading raw material stock...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-200">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-concrete-50/50">
                    <td className="p-4 font-bold text-charcoal-black">{item.itemName}</td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4 font-black text-accent-orange">{item.currentStock} {item.unit}</td>
                    <td className="p-4 font-bold">{item.unit}</td>
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
