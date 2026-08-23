import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Truck, Play, TrendingUp, CheckCircle2, Clock, Plus, Navigation, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function LogisticsDispatchDashboard() {
  let trips: any[] = [];
  try {
    trips = await prisma.deliveryTrip.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: true,
        driver: true,
        order: { select: { orderNumber: true, customer: { select: { fullName: true } } } }
      }
    });
  } catch (e) {
    console.warn("[LogisticsDashboard Warning] Database offline, rendering fallback trips.");
    trips = [
      { id: "1", tripNumber: "VRMC-TRIP-2026-00014", concreteGrade: "M30", quantityM3: 6, status: "IN_TRANSIT", destinationAddress: "Hinjewadi Phase 3", vehicle: { vehicleNumber: "MH-12-RN-8821" }, driver: { name: "Sanjay Pawar" }, order: { orderNumber: "VRMC-ORD-00042", customer: { fullName: "Kapadia Developers" } } },
      { id: "2", tripNumber: "VRMC-TRIP-2026-00013", concreteGrade: "M35", quantityM3: 6, status: "ARRIVED_AT_SITE", destinationAddress: "Kharadi Bypass", vehicle: { vehicleNumber: "MH-12-RN-8822" }, driver: { name: "Ramesh Shinde" }, order: { orderNumber: "VRMC-ORD-00041", customer: { fullName: "Godrej Infra" } } }
    ];
  }

  const columns = [
    { key: "tripNumber", header: "Trip #" },
    { key: "customer", header: "Client", render: (_: any, r: any) => r.order?.customer?.fullName || "Commercial Client" },
    { key: "destination", header: "Jobsite", render: (_: any, r: any) => r.destinationAddress },
    { key: "vehicle", header: "Mixer Truck", render: (_: any, r: any) => <span className="font-bold text-accent-orange">{r.vehicle?.vehicleNumber || "MH-12-RN-8821"}</span> },
    { key: "driver", header: "Driver", render: (_: any, r: any) => r.driver?.name || "Driver" },
    { key: "status", header: "Status", render: (_: any, r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-black flex items-center gap-2">
            <Truck className="w-6 h-6 text-accent-orange" /> Dispatch & Fleet Logistics Portal
          </h1>
          <p className="text-concrete-500">Monitor transit mixers in real-time, optimize delivery routes, and track jobsite arrivals.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/logistics/fleet"
            className="bg-white border border-concrete-300 text-charcoal-black px-4 py-2 rounded-lg font-bold text-xs hover:bg-concrete-50 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4 text-sky-500" /> Fleet Roster
          </Link>
          <Link
            href="/logistics/trips/new"
            className="bg-accent-orange text-white px-5 py-2.5 rounded-lg font-bold text-xs hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Dispatch Trip
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Mixers In Transit" value="4 Vehicles" trend="up" icon={<Truck />} />
        <StatCard label="Unloading At Site" value="2 Trucks" trend="neutral" icon={<MapPin />} />
        <StatCard label="Today's Deliveries" value="18 Batches" change="+12%" trend="up" icon={<CheckCircle2 />} />
        <StatCard label="Average Transit Time" value="38 Mins" trend="down" icon={<Clock />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable columns={columns} data={trips} title="Active Dispatch Schedule" />
        </div>

        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-semibold text-charcoal-black mb-3">Quick Actions</h3>
            <div className="flex flex-col gap-2.5">
              <Link href="/logistics" className="p-3.5 bg-orange-50/50 rounded-xl border border-orange-200 text-xs font-bold text-accent-orange hover:bg-orange-100 transition-colors flex items-center justify-between">
                <span>Live GPS Fleet Command Hub</span>
                <span className="text-[10px] bg-accent-orange text-white font-extrabold px-2 py-0.5 rounded">OPEN</span>
              </Link>
              <Link href="/logistics/trips/new" className="p-3.5 bg-concrete-50 rounded-xl border border-concrete-200 text-xs font-bold text-charcoal-black hover:bg-concrete-100 transition-colors">
                Schedule New Transit Mixer
              </Link>
              <Link href="/logistics/fleet" className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs font-bold text-sky-900 hover:bg-sky-100 transition-colors">
                View Fleet & Driver Roster
              </Link>
            </div>
          </div>

          <div className="p-3.5 bg-charcoal-black text-white rounded-xl text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-accent-orange">
              <Navigation className="w-3.5 h-3.5" /> Pune GPS Corridor Live
            </div>
            <div className="text-concrete-300 text-[11px]">
              Average trip duration: 38 mins • Slump retention: 100%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
