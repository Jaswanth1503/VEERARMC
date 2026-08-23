"use client";

import React, { useState } from "react";
import { RAGSourceMetadata } from "@/lib/types/ai";
import { FileText, ExternalLink, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

interface SourceCitationsProps {
  sources?: RAGSourceMetadata[];
}

export const SourceCitations: React.FC<SourceCitationsProps> = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-2 border-t border-concrete-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-accent-orange font-semibold hover:text-accent-orange/80 transition-colors focus:outline-none"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Verified Sources ({sources.length})</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5 animate-fadeIn">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-concrete-50 border border-concrete-200 text-xs flex items-start justify-between gap-2 hover:border-concrete-300 transition-all shadow-sm"
            >
              <div className="flex items-start gap-2 overflow-hidden">
                <FileText className="w-3.5 h-3.5 text-accent-orange mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-charcoal-black truncate">
                    {src.documentName || src.title || "Knowledge Document"}
                  </div>
                  <div className="text-[11px] text-concrete-600 flex items-center gap-2 mt-0.5">
                    {src.section && <span>Section: {src.section}</span>}
                    {src.page && <span>Page {src.page}</span>}
                    <span className="text-emerald-600 font-mono font-semibold">
                      Match: {Math.round(src.relevanceScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {src.sourceUrl && (
                <a
                  href={src.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-concrete-500 hover:text-accent-orange hover:bg-concrete-200 transition-colors shrink-0"
                  title="Open Source Document"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
