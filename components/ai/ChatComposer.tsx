"use client";

import React, { useRef, useEffect } from "react";
import { Send, Square, Paperclip, Sparkles } from "lucide-react";

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  suggestedQuestions?: string[];
  onSelectSuggestion?: (question: string) => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  suggestedQuestions = [],
  onSelectSuggestion
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as content expands
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming && !disabled) {
        onSend(input.trim());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming && !disabled) {
      onSend(input.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Suggested Questions Pills */}
      {suggestedQuestions.length > 0 && !input && !isStreaming && (
        <div className="flex flex-wrap items-center gap-2 mb-3 animate-fadeIn">
          <span className="text-xs text-accent-orange font-bold flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5" /> Suggested:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSuggestion && onSelectSuggestion(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-concrete-200 text-concrete-700 hover:text-accent-orange hover:border-accent-orange/50 hover:bg-concrete-50 transition-all shadow-sm font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <form onSubmit={handleSubmit} className="relative rounded-2xl bg-white border border-concrete-300 focus-within:border-accent-orange focus-within:ring-2 focus-within:ring-accent-orange/20 shadow-lg shadow-concrete-200/50 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Veera AI about concrete grades, mix specs, orders, or technical guidelines..."
          rows={1}
          disabled={disabled}
          maxLength={4000}
          className="w-full py-3.5 pl-4 pr-24 bg-transparent text-sm text-charcoal-black placeholder-concrete-400 resize-none focus:outline-none max-h-44 scrollbar-thin scrollbar-thumb-concrete-300"
        />

        {/* Action Toolbar Inside Box */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
          {/* Attachment Architecture Placeholder */}
          <button
            type="button"
            className="p-2 rounded-xl text-concrete-400 hover:text-accent-orange hover:bg-concrete-100 transition-colors"
            title="Attach PDF / Blueprint (Future Feature)"
            onClick={() => alert("Document & blueprint attachment analysis will be available in future releases.")}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Send / Stop Streaming Button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="p-2 rounded-xl bg-error-red text-white hover:bg-error-red/90 transition-colors shadow-md flex items-center justify-center"
              title="Stop Generation"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className="p-2 rounded-xl bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-all shadow-md flex items-center justify-center"
              title="Send Message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between text-[11px] text-concrete-500 px-2 mt-1.5">
        <span>Veera AI uses RAG to ground answers in technical documents.</span>
        <span>{input.length}/4000</span>
      </div>
    </div>
  );
};
