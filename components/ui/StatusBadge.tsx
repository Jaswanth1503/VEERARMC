import React from "react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStyles = (s: string) => {
    switch (s.toUpperCase()) {
      case 'ACTIVE':
      case 'DELIVERED':
      case 'COMPLETED':
      case 'PAID':
      case 'SUCCESS':
        return 'bg-success-green/10 text-success-green border-success-green/20';
      case 'PENDING':
      case 'IN_TRANSIT':
      case 'IN_PROGRESS':
        return 'bg-accent-orange/10 text-accent-orange border-accent-orange/20';
      case 'CANCELLED':
      case 'OVERDUE':
      case 'FAILED':
      case 'ERROR':
        return 'bg-error-red/10 text-error-red border-error-red/20';
      case 'AVAILABLE':
        return 'bg-steel-blue-500/10 text-steel-blue-600 border-steel-blue-500/20';
      default:
        return 'bg-concrete-100 text-concrete-600 border-concrete-200';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStyles(status)} uppercase tracking-wider`}>
      {status}
    </span>
  );
}
