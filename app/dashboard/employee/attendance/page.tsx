"use client";

import React, { useState } from "react";
import { Clock, CheckCircle2 } from "lucide-react";

export default function EmployeeAttendancePage() {
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-black flex items-center gap-2">
          <Clock className="w-6 h-6 text-accent-orange" /> Employee Shift Attendance
        </h1>
        <p className="text-xs text-concrete-600 mt-1">
          Daily shift clock-in, check-out timestamping, and duty log.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 p-8 text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-concrete-100 rounded-full flex items-center justify-center mx-auto text-accent-orange">
          <Clock className="w-10 h-10" />
        </div>

        <div>
          <div className="text-xl font-black text-charcoal-black">
            {checkedIn ? "Shift Active (Checked In)" : "Not Checked In"}
          </div>
          <div className="text-xs text-concrete-500 mt-1">
            {checkedIn ? "Clock-in time recorded at 07:30 AM" : "Press button below to mark morning shift attendance"}
          </div>
        </div>

        <button
          onClick={() => {
            setCheckedIn(!checkedIn);
            alert(checkedIn ? "Checked out successfully." : "Checked in successfully for shift!");
          }}
          className={`px-8 py-3 rounded-xl font-extrabold text-sm text-white transition-all shadow-md ${
            checkedIn ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {checkedIn ? "Clock Out of Shift" : "Clock In Shift"}
        </button>
      </div>
    </div>
  );
}
