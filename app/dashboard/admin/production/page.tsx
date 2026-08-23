import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Factory, Play, TrendingUp, CheckCircle2, Clock, Plus, Layers, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminProductionPage() {
  let plans: any[] = [];
  try {
    plans = await prisma.productionPlan.findMany({
      take: 10,
      orderBy: { scheduledStartTime: "asc" },
      include: {
        plant: true,
        order: { select: { orderNumber: true, customer: { select: { fullName: true } } } }
      }
    });
  } catch (e) {
    console.warn("[AdminProduction Warning] Database offline, rendering fallback plans.");
    plans = [
      { id: "1", planNumber: "VRMC-PLAN-2026-00018", concreteGrade: "M30", plannedQuantity: 48, status: "IN_PROGRESS", scheduledDate: new Date(), plant: { name: "Central Plant 01" }, order: { orderNumber: "VRMC-ORD-00042", customer: { fullName: "Kapadia Developers" } } },
      { id: "2", planNumber: "VRMC-PLAN-2026-00017", concreteGrade: "M35", plannedQuantity: 72, status: "READY", scheduledDate: new Date(), plant: { name: "North Plant 02" }, order: { orderNumber: "VRMC-ORD-00041", customer: { fullName: "Godrej Infra" } } }
    ];
  }

  const columns = [
    { key: "planNumber", header: "Plan #" },
    { key: "client", header: "Client / Order", render: (_: any, r: any) => `${r.order?.customer?.fullName || "Client"} (${r.order?.orderNumber || "Direct"})` },
    { key: "concreteGrade", header: "Grade", render: (_: any, r: any) => <span className="font-bold text-accent-orange">{r.concreteGrade}</span> },
    { key: "plannedQuantity", header: "Volume", render: (_: any, r: any) => `${r.plannedQuantity} m³` },
    { key: "plant", header: "Plant", render: (_: any, r: any) => r.plant?.name || "Central Plant" },
    { key: "status", header: "Status", render: (_: any, r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-black flex items-center gap-2">
            <Factory className="w-6 h-6 text-accent-orange" /> Enterprise Production & Plant Oversight
          </h1>
          <p className="text-concrete-500">Monitor plant network capacity, material variances, and AI demand projections across all batching plants.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/production"
            className="bg-charcoal-black text-white px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-black transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Factory className="w-4 h-4 text-accent-orange" /> Open Production Command Hub
          </Link>
          <Link
            href="/production/plans/new"
            className="bg-accent-orange text-white px-5 py-2.5 rounded-lg font-bold text-xs hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Schedule Plan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Network Daily Capacity" value="4,500 m³" change="3 Plants" trend="neutral" icon={<Factory />} />
        <StatCard label="Live Batched Volume" value="1,840 m³" change="+18%" trend="up" icon={<Play />} />
        <StatCard label="Network Utilization" value="61%" trend="up" icon={<TrendingUp />} />
        <StatCard label="Material Variance" value="±0.4%" change="IS Compliant" trend="up" icon={<Layers />} />
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm p-6">
        <DataTable columns={columns} data={plans} title="Enterprise Plant Production Schedule" />
      </div>
    </div>
  );
}
