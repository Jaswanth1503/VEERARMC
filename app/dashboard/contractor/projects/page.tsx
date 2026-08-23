"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building, Plus, MapPin, Calendar } from "lucide-react";

export default function ContractorProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error("Failed to load projects", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
            <Building className="w-6 h-6 text-accent-orange" /> Construction Projects
          </h1>
          <p className="text-xs text-concrete-600 mt-1">
            Manage commercial and residential construction projects, active pours, and structural requirements.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-concrete-500 text-xs font-medium">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-concrete-200 p-12 text-center space-y-4">
          <Building className="w-12 h-12 text-concrete-300 mx-auto" />
          <div className="text-sm font-bold text-charcoal-black">No active projects found</div>
          <p className="text-xs text-concrete-500 max-w-sm mx-auto">
            Projects are created automatically upon quote generation or blueprint analysis submission.
          </p>
          <Link
            href="/blueprint-analyzer"
            className="inline-flex px-5 py-2.5 bg-accent-orange text-white text-xs font-bold rounded-xl hover:bg-accent-orange/90"
          >
            Upload Blueprint Drawing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-concrete-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-charcoal-black text-base">{p.projectName}</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700">
                  {p.status}
                </span>
              </div>

              <div className="text-xs text-concrete-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                  <span>{p.location || "Pune, MH"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-concrete-400 shrink-0" />
                  <span>Created: {new Date(p.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
