import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Package, Truck, FileText, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export default async function CustomerDashboard() {
  const session = await getSession();
  const userId = session?.userId || "00000000-0000-0000-0000-000000000000";

  let myOrders: any[] = [
    { orderNumber: "ORD-C101", concreteGrade: "M25", quantity: 35, deliveryDate: new Date(), status: "IN_TRANSIT" },
    { orderNumber: "ORD-C102", concreteGrade: "M30", quantity: 50, deliveryDate: new Date(), status: "PENDING" }
  ];
  let activeProjects = 3;
  let pendingOrders = 1;

  try {
    const dbOrders = await prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    if (dbOrders.length > 0) myOrders = dbOrders;

    activeProjects = await prisma.project.count({ where: { customerId: userId, status: 'ACTIVE' } });
    pendingOrders = await prisma.order.count({ where: { customerId: userId, status: 'PENDING' } });
  } catch (e) {
    console.warn("[CustomerDashboard Warning] Database offline, rendering customer dashboard with fallback data.");
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
          <h1 className="text-2xl font-bold text-charcoal-black">Customer Portal</h1>
          <p className="text-concrete-500">Track your concrete orders and active projects.</p>
        </div>
        <a href="/quote" className="bg-accent-orange text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-sm inline-block">
          Place New Order
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Projects" value={activeProjects} icon={<CheckCircle />} />
        <StatCard label="Pending Orders" value={pendingOrders} icon={<Package />} />
        <StatCard label="In Transit" value="1" trend="up" icon={<Truck />} />
        <StatCard label="Total Invoices" value="$14,200" trend="neutral" icon={<FileText />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable columns={columns} data={myOrders} title="Recent Orders" />
        </div>
        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm p-5 flex flex-col">
          <h3 className="font-semibold text-charcoal-black mb-4">Quick Actions</h3>
          <div className="space-y-3 flex-1">
            <a href="/quality-predictor" className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-sm font-bold text-purple-900 hover:bg-purple-100 transition-colors flex items-center justify-between">
              <span>AI Quality & Strength Predictor</span>
              <span className="text-[10px] bg-purple-200 text-purple-800 font-extrabold px-2 py-0.5 rounded-full">NEW</span>
            </a>
            <a href="/quote" className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-sm font-medium text-charcoal-black hover:bg-concrete-100 transition-colors block">
              Generate AI Quote
            </a>
            <a href="/recommendations" className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-sm font-medium text-charcoal-black hover:bg-concrete-100 transition-colors block">
              AI Recommendation Engine
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
