"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Headset, MessageSquarePlus, CheckCircle2, Clock, 
  AlertTriangle, ChevronRight, HelpCircle, X, ChevronDown, Send
} from "lucide-react";
import { PortalSupportTicketItem } from "@/lib/portal/types/portal";

export default function PortalSupportPage() {
  const [tickets, setTickets] = useState<PortalSupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Ticket Modal State
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("DELIVERY_DELAY");
  const [priority, setPriority] = useState("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/portal/support");
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/portal/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          description,
          category,
          priority,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTicketSuccess(true);
        setTimeout(() => {
          setTicketSuccess(false);
          setShowModal(false);
          setSubject("");
          setDescription("");
          fetchTickets();
        }, 1500);
      }
    } catch (e) {
      console.error("Failed to create ticket", e);
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "What is the maximum allowable transit time and slump retention window?",
      a: "As per IS 4926 standard, concrete must be completely discharged within 120 minutes from the time of batching at the plant. In hot weather conditions (>32°C), retarders are incorporated to guarantee workability for up to 150 minutes. You can monitor the real-time slump retention countdown on the Live Deliveries page."
    },
    {
      q: "How are 7-day and 28-day concrete cube compressive tests conducted?",
      a: "Three 150mm test cubes are cast at the site discharge point during every 50m³ batching interval. Samples are water-cured at 27±2°C in accordance with IS 516. NABL-accredited compressive test results are cryptographically verified and uploaded to your Document Vault automatically on Day 7 and Day 28."
    },
    {
      q: "What is Veera RMC's site rain delay or pump breakdown policy?",
      a: "If unforeseen site delays occur (such as sudden heavy rain or pump line blockage), immediately contact our dispatch team or open a High Priority Support Ticket. Our plant will halt subsequent transit mixer dispatches and adjust retarder dosage in any mixer already on route."
    },
    {
      q: "How can I request custom mix designs (e.g. self-compacting or silica fume)?",
      a: "Custom mix specifications can be configured using our AI Mix Recommendation Engine or by opening a Technical Support ticket. Our Quality Control lab will generate IS 10262 trial mix proportions within 24 hours."
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/portal" className="text-xs text-gray-400 hover:text-white">Portal</Link>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-accent-orange font-medium">Support & FAQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Customer Care & Ticketing Desk
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            SLA-guaranteed issue resolution for site delivery delays, mix quality, and billing queries.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-orange hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-orange-500/20"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Create Support Ticket
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Active Support Cases ({tickets.length})
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center text-gray-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
            <h3 className="text-base font-bold text-white mb-1">All Clear! No Open Tickets</h3>
            <p className="text-xs">You do not have any pending customer support or quality cases.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <span className="font-mono text-xs font-bold text-white bg-neutral-800 px-2 py-0.5 rounded">
                      {t.ticketNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.priority === "CRITICAL" || t.priority === "HIGH" ? "bg-red-500/20 text-red-400" :
                        t.priority === "MEDIUM" ? "bg-amber-500/20 text-amber-400" : "bg-neutral-800 text-gray-400"
                      }`}>
                        {t.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.status === "OPEN" ? "bg-sky-500/20 text-sky-400" :
                        t.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-400 animate-pulse" :
                        "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-bold text-white leading-snug">{t.subject}</h4>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-gray-500">
                  <span>Category: <strong className="text-gray-300">{t.category.replace("_", " ")}</strong></span>
                  {t.slaHoursRemaining !== undefined && t.slaHoursRemaining > 0 && (
                    <span className="text-amber-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" /> SLA: {t.slaHoursRemaining}h response
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technical FAQ Accordion */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <HelpCircle className="w-5 h-5 text-accent-orange" />
          <div>
            <h3 className="text-base font-bold text-white">Concrete Operations Knowledge Base & FAQ</h3>
            <p className="text-xs text-gray-400">Standard guidelines on slump test tolerances, cube curing, and site prep</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-4 hover:bg-neutral-900/60 transition"
              >
                <span className="text-xs sm:text-sm font-semibold text-white">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180 text-accent-orange" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-400 leading-relaxed border-t border-neutral-800/80">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Open Support Case</h3>
            <p className="text-xs text-gray-400 mb-4">
              Our dispatch and technical team responds to active pour tickets within 15 minutes.
            </p>

            {ticketSuccess ? (
              <div className="p-6 text-center text-emerald-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                <p className="font-bold">Ticket Submitted Successfully!</p>
                <p className="text-xs text-gray-400 mt-1">Ticket reference created and routed to dispatch lead.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Case Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                  >
                    <option value="DELIVERY_DELAY">Delivery Delay / Route Congestion</option>
                    <option value="QUALITY_ISSUE">Concrete Quality / Slump Adjustment</option>
                    <option value="BILLING_DISPUTE">Billing / Tax Invoice Query</option>
                    <option value="TECHNICAL_SUPPORT">Mix Design IS 10262 Support</option>
                    <option value="GENERAL_ENQUIRY">General Site Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                  >
                    <option value="MEDIUM">Medium (Within 2 Hours)</option>
                    <option value="HIGH">High (Site Waiting — 30 Min Response)</option>
                    <option value="CRITICAL">Critical (Active Pour Stoppage — 15 Min)</option>
                    <option value="LOW">Low (General Query)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Pump block on site, hold mixer dispatch #2"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Detailed Description</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe specific truck numbers, site contact phone, or slump observations..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-gray-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-accent-orange hover:bg-orange-600 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? "Submitting..." : "Submit Ticket"}
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
