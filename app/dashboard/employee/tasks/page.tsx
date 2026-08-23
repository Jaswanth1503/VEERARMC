"use client";

import React from "react";
import { CheckSquare } from "lucide-react";

export default function EmployeeTasksPage() {
  const tasks = [
    { id: 1, title: "Batching Plant 01 Calibration Check", priority: "HIGH", status: "IN_PROGRESS" },
    { id: 2, title: "Transit Mixer #MH-12-VT-8832 Slump Testing", priority: "NORMAL", status: "PENDING" },
    { id: 3, title: "Customer Site Pour Quality Approval", priority: "HIGH", status: "COMPLETED" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-accent-orange" /> Operational Tasks & Duties
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Daily assigned quality testing, plant operations, and maintenance tasks.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-concrete-200">
          {tasks.map(t => (
            <div key={t.id} className="p-4 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-charcoal-black">{t.title}</div>
                <div className="text-concrete-500 font-medium">Priority: {t.priority}</div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                t.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
              }`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
