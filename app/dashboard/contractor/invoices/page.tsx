"use client";

import React, { useState, useEffect } from "react";
import { FileText, Download } from "lucide-react";

export default function ContractorInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (e) {
      console.error("Failed to load contractor invoices", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-accent-orange" /> Contractor Invoices & Billing
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Review tax invoices and billing logs for contractor project orders.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-concrete-500 text-xs font-medium">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-concrete-200 p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-concrete-300 mx-auto" />
          <div className="text-sm font-bold text-charcoal-black">No invoices found</div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-200">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-concrete-50/50 transition-colors">
                    <td className="p-4 font-bold text-charcoal-black">{inv.invoiceNumber}</td>
                    <td className="p-4 font-extrabold text-accent-orange">₹{inv.amount.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-concrete-600">{new Date(inv.dueDate).toLocaleDateString("en-IN")}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="px-3 py-1.5 bg-concrete-100 text-concrete-700 rounded-lg font-semibold hover:bg-concrete-200 text-[11px] inline-flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> PDF Receipt
                      </button>
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
