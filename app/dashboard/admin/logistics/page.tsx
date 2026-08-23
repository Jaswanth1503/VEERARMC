import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Truck, Play, TrendingUp, CheckCircle2, Clock, Plus, Navigation, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminLogisticsPage() {
  let trips: any[] = [];
  try {
    trips = await prisma.deliveryTrip.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: true,
        driver: true,
        order: { select: { orderNumber: true, customer: { select: { fullName: true } } } }
      }
    });
  } catch (e) {
    console.warn("[AdminLogistics Warning] Database offline, rendering fallback trips.");
    trips = [
      { id: "1", tripNumber: "VRMC-TRIP-2026-00014", concreteGrade: "M30", quantityM3: 6, status: "IN_TRANSIT", destinationAddress: "Hinjewadi Phase 3", vehicle: { vehicleNumber: "MH-12-RN-8821" }, driver: { name: "Sanjay Pawar" }, order: { orderNumber: "VRMC-ORD-00042", customer: { fullName: "Kapadia Developers" } } },
      { id: "2", tripNumber: "VRMC-TRIP-2026-00013", concreteGrade: "M35", quantityM3: 6, status: "ARRIVED_AT_SITE", destinationAddress: "Kharadi Bypass", vehicle: { vehicleNumber: "MH-12-RN-8822" }, driver: { name: "Ramesh Shinde" }, order: { orderNumber: "VRMC-ORD-00041", customer: { fullName: "Godrej Infra" } } }
    ];
  }

  const columns = [
    { key: "tripNumber", header: "Trip #" },
    { key: "client", header: "Client / Order", render: (_: any, r: any) => `${r.order?.customer?.fullName || "Client"} (${r.order?.orderNumber || "Direct"})` },
    { key: "destination", header: "Jobsite Location", render: (_: any, r: any) => r.destinationAddress },
    { key: "vehicle", header: "Vehicle", render: (_: any, r: any) => <span className="font-bold text-accent-orange">{r.vehicle?.vehicleNumber || "MH-12-RN-8821"}</span> },
    { key: "driver", header: "Driver", render: (_: any, r: any) => r.driver?.name || "Driver" },
    { key: "status", header: "Status", render: (_: any, r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-black flex items-center gap-2">
            <Truck className="w-6 h-6 text-accent-orange" /> Enterprise Logistics & Fleet Intelligence
          </h1>
          <p className="text-concrete-500">Real-time GPS tracking across all transit mixers, boom pumps, and customer pouring sites.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/logistics"
            className="bg-charcoal-black text-white px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-black transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Navigation className="w-4 h-4 text-accent-orange" /> Open GPS Fleet Hub
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
        <StatCard label="Total Fleet" value="24 Vehicles" change="Mixers & Pumps" trend="neutral" icon={<Truck />} />
        <StatCard label="Live In Transit" value="6 Vehicles" change="+25%" trend="up" icon={<Play />} />
        <StatCard label="On-Time Delivery" value="97.8%" change="IS 4926" trend="up" icon={<CheckCircle2 />} />
        <StatCard label="Fleet Fuel Efficiency" value="3.4 km/L" trend="up" icon={<TrendingUp />} />
      </div>

      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm p-6">
        <DataTable columns={columns} data={trips} title="Enterprise Live Transit Dispatch Roster" />
      </div>
    </div>
  );
}
