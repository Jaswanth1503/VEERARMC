"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Building, ArrowLeft, Calendar, MapPin, CheckCircle2, Clock, 
  AlertTriangle, Sparkles, Plus, Check, FileText, DollarSign, 
  Layers, Truck, ShieldAlert, Activity, ChevronRight, X, Send,
  RefreshCw, TrendingUp, Users, AlertCircle, Award
} from "lucide-react";
import { ProjectDetailDTO } from "@/lib/projects/types/project";
import { ProjectCopilotResponse } from "@/lib/projects/services/project-copilot.service";

export default function ProjectCommandCenterPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "MILESTONES" | "TASKS" | "BUDGET" | "RISKS" | "DOCUMENTS" | "COPILOT" | "ACTIVITY">("OVERVIEW");

  // AI Copilot State
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotInsights, setCopilotInsights] = useState<ProjectCopilotResponse | null>(null);

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", priority: "MEDIUM", assignedToName: "Site Engineer", dueDate: "" });

  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: "", targetDate: "", concreteVolumeM3: 60, ownerName: "Batch Plant Lead" });

  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskForm, setRiskForm] = useState({ title: "", riskType: "OPERATIONAL", severity: "HIGH", mitigationPlan: "" });

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchInitialCopilot();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialCopilot = async (question?: string) => {
    setCopilotLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question || "Assess overall project health and delay risk" })
      });
      if (res.ok) {
        const data = await res.json();
        setCopilotInsights(data.insights);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm)
      });
      if (res.ok) {
        setShowTaskModal(false);
        setTaskForm({ title: "", priority: "MEDIUM", assignedToName: "Site Engineer", dueDate: "" });
        fetchProjectDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: nextStatus })
      });
      if (res.ok) {
        fetchProjectDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...milestoneForm,
          concreteVolumeM3: Number(milestoneForm.concreteVolumeM3)
        })
      });
      if (res.ok) {
        setShowMilestoneModal(false);
        setMilestoneForm({ title: "", targetDate: "", concreteVolumeM3: 60, ownerName: "Batch Plant Lead" });
        fetchProjectDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, status: "COMPLETED" })
      });
      if (res.ok) {
        fetchProjectDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${projectId}/risks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(riskForm)
      });
      if (res.ok) {
        setShowRiskModal(false);
        setRiskForm({ title: "", riskType: "OPERATIONAL", severity: "HIGH", mitigationPlan: "" });
        fetchProjectDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-concrete-500 bg-white rounded-3xl border border-concrete-200">
        Loading project command center...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-concrete-200">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="font-bold text-sm text-charcoal-black">Project Not Found</h3>
        <Link href="/projects" className="text-xs font-bold text-accent-orange">
          Return to Projects Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back Link & Quick Breadcrumb */}
      <div className="flex items-center justify-between text-xs font-bold">
        <Link
          href="/projects"
          className="flex items-center gap-1.5 text-concrete-600 hover:text-charcoal-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Hub</span>
        </Link>

        <span className="text-concrete-400">
          Created on {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Main Project Command Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 font-black text-xs rounded-lg tracking-wider">
                {project.projectCode}
              </span>
              <span className={`px-2.5 py-1 text-xs font-black rounded-lg uppercase ${
                project.status === "ACTIVE" || project.status === "IN_PROGRESS" ? "bg-sky-100 text-sky-800" : "bg-concrete-100 text-concrete-800"
              }`}>
                {project.status.replace("_", " ")}
              </span>
              <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${
                project.priority === "CRITICAL" ? "bg-red-100 text-red-800" : project.priority === "HIGH" ? "bg-amber-100 text-amber-800" : "bg-concrete-100 text-concrete-700"
              }`}>
                {project.priority} PRIORITY
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-charcoal-black tracking-tight mt-1">
              {project.projectName}
            </h1>

            <div className="flex items-center gap-3 text-xs text-concrete-600 font-semibold flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-concrete-400" />
                {project.location || "Pune, MH"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-concrete-400" />
                Customer: <strong className="text-charcoal-black">{project.customerName}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-concrete-400" />
                Target: {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : "Flexible"}
              </span>
            </div>
          </div>

          {/* 0-100 Project Health Gauge Widget */}
          <div className="flex items-center gap-4 bg-concrete-50 p-4 rounded-2xl border border-concrete-200">
            <div className="text-right">
              <div className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider">Project Health</div>
              <div className={`text-2xl md:text-3xl font-black ${
                project.healthScore >= 80 ? "text-emerald-600" : project.healthScore >= 60 ? "text-amber-600" : "text-red-600"
              }`}>
                {project.healthScore}%
              </div>
              <span className="text-[10px] font-bold text-concrete-500 uppercase">
                {project.health.status}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xs border border-concrete-200">
              <Activity className={`w-6 h-6 ${
                project.healthScore >= 80 ? "text-emerald-500" : project.healthScore >= 60 ? "text-amber-500" : "text-red-500"
              }`} />
            </div>
          </div>
        </div>

        {/* Progress Bar & Contract Specs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-concrete-100 text-xs">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-concrete-500">Overall Progress</span>
              <span className="text-charcoal-black">{project.progressPercentage}%</span>
            </div>
            <div className="w-full bg-concrete-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-accent-orange h-full rounded-full transition-all"
                style={{ width: `${Math.max(5, project.progressPercentage)}%` }}
              />
            </div>
          </div>

          <div className="bg-concrete-50 p-3 rounded-xl border border-concrete-200">
            <span className="text-[10px] text-concrete-400 font-bold uppercase block">Contract Value</span>
            <span className="text-base font-black text-charcoal-black">₹{(project.estimatedValue / 100000).toFixed(1)} Lakhs</span>
          </div>

          <div className="bg-concrete-50 p-3 rounded-xl border border-concrete-200">
            <span className="text-[10px] text-concrete-400 font-bold uppercase block">Concrete Volume</span>
            <span className="text-base font-black text-purple-700">{project.totalVolumeM3 || 250} m³</span>
          </div>

          <div className="bg-concrete-50 p-3 rounded-xl border border-concrete-200">
            <span className="text-[10px] text-concrete-400 font-bold uppercase block">Active Risks</span>
            <span className={`text-base font-black ${project.risks.filter(r => r.status !== "RESOLVED").length > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {project.risks.filter(r => r.status !== "RESOLVED").length} Risks
            </span>
          </div>
        </div>
      </div>

      {/* Visual Lifecycle Stepper: Lead -> Quote -> Project -> Planning -> Production -> Logistics -> Completion */}
      <div className="bg-white p-5 rounded-3xl border border-concrete-200 shadow-xs">
        <div className="text-xs font-black text-charcoal-black uppercase tracking-wider mb-3">
          Lifecycle Execution Stream:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-bold">
          {[
            { step: "Lead / Inquiry", status: "DONE" },
            { step: "AI Quote & Design", status: "DONE" },
            { step: "Project Initiation", status: "DONE" },
            { step: "Planning & Procurement", status: project.progressPercentage >= 20 ? "DONE" : "IN_PROGRESS" },
            { step: "Batching & Production", status: project.progressPercentage >= 40 ? "DONE" : project.progressPercentage >= 20 ? "IN_PROGRESS" : "PENDING" },
            { step: "Logistics & Pour", status: project.progressPercentage >= 70 ? "DONE" : project.progressPercentage >= 40 ? "IN_PROGRESS" : "PENDING" },
            { step: "28-Day Strength Sign-off", status: project.progressPercentage >= 100 ? "DONE" : "PENDING" }
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                s.status === "DONE"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : s.status === "IN_PROGRESS"
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-concrete-50 border-concrete-200 text-concrete-400"
              }`}
            >
              <div className="text-[9px] font-black uppercase">Step 0{idx + 1}</div>
              <div className="text-xs font-bold mt-0.5 leading-tight">{s.step}</div>
              <span className="text-[9px] font-bold mt-1 block">
                {s.status === "DONE" ? "✓ Completed" : s.status === "IN_PROGRESS" ? "⏳ Active" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Command Center Tabs Switcher */}
      <div className="flex items-center gap-1.5 bg-concrete-100 p-1.5 rounded-2xl overflow-x-auto text-xs font-black">
        {[
          { id: "OVERVIEW", label: "Overview & Phases", icon: <Layers className="w-3.5 h-3.5" /> },
          { id: "MILESTONES", label: `Milestones (${project.milestones.length})`, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
          { id: "TASKS", label: `Tasks (${project.tasks.length})`, icon: <Clock className="w-3.5 h-3.5" /> },
          { id: "BUDGET", label: "Budget & Costs", icon: <DollarSign className="w-3.5 h-3.5" /> },
          { id: "RISKS", label: `Risks (${project.risks.length})`, icon: <ShieldAlert className="w-3.5 h-3.5" /> },
          { id: "DOCUMENTS", label: `Documents (${project.documents.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
          { id: "COPILOT", label: "AI Project Copilot", icon: <Sparkles className="w-3.5 h-3.5 text-accent-orange" /> },
          { id: "ACTIVITY", label: "Activity Audit", icon: <Activity className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-charcoal-black shadow-xs font-black"
                : "text-concrete-600 hover:text-charcoal-black"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & PHASES */}
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
              <h3 className="font-black text-base text-charcoal-black">Standard 7 RMC Lifecycle Phases</h3>
              <div className="space-y-3">
                {project.phases.map((ph) => (
                  <div key={ph.id} className="p-3.5 bg-concrete-50 rounded-2xl border border-concrete-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-concrete-200 text-charcoal-black text-xs font-black flex items-center justify-center">
                        {ph.sequence}
                      </span>
                      <div>
                        <div className="font-bold text-xs text-charcoal-black">{ph.phaseName}</div>
                        <span className="text-[10px] text-concrete-500 font-semibold">
                          {ph.status === "COMPLETED" ? "Phase Completed" : ph.status === "IN_PROGRESS" ? "Active Execution" : "Scheduled"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-44">
                      <div className="w-full bg-concrete-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${ph.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-charcoal-black w-8 text-right">{ph.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Team Assigned */}
            <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-3">
              <h3 className="font-black text-sm text-charcoal-black flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-orange" /> Assigned Project Team
              </h3>
              <div className="space-y-2">
                {project.assignments.map((a) => (
                  <div key={a.id} className="p-2.5 bg-concrete-50 rounded-xl border border-concrete-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-charcoal-black">{a.userName}</div>
                      <span className="text-[10px] text-concrete-400 uppercase font-black">{a.role.replace("_", " ")}</span>
                    </div>
                    <span className="text-[10px] text-concrete-500 font-semibold">
                      {new Date(a.assignedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Health Recommendations */}
            <div className="bg-purple-950 text-white p-6 rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-black text-sm text-white">AI Health Recommendations</h3>
              </div>
              <div className="space-y-2 text-xs">
                {project.health.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-2.5 bg-purple-900/60 rounded-xl border border-purple-800 text-purple-200 font-semibold leading-relaxed">
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES */}
      {activeTab === "MILESTONES" && (
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
            <div>
              <h3 className="font-black text-base text-charcoal-black">Project Pour Milestones</h3>
              <p className="text-xs text-concrete-500">Track foundation raft casting, slab schedule, and 28-day testing deadlines</p>
            </div>
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="px-3.5 py-1.5 bg-accent-orange hover:bg-orange-600 text-white text-xs font-black rounded-xl flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Milestone
            </button>
          </div>

          <div className="space-y-3">
            {project.milestones.map((m) => (
              <div key={m.id} className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      m.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : m.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-800" : "bg-concrete-200 text-concrete-800"
                    }`}>
                      {m.status}
                    </span>
                    <h4 className="font-bold text-xs text-charcoal-black">{m.title}</h4>
                  </div>
                  {m.description && <p className="text-xs text-concrete-600 font-medium">{m.description}</p>}
                  <div className="flex items-center gap-3 text-[11px] text-concrete-500 font-semibold pt-1">
                    <span>Target: {new Date(m.targetDate).toLocaleDateString()}</span>
                    {m.concreteVolumeM3 ? <span>• Volume: {m.concreteVolumeM3} m³</span> : null}
                    {m.ownerName && <span>• Owner: {m.ownerName}</span>}
                  </div>
                </div>

                <div>
                  {m.status !== "COMPLETED" ? (
                    <button
                      onClick={() => handleCompleteMilestone(m.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-black text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Signed-off
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TASKS */}
      {activeTab === "TASKS" && (
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
            <div>
              <h3 className="font-black text-base text-charcoal-black">Execution Tasks & Action Items</h3>
              <p className="text-xs text-concrete-500">Assign responsibilities across batching plant, fleet drivers, and site engineers</p>
            </div>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-3.5 py-1.5 bg-accent-orange hover:bg-orange-600 text-white text-xs font-black rounded-xl flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>

          <div className="space-y-2.5">
            {project.tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-concrete-400 font-semibold">
                No tasks created yet. Click "Add Task" to assign work items.
              </div>
            ) : (
              project.tasks.map((t) => (
                <div key={t.id} className="p-3.5 bg-concrete-50 rounded-2xl border border-concrete-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(t.id, t.status)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        t.status === "DONE"
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-concrete-300 bg-white hover:border-emerald-500"
                      }`}
                    >
                      {t.status === "DONE" && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div>
                      <div className={`font-bold text-xs ${t.status === "DONE" ? "line-through text-concrete-400" : "text-charcoal-black"}`}>
                        {t.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-concrete-500 font-semibold mt-0.5">
                        <span className="uppercase font-black text-accent-orange">{t.priority}</span>
                        <span>•</span>
                        <span>Assigned: {t.assignedToName || "Site Lead"}</span>
                        {t.dueDate && <span>• Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    t.status === "DONE" ? "bg-emerald-100 text-emerald-800" : "bg-concrete-200 text-concrete-800"
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BUDGET & COSTS */}
      {activeTab === "BUDGET" && (
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
            <div>
              <h3 className="font-black text-base text-charcoal-black">Project Cost & Budget Center</h3>
              <p className="text-xs text-concrete-500">Multi-category variance analysis across concrete supply, pumping, logistics, and QC testing</p>
            </div>
            <span className="text-xs font-black text-emerald-700">Contract Total: ₹{(project.estimatedValue / 100000).toFixed(1)} Lakhs</span>
          </div>

          <div className="space-y-3">
            {project.budgets.map((b) => (
              <div key={b.id} className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-charcoal-black font-black uppercase tracking-wider">{b.category.replace("_", " ")}</span>
                  <span className="text-concrete-600">
                    Allocated: ₹{(b.estimatedAmount / 100000).toFixed(2)} Lakhs
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-semibold pt-1">
                  <div>
                    <span className="text-[10px] text-concrete-400 block">Actual Spent:</span>
                    <span className="font-bold text-charcoal-black">₹{(b.actualAmount / 100000).toFixed(2)}L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-concrete-400 block">Variance:</span>
                    <span className={`font-bold ${b.variance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {b.variance === 0 ? "On Target" : `₹${(b.variance / 1000).toFixed(0)}K`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-concrete-400 block">Utilization:</span>
                    <span className="font-bold text-charcoal-black">
                      {b.estimatedAmount > 0 ? Math.round((b.actualAmount / b.estimatedAmount) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: RISKS */}
      {activeTab === "RISKS" && (
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
            <div>
              <h3 className="font-black text-base text-charcoal-black">Project Risk Registry</h3>
              <p className="text-xs text-concrete-500">Identify and track operational, financial, and schedule contingencies</p>
            </div>
            <button
              onClick={() => setShowRiskModal(true)}
              className="px-3.5 py-1.5 bg-accent-orange hover:bg-orange-600 text-white text-xs font-black rounded-xl flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Log Risk
            </button>
          </div>

          <div className="space-y-3">
            {project.risks.map((r) => (
              <div key={r.id} className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      r.severity === "CRITICAL" ? "bg-red-100 text-red-800" : r.severity === "HIGH" ? "bg-amber-100 text-amber-800" : "bg-concrete-200 text-concrete-800"
                    }`}>
                      {r.severity} SEVERITY
                    </span>
                    <span className="text-[10px] font-black text-concrete-400 uppercase">{r.riskType}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-concrete-200 text-concrete-700 text-[9px] font-bold rounded">
                    {r.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-charcoal-black">{r.title}</h4>
                  {r.description && <p className="text-xs text-concrete-600 font-medium mt-0.5">{r.description}</p>}
                </div>

                {r.mitigationPlan && (
                  <div className="p-2.5 bg-white rounded-xl border border-concrete-200 text-[11px] text-concrete-700 font-semibold">
                    <strong className="text-emerald-700">Mitigation Action:</strong> {r.mitigationPlan}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DOCUMENTS */}
      {activeTab === "DOCUMENTS" && (
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-concrete-100 pb-3">
            <div>
              <h3 className="font-black text-base text-charcoal-black">Project Digital Document Center</h3>
              <p className="text-xs text-concrete-500">Repository of CAD Blueprints, Supply Agreements, Delivery Slips, and NABL QC Test Reports</p>
            </div>
            <span className="text-xs font-bold text-concrete-400">{project.documents.length} Files Uploaded</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.documents.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs text-concrete-400 font-semibold">
                No documents uploaded yet.
              </div>
            ) : (
              project.documents.map((d) => (
                <div key={d.id} className="p-4 bg-concrete-50 rounded-2xl border border-concrete-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-accent-orange" />
                    <div>
                      <div className="font-bold text-xs text-charcoal-black">{d.title}</div>
                      <span className="text-[10px] text-concrete-400 uppercase font-black">{d.documentType}</span>
                    </div>
                  </div>

                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-white hover:bg-concrete-100 text-charcoal-black rounded-lg border border-concrete-200 text-xs font-bold"
                  >
                    View
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: AI PROJECT COPILOT */}
      {activeTab === "COPILOT" && (
        <div className="space-y-4">
          {/* Query Bar */}
          <div className="bg-white p-5 rounded-3xl border border-concrete-200 shadow-xs flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <input
              type="text"
              placeholder="Ask AI Copilot e.g. 'Can we accelerate raft casting by shifting pour to 05:30 AM?'..."
              value={copilotQuery}
              onChange={(e) => setCopilotQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchInitialCopilot(copilotQuery)}
              className="w-full text-xs font-bold bg-concrete-50 p-2.5 rounded-xl border border-concrete-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={() => fetchInitialCopilot(copilotQuery)}
              disabled={copilotLoading}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
            >
              {copilotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Consult</span>
            </button>
          </div>

          {copilotInsights && (
            <div className="bg-purple-950 text-white p-6 md:p-8 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-purple-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-black text-white">Veera AI Project Assessment</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-purple-900 text-purple-200 text-xs font-bold rounded-lg">
                    Delay Risk: {copilotInsights.delayRiskScore}%
                  </span>
                  <span className="px-2.5 py-1 bg-purple-900 text-purple-200 text-xs font-bold rounded-lg">
                    Slip: {copilotInsights.delayPredictionDays} Days
                  </span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-purple-100 leading-relaxed font-medium">
                {copilotInsights.healthSummary}
              </p>

              {/* Action Recommendations */}
              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block">
                  Recommended Operational Interventions:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {copilotInsights.recommendedActions.map((act, idx) => (
                    <div key={idx} className="p-3.5 bg-purple-900/60 rounded-2xl border border-purple-800 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-black text-accent-orange">
                        <span>{act.actionType}</span>
                        <span className="text-white">{act.priority}</span>
                      </div>
                      <div className="font-bold text-white leading-tight">{act.title}</div>
                      <p className="text-[11px] text-purple-200 font-medium pt-0.5">{act.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: ACTIVITY AUDIT */}
      {activeTab === "ACTIVITY" && (
        <div className="bg-white p-6 rounded-3xl border border-concrete-200 shadow-xs space-y-4">
          <div className="border-b border-concrete-100 pb-3">
            <h3 className="font-black text-base text-charcoal-black">Project Activity Stream & Audit Trail</h3>
            <p className="text-xs text-concrete-500">Every task completion, milestone update, and risk mitigation event is permanently tracked</p>
          </div>

          <div className="space-y-3">
            {project.activities.map((a) => (
              <div key={a.id} className="p-3.5 bg-concrete-50 rounded-2xl border border-concrete-200 flex items-start gap-3">
                <Activity className="w-4 h-4 text-accent-orange mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-xs text-charcoal-black font-semibold">{a.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-concrete-400 font-bold">
                    <span>{a.userName || "System"}</span>
                    <span>•</span>
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-concrete-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-concrete-100 pb-2">
              <h3 className="font-black text-base text-charcoal-black">Add Project Task</h3>
              <button onClick={() => setShowTaskModal(false)}><X className="w-5 h-5 text-concrete-400" /></button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-concrete-600 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Boom Pump Inspection"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-concrete-600 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-concrete-600 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={taskForm.assignedToName}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedToName: e.target.value })}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-concrete-600 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 bg-concrete-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-accent-orange text-white rounded-xl font-black">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-concrete-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-concrete-100 pb-2">
              <h3 className="font-black text-base text-charcoal-black">Add Pour Milestone</h3>
              <button onClick={() => setShowMilestoneModal(false)}><X className="w-5 h-5 text-concrete-400" /></button>
            </div>
            <form onSubmit={handleCreateMilestone} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-concrete-600 mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2nd Floor Monolithic Slab Pour"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-concrete-600 mb-1">Target Date *</label>
                  <input
                    type="date"
                    required
                    value={milestoneForm.targetDate}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-concrete-600 mb-1">Volume (m³)</label>
                  <input
                    type="number"
                    value={milestoneForm.concreteVolumeM3}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, concreteVolumeM3: Number(e.target.value) })}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowMilestoneModal(false)} className="px-4 py-2 bg-concrete-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-accent-orange text-white rounded-xl font-black">Schedule Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Risk Modal */}
      {showRiskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-concrete-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-concrete-100 pb-2">
              <h3 className="font-black text-base text-charcoal-black">Log Project Risk</h3>
              <button onClick={() => setShowRiskModal(false)}><X className="w-5 h-5 text-concrete-400" /></button>
            </div>
            <form onSubmit={handleCreateRisk} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-concrete-600 mb-1">Risk Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traffic Bottleneck during Friday evening pour"
                  value={riskForm.title}
                  onChange={(e) => setRiskForm({ ...riskForm, title: e.target.value })}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-concrete-600 mb-1">Category</label>
                  <select
                    value={riskForm.riskType}
                    onChange={(e) => setRiskForm({ ...riskForm, riskType: e.target.value })}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl"
                  >
                    <option value="OPERATIONAL">Operational</option>
                    <option value="FINANCIAL">Financial</option>
                    <option value="SCHEDULE">Schedule</option>
                    <option value="LOGISTICS">Logistics</option>
                    <option value="PRODUCTION">Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-concrete-600 mb-1">Severity</label>
                  <select
                    value={riskForm.severity}
                    onChange={(e) => setRiskForm({ ...riskForm, severity: e.target.value })}
                    className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-concrete-600 mb-1">Mitigation Action Plan</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Stagger dispatches to 05:30 AM early morning slot"
                  value={riskForm.mitigationPlan}
                  onChange={(e) => setRiskForm({ ...riskForm, mitigationPlan: e.target.value })}
                  className="w-full p-2.5 bg-concrete-50 border border-concrete-200 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowRiskModal(false)} className="px-4 py-2 bg-concrete-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-red-600 text-white rounded-xl font-black">Log Risk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
