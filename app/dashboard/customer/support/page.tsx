"use client";

import React, { useState, useEffect } from "react";
import { Headset, Send, MessageSquare, CheckCircle2 } from "lucide-react";

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (e) {
      console.error("Failed to load support tickets", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return alert("Please fill in subject and description.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description })
      });

      if (res.ok) {
        alert("✅ Support ticket submitted successfully.");
        setSubject("");
        setDescription("");
        fetchTickets();
      }
    } catch (err) {
      alert("Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <Headset className="w-6 h-6 text-accent-orange" /> Enterprise Customer Support
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Submit technical inquiries, site delivery assistance requests, or quality test feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Submit Form */}
        <div className="bg-white rounded-2xl border border-concrete-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-charcoal-black flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent-orange" /> Submit Support Ticket
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-concrete-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Slump test inquiry for Order #VRMC-ORD-0001"
                className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-concrete-700 mb-1">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your inquiry or site requirement..."
                className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-accent-orange text-white font-extrabold rounded-xl hover:bg-accent-orange/90 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Support Ticket"}
            </button>
          </form>
        </div>

        {/* Existing Tickets List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-concrete-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-charcoal-black">Support History & Status</h2>

          {loading ? (
            <div className="p-8 text-center text-concrete-500 text-xs">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-concrete-400 text-xs">No active support tickets.</div>
          ) : (
            <div className="divide-y divide-concrete-200">
              {tickets.map(t => (
                <div key={t.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-charcoal-black">{t.ticketNumber}: {t.subject}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-concrete-600 line-clamp-2">{t.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
