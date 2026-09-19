"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  User, Building, Phone, Mail, Bell, ShieldCheck, 
  ChevronRight, Save, CheckCircle2, Smartphone, MapPin
} from "lucide-react";

export default function PortalProfilePage() {
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    companyName: "Prestige Construction & Infra Ltd",
    contactPerson: "Mr. Jaswanth Reddy",
    phone: "+91 98450 12345",
    email: "jaswanth@prestigeinfra.com",
    gstin: "29AABCP1345L1Z9",
    primarySiteAddress: "Plot 88, Electronic City Phase 1, Near Toll Plaza, Bangalore 560100",
    whatsappAlerts: true,
    smsDispatchAlerts: true,
    emailInvoices: true,
    emailQcCertificates: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/portal" className="text-xs text-gray-400 hover:text-white">Portal</Link>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-accent-orange font-medium">Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Client Profile & Preferences
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your site delivery contacts, billing company GSTIN, and automated alert channels.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company & Billing Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Building className="w-5 h-5 text-accent-orange" />
            <h3 className="text-base font-bold text-white">Company & Commercial Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Registered Company Name</label>
              <input
                type="text"
                value={prefs.companyName}
                onChange={(e) => setPrefs({ ...prefs, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-medium focus:border-accent-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-semibold">GSTIN Registration Number</label>
              <input
                type="text"
                value={prefs.gstin}
                onChange={(e) => setPrefs({ ...prefs, gstin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-accent-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Lead Site Representative</label>
              <input
                type="text"
                value={prefs.contactPerson}
                onChange={(e) => setPrefs({ ...prefs, contactPerson: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-medium focus:border-accent-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Primary Site Phone</label>
              <input
                type="text"
                value={prefs.phone}
                onChange={(e) => setPrefs({ ...prefs, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-medium focus:border-accent-orange focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-gray-400 block mb-1 font-semibold">Primary Site Delivery Address</label>
              <input
                type="text"
                value={prefs.primarySiteAddress}
                onChange={(e) => setPrefs({ ...prefs, primarySiteAddress: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-medium focus:border-accent-orange focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notification Subscriptions Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Bell className="w-5 h-5 text-accent-orange" />
            <h3 className="text-base font-bold text-white">Automated Pour Notifications</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold text-white block">WhatsApp Live Dispatch Updates</span>
                  <span className="text-gray-400">Receive mixer truck departure alerts, live GPS links, and driver contact</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.whatsappAlerts}
                onChange={(e) => setPrefs({ ...prefs, whatsappAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-accent-orange focus:ring-accent-orange bg-neutral-800 border-neutral-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="font-bold text-white block">SMS Immediate Delivery Alert</span>
                  <span className="text-gray-400">Receive SMS message when transit mixer is within 15 minutes of site</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.smsDispatchAlerts}
                onChange={(e) => setPrefs({ ...prefs, smsDispatchAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-accent-orange focus:ring-accent-orange bg-neutral-800 border-neutral-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold text-white block">Email Delivery Challans & Tax Invoices</span>
                  <span className="text-gray-400">Automated PDF receipts and GST e-invoices sent to accounting</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.emailInvoices}
                onChange={(e) => setPrefs({ ...prefs, emailInvoices: e.target.checked })}
                className="w-4 h-4 rounded text-accent-orange focus:ring-accent-orange bg-neutral-800 border-neutral-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="font-bold text-white block">Email NABL Compressive Strength Certificates</span>
                  <span className="text-gray-400">7-day and 28-day cube strength certificates emailed on publication</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.emailQcCertificates}
                onChange={(e) => setPrefs({ ...prefs, emailQcCertificates: e.target.checked })}
                className="w-4 h-4 rounded text-accent-orange focus:ring-accent-orange bg-neutral-800 border-neutral-700"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully!
            </span>
          ) : <span></span>}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-accent-orange hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            Save Profile Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
