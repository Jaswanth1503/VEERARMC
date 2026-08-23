import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

export function StatCard({ label, value, change, trend, icon }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-concrete-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-concrete-500 text-sm font-medium">{label}</h3>
        {icon && <div className="text-concrete-400">{icon}</div>}
      </div>
      <div className="flex items-end justify-between mt-4">
        <span className="text-2xl font-bold text-charcoal-black tracking-tight">{value}</span>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend === 'up' ? 'text-success-green' : 
            trend === 'down' ? 'text-error-red' : 
            'text-steel-blue-500'
          }`}>
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
            {trend === 'neutral' && <Minus className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
