import { StatCard } from "@/components/ui/StatCard";
import { DollarSign, TrendingUp, Package, Truck, Factory, Sparkles, ShieldCheck, FileText, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { KPICalculatorService } from "@/lib/analytics/services/kpi-calculator.service";
import { ExecutiveAIService } from "@/lib/analytics/services/executive-ai.service";

export default async function ExecutiveCommandPortal() {
  const kpis = await KPICalculatorService.calculateKPIs("30D");
  const aiInsights = await ExecutiveAIService.generateExecutiveInsights(kpis);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-accent-orange/10 text-accent-orange font-black text-xs rounded-lg tracking-wider">
              C-SUITE STRATEGIC SUITE
            </span>
            <span className="text-xs text-concrete-500 font-semibold">• Veera RMC 2.0</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-charcoal-black mt-2">
            Executive Command & Decision Center
          </h1>
          <p className="text-concrete-500 text-xs md:text-sm">
            Unified leadership oversight: profitability, multi-plant dispatch throughput, and automated risk intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/analytics"
            className="px-5 py-2.5 bg-accent-orange text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-colors shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Open Full BI Hub
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Monthly Revenue" 
          value={`₹${(kpis.totalRevenue / 100000).toFixed(1)} Lakh`} 
          change={`+${kpis.revenueGrowthPercent}% MoM`} 
          trend="up" 
          icon={<DollarSign />} 
        />
        <StatCard 
          label="Business Health Index" 
          value={`${kpis.businessHealthScore}/100`} 
          change={kpis.healthScoreLabel} 
          trend="up" 
          icon={<ShieldCheck />} 
        />
        <StatCard 
          label="Batched Volume" 
          value={`${kpis.totalVolumeBatchedM3.toLocaleString()} m³`} 
          change="3 Batching Plants" 
          trend="neutral" 
          icon={<Factory />} 
        />
        <StatCard 
          label="On-Time Delivery Rate" 
          value={`${kpis.onTimeDeliveryRatePercent}%`} 
          change="IS 4926 Compliant" 
          trend="up" 
          icon={<Truck />} 
        />
      </div>

      {/* AI Executive Intelligence Spotlight */}
      <div className="bg-charcoal-black text-white p-6 md:p-8 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-concrete-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-orange animate-pulse" />
            <h3 className="text-base font-black text-white">Gemini AI Executive Strategic Summary</h3>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-lg border border-emerald-500/30">
            STRATEGY CALIBRATED
          </span>
        </div>

        <p className="text-xs md:text-sm text-concrete-300 leading-relaxed font-medium">
          {aiInsights.strategicSummary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {aiInsights.executiveActionItems.map((act, i) => (
            <div key={i} className="p-3.5 bg-concrete-900 rounded-2xl border border-concrete-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black">
                <span className="text-accent-orange">{act.priority}</span>
                <span className="text-concrete-500">{act.targetDepartment}</span>
              </div>
              <p className="text-xs font-semibold text-concrete-200">{act.action}</p>
              <div className="text-[10px] text-concrete-400 font-bold pt-1">Owner: {act.owner}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
