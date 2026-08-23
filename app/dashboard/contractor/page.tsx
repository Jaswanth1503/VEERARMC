import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { HardHat, Building, Clock, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export default async function ContractorDashboard() {
  const session = await getSession();
  const userId = session?.userId || "00000000-0000-0000-0000-000000000000";

  let activeProjects = 2;
  let recentOrders: any[] = [
    { orderNumber: "ORD-K201", concreteGrade: "M35", quantity: 40, deliveryDate: new Date(), status: "IN_TRANSIT" }
  ];

  try {
    activeProjects = await prisma.project.count({ where: { contractorId: userId, status: 'ACTIVE' } });
    const dbOrders = await prisma.order.findMany({
      where: { contractorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    if (dbOrders.length > 0) recentOrders = dbOrders;
  } catch (e) {
    console.warn("[ContractorDashboard Warning] Database offline, rendering contractor portal with fallback data.");
  }

  const columns = [
    { key: "orderNumber", header: "Order ID" },
    { key: "concreteGrade", header: "Grade" },
    { key: "quantity", header: "Qty (m³)" },
    { key: "deliveryDate", header: "Delivery Date", render: (val: Date) => new Date(val).toLocaleDateString() },
    { key: "status", header: "Status", render: (val: string) => <StatusBadge status={val} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-black">Contractor Portal</h1>
          <p className="text-concrete-500">Manage your active projects and schedule concrete deliveries.</p>
        </div>
        <div className="flex gap-3">
          <a href="/quote" className="bg-white border border-concrete-200 text-charcoal-black px-4 py-2.5 rounded-lg font-medium hover:bg-concrete-50 transition-colors shadow-sm">
            Material Calculator
          </a>
          <a href="/dashboard/contractor/order" className="bg-charcoal-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-concrete-900 transition-colors shadow-sm">
            Book Pump
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Current Projects" value={activeProjects} icon={<Building />} />
        <StatCard label="Upcoming Deliveries" value="3" icon={<Truck />} />
        <StatCard label="Pending Invoices" value="2" icon={<Clock />} />
        <StatCard label="Active Workers" value="45" icon={<HardHat />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable columns={columns} data={recentOrders} title="Recent Orders" />
        </div>
        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm p-5 flex flex-col">
          <h3 className="font-semibold text-charcoal-black mb-4">Quick Actions</h3>
          <div className="flex-1 flex flex-col gap-3">
            <a href="/quality-predictor" className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-sm font-bold text-purple-900 hover:bg-purple-100 transition-colors flex items-center justify-between">
              <span>AI Quality & Strength Predictor</span>
              <span className="text-[10px] bg-purple-200 text-purple-800 font-extrabold px-2 py-0.5 rounded-full">NEW</span>
            </a>
            <a href="/dashboard/contractor/projects" className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-sm font-medium text-charcoal-black hover:bg-concrete-100 transition-colors">
              Manage Active Projects
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
