"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building, HardHat, Layers, Truck, CheckCircle2, ArrowRight, ArrowLeft, 
  Sparkles, Download, Mail, Check, RotateCw, Calculator, FileText, 
  ShieldCheck, AlertCircle, Clock, ChevronRight, HelpCircle, Phone, FlaskConical
} from "lucide-react";

interface ConcreteGradeItem {
  id: string;
  gradeCode: string;
  name: string;
  description: string;
  nominalMix: string;
  compressiveStrength: number;
  basePricePerM3: number;
  applications: string[];
}

export default function QuoteGeneratorPage() {
  const [step, setStep] = useState(1);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [grades, setGrades] = useState<ConcreteGradeItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState<any>(null);
  const [userSession, setUserSession] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Project Details
    projectName: "",
    projectType: "Residential",
    constructionCategory: "Multi-Story Building",
    customerName: "",
    companyName: "",
    phone: "",
    email: "",
    siteAddress: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    projectDescription: "",

    // Step 2: Construction Details
    floors: 2,
    builtUpArea: 1500,
    constructionStage: "Slab & Columns",
    estimatedDuration: "3 Months",
    pouringFrequency: "Single Pour",
    estimatedPourDate: "",
    projectScale: "Medium",
    constructionType: "RCC Frame Structure",
    lengthMeters: 0,
    widthMeters: 0,
    heightMeters: 0,
    dimensionUnit: "METERS" as "METERS" | "FEET",

    // Step 3: Requirements
    concreteGradeCode: "M25",
    requiredQuantity: 30,
    inputUnit: "M3" as "M3" | "CUFT" | "CUYD" | "LITERS",
    wastagePercent: 5.0,
    slumpRequirement: "100-150 mm (Pumpable)",
    specialRequirements: "",

    // Step 4: Delivery
    preferredDeliveryWindow: "Morning (08:00 - 12:00)",
    pumpRequired: true,
    pumpType: "LINE_PUMP",
    siteAccessNotes: "Clear 4m wide access road available.",
    discountCode: ""
  });

  // Fetch session & pre-fill logged-in user details
  useEffect(() => {
    fetchSession();
    fetchGrades();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUserSession(data.user);
          setFormData(prev => ({
            ...prev,
            customerName: prev.customerName || data.user.fullName || "",
            email: prev.email || data.user.email || "",
            phone: prev.phone || data.user.phone || ""
          }));
        }
      }
    } catch (e) {
      console.warn("User not logged in or session fetch failed");
    }
  };

  const fetchGrades = async () => {
    setLoadingGrades(true);
    try {
      const res = await fetch("/api/quotes?action=grades");
      if (res.ok) {
        const data = await res.json();
        setGrades(data.grades || []);
      }
    } catch (e) {
      console.error("Failed to load concrete grades", e);
    } finally {
      setLoadingGrades(false);
    }
  };

  // Convert input quantity to M3 deterministically
  const calculateVolumeM3 = (): { baseM3: number; wastageM3: number; recommendedM3: number } => {
    let base = Number(formData.requiredQuantity) || 0;
    if (formData.inputUnit === "CUFT") base = base * 0.0283168;
    if (formData.inputUnit === "CUYD") base = base * 0.764555;
    if (formData.inputUnit === "LITERS") base = base / 1000;

    // Check manual dimension volume
    if (formData.lengthMeters > 0 && formData.widthMeters > 0 && formData.heightMeters > 0) {
      const dimVol = formData.lengthMeters * formData.widthMeters * formData.heightMeters;
      base = formData.dimensionUnit === "FEET" ? dimVol * 0.0283168 : dimVol;
    }

    base = Math.round(base * 100) / 100;
    const wastage = Math.round(base * (formData.wastagePercent / 100) * 100) / 100;
    const recommended = Math.round((base + wastage) * 10) / 10;

    return { baseM3: base, wastageM3: wastage, recommendedM3: recommended };
  };

  const volumeCalc = calculateVolumeM3();
  const selectedGradeObj = grades.find(g => g.gradeCode === formData.concreteGradeCode) || {
    basePricePerM3: 4800,
    name: "Grade M25 Premium Structural RCC"
  };

  // Quick preview pricing
  const previewSubtotal = Math.round(volumeCalc.recommendedM3 * (selectedGradeObj.basePricePerM3 || 4800));
  const previewTransport = 800;
  const previewPump = formData.pumpRequired ? 3500 : 0;
  const previewTaxable = previewSubtotal + previewTransport + previewPump;
  const previewGST = Math.round(previewTaxable * 0.18);
  const previewTotal = previewTaxable + previewGST;

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.projectName || !formData.customerName || !formData.phone || !formData.email || !formData.siteAddress || !formData.pincode) {
        alert("Please complete all required project and contact fields.");
        return;
      }
    }
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenerateQuote = async () => {
    setIsSubmitting(true);
    setStep(5); // AI Processing step

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate quotation.");
      }

      const data = await res.json();
      setGeneratedQuote(data.quote);
      setStep(6); // Result Page
    } catch (err: any) {
      console.error("Quote Generation Error:", err);
      alert(`Error: ${err.message || "Failed to generate quote. Please try again."}`);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (!generatedQuote?.id) return;
    try {
      const res = await fetch(`/api/quotes/${generatedQuote.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedQuote(data.quote);
        alert("🎉 Quote successfully accepted! You can now view it in your Dashboard.");
      }
    } catch (e) {
      alert("Failed to accept quote. Please try again.");
    }
  };

  const handleConvertToOrder = async () => {
    if (!generatedQuote?.id) return;
    try {
      const res = await fetch(`/api/quotes/${generatedQuote.id}/convert`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        alert(`✅ Order ${data.order.orderNumber} successfully created from Quote!`);
        window.location.href = `/dashboard/${userSession?.role?.roleName?.toLowerCase() || 'customer'}/orders`;
      }
    } catch (e) {
      alert("Failed to convert quote to order.");
    }
  };

  const stepsList = [
    { num: 1, label: "Project" },
    { num: 2, label: "Construction" },
    { num: 3, label: "Concrete" },
    { num: 4, label: "Delivery" },
    { num: 5, label: "Review & AI" },
    { num: 6, label: "Quote Result" }
  ];

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black font-sans pb-16">
      {/* Top Header Navbar */}
      <header className="bg-white border-b border-concrete-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-black tracking-tighter flex items-baseline text-lg">
              <span className="text-[#DA291C] italic mr-1">VEERA</span>
              <span className="text-[#008C45]">CONCRETE</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-orange/10 text-accent-orange font-bold font-mono">
              AI Quote Generator 2.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/quality-predictor"
              className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-200 text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1.5 transition-all"
            >
              <FlaskConical className="w-3.5 h-3.5" /> Quality Predictor
            </Link>
            <Link
              href="/ai-assistant"
              className="text-xs px-3 py-1.5 rounded-xl bg-concrete-100 border border-concrete-200 text-concrete-700 hover:text-accent-orange font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-orange" /> Ask Veera AI
            </Link>
            {userSession ? (
              <Link
                href={`/dashboard/${userSession.role?.roleName?.toLowerCase() || 'customer'}`}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-accent-orange text-white hover:bg-accent-orange/90 font-semibold shadow-sm transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs px-3.5 py-1.5 rounded-xl bg-concrete-800 text-white hover:bg-concrete-700 font-semibold shadow-sm transition-all"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {/* Progress Bar Header */}
        <div className="bg-white rounded-2xl border border-concrete-200 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2 scrollbar-none">
            {stepsList.map((s, idx) => (
              <div key={s.num} className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.num
                      ? "bg-accent-orange text-white ring-4 ring-accent-orange/20"
                      : step > s.num
                      ? "bg-emerald-600 text-white"
                      : "bg-concrete-100 text-concrete-500 border border-concrete-200"
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs font-bold ${step === s.num ? "text-accent-orange" : step > s.num ? "text-charcoal-black" : "text-concrete-400"}`}>
                  {s.label}
                </span>
                {idx < stepsList.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-1 ${step > s.num ? "bg-emerald-600" : "bg-concrete-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: PROJECT DETAILS */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-charcoal-black flex items-center gap-2">
                <Building className="w-5 h-5 text-accent-orange" /> Step 1: Project & Contact Information
              </h2>
              <p className="text-xs text-concrete-600 mt-1">
                Provide project name, construction category, and delivery site contact information.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g. Green Valley Villa Construction"
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Project Type *</label>
                <select
                  value={formData.projectType}
                  onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                >
                  {["Residential", "Commercial", "Industrial", "Infrastructure", "Hospital", "School", "Bridge", "Road", "Flyover", "Other"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Customer / Contact Name *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Company Name (Optional)</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Apex Builders Pvt Ltd"
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-concrete-700 mb-1">Site Delivery Address *</label>
                <input
                  type="text"
                  value={formData.siteAddress}
                  onChange={e => setFormData({ ...formData, siteAddress: e.target.value })}
                  placeholder="Plot/Survey No., Street, Landmark"
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Pune"
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g. 411001"
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-concrete-200">
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-accent-orange text-white font-bold text-sm rounded-xl hover:bg-accent-orange/90 flex items-center gap-2 shadow-sm transition-all"
              >
                Next: Construction Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONSTRUCTION DETAILS */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-charcoal-black flex items-center gap-2">
                <HardHat className="w-5 h-5 text-accent-orange" /> Step 2: Construction Details & Optional Dimension Calculator
              </h2>
              <p className="text-xs text-concrete-600 mt-1">
                Enter building dimensions or project floor scale to auto-estimate required concrete volume.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Number of Floors</label>
                <input
                  type="number"
                  value={formData.floors}
                  onChange={e => setFormData({ ...formData, floors: Number(e.target.value) })}
                  min={1}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Built-up Area (Sq Ft)</label>
                <input
                  type="number"
                  value={formData.builtUpArea}
                  onChange={e => setFormData({ ...formData, builtUpArea: Number(e.target.value) })}
                  min={100}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Construction Stage</label>
                <select
                  value={formData.constructionStage}
                  onChange={e => setFormData({ ...formData, constructionStage: e.target.value })}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                >
                  {["Footing & Foundation", "Plinth Beam", "Columns & Shear Walls", "Slab & Beams", "Driveway & Pavement", "Parapet & Finishing"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dimension Calculator Card */}
            <div className="p-4 rounded-2xl bg-concrete-50 border border-concrete-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-black flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-accent-orange" /> Optional: Auto Volume Calculator from Dimensions
                </span>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <button
                    onClick={() => setFormData({ ...formData, dimensionUnit: "METERS" })}
                    className={`px-2.5 py-1 rounded-lg border ${formData.dimensionUnit === "METERS" ? "bg-accent-orange text-white border-accent-orange" : "bg-white border-concrete-200 text-concrete-600"}`}
                  >
                    Meters
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, dimensionUnit: "FEET" })}
                    className={`px-2.5 py-1 rounded-lg border ${formData.dimensionUnit === "FEET" ? "bg-accent-orange text-white border-accent-orange" : "bg-white border-concrete-200 text-concrete-600"}`}
                  >
                    Feet
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-concrete-600">Length ({formData.dimensionUnit.toLowerCase()})</label>
                  <input
                    type="number"
                    value={formData.lengthMeters || ""}
                    onChange={e => setFormData({ ...formData, lengthMeters: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full p-2.5 bg-white border border-concrete-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-concrete-600">Width ({formData.dimensionUnit.toLowerCase()})</label>
                  <input
                    type="number"
                    value={formData.widthMeters || ""}
                    onChange={e => setFormData({ ...formData, widthMeters: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full p-2.5 bg-white border border-concrete-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-concrete-600">Height / Depth ({formData.dimensionUnit.toLowerCase()})</label>
                  <input
                    type="number"
                    value={formData.heightMeters || ""}
                    onChange={e => setFormData({ ...formData, heightMeters: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full p-2.5 bg-white border border-concrete-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {formData.lengthMeters > 0 && formData.widthMeters > 0 && formData.heightMeters > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                  Calculated Base Volume: <strong>{volumeCalc.baseM3} m³</strong> (Auto-populated in Step 3).
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-concrete-200">
              <button
                onClick={handlePrevStep}
                className="px-5 py-2.5 bg-concrete-100 text-concrete-700 font-bold text-sm rounded-xl hover:bg-concrete-200 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-accent-orange text-white font-bold text-sm rounded-xl hover:bg-accent-orange/90 flex items-center gap-2 shadow-sm transition-all"
              >
                Next: Concrete Requirements <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONCRETE REQUIREMENTS & UNIT CONVERSION */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-charcoal-black flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent-orange" /> Step 3: Concrete Grade & Deterministic Unit Conversion
              </h2>
              <p className="text-xs text-concrete-600 mt-1">
                Concrete grades are retrieved directly from the Veera RMC PostgreSQL product catalogue.
              </p>
            </div>

            {/* Grade Selection Cards */}
            <div>
              <label className="block text-xs font-bold text-concrete-700 mb-2">Select Concrete Grade *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {grades.map(g => (
                  <button
                    key={g.gradeCode}
                    onClick={() => setFormData({ ...formData, concreteGradeCode: g.gradeCode })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      formData.concreteGradeCode === g.gradeCode
                        ? "border-accent-orange bg-accent-orange/10 ring-2 ring-accent-orange/20"
                        : "border-concrete-200 bg-white hover:border-concrete-300"
                    }`}
                  >
                    <div className="font-extrabold text-charcoal-black text-sm flex items-center justify-between">
                      <span>{g.gradeCode}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-concrete-600 font-mono font-normal">
                        ₹{g.basePricePerM3}/m³
                      </span>
                    </div>
                    <div className="text-[11px] text-concrete-600 font-medium truncate mt-1">{g.name}</div>
                    <div className="text-[10px] text-concrete-500 mt-1 font-mono">{g.compressiveStrength} MPa @ 28 days</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Input & Unit Converter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Required Quantity *</label>
                <input
                  type="number"
                  value={formData.requiredQuantity}
                  onChange={e => setFormData({ ...formData, requiredQuantity: Number(e.target.value) })}
                  min={1}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Input Unit *</label>
                <select
                  value={formData.inputUnit}
                  onChange={e => setFormData({ ...formData, inputUnit: e.target.value as any })}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange font-semibold"
                >
                  <option value="M3">Cubic Meters (m³)</option>
                  <option value="CUFT">Cubic Feet (Cu Ft)</option>
                  <option value="CUYD">Cubic Yards (Cu Yd)</option>
                  <option value="LITERS">Liters</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Wastage Allowance (%)</label>
                <input
                  type="number"
                  value={formData.wastagePercent}
                  onChange={e => setFormData({ ...formData, wastagePercent: Number(e.target.value) })}
                  step={0.5}
                  min={0}
                  max={20}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>
            </div>

            {/* Deterministic Unit Conversion Result Display */}
            <div className="p-4 rounded-2xl bg-concrete-100 border border-concrete-200 text-xs text-concrete-800 space-y-1">
              <div className="font-bold text-charcoal-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Deterministic Quantity Conversion Breakdown:
              </div>
              <div>Input Quantity: <strong>{formData.requiredQuantity} {formData.inputUnit}</strong></div>
              <div>Base Volume: <strong>{volumeCalc.baseM3} m³</strong></div>
              <div>Wastage Margin (+{volumeCalc.wastageM3} m³ @ {formData.wastagePercent}%): <strong>+{volumeCalc.wastageM3} m³</strong></div>
              <div className="text-sm font-black text-accent-orange pt-1">
                Recommended Order Volume: {volumeCalc.recommendedM3} m³
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-concrete-200">
              <button
                onClick={handlePrevStep}
                className="px-5 py-2.5 bg-concrete-100 text-concrete-700 font-bold text-sm rounded-xl hover:bg-concrete-200 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-accent-orange text-white font-bold text-sm rounded-xl hover:bg-accent-orange/90 flex items-center gap-2 shadow-sm transition-all"
              >
                Next: Delivery Information <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DELIVERY INFORMATION */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-charcoal-black flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent-orange" /> Step 4: Delivery & Concrete Pumping Requirements
              </h2>
              <p className="text-xs text-concrete-600 mt-1">
                Specify delivery window time slot, pump logistics, and site access conditions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Preferred Delivery Time Window</label>
                <select
                  value={formData.preferredDeliveryWindow}
                  onChange={e => setFormData({ ...formData, preferredDeliveryWindow: e.target.value })}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                >
                  <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
                  <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                  <option value="Evening (16:00 - 20:00)">Evening (16:00 - 20:00)</option>
                  <option value="Night Pour (20:00 - 04:00)">Night Pour (20:00 - 04:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-concrete-700 mb-1">Estimated Pour Date</label>
                <input
                  type="date"
                  value={formData.estimatedPourDate}
                  onChange={e => setFormData({ ...formData, estimatedPourDate: e.target.value })}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-concrete-700 mb-1">Concrete Pump Required?</label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      type="radio"
                      name="pumpRequired"
                      checked={formData.pumpRequired === true}
                      onChange={() => setFormData({ ...formData, pumpRequired: true })}
                      className="accent-accent-orange w-4 h-4"
                    />
                    Yes, Pump Required
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      type="radio"
                      name="pumpRequired"
                      checked={formData.pumpRequired === false}
                      onChange={() => setFormData({ ...formData, pumpRequired: false })}
                      className="accent-accent-orange w-4 h-4"
                    />
                    No, Chute Discharge
                  </label>
                </div>
              </div>

              {formData.pumpRequired && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-concrete-700 mb-1">Select Pump Equipment Type</label>
                  <select
                    value={formData.pumpType}
                    onChange={e => setFormData({ ...formData, pumpType: e.target.value })}
                    className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange font-medium"
                  >
                    <option value="LINE_PUMP">Stationary Line Pump (Up to 100m pipeline distance)</option>
                    <option value="BOOM_PUMP_24M">24 Meter Mobile Boom Pump</option>
                    <option value="BOOM_PUMP_42M">42 Meter Heavy High-reach Boom Pump</option>
                  </select>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-concrete-700 mb-1">Site Access Notes & Instructions</label>
                <textarea
                  value={formData.siteAccessNotes}
                  onChange={e => setFormData({ ...formData, siteAccessNotes: e.target.value })}
                  placeholder="e.g. Narrow 4m road, overhead power line clearance, turning radius..."
                  rows={2}
                  className="w-full p-3 bg-concrete-50 border border-concrete-200 rounded-xl text-sm focus:outline-none focus:border-accent-orange resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-concrete-200">
              <button
                onClick={handlePrevStep}
                className="px-5 py-2.5 bg-concrete-100 text-concrete-700 font-bold text-sm rounded-xl hover:bg-concrete-200 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleGenerateQuote}
                className="px-8 py-3.5 bg-accent-orange text-white font-extrabold text-sm rounded-xl hover:bg-accent-orange/90 flex items-center gap-2 shadow-lg shadow-orange-950/20 transition-all"
              >
                Generate Quote & AI Analysis <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: AI ANALYSIS & COMPUTATION LOADING STATE */}
        {step === 5 && (
          <div className="bg-white rounded-2xl border border-concrete-200 p-12 text-center space-y-6 shadow-sm animate-fadeIn">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-accent-orange/20 animate-ping" />
              <div className="w-16 h-16 rounded-2xl bg-accent-orange text-white flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-charcoal-black">Veera AI Quote Engine Processing...</h3>
              <p className="text-xs text-concrete-600 max-w-md mx-auto">
                Running deterministic pricing formulas, fetching database concrete grade rates, calculating 18% GST tax, and generating qualitative structural advice.
              </p>
            </div>
          </div>
        )}

        {/* STEP 6: QUOTE RESULT PAGE */}
        {step === 6 && generatedQuote && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Result Card */}
            <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-concrete-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-charcoal-black">
                      Quotation #{generatedQuote.quoteNumber}
                    </h2>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 font-bold border border-emerald-500/30">
                      {generatedQuote.status}
                    </span>
                  </div>
                  <p className="text-xs text-concrete-600 mt-1">
                    Project: <strong>{generatedQuote.projectName}</strong> • Customer: <strong>{generatedQuote.customerName}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-concrete-500">Estimated Total Amount</div>
                  <div className="text-3xl font-black text-accent-orange">
                    ₹{generatedQuote.totalAmount?.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-concrete-500 mt-0.5">Incl. 18% GST • Valid for 14 Days</div>
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/quotes/${generatedQuote.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-concrete-800 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-concrete-700 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </a>

                  <button
                    onClick={async () => {
                      const res = await fetch(`/api/quotes/${generatedQuote.id}/send`, { method: "POST" });
                      if (res.ok) alert("📧 Quotation email sent successfully!");
                    }}
                    className="px-4 py-2 rounded-xl bg-concrete-100 border border-concrete-200 text-concrete-700 text-xs font-bold flex items-center gap-1.5 hover:bg-concrete-200 transition-all"
                  >
                    <Mail className="w-4 h-4" /> Email Quote
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {generatedQuote.status === "ACCEPTED" ? (
                    <button
                      onClick={handleConvertToOrder}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-all shadow-sm"
                    >
                      Convert to Official Order <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleAcceptQuote}
                      className="px-6 py-2.5 rounded-xl bg-accent-orange text-white text-xs font-extrabold flex items-center gap-1.5 hover:bg-accent-orange/90 transition-all shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept Quotation
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="bg-white rounded-2xl border border-concrete-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-charcoal-black flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-orange" /> Deterministic Cost & Item Breakdown
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-concrete-100 text-charcoal-black font-bold border-b border-concrete-200">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Unit Rate</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-concrete-200">
                      <td className="p-3">
                        <strong>Ready Mix Concrete — {generatedQuote.concreteGradeCode}</strong>
                        <div className="text-[11px] text-concrete-500 mt-0.5">
                          Requested: {generatedQuote.inputQuantity} {generatedQuote.inputUnit} (+ {generatedQuote.wastagePercent}% wastage allowance)
                        </div>
                      </td>
                      <td className="p-3 font-bold">{generatedQuote.concreteGradeCode}</td>
                      <td className="p-3">{generatedQuote.calculatedVolumeM3} m³</td>
                      <td className="p-3">₹{Math.round(generatedQuote.subtotal / generatedQuote.calculatedVolumeM3).toLocaleString("en-IN")}/m³</td>
                      <td className="p-3 text-right font-bold">₹{generatedQuote.subtotal?.toLocaleString("en-IN")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="w-full sm:w-80 ml-auto pt-3 space-y-1.5 text-xs text-concrete-700">
                <div className="flex justify-between">
                  <span>Concrete Subtotal:</span>
                  <span className="font-bold">₹{generatedQuote.subtotal?.toLocaleString("en-IN")}</span>
                </div>
                {generatedQuote.transportCost > 0 && (
                  <div className="flex justify-between">
                    <span>Transit Mixer Transport:</span>
                    <span>₹{generatedQuote.transportCost?.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {generatedQuote.pumpCost > 0 && (
                  <div className="flex justify-between">
                    <span>Pump Charge ({generatedQuote.pumpType || 'Line Pump'}):</span>
                    <span>₹{generatedQuote.pumpCost?.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {generatedQuote.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Promotional Discount:</span>
                    <span>-₹{generatedQuote.discountAmount?.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-concrete-200">
                  <span>Taxable Amount:</span>
                  <span className="font-bold">₹{generatedQuote.taxableAmount?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{generatedQuote.taxAmount?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-base font-black text-accent-orange pt-2 border-t-2 border-accent-orange">
                  <span>Estimated Total:</span>
                  <span>₹{generatedQuote.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* AI Technical Advice Panel */}
            {generatedQuote.aiSummary && (
              <div className="bg-white rounded-2xl border border-accent-orange/30 p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-accent-orange flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Veera AI Structural Assessment & Site Notes
                </h3>
                <p className="text-xs text-concrete-800 leading-relaxed bg-accent-orange/5 p-3.5 rounded-xl border border-accent-orange/20">
                  {generatedQuote.aiSummary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {generatedQuote.aiQuantityExplanation && (
                    <div className="p-3.5 rounded-xl bg-concrete-50 border border-concrete-200">
                      <strong className="text-charcoal-black block mb-1">Quantity Explanation:</strong>
                      <p className="text-concrete-600">{generatedQuote.aiQuantityExplanation}</p>
                    </div>
                  )}

                  {generatedQuote.aiDeliveryRecommendation && (
                    <div className="p-3.5 rounded-xl bg-concrete-50 border border-concrete-200">
                      <strong className="text-charcoal-black block mb-1">Delivery & Access Advice:</strong>
                      <p className="text-concrete-600">{generatedQuote.aiDeliveryRecommendation}</p>
                    </div>
                  )}
                </div>

                {/* Engineer Disclaimer */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Structural Engineer Disclaimer:</strong> AI grade recommendations are advisory guidelines. Final concrete mix grade selection must be verified and approved by a qualified structural engineer for your specific site conditions.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
