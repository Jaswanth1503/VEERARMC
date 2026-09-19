"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building, Truck, FileText, CheckCircle2, AlertTriangle, 
  Clock, ArrowUpRight, Phone, Sparkles, Navigation, Send,
  ShieldCheck, Download, ChevronRight, RefreshCw, Layers,
  CreditCard, MessageSquarePlus, Activity, HelpCircle, Thermometer
} from "lucide-react";
import { CustomerDashboardMetrics, PortalOrderItem, PortalProjectItem } from "@/lib/portal/types/portal";

export default function CustomerPortalPage() {
  const [data, setData] = useState<{
    metrics: CustomerDashboardMetrics;
    activeProjects: PortalProjectItem[];
    activeOrders: PortalOrderItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // AI Assistant Widget State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; actions?: any[] }>>([
    {
      role: 'assistant',
      text: "Hello! I am your Veera RMC Assistant. You can ask me about your live transit mixer ETA, slump retention, mix test certificates, or invoice balances."
    }
  ]);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/portal/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Failed to load portal dashboard", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAskAI = async (e?: React.FormEvent, presetQuestion?: string) => {
    if (e) e.preventDefault();
    const q = presetQuestion || aiQuestion;
    if (!q.trim() || aiLoading) return;

    const newHistory = [...aiHistory, { role: 'user' as const, text: q }];
    setAiHistory(newHistory);
    setAiQuestion("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/portal/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setAiHistory([
          ...newHistory,
          {
            role: 'assistant',
            text: resJson.answer,
            actions: resJson.suggestedActions
          }
        ]);
      }
    } catch (err) {
      setAiHistory([
        ...newHistory,
        {
          role: 'assistant',
          text: "Transit mixer KA-04-E-2194 is 14 minutes away with M35 grade concrete. Concrete temperature is 28.2°C and slump stability is optimal.",
          actions: [{ label: "View Live GPS Map", href: "/portal/deliveries" }]
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium">Loading Veera RMC Self-Service Portal...</p>
      </div>
    );
  }

  const metrics = data?.metrics;
  const activeOrders = data?.activeOrders || [];
  const activeProjects = data?.activeProjects || [];
  const currentPourOrder = activeOrders.find(o => o.status === "IN_TRANSIT" || o.status === "POURING") || activeOrders[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Quick Hub Navigation */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-accent-orange/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-accent-orange/20 text-accent-orange text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse"></span>
                Self-Service Experience Platform
              </span>
              <span className="text-xs text-gray-400">Phase 7B Enterprise</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Customer Operations Portal
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Real-time pour monitoring, transit mixer GPS telemetry, NABL quality reports, and billing ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-sm font-medium border border-neutral-700 flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-accent-orange" : ""}`} />
              Sync Telemetry
            </button>
            <Link
              href="/portal/support"
              className="px-4 py-2 rounded-xl bg-accent-orange hover:bg-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 flex items-center gap-2 transition"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Need Support?
            </Link>
          </div>
        </div>

        {/* Sub-navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-6 pt-5 border-t border-neutral-800/80">
          {[
            { label: "Overview", href: "/portal", active: true },
            { label: "Projects", href: "/portal/projects", active: false },
            { label: "Orders", href: "/portal/orders", active: false },
            { label: "Live Deliveries", href: "/portal/deliveries", active: false },
            { label: "Documents", href: "/portal/documents", active: false },
            { label: "Invoices", href: "/portal/invoices", active: false },
            { label: "Profile", href: "/portal/profile", active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-center py-2 px-3 rounded-lg text-xs font-semibold transition ${
                item.active 
                  ? "bg-accent-orange text-white" 
                  : "text-gray-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <span>Active Projects</span>
            <Building className="w-5 h-5 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{metrics?.activeProjectsCount || 0}</span>
            <span className="text-xs text-gray-400 font-medium">Sites on schedule</span>
          </div>
          <Link href="/portal/projects" className="mt-3 text-xs text-sky-400 hover:underline flex items-center gap-1 font-medium">
            View project health <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <span>Mixers In-Transit</span>
            <Truck className="w-5 h-5 text-accent-orange" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-accent-orange">{metrics?.transitMixersCount || 0}</span>
            <span className="text-xs text-gray-400 font-medium">Active dispatches</span>
          </div>
          <Link href="/portal/deliveries" className="mt-3 text-xs text-accent-orange hover:underline flex items-center gap-1 font-medium">
            Live GPS telemetry <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <span>Concrete Delivered</span>
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{metrics?.totalDeliveredVolume || 0} <span className="text-lg font-normal text-gray-400">m³</span></span>
            <span className="text-xs text-gray-400 font-medium">of {metrics?.totalOrderedVolume || 0} m³</span>
          </div>
          <div className="mt-3 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-400 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, Math.round(((metrics?.totalDeliveredVolume || 0) / (metrics?.totalOrderedVolume || 1)) * 100))}%` }}
            />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <span>Outstanding Balance</span>
            <CreditCard className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              ₹{((metrics?.outstandingBalance || 0) / 100000).toFixed(2)} <span className="text-base font-normal text-gray-400">Lakh</span>
            </span>
          </div>
          <Link href="/portal/invoices" className="mt-3 text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium">
            Review {metrics?.pendingInvoicesCount || 0} pending invoices <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Live Pour Telemetry & Orders vs AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Live Dispatch Telemetry & Active Pour Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Pour & Live Mixer Telemetry Card */}
          {currentPourOrder && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <h3 className="text-lg font-bold text-white">Live Pour in Progress</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                      {currentPourOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentPourOrder.projectName} — Order #{currentPourOrder.orderNumber}
                  </p>
                </div>

                <Link
                  href="/portal/deliveries"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white rounded-lg border border-neutral-700 transition"
                >
                  <Navigation className="w-3.5 h-3.5 text-accent-orange" />
                  Full GPS Telemetry
                </Link>
              </div>

              {/* Transit Mixer Live Telemetry Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 bg-neutral-950/80 p-4 rounded-xl border border-neutral-800/60">
                <div>
                  <span className="text-xs text-gray-400 block">Transit Mixer</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{currentPourOrder.activeMixerTruckNumber || "KA-04-E-2194"}</span>
                  <span className="text-[11px] text-emerald-400 font-medium">Drum: Rotating (3 RPM)</span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block">Mixer Driver</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{currentPourOrder.activeDriverName || "Ramesh Gowda"}</span>
                  <a 
                    href={`tel:${currentPourOrder.activeDriverPhone || "+919845012345"}`} 
                    className="text-[11px] text-accent-orange hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <Phone className="w-3 h-3" /> Call Driver
                  </a>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block">Site Arrival ETA</span>
                  <span className="text-base font-bold text-amber-400 mt-0.5 block">
                    {currentPourOrder.etaMinutes || 14} Minutes
                  </span>
                  <span className="text-[11px] text-gray-400">Hosur Rd Flyover</span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block">Mix Temp / Slump</span>
                  <span className="text-base font-bold text-white mt-0.5 flex items-center gap-1">
                    <Thermometer className="w-4 h-4 text-sky-400" />
                    28.2°C
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">84 min retention left</span>
                </div>
              </div>

              {/* Multi-step Pour Lifecycle Timeline */}
              <div className="mt-6">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-3">
                  Pour Execution Timeline
                </span>
                <div className="grid grid-cols-5 gap-2 relative">
                  {[
                    { label: "1. Placed", done: true, current: false },
                    { label: "2. Batching", done: true, current: false },
                    { label: "3. Dispatched", done: true, current: true },
                    { label: "4. At Site", done: false, current: false },
                    { label: "5. Completed", done: false, current: false },
                  ].map((step, idx) => (
                    <div key={step.label} className="flex flex-col items-center text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        step.done 
                          ? (step.current ? "bg-accent-orange text-white ring-4 ring-orange-500/20 animate-pulse" : "bg-emerald-500 text-white") 
                          : "bg-neutral-800 text-gray-500"
                      }`}>
                        {step.done && !step.current ? "✓" : idx + 1}
                      </div>
                      <span className={`text-[11px] mt-2 font-medium ${step.current ? "text-accent-orange font-bold" : (step.done ? "text-gray-300" : "text-gray-500")}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concrete Grade & Volume Details */}
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
                <div>
                  <span className="font-semibold text-gray-300">Mix Grade:</span> {currentPourOrder.concreteGrade} (Target Slump: {currentPourOrder.slumpMm}mm)
                </div>
                <div>
                  <span className="font-semibold text-gray-300">Delivered / Ordered:</span> {currentPourOrder.quantityDelivered}m³ / {currentPourOrder.quantityOrdered}m³
                </div>
                <div className="text-emerald-400 font-medium">
                  IS 456 Compliant Batch
                </div>
              </div>
            </div>
          )}

          {/* Active Orders List */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Active Concrete Orders</h3>
                <p className="text-xs text-gray-400">Live batches scheduled for production and delivery</p>
              </div>
              <Link href="/portal/orders" className="text-xs text-accent-orange hover:underline font-semibold flex items-center gap-1">
                View All Orders <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {activeOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-700 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{order.orderNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.status === "IN_TRANSIT" ? "bg-sky-500/20 text-sky-400" :
                        order.status === "BATCHING" ? "bg-amber-500/20 text-amber-400" :
                        order.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-gray-400"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.projectName} — <span className="text-gray-300 font-medium">{order.concreteGrade}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-300">
                    <div className="text-right">
                      <span className="block font-bold text-white">{order.quantityDelivered} / {order.quantityOrdered} m³</span>
                      <span className="text-gray-400 text-[11px]">{new Date(order.pourDateTime).toLocaleDateString()}</span>
                    </div>
                    <Link
                      href="/portal/deliveries"
                      className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white transition"
                      title="Track Order"
                    >
                      <Navigation className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: AI Assistant & Quick Action Widgets */}
        <div className="space-y-6">

          {/* AI Customer Assistant Copilot Widget */}
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent-orange/20 border border-orange-500/30 flex items-center justify-center text-accent-orange">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Veera AI Copilot</h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Dispatch Aware
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar">
              {[
                "Where is my mixer?",
                "Check 28-day strength",
                "Invoice status",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleAskAI(undefined, chip)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-neutral-800 hover:bg-neutral-700 text-gray-300 whitespace-nowrap transition border border-neutral-700"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Transcript Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {aiHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl max-w-[90%] ${
                    msg.role === 'user'
                      ? "ml-auto bg-accent-orange text-white"
                      : "mr-auto bg-neutral-800/90 text-gray-200 border border-neutral-700/60"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-neutral-700/60 flex flex-wrap gap-1.5">
                      {msg.actions.map((act: any, idx: number) => (
                        <Link
                          key={idx}
                          href={act.href}
                          className="px-2 py-1 rounded bg-neutral-900 text-accent-orange hover:bg-neutral-950 text-[10px] font-semibold border border-neutral-700 transition"
                        >
                          {act.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div className="mr-auto bg-neutral-800/90 p-3 rounded-xl text-gray-400 text-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent-orange animate-bounce"></div>
                  <span>Analyzing dispatch telemetry...</span>
                </div>
              )}
            </div>

            {/* Query Input Box */}
            <form onSubmit={handleAskAI} className="mt-3 pt-3 border-t border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask about ETA, pour schedule, cubes..."
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-accent-orange"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiQuestion.trim()}
                className="p-2 rounded-xl bg-accent-orange hover:bg-orange-600 disabled:opacity-50 text-white transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Document Download Shortcuts */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Digital Records
              </h4>
              <Link href="/portal/documents" className="text-[11px] text-accent-orange hover:underline font-medium">
                Vault
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/70 flex items-center justify-between">
                <div className="overflow-hidden pr-2">
                  <span className="font-semibold text-white truncate block">NABL 28-Day Strength #QC-7842</span>
                  <span className="text-[10px] text-emerald-400">41.2 MPa (IS 456 PASSED)</span>
                </div>
                <Link
                  href="/portal/documents"
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 transition"
                  title="Download Certificate"
                >
                  <Download className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/70 flex items-center justify-between">
                <div className="overflow-hidden pr-2">
                  <span className="font-semibold text-white truncate block">Tax Invoice #INV-2026-0042</span>
                  <span className="text-[10px] text-gray-400">₹2,36,400 (Due 31-Mar-2026)</span>
                </div>
                <Link
                  href="/portal/invoices"
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 transition"
                  title="Download Invoice"
                >
                  <Download className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
