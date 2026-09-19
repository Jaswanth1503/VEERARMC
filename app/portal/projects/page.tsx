"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building, MapPin, Calendar, Layers, ArrowUpRight, 
  ChevronRight, Search, CheckCircle2, AlertTriangle, ShieldCheck
} from "lucide-react";
import { PortalProjectItem } from "@/lib/portal/types/portal";

export default function PortalProjectsPage() {
  const [projects, setProjects] = useState<PortalProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/portal/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) setProjects(data.projects);
      })
      .catch((err) => console.error("Failed to load projects", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.code.toLowerCase().includes(search.toLowerCase()) ||
                          p.siteAddress.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/portal" className="text-xs text-gray-400 hover:text-white">Portal</Link>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-accent-orange font-medium">Projects</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Construction Projects
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track site progression, concrete grade mix utilization, and delivery fulfillment.
          </p>
        </div>

        <Link
          href="/quote"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-orange hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-orange-500/20"
        >
          <Building className="w-4 h-4" />
          Request New Pour Quote
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name, code (e.g. PRJ-2026-001) or site address..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent-orange"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {["ALL", "ACTIVE", "PLANNING", "COMPLETED"].map((stat) => (
            <button
              key={stat}
              onClick={() => setStatusFilter(stat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                statusFilter === stat
                  ? "bg-accent-orange text-white"
                  : "bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800"
              }`}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-gray-400">
          <Building className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <h3 className="text-lg font-bold text-white mb-1">No Projects Found</h3>
          <p className="text-sm">No projects matching your search criteria were found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 transition shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-1 bg-neutral-800 text-accent-orange rounded-md font-bold">
                      {project.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      project.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" :
                      project.status === "PLANNING" ? "bg-amber-500/20 text-amber-400" : "bg-neutral-800 text-gray-400"
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  {/* 0-100 Health score badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-gray-300">Health:</span>
                    <span className="text-emerald-400 font-bold">{project.healthScore}/100</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-white tracking-tight">{project.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{project.siteAddress}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Pour Fulfillment Progress</span>
                    <span className="font-bold text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-accent-orange h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Concrete Volume Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80 text-xs">
                  <div>
                    <span className="text-gray-500 block">Total Supplied</span>
                    <span className="text-sm font-bold text-white">{project.totalVolumeDelivered} m³</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Planned Contract Volume</span>
                    <span className="text-sm font-bold text-white">{project.totalVolumeOrdered} m³</span>
                  </div>
                </div>

                {/* Mix Grades Used */}
                <div className="mt-4">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Specified Mix Grades:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.gradesUsed.map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded text-[11px] bg-neutral-800 text-gray-300 font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Target: {new Date(project.targetCompletionDate).toLocaleDateString()}
                </div>

                <Link
                  href="/portal/orders"
                  className="text-xs text-accent-orange hover:underline font-semibold inline-flex items-center gap-1"
                >
                  View Pour Schedule <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
