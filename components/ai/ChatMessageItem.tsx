"use client";

import React, { useState } from "react";
import { VeeraAILogo } from "./VeeraAILogo";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { SourceCitations } from "./SourceCitations";
import { RAGSourceMetadata } from "@/lib/types/ai";
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCw, User } from "lucide-react";

export interface MessageItemProps {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  sources?: RAGSourceMetadata[];
  timestamp?: string;
  onRegenerate?: () => void;
}

export const ChatMessageItem: React.FC<MessageItemProps> = ({
  id,
  role,
  content,
  isStreaming = false,
  sources,
  timestamp,
  onRegenerate
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"POSITIVE" | "NEGATIVE" | null>(null);

  const isAssistant = role === "assistant";

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (rating: "POSITIVE" | "NEGATIVE") => {
    if (!id) return;
    setFeedback(rating);
    try {
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id, rating })
      });
    } catch (e) {
      console.error("Failed to submit feedback", e);
    }
  };

  return (
    <div className={`py-4 px-4 sm:px-6 transition-colors ${isAssistant ? "bg-white border-y border-concrete-200" : "bg-concrete-50/50"}`}>
      <div className="max-w-4xl mx-auto flex items-start gap-3.5">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isAssistant ? (
            <VeeraAILogo size="sm" animated={isStreaming} />
          ) : (
            <div className="w-7 h-7 rounded-xl bg-concrete-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content Body */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header metadata */}
          <div className="flex items-center gap-2 text-xs text-concrete-500">
            <span className="font-bold text-charcoal-black">
              {isAssistant ? "Veera AI" : "You"}
            </span>
            {timestamp && <span className="text-[11px] text-concrete-400">• {timestamp}</span>}
          </div>

          {/* Main Markdown & Text */}
          <div className="text-sm text-concrete-800">
            <MarkdownRenderer content={content} />
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-accent-orange animate-pulse ml-1 align-middle" />
            )}
          </div>

          {/* RAG Source Citations */}
          {isAssistant && sources && sources.length > 0 && (
            <SourceCitations sources={sources} />
          )}

          {/* Action Toolbar for Assistant */}
          {isAssistant && !isStreaming && content && (
            <div className="flex items-center gap-1.5 pt-2 text-concrete-500">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-concrete-100 hover:text-charcoal-black text-xs flex items-center gap-1 transition-colors"
                title="Copy Message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-md hover:bg-concrete-100 hover:text-charcoal-black text-xs flex items-center gap-1 transition-colors"
                  title="Regenerate Response"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="w-px h-3 bg-concrete-200 mx-1" />

              <button
                onClick={() => handleFeedback("POSITIVE")}
                className={`p-1.5 rounded-md hover:bg-concrete-100 text-xs transition-colors ${feedback === "POSITIVE" ? "text-emerald-600 font-bold" : "hover:text-charcoal-black"}`}
                title="Helpful Response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFeedback("NEGATIVE")}
                className={`p-1.5 rounded-md hover:bg-concrete-100 text-xs transition-colors ${feedback === "NEGATIVE" ? "text-error-red font-bold" : "hover:text-charcoal-black"}`}
                title="Not Helpful"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
