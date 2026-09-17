"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building, Plus, Search, Filter, Calendar, MapPin, 
  ArrowUpRight, AlertTriangle, CheckCircle2, Clock, 
  TrendingUp, Activity, Sparkles, X, ChevronRight, Layers, FileText
} from "lucide-react";

interface ProjectItem {
  id: string;
  projectCode: string;
  projectName: string;
  location: string;
  status: string;
  priority: string;
  progressPercentage: number;
  healthScore: number;
  estimatedValue: number;
  actualValue: number;
  startDate: string | null;
  targetDate: string | null;
  customerName: string;
  contractorName: string | null;
  ordersCount: number;
  milestonesCount: number;
  activeRisksCount: number;
  createdAt: string;
}

interface PortfolioStats {
  totalProjectsCount: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  atRiskProjectsCount: number;
  totalPipelineValueINR: number;
  averageHealthScore: number;
}

export default function ProjectsHubPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    location: "Pune, Maharashtra",
    description: "",
    priority: "MEDIUM",
    targetDate: "",
    estimatedValue: 2500000,
    initialConcreteVolumeM3: 250
  });

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const url = statusFilter === "ALL" 
        ? "/api/projects" 
        : `/api/projects?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.portfolio) setPortfolio(data.portfolio);
      }
    } catch (e) {
      console.error("Failed to load projects:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimatedValue: Number(formData.estimatedValue),
          initialConcreteVolumeM3: Number(formData.initialConcreteVolumeM3)
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setFormData({
          projectName: "",
          location: "Pune, Maharashtra",
          description: "",
          priority: "MEDIUM",
          targetDate: "",
          estimatedValue: 2500000,
          initialConcreteVolumeM3: 250
        });
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.projectName.toLowerCase().includes(q) ||
      p.projectCode.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 font-black text-xs rounded-lg tracking-wider">
              ENTERPRISE PROJECT MANAGEMENT
            </span>
            <span className="text-xs text-concrete-500 font-semibold">• Lifecycle & Execution Platform</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-charcoal-black tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-accent-orange" /> Projects Command Hub
          </h1>
          <p className="text-xs md:text-sm text-concrete-600">
            End-to-end execution of RMC customer engagements from Quote to Raft Pour, Logistics dispatch, and 28-day strength certification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-accent-orange hover:bg-orange-600 text-white text-xs font-black rounded-2xl shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>

          <Link
            href="/dashboard/project-manager"
            className="px-4 py-2.5 bg-charcoal-black hover:bg-black text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center gap-2 transition-all"
          >
            <Activity className="w-4 h-4 text-emerald-400" /> PM Command Deck
          </Link>
        </div>
      </div>

      {/* Portfolio Overview KPIs */}
      {portfolio && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Total Projects</span>
            <div className="text-xl md:text-2xl font-black text-charcoal-black mt-1">
              {portfolio.totalProjectsCount}
            </div>
            <span className="text-[10px] font-bold text-concrete-500 mt-1 block">
              {portfolio.activeProjectsCount} Active In-Flight
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Pipeline Value</span>
            <div className="text-xl md:text-2xl font-black text-charcoal-black mt-1">
              ₹{(portfolio.totalPipelineValueINR / 10000000).toFixed(2)} <span className="text-xs font-bold text-concrete-500">Cr</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 mt-1 block flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Contracted Run-Rate
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Avg Health Score</span>
            <div className="text-xl md:text-2xl font-black text-emerald-700 mt-1">
              {portfolio.averageHealthScore}/100
            </div>
            <span className="text-[10px] font-bold text-emerald-600 mt-1 block">
              Optimal Execution
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">At-Risk Projects</span>
            <div className="text-xl md:text-2xl font-black text-accent-orange mt-1">
              {portfolio.atRiskProjectsCount}
            </div>
            <span className="text-[10px] font-bold text-amber-600 mt-1 block">
              {portfolio.atRiskProjectsCount === 0 ? "Zero Critical Slippages" : "Requires PM Action"}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">Completed Pours</span>
            <div className="text-xl md:text-2xl font-black text-purple-700 mt-1">
              {portfolio.completedProjectsCount}
            </div>
            <span className="text-[10px] font-bold text-concrete-500 mt-1 block">
              100% Strength Certified
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-concrete-200 shadow-xs">
            <span className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider block">On-Time Dispatch</span>
            <div className="text-xl md:text-2xl font-black text-sky-600 mt-1">
              95.5%
            </div>
            <span className="text-[10px] font-bold text-sky-600 mt-1 block">
              IS 456 Slump Compliant
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-concrete-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search project name, code, site location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-concrete-50 border border-concrete-200 focus:outline-none focus:ring-2 focus:ring-accent-orange"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {["ALL", "ACTIVE", "IN_PROGRESS", "PLANNING", "COMPLETED", "ON_HOLD"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                statusFilter === st
                  ? "bg-charcoal-black text-white shadow-xs"
                  : "bg-concrete-100 text-concrete-600 hover:bg-concrete-200"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-concrete-500 bg-white rounded-3xl border border-concrete-200">
          Loading enterprise projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-concrete-200">
          <Building className="w-12 h-12 text-concrete-300 mx-auto" />
          <h3 className="font-bold text-sm text-charcoal-black">No projects found matching criteria</h3>
          <p className="text-xs text-concrete-500 max-w-sm mx-auto">
            Create your first turnkey ready-mix concrete project to initiate timeline tracking, batching schedules, and AI copilot insights.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-accent-orange text-white text-xs font-bold rounded-xl"
          >
            Create New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-3xl border border-concrete-200 shadow-xs hover:border-accent-orange transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-accent-orange tracking-wider uppercase">
                    {p.projectCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                      p.healthScore >= 80 ? "bg-emerald-100 text-emerald-800" : p.healthScore >= 60 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                    }`}>
                      Health {p.healthScore}%
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                      p.status === "ACTIVE" || p.status === "IN_PROGRESS" ? "bg-sky-100 text-sky-800" : "bg-concrete-100 text-concrete-800"
                    }`}>
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-base text-charcoal-black leading-snug hover:text-accent-orange transition-colors">
                    <Link href={`/projects/${p.id}`}>{p.projectName}</Link>
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-concrete-500 font-semibold mt-1">
                    <MapPin className="w-3.5 h-3.5 text-concrete-400" />
                    <span>{p.location}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-concrete-500">Execution Progress</span>
                    <span className="text-charcoal-black">{p.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-concrete-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-accent-orange h-full rounded-full transition-all"
                      style={{ width: `${Math.max(5, p.progressPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Specs Strip */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-concrete-100 text-xs">
                  <div>
                    <span className="text-[10px] text-concrete-400 font-bold uppercase block">Contract Value</span>
                    <span className="font-black text-charcoal-black">₹{(p.estimatedValue / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-concrete-400 font-bold uppercase block">Customer</span>
                    <span className="font-bold text-charcoal-black truncate block">{p.customerName}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-concrete-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-concrete-500 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{p.targetDate ? new Date(p.targetDate).toLocaleDateString() : "Flexible"}</span>
                </div>

                <Link
                  href={`/projects/${p.id}`}
                  className="px-3.5 py-1.5 bg-concrete-100 hover:bg-accent-orange hover:text-white text-charcoal-black text-xs font-black rounded-xl flex items-center gap-1 transition-all"
                >
                  <span>Open Deck</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 border border-concrete-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
              <div>
                <h3 className="font-black text-base text-charcoal-black">Initialize Turnkey RMC Project</h3>
                <p className="text-xs text-concrete-500">Seeds 7 lifecycle phases, foundation milestones & budget allocation</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-concrete-400 hover:text-charcoal-black rounded-xl hover:bg-concrete-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="block text-concrete-600 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro Line 3 Pier Package 4"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-concrete-600 mb-1">Site Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange"
                  />
                </div>

                <div>
                  <label className="block text-concrete-600 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-concrete-600 mb-1">Estimated Contract Value (₹)</label>
                  <input
                    type="number"
                    min="10000"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange"
                  />
                </div>

                <div>
                  <label className="block text-concrete-600 mb-1">Concrete Volume (m³)</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.initialConcreteVolumeM3}
                    onChange={(e) => setFormData({ ...formData, initialConcreteVolumeM3: Number(e.target.value) })}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-concrete-600 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 text-[11px] text-amber-900 font-medium">
                ⚡ Automatic Initialization: Creates 7 RMC lifecycle phases, seeds Foundation Raft Casting milestones, and allocates budget categories (Concrete Supply 72%, Pumping 12%, Logistics 8%, Testing 3%, Contingency 5%).
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-accent-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Initialize Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
