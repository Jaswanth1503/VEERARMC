"use client";

import React from "react";

interface VeeraAILogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export const VeeraAILogo: React.FC<VeeraAILogoProps> = ({
  size = "md",
  animated = false,
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base"
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24
  };

  return (
    <div className={`relative inline-flex items-center justify-center rounded-xl bg-accent-orange text-white font-bold shadow-md shadow-accent-orange/20 ${sizeClasses[size]} ${className}`}>
      {/* Outer Pulse Glow Ring when streaming/active */}
      {animated && (
        <span className="absolute -inset-1 rounded-xl bg-accent-orange/30 animate-ping duration-1000 pointer-events-none" />
      )}

      {/* Hexagonal Concrete Symbol + AI Spark SVG */}
      <svg
        width={iconSizes[size]}
        height={iconSizes[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? "animate-pulse" : ""}
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
};
