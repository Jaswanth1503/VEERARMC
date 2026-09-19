"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CreditCard, Download, CheckCircle2, Clock, AlertTriangle, 
  ChevronRight, DollarSign, FileText, ArrowUpRight, X, ShieldCheck
} from "lucide-react";
import { PortalInvoiceItem } from "@/lib/portal/types/portal";

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<PortalInvoiceItem[]>([]);
  const [summary, setSummary] = useState<{
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
    overdueCount: number;
  }>({ totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0, overdueCount: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Payment Modal State
  const [payInvoice, setPayInvoice] = useState<PortalInvoiceItem | null>(null);
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    fetch("/api/portal/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (data.invoices) setInvoices(data.invoices);
        if (data.summary) setSummary(data.summary);
      })
      .catch((err) => console.error("Failed to load invoices", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaySuccess(true);
      setTimeout(() => {
        setPaySuccess(false);
        setPayInvoice(null);
        // Mark local as paid
        if (payInvoice) {
          setInvoices(prev => prev.map(inv => inv.id === payInvoice.id ? { ...inv, status: 'PAID', paidAmount: inv.totalAmount, balanceAmount: 0 } : inv));
          setSummary(prev => ({
            ...prev,
            totalPaid: prev.totalPaid + payInvoice.balanceAmount,
            totalOutstanding: Math.max(0, prev.totalOutstanding - payInvoice.balanceAmount)
          }));
        }
      }, 1500);
    }, 1200);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === "ALL") return true;
    return inv.status === statusFilter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/portal" className="text-xs text-gray-400 hover:text-white">Portal</Link>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-accent-orange font-medium">Invoices</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Invoices & Billing Ledger
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Transparent breakdown of concrete batch supplies, freight, pumping, and 18% GST.
          </p>
        </div>
      </div>

      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <span className="text-xs text-gray-400 block">Total Billed</span>
          <span className="text-2xl font-bold text-white mt-1 block">
            ₹{(summary.totalInvoiced / 100000).toFixed(2)} Lakh
          </span>
          <span className="text-[11px] text-gray-500">Cumulative concrete orders</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <span className="text-xs text-gray-400 block">Total Settled</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            ₹{(summary.totalPaid / 100000).toFixed(2)} Lakh
          </span>
          <span className="text-[11px] text-emerald-400/80">Paid via RTGS / Gateway</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <span className="text-xs text-gray-400 block">Outstanding Balance</span>
          <span className="text-2xl font-bold text-accent-orange mt-1 block">
            ₹{(summary.totalOutstanding / 100000).toFixed(2)} Lakh
          </span>
          <span className="text-[11px] text-accent-orange/80">Pending payment reconciliation</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <span className="text-xs text-gray-400 block">Overdue Invoices</span>
          <span className={`text-2xl font-bold mt-1 block ${summary.overdueCount > 0 ? "text-red-400" : "text-white"}`}>
            {summary.overdueCount}
          </span>
          <span className="text-[11px] text-gray-500">Exceeded credit payment terms</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {["ALL", "DUE", "OVERDUE", "PAID"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              statusFilter === st
                ? "bg-accent-orange text-white"
                : "bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-gray-400">
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <h3 className="text-lg font-bold text-white mb-1">No Invoices Found</h3>
          <p className="text-sm">There are no invoices matching the selected status.</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-neutral-950 text-gray-400 uppercase font-semibold text-[11px] border-b border-neutral-800">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Project & Order</th>
                  <th className="p-4">Billing Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Subtotal + GST</th>
                  <th className="p-4">Total (₹)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-800/50 transition">
                    <td className="p-4 font-mono font-bold text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{inv.projectName}</div>
                      <div className="text-[11px] text-gray-500">Order: {inv.orderNumber}</div>
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div>₹{inv.subtotal.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-gray-500">+18% GST (₹{inv.taxGst.toLocaleString('en-IN')})</div>
                    </td>
                    <td className="p-4 font-bold text-white text-sm">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.status === "PAID" ? "bg-emerald-500/20 text-emerald-400" :
                        inv.status === "OVERDUE" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href="/portal/documents"
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 transition text-[11px] font-semibold"
                        title="Download Invoice PDF"
                      >
                        PDF
                      </Link>
                      {inv.status !== "PAID" && (
                        <button
                          onClick={() => setPayInvoice(inv)}
                          className="px-3 py-1.5 rounded-lg bg-accent-orange hover:bg-orange-600 text-white font-semibold text-[11px] transition shadow-md"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Simulation Modal */}
      {payInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setPayInvoice(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Online Payment Gateway</h3>
            <p className="text-xs text-gray-400 mb-4">
              Invoice #{payInvoice.invoiceNumber} — {payInvoice.projectName}
            </p>

            {paySuccess ? (
              <div className="p-6 text-center text-emerald-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                <p className="font-bold">Payment Successful!</p>
                <p className="text-xs text-gray-400 mt-1">Receipt generated and ledger updated.</p>
              </div>
            ) : (
              <form onSubmit={handleSimulatePayment} className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Invoice Amount:</span>
                    <span className="font-bold text-white">₹{payInvoice.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>GST (18% Included):</span>
                    <span>₹{payInvoice.taxGst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold text-sm text-accent-orange">
                    <span>Total Payable:</span>
                    <span>₹{payInvoice.balanceAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Payment Method</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs">
                    <option>Corporate Net Banking (HDFC / ICICI / SBI)</option>
                    <option>NEFT / RTGS Virtual Account</option>
                    <option>Commercial Credit Line / UPI</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayInvoice(null)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paying}
                    className="px-4 py-2 rounded-xl bg-accent-orange hover:bg-orange-600 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {paying ? "Processing RTGS..." : `Pay ₹${payInvoice.balanceAmount.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
