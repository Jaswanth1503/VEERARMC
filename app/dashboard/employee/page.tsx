import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Clock, CheckSquare, Briefcase, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export default async function EmployeeDashboard() {
  const session = await getSession();
  const userId = session?.userId || "00000000-0000-0000-0000-000000000000";

  let profile: any = null;
  try {
    profile = await prisma.employeeProfile.findUnique({
      where: { userId },
      include: { attendances: { orderBy: { date: 'desc' }, take: 5 } }
    });
  } catch (e) {
    console.warn("[EmployeeDashboard Warning] Database offline, rendering employee portal with fallback data.");
  }

  const columns = [
    { key: "date", header: "Date", render: (val: Date) => new Date(val).toLocaleDateString() },
    { key: "checkIn", header: "Check In", render: (val: Date) => val ? new Date(val).toLocaleTimeString() : '-' },
    { key: "checkOut", header: "Check Out", render: (val: Date) => val ? new Date(val).toLocaleTimeString() : '-' },
    { key: "status", header: "Status", render: (val: string) => <StatusBadge status={val} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-black">Employee Portal</h1>
          <p className="text-concrete-500">Welcome back! Here is your daily overview.</p>
        </div>
        <a href="/dashboard/employee/attendance" className="bg-success-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Check In (QR)
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Department" value={profile?.department || "Plant Operations"} icon={<Briefcase />} />
        <StatCard label="Today's Tasks" value="4" icon={<CheckSquare />} />
        <StatCard label="Present Days" value="22" change="This Month" trend="up" icon={<Calendar />} />
        <StatCard label="Leave Balance" value="14" change="Days" trend="neutral" icon={<Clock />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable columns={columns} data={profile?.attendances || []} title="Recent Attendance" />
        </div>
        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm p-5 flex flex-col">
          <h3 className="font-semibold text-charcoal-black mb-4">Upcoming Tasks</h3>
          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" defaultChecked />
              <div>
                <p className="text-sm font-medium text-charcoal-black">Equipment Maintenance Check</p>
                <p className="text-xs text-concrete-500">Completed 10:30 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <div>
                <p className="text-sm font-medium text-charcoal-black">Concrete Quality Cube Testing</p>
                <p className="text-xs text-concrete-500">Due Today, 3:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
