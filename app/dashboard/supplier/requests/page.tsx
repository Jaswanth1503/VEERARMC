"use client";

import React from "react";
import { Package, CheckCircle2 } from "lucide-react";

export default function SupplierRequestsPage() {
  const requests = [
    { id: "PO-2026-001", item: "Grade 53 OPC Cement", quantity: "500 Tons", plant: "Central Plant 01", status: "PENDING_DISPATCH" },
    { id: "PO-2026-002", item: "20mm Coarse Aggregate", quantity: "800 Tons", plant: "North Plant 02", status: "FULFILLED" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <Package className="w-6 h-6 text-accent-orange" /> Raw Material Purchase Requests
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Purchase orders issued by Veera RMC batching plants for cement, aggregate, and admixtures.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
              <tr>
                <th className="p-4">PO Number</th>
                <th className="p-4">Material Required</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Destination Plant</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete-200">
              {requests.map(r => (
                <tr key={r.id} className="hover:bg-concrete-50/50">
                  <td className="p-4 font-bold text-charcoal-black">{r.id}</td>
                  <td className="p-4 font-extrabold text-accent-orange">{r.item}</td>
                  <td className="p-4 font-black">{r.quantity}</td>
                  <td className="p-4">{r.plant}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
