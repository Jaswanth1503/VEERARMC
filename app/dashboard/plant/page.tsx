import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Factory, Play, TrendingUp, CheckCircle2, Clock, Plus, Layers, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PlantManagerDashboard() {
  let plans: any[] = [];
  try {
    plans = await prisma.productionPlan.findMany({
      take: 5,
      orderBy: { scheduledStartTime: "asc" },
      include: {
        plant: true,
        order: { select: { orderNumber: true, customer: { select: { fullName: true } } } }
      }
    });
  } catch (e) {
    console.warn("[PlantDashboard Warning] Database offline, rendering fallback plans.");
    plans = [
      { id: "1", planNumber: "VRMC-PLAN-2026-00018", concreteGrade: "M30", plannedQuantity: 48, status: "IN_PROGRESS", scheduledDate: new Date(), plant: { name: "Central Plant 01" }, order: { orderNumber: "VRMC-ORD-00042", customer: { fullName: "Kapadia Developers" } } },
      { id: "2", planNumber: "VRMC-PLAN-2026-00017", concreteGrade: "M35", plannedQuantity: 72, status: "READY", scheduledDate: new Date(), plant: { name: "North Plant 02" }, order: { orderNumber: "VRMC-ORD-00041", customer: { fullName: "Godrej Infra" } } }
    ];
  }

  const columns = [
    { key: "planNumber", header: "Plan Number" },
    { key: "customer", header: "Client", render: (_: any, r: any) => r.order?.customer?.fullName || "Commercial Client" },
    { key: "concreteGrade", header: "Grade", render: (_: any, r: any) => <span className="font-bold text-accent-orange">{r.concreteGrade}</span> },
    { key: "plannedQuantity", header: "Volume (m³)", render: (_: any, r: any) => `${r.plannedQuantity} m³` },
    { key: "plant", header: "Plant", render: (_: any, r: any) => r.plant?.name || "Central Plant" },
    { key: "status", header: "Status", render: (_: any, r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-black flex items-center gap-2">
            <Factory className="w-6 h-6 text-accent-orange" /> Batching Plant Operations Portal
          </h1>
          <p className="text-concrete-500">Monitor plant capacity, batch mixer trucks, and track raw material consumption.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/production/forecast"
            className="bg-white border border-concrete-300 text-charcoal-black px-4 py-2 rounded-lg font-bold text-xs hover:bg-concrete-50 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> AI Forecast
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
        <StatCard label="Today's Batched Volume" value="480 m³" change="+14%" trend="up" icon={<Factory />} />
        <StatCard label="Active Mixer Batches" value="6 Batches" trend="up" icon={<Play />} />
        <StatCard label="Plant Utilization" value="68%" trend="neutral" icon={<TrendingUp />} />
        <StatCard label="Cement Silo Level" value="180 Tons" trend="up" icon={<Layers />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable columns={columns} data={plans} title="Scheduled Batching Plans" />
        </div>

        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-semibold text-charcoal-black mb-3">Plant Quick Commands</h3>
            <div className="flex flex-col gap-2.5">
              <Link href="/production" className="p-3.5 bg-orange-50/50 rounded-xl border border-orange-200 text-xs font-bold text-accent-orange hover:bg-orange-100 transition-colors flex items-center justify-between">
                <span>Production Operations Command Hub</span>
                <span className="text-[10px] bg-accent-orange text-white font-extrabold px-2 py-0.5 rounded">OPEN</span>
              </Link>
              <Link href="/production/plans/new" className="p-3.5 bg-concrete-50 rounded-xl border border-concrete-200 text-xs font-bold text-charcoal-black hover:bg-concrete-100 transition-colors">
                Schedule New Batching Sequence
              </Link>
              <Link href="/production/forecast" className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-xs font-bold text-purple-900 hover:bg-purple-100 transition-colors">
                7-Day & 30-Day AI Demand Forecasting
              </Link>
            </div>
          </div>

          <div className="p-3.5 bg-charcoal-black text-white rounded-xl text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-accent-orange">
              <Factory className="w-3.5 h-3.5" /> Central Plant (Hadapsar)
            </div>
            <div className="text-concrete-300 text-[11px]">
              Daily Capacity: 1,800 m³ • Available: 660 m³ today
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
