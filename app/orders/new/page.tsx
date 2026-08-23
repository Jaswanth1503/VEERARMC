"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Package, ArrowLeft, Send, Sparkles, Truck, CheckCircle2, 
  Calendar, Layers, FileSpreadsheet, HardHat, Building, AlertCircle
} from "lucide-react";

export default function CreateNewOrderWizard() {
  const router = useRouter();

  // Mode: "MANUAL" | "FROM_QUOTE" | "FROM_BLUEPRINT"
  const [creationMode, setCreationMode] = useState<"MANUAL" | "FROM_QUOTE" | "FROM_BLUEPRINT">("MANUAL");

  // Manual Form State
  const [concreteGrade, setConcreteGrade] = useState("M25");
  const [quantity, setQuantity] = useState<number>(30);
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState<string>(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [preferredTimeWindow, setPreferredTimeWindow] = useState("08:00 AM - 12:00 PM");
  const [deliveryAddress, setDeliveryAddress] = useState("Kharadi IT Park Road, Site Block B, Pune");
  const [siteCity, setSiteCity] = useState("Pune");
  const [pincode, setPincode] = useState("411014");
  const [siteContactName, setSiteContactName] = useState("Pradeep Verma");
  const [siteContactPhone, setSiteContactPhone] = useState("+91 98220 44556");
  const [pumpRequired, setPumpRequired] = useState(true);
  const [pumpType, setPumpType] = useState("BOOM_PUMP_24M");
  const [specialInstructions, setSpecialInstructions] = useState("Require slump of 120mm at point of discharge. First truck at 08:30 AM.");
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "CRITICAL">("NORMAL");

  // Selection list for Quote / Blueprint conversion
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (creationMode === "FROM_QUOTE") {
      fetchQuotes();
    } else if (creationMode === "FROM_BLUEPRINT") {
      fetchBlueprints();
    }
  }, [creationMode]);

  const fetchQuotes = async () => {
    setFetchingData(true);
    try {
      const res = await fetch("/api/quotes");
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes || []);
        if (data.quotes && data.quotes.length > 0) {
          setSelectedQuoteId(data.quotes[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchBlueprints = async () => {
    setFetchingData(true);
    try {
      const res = await fetch("/api/blueprints");
      if (res.ok) {
        const data = await res.json();
        setBlueprints(data.analyses || []);
        if (data.analyses && data.analyses.length > 0) {
          setSelectedBlueprintId(data.analyses[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingData(false);
    }
  };

  // Financial Estimates
  const unitPrice = 4500;
  const subtotal = quantity * unitPrice;
  const pumpCost = pumpRequired ? 5000 : 0;
  const tax = (subtotal + pumpCost) * 0.18;
  const estimatedTotal = subtotal + pumpCost + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (creationMode === "FROM_QUOTE") {
        if (!selectedQuoteId) return alert("Please select a quotation to convert.");
        const res = await fetch("/api/orders/from-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quoteId: selectedQuoteId })
        });
        const data = await res.json();
        if (res.ok) {
          router.push(`/orders/${data.order.id}`);
        } else {
          alert(data.error || "Failed to convert quote to order.");
        }
      } else if (creationMode === "FROM_BLUEPRINT") {
        if (!selectedBlueprintId) return alert("Please select a blueprint analysis to convert.");
        const res = await fetch("/api/orders/from-blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysisId: selectedBlueprintId,
            overrides: {
              requestedDeliveryDate,
              deliveryAddress,
              siteCity,
              pumpRequired,
              pumpType,
              siteContactName,
              siteContactPhone,
              specialInstructions
            }
          })
        });
        const data = await res.json();
        if (res.ok) {
          router.push(`/orders/${data.order.id}`);
        } else {
          alert(data.error || "Failed to convert blueprint to order.");
        }
      } else {
        // Direct Manual Order Creation
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            concreteGrade,
            quantity: Number(quantity),
            requestedDeliveryDate,
            preferredTimeWindow,
            deliveryAddress,
            siteCity,
            pincode,
            siteContactName,
            siteContactPhone,
            pumpRequired,
            pumpType: pumpRequired ? pumpType : undefined,
            specialInstructions,
            priority,
            status: "SUBMITTED"
          })
        });

        const data = await res.json();
        if (res.ok) {
          router.push(`/orders/${data.order.id}`);
        } else {
          alert(data.error || "Failed to place order.");
        }
      }
    } catch (e: any) {
      alert("Network error: " + (e.message || "Failed to process order request."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-concrete-600 hover:text-accent-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
          <span className="text-xs font-extrabold text-concrete-400">Order Creation Wizard</span>
        </div>

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm">
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <Package className="w-6 h-6 text-accent-orange" /> Place Commercial Ready Mix Concrete Order
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Choose your preferred order pipeline: direct mix specifications, approved quotation conversion, or structural blueprint findings.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            <button
              type="button"
              onClick={() => setCreationMode("MANUAL")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                creationMode === "MANUAL"
                  ? "bg-orange-50/50 border-accent-orange text-charcoal-black shadow-sm ring-1 ring-accent-orange"
                  : "bg-concrete-50 border-concrete-200 text-concrete-600 hover:bg-concrete-100"
              }`}
            >
              <div className="font-black text-xs flex items-center gap-1.5 text-accent-orange">
                <HardHat className="w-4 h-4" /> Direct Manual Order
              </div>
              <div className="text-[11px] text-concrete-500 mt-1">
                Specify grade, m³ volume, delivery date, and pump type directly.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCreationMode("FROM_QUOTE")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                creationMode === "FROM_QUOTE"
                  ? "bg-orange-50/50 border-accent-orange text-charcoal-black shadow-sm ring-1 ring-accent-orange"
                  : "bg-concrete-50 border-concrete-200 text-concrete-600 hover:bg-concrete-100"
              }`}
            >
              <div className="font-black text-xs flex items-center gap-1.5 text-accent-orange">
                <FileSpreadsheet className="w-4 h-4" /> Convert Approved Quote
              </div>
              <div className="text-[11px] text-concrete-500 mt-1">
                Auto-prefill verified commercial rates and volume from Phase 4C quote.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCreationMode("FROM_BLUEPRINT")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                creationMode === "FROM_BLUEPRINT"
                  ? "bg-orange-50/50 border-accent-orange text-charcoal-black shadow-sm ring-1 ring-accent-orange"
                  : "bg-concrete-50 border-concrete-200 text-concrete-600 hover:bg-concrete-100"
              }`}
            >
              <div className="font-black text-xs flex items-center gap-1.5 text-emerald-600">
                <Layers className="w-4 h-4" /> Convert Blueprint Analysis
              </div>
              <div className="text-[11px] text-concrete-500 mt-1">
                Auto-generate order from structural drawing takeoff quantities (Phase 4D).
              </div>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {creationMode === "FROM_QUOTE" && (
            <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-accent-orange" /> Select Approved Quotation
              </h2>
              {fetchingData ? (
                <div className="p-8 text-center text-xs text-concrete-500 font-semibold">Loading quotations...</div>
              ) : quotes.length === 0 ? (
                <div className="p-6 bg-concrete-50 rounded-xl border border-concrete-200 text-xs text-concrete-600 text-center">
                  No previous quotations found. You can <Link href="/quote" className="text-accent-orange font-bold underline">generate a new quote</Link> or switch to Direct Manual Order.
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-concrete-700">Available Quotations</label>
                  <select
                    value={selectedQuoteId}
                    onChange={e => setSelectedQuoteId(e.target.value)}
                    className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none focus:border-accent-orange"
                  >
                    {quotes.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.quoteNumber} — {q.projectName} ({q.concreteGradeCode}, {q.calculatedVolumeM3} m³, ₹{(q.totalAmount || 0).toLocaleString("en-IN")})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {creationMode === "FROM_BLUEPRINT" && (
            <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> Select Blueprint Analysis Record
              </h2>
              {fetchingData ? (
                <div className="p-8 text-center text-xs text-concrete-500 font-semibold">Loading blueprint analyses...</div>
              ) : blueprints.length === 0 ? (
                <div className="p-6 bg-concrete-50 rounded-xl border border-concrete-200 text-xs text-concrete-600 text-center">
                  No blueprint analysis records found. You can <Link href="/blueprint-analyzer" className="text-emerald-600 font-bold underline">upload a structural drawing</Link> or switch to Direct Manual Order.
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-concrete-700">Blueprint Analyses</label>
                  <select
                    value={selectedBlueprintId}
                    onChange={e => setSelectedBlueprintId(e.target.value)}
                    className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none focus:border-accent-orange"
                  >
                    {blueprints.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.recommendedGrade || "M25"}, ~{b.totalConcreteM3 || 0} m³)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Core Concrete & Pour Requirements */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
              <Truck className="w-4 h-4 text-accent-orange" /> Mix Design & Delivery Logistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Concrete Grade</label>
                <select
                  value={concreteGrade}
                  onChange={e => setConcreteGrade(e.target.value)}
                  disabled={creationMode !== "MANUAL"}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-black text-accent-orange focus:outline-none focus:border-accent-orange disabled:opacity-60"
                >
                  {["M10", "M15", "M20", "M25", "M30", "M35", "M40", "M50"].map(g => (
                    <option key={g} value={g}>{g} Grade Concrete</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Total Volume (m³)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  disabled={creationMode !== "MANUAL"}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none focus:border-accent-orange disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Order Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none"
                >
                  <option value="NORMAL">Normal Priority</option>
                  <option value="HIGH">High Priority (Urgent Pour)</option>
                  <option value="CRITICAL">Critical Continuous Pour</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Requested Pour Date</label>
                <input
                  type="date"
                  value={requestedDeliveryDate}
                  onChange={e => setRequestedDeliveryDate(e.target.value)}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Preferred Time Slot</label>
                <select
                  value={preferredTimeWindow}
                  onChange={e => setPreferredTimeWindow(e.target.value)}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none"
                >
                  <option value="06:00 AM - 09:00 AM">Early Morning (06:00 AM - 09:00 AM)</option>
                  <option value="08:00 AM - 12:00 PM">Morning Slot (08:00 AM - 12:00 PM)</option>
                  <option value="12:00 PM - 04:00 PM">Afternoon Slot (12:00 PM - 04:00 PM)</option>
                  <option value="04:00 PM - 08:00 PM">Evening Slot (04:00 PM - 08:00 PM)</option>
                  <option value="09:00 PM - 03:00 AM">Night Mat Pour (09:00 PM - 03:00 AM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Delivery Site & Contact Information */}
          <div className="bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
              <Building className="w-4 h-4 text-accent-orange" /> Site Location & Contact Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-concrete-700 mb-1">Site Delivery Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-medium text-charcoal-black focus:outline-none focus:border-accent-orange"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">City & Pincode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteCity}
                    onChange={e => setSiteCity(e.target.value)}
                    className="w-2/3 p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-1/3 p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black focus:outline-none"
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Site Contact Engineer / Receiver</label>
                <input
                  type="text"
                  value={siteContactName}
                  onChange={e => setSiteContactName(e.target.value)}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-medium text-charcoal-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  value={siteContactPhone}
                  onChange={e => setSiteContactPhone(e.target.value)}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-medium text-charcoal-black focus:outline-none"
                />
              </div>
            </div>

            {/* Concrete Pump Options */}
            <div className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-charcoal-black">Require Concrete Boom / Line Pump?</div>
                  <div className="text-[11px] text-concrete-500">Select if delivery requires mechanical pump placement at elevated floors or slabs.</div>
                </div>
                <input
                  type="checkbox"
                  checked={pumpRequired}
                  onChange={e => setPumpRequired(e.target.checked)}
                  className="w-5 h-5 accent-accent-orange cursor-pointer"
                />
              </div>

              {pumpRequired && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-concrete-200">
                  <div>
                    <label className="block text-[11px] font-bold text-concrete-700 mb-1">Recommended Pump Machine</label>
                    <select
                      value={pumpType}
                      onChange={e => setPumpType(e.target.value)}
                      className="w-full p-2 bg-white border border-concrete-300 rounded-lg text-xs font-bold text-charcoal-black focus:outline-none"
                    >
                      <option value="BOOM_PUMP_24M">24m Boom Pump (Up to 4 Floors)</option>
                      <option value="BOOM_PUMP_42M">42m Boom Pump (High Rise / High Volume)</option>
                      <option value="LINE_PUMP">Stationary Line Pump (Ground & Long Run)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-concrete-700 mb-1">Special Instructions & Slump Requirements</label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl text-xs text-charcoal-black focus:outline-none"
                placeholder="e.g. Slump 120mm, fiber mesh reinforcement, transit clearance instructions..."
              />
            </div>
          </div>

          {/* Cost Estimate & Submission Bar */}
          <div className="bg-charcoal-black text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-[11px] font-bold text-concrete-400 uppercase tracking-wider">Estimated Order Total (Incl. 18% GST)</div>
              <div className="text-3xl font-black text-accent-orange mt-1">
                ₹{estimatedTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-concrete-300 mt-0.5">
                {quantity} m³ @ ₹{unitPrice}/m³ {pumpRequired ? "+ ₹5,000 Pump Setup" : ""}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                href="/orders"
                className="px-5 py-3 rounded-xl border border-concrete-700 text-xs font-bold text-concrete-300 hover:bg-concrete-800 transition-all text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-accent-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-orange/30 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading ? "Placing Order & AI Risk Analysis..." : "Place Commercial Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
