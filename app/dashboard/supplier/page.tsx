import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Package, TrendingUp, Archive, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function SupplierDashboard() {
  let inventory: any[] = [];
  try {
    inventory = await prisma.inventory.findMany({ take: 5 });
  } catch (e) {
    console.warn("[SupplierDashboard Warning] Database offline, rendering fallback inventory items.");
    inventory = [
      { itemName: "OPC 53 Grade Cement", category: "Binder", currentStock: 120, minimumStock: 50, unit: "Tons" },
      { itemName: "Class F Fly Ash", category: "Pozzolan", currentStock: 45, minimumStock: 30, unit: "Tons" },
      { itemName: "Crushed Sand (Zone II)", category: "Fine Agg", currentStock: 450, minimumStock: 100, unit: "Tons" }
    ];
  }

  const columns = [
    { key: "itemName", header: "Material" },
    { key: "category", header: "Category" },
    { key: "currentStock", header: "Stock" },
    { key: "unit", header: "Unit" },
    { 
      key: "status", 
      header: "Status", 
      render: (_: any, row: any) => (row.currentStock || 0) <= (row.minimumStock || 0) 
        ? <StatusBadge status="LOW STOCK" /> 
        : <StatusBadge status="ADEQUATE" /> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-black">Supplier Portal</h1>
          <p className="text-concrete-500">Manage purchase requests and raw material deliveries.</p>
        </div>
        <a href="/dashboard/supplier/payments" className="bg-steel-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-steel-blue-700 transition-colors shadow-sm">
          Submit Invoice
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Requests" value="5" icon={<Package />} />
        <StatCard label="Materials Supplied" value="12,400" change="Tons" trend="up" icon={<Archive />} />
        <StatCard label="On-Time Delivery" value="98%" trend="up" icon={<TrendingUp />} />
        <StatCard label="Unpaid Invoices" value="$42,000" trend="neutral" icon={<FileText />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable columns={columns} data={inventory} title="Plant Inventory Status" />
        </div>
        <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm p-5 flex flex-col">
          <h3 className="font-semibold text-charcoal-black mb-4">Supplier Quick Actions</h3>
          <div className="flex-1 flex flex-col gap-3">
            <a href="/quality-predictor" className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-sm font-bold text-purple-900 hover:bg-purple-100 transition-colors flex items-center justify-between">
              <span>AI Quality & Strength Predictor</span>
              <span className="text-[10px] bg-purple-200 text-purple-800 font-extrabold px-2 py-0.5 rounded-full">NEW</span>
            </a>
            <a href="/dashboard/supplier/inventory" className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-sm font-medium text-charcoal-black hover:bg-concrete-100 transition-colors">
              Manage Raw Material Inventory
            </a>
            <a href="/dashboard/supplier/requests" className="p-4 bg-concrete-50 rounded-xl border border-concrete-200 text-sm font-medium text-charcoal-black hover:bg-concrete-100 transition-colors">
              View Purchase Requests
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
