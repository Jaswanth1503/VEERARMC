"use client";

import React from "react";
import { FileSpreadsheet, Download } from "lucide-react";

export default function EmployeeSalaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-accent-orange" /> Payroll & Salary Slips
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Monthly salary slips, PF contributions, and attendance allowance records.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs border-b border-concrete-200 pb-3">
          <div>
            <div className="font-bold text-charcoal-black text-sm">Monthly Payslip — Current Month</div>
            <div className="text-concrete-500">Gross Pay: ₹45,000 | Net Pay: ₹41,200</div>
          </div>

          <button className="px-4 py-2 bg-concrete-100 text-concrete-700 font-bold rounded-xl hover:bg-concrete-200 text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Download Payslip PDF
          </button>
        </div>
      </div>
    </div>
  );
}
