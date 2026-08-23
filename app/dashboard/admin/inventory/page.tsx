"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, ShieldCheck } from "lucide-react";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const data = await res.json();
        setInventory(data.items || []);
      }
    } catch (e) {
      console.error("Failed to load inventory", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-accent-orange" /> Batching Plant Raw Material Inventory
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Monitor cement silos, coarse/fine aggregates stock (tons), chemical admixtures, and diesel reserves.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-concrete-500 text-xs font-medium">Loading inventory data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Minimum Threshold</th>
                  <th className="p-4">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-200">
                {inventory.map(item => (
                  <tr key={item.id} className="hover:bg-concrete-50/50 transition-colors">
                    <td className="p-4 font-bold text-charcoal-black">{item.itemName}</td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4 font-black text-accent-orange">{item.currentStock} {item.unit}</td>
                    <td className="p-4 text-concrete-600">{item.minimumStock} {item.unit}</td>
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
