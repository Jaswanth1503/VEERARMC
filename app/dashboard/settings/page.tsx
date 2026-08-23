"use client";

import React, { useState, useEffect } from "react";
import { User, Shield, Bell, Key, Save, CheckCircle2 } from "lucide-react";

export default function DashboardSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    notificationsEmail: true,
    notificationsSMS: false
  });

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setFormData(prev => ({
            ...prev,
            fullName: data.user.fullName || "",
            email: data.user.email || "",
            phone: data.user.phone || ""
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-black flex items-center gap-2">
          <User className="w-6 h-6 text-accent-orange" /> Account Settings
        </h1>
        <p className="text-xs text-concrete-500 mt-1">
          Manage your enterprise profile, security credentials, and alert notifications.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border border-concrete-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
            <User className="w-4 h-4 text-concrete-600" /> Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-accent-orange"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-concrete-50 text-sm text-concrete-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 text-sm focus:outline-none focus:border-accent-orange"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-concrete-700 uppercase mb-1">Role</label>
              <input
                type="text"
                value={user?.role?.roleName || user?.role || "User"}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-concrete-50 text-sm text-concrete-500 capitalize cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-concrete-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-charcoal-black flex items-center gap-2 border-b border-concrete-100 pb-3">
            <Bell className="w-4 h-4 text-concrete-600" /> Notifications & Alerts
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notificationsEmail}
                onChange={e => setFormData({ ...formData, notificationsEmail: e.target.checked })}
                className="w-4 h-4 text-accent-orange rounded"
              />
              <div>
                <span className="text-sm font-medium text-charcoal-black">Email Notifications</span>
                <p className="text-xs text-concrete-500">Receive order status updates, invoices, and dispatch alerts via email.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notificationsSMS}
                onChange={e => setFormData({ ...formData, notificationsSMS: e.target.checked })}
                className="w-4 h-4 text-accent-orange rounded"
              />
              <div>
                <span className="text-sm font-medium text-charcoal-black">SMS / WhatsApp Notifications</span>
                <p className="text-xs text-concrete-500">Receive real-time truck dispatch and ETA alerts on your mobile device.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-charcoal-black text-white rounded-xl text-sm font-bold hover:bg-concrete-800 transition-all flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
