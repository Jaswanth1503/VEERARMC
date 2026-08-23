import { StatCard } from "@/components/ui/StatCard";
import { DollarSign, TrendingUp, Package, Truck, Factory, Sparkles, ShieldCheck, FileText, ArrowUpRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { KPICalculatorService } from "@/lib/analytics/services/kpi-calculator.service";
import { RevenueAnalyticsService } from "@/lib/analytics/services/revenue-analytics.service";

export default async function AdminAnalyticsPage() {
  const [kpis, topCustomers] = await Promise.all([
    KPICalculatorService.calculateKPIs("30D"),
    RevenueAnalyticsService.getRevenueByCustomer(5)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-black flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent-orange" /> Enterprise Business Analytics & Reporting
          </h1>
          <p className="text-concrete-500">Cross-departmental performance metrics, client revenue concentration, and growth indicators.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/analytics"
            className="bg-accent-orange text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4" /> Open Interactive BI Hub
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Revenue" value={`₹${(kpis.totalRevenue / 100000).toFixed(1)}L`} change={`+${kpis.revenueGrowthPercent}%`} trend="up" icon={<DollarSign />} />
        <StatCard label="Total Orders" value={`${kpis.totalOrders} Batches`} change="94.2% Conversion" trend="up" icon={<Package />} />
        <StatCard label="Business Health" value={`${kpis.businessHealthScore}/100`} change={kpis.healthScoreLabel} trend="up" icon={<ShieldCheck />} />
        <StatCard label="Fleet On-Time" value={`${kpis.onTimeDeliveryRatePercent}%`} change="IS 4926" trend="up" icon={<Truck />} />
      </div>

      {/* Top Enterprise Customers Table */}
      <div className="bg-white rounded-3xl border border-concrete-200 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-charcoal-black">Top Revenue Generating Clients</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-concrete-50 text-concrete-600 font-extrabold border-b border-concrete-200">
              <tr>
                <th className="p-3">Client Account</th>
                <th className="p-3">Company</th>
                <th className="p-3">Batches</th>
                <th className="p-3">Volume (m³)</th>
                <th className="p-3">Total Revenue</th>
                <th className="p-3 text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete-100">
              {topCustomers.map(c => (
                <tr key={c.customerId} className="hover:bg-concrete-50/60 transition-colors">
                  <td className="p-3 font-bold text-charcoal-black">{c.customerName}</td>
                  <td className="p-3 text-concrete-600">{c.companyName}</td>
                  <td className="p-3 font-bold">{c.orderCount}</td>
                  <td className="p-3 font-bold text-accent-orange">{c.totalVolumeM3} m³</td>
                  <td className="p-3 font-black text-charcoal-black">₹{c.totalRevenue.toLocaleString("en-IN")}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-lg border border-emerald-200">
                      {c.contributionPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
