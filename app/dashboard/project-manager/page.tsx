"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building, AlertTriangle, CheckCircle2, Clock, 
  TrendingUp, Activity, ChevronRight, MapPin, Calendar, 
  Layers, ArrowUpRight, ShieldAlert, Sparkles, Filter
} from "lucide-react";

export default function ProjectManagerCommandCenter() {
  const [projects, setProjects] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        setPortfolio(data.portfolio || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const criticalProjects = projects.filter(p => p.healthScore < 75 || p.priority === "CRITICAL");
  const highValueProjects = [...projects].sort((a, b) => b.estimatedValue - a.estimatedValue).slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 font-black text-xs rounded-lg tracking-wider">
                PROJECT MANAGER COMMAND CENTER
              </span>
              <span className="text-xs text-concrete-500 font-semibold">• Critical Operations & Delivery Oversight</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-charcoal-black tracking-tight flex items-center gap-2">
              <Building className="w-7 h-7 text-accent-orange" /> Portfolio Command Deck
            </h1>
            <p className="text-xs md:text-sm text-concrete-600">
              Live supervision of foundation raft casting milestones, active slippages, and project profitability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="px-5 py-2.5 bg-accent-orange hover:bg-orange-600 text-white text-xs font-black rounded-2xl shadow-md flex items-center gap-2 transition-all"
            >
              <span>View All Projects</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Portfolio Stats */}
        {portfolio && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
              <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Contracted Pipeline</span>
              <div className="text-xl md:text-2xl font-black text-charcoal-black mt-1">
                ₹{(portfolio.totalPipelineValueINR / 10000000).toFixed(2)} Cr
              </div>
              <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Active Contracts</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
              <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Average Health</span>
              <div className="text-xl md:text-2xl font-black text-emerald-600 mt-1">
                {portfolio.averageHealthScore}%
              </div>
              <span className="text-[10px] font-bold text-concrete-500 mt-1 block">Target &gt; 80%</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
              <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Critical &amp; At-Risk</span>
              <div className="text-xl md:text-2xl font-black text-red-600 mt-1">
                {criticalProjects.length}
              </div>
              <span className="text-[10px] font-bold text-red-600 mt-1 block">Requires Attention</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
              <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">In-Flight Projects</span>
              <div className="text-xl md:text-2xl font-black text-purple-700 mt-1">
                {portfolio.activeProjectsCount}
              </div>
              <span className="text-[10px] font-bold text-concrete-500 mt-1 block">Active Batching</span>
            </div>
          </div>
        )}

        {/* 2-Col: Critical & At-Risk Projects vs High Value Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Critical / Attention Projects */}
          <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent-orange" />
                <h3 className="font-black text-base text-charcoal-black">Critical &amp; At-Risk Attention Deck</h3>
              </div>
              <span className="text-xs font-black text-accent-orange">{criticalProjects.length} Priority Flagged</span>
            </div>

            <div className="space-y-3">
              {criticalProjects.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200">
                  ✅ Zero critical project delays. All active projects are executing within schedule.
                </div>
              ) : (
                criticalProjects.map(p => (
                  <div key={p.id} className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-accent-orange uppercase">{p.projectCode}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                          p.healthScore < 70 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          Health {p.healthScore}%
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-charcoal-black">{p.projectName}</h4>
                      <p className="text-[11px] text-concrete-500 font-semibold">{p.location} • {p.customerName}</p>
                    </div>

                    <Link
                      href={`/projects/${p.id}`}
                      className="px-3.5 py-1.5 bg-white hover:bg-accent-orange hover:text-white text-charcoal-black border border-concrete-200 rounded-xl text-xs font-black transition-all"
                    >
                      Inspect
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: High Value Anchor Projects */}
          <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-base text-charcoal-black">High-Value Anchor Accounts</h3>
              </div>
              <span className="text-xs font-black text-emerald-700">Top 5 by Contract Size</span>
            </div>

            <div className="space-y-3">
              {highValueProjects.map(p => (
                <div key={p.id} className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-concrete-500 uppercase">{p.projectCode}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black">
                        ₹{(p.estimatedValue / 100000).toFixed(1)} Lakhs
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-charcoal-black">{p.projectName}</h4>
                    <span className="text-[10px] text-concrete-500 font-semibold">{p.progressPercentage}% Completed</span>
                  </div>

                  <Link
                    href={`/projects/${p.id}`}
                    className="px-3.5 py-1.5 bg-white hover:bg-black hover:text-white text-charcoal-black border border-concrete-200 rounded-xl text-xs font-black transition-all"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
