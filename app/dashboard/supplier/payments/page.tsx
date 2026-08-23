"use client";

import React from "react";
import { FileText, Download } from "lucide-react";

export default function SupplierPaymentsPage() {
  const payments = [
    { id: "PAY-9041", po: "PO-2026-001", amount: 1850000, date: "2026-08-01", status: "CLEARED" },
    { id: "PAY-9042", po: "PO-2026-002", amount: 1240000, date: "2026-08-10", status: "PROCESSING" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-accent-orange" /> Supplier Payments & Disbursements
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Review accounts payable disbursements and bank transfer receipts.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
              <tr>
                <th className="p-4">Payment Ref</th>
                <th className="p-4">PO Number</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete-200">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-concrete-50/50">
                  <td className="p-4 font-bold text-charcoal-black">{p.id}</td>
                  <td className="p-4">{p.po}</td>
                  <td className="p-4 font-black text-accent-orange">₹{p.amount.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-concrete-600">{p.date}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700">
                      {p.status}
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
