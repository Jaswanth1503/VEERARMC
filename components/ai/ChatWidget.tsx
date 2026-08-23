"use client";

import React, { useState, useRef, useEffect } from "react";
import { VeeraAILogo } from "./VeeraAILogo";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { SourceCitations } from "./SourceCitations";
import { RAGSourceMetadata } from "@/lib/types/ai";
import { MessageSquare, X, Maximize2, Send, RotateCw, Sparkles } from "lucide-react";
import Link from "next/link";

interface WidgetMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: RAGSourceMetadata[];
  isStreaming?: boolean;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isStreaming) return;

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    // Append user message immediately
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: "user", content: prompt },
      { id: assistantMsgId, role: "assistant", content: "", isStreaming: true }
    ]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, conversationId })
      });

      if (!response.ok) {
        let errMessage = "Veera AI is ready to assist. Please try your question again.";
        if (response.status === 401) {
          errMessage = "🔒 **Authentication Required**: Please [Log In](/login) to your account to use Veera AI.";
        }
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, content: errMessage, isStreaming: false }
              : m
          )
        );
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No readable stream reader");

      let streamedText = "";
      let retrievedSources: RAGSourceMetadata[] = [];
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const eventStr of events) {
          if (!eventStr.trim()) continue;
          const lines = eventStr.split("\n");
          let eventType = "";
          let dataJson = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.replace("event: ", "").trim();
            if (line.startsWith("data: ")) dataJson = line.replace("data: ", "").trim();
          }

          if (dataJson) {
            try {
              const data = JSON.parse(dataJson);

              if (eventType === "metadata") {
                if (data.conversationId) setConversationId(data.conversationId);
                if (data.sources) retrievedSources = data.sources;
              } else if (eventType === "token") {
                streamedText += data.token;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: streamedText, sources: retrievedSources }
                      : m
                  )
                );
              } else if (eventType === "done") {
                if (data.fullText) streamedText = data.fullText;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: streamedText, sources: retrievedSources, isStreaming: false }
                      : m
                  )
                );
              } else if (eventType === "error") {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: data.message || "An error occurred.", isStreaming: false }
                      : m
                  )
                );
              }
            } catch (jsonErr) {
              console.warn("[ChatWidget Stream JSON Parse Error]:", jsonErr);
            }
          }
        }
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, isStreaming: false }
            : m
        )
      );

    } catch (error: any) {
      console.error("[ChatWidget Send Error]:", error);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: "Veera AI is ready to assist. Please try your question again.",
                isStreaming: false
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Expanded Modal Window */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] h-[calc(100dvh-120px)] sm:h-[540px] max-h-[580px] rounded-3xl bg-white border border-concrete-200 shadow-2xl shadow-charcoal-black/25 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-concrete-50 border-b border-concrete-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <VeeraAILogo size="sm" animated={isStreaming} />
              <div>
                <h3 className="text-xs font-bold text-charcoal-black flex items-center gap-1.5">
                  Veera AI Assistant <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[10px] text-concrete-500">IS 456 & 10262 RAG Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/ai-assistant"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-concrete-500 hover:text-accent-orange hover:bg-concrete-100 transition-colors"
                title="Expand Full Page"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-concrete-500 hover:text-charcoal-black hover:bg-concrete-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-concrete-200 bg-concrete-50/40">
            {messages.length === 0 && (
              <div className="text-center py-6 px-3 space-y-3">
                <VeeraAILogo size="lg" className="mx-auto" />
                <h4 className="text-sm font-bold text-charcoal-black">Welcome to Veera AI</h4>
                <p className="text-xs text-concrete-600">
                  Ask me anything about ready mix concrete grades, slump specs, delivery schedules, or pricing estimates.
                </p>
                <div className="pt-2 flex flex-col gap-1.5 text-left">
                  {[
                    "What is the difference between M25 and M30?",
                    "What is the max transit time for RMC under IS 4926?",
                    "How to request a quotation?"
                  ].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="p-2.5 rounded-xl bg-white border border-concrete-200 hover:border-accent-orange/50 text-xs text-concrete-800 hover:text-accent-orange transition-all text-left flex items-center justify-between shadow-xs active:scale-[0.98]"
                    >
                      <span className="font-medium">{q}</span>
                      <Sparkles className="w-3.5 h-3.5 text-accent-orange shrink-0 ml-1.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 text-xs ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <VeeraAILogo size="sm" className="shrink-0 mt-0.5" animated={m.isStreaming} />
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[88%] break-words ${
                    m.role === "user"
                      ? "bg-accent-orange text-white font-medium shadow-md"
                      : "bg-white border border-concrete-200 text-concrete-800 shadow-xs"
                  }`}
                >
                  <MarkdownRenderer content={m.content} />
                  {m.isStreaming && (
                    <span className="inline-block w-1.5 h-3 bg-accent-orange animate-pulse ml-1 align-middle" />
                  )}
                  {m.sources && <SourceCitations sources={m.sources} />}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-concrete-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your concrete question..."
              disabled={isStreaming}
              className="flex-1 py-2 px-3 rounded-xl bg-concrete-50 border border-concrete-200 text-xs text-charcoal-black placeholder-concrete-400 focus:outline-none focus:border-accent-orange/60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2.5 rounded-xl bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-all shadow-md shrink-0 active:scale-95"
            >
              {isStreaming ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-3.5 sm:p-4 rounded-2xl bg-accent-orange text-white shadow-xl shadow-orange-950/25 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
        title="Open Veera AI Assistant"
        aria-label="Open Veera AI Assistant"
      >
        <span className="absolute -inset-1 rounded-2xl bg-accent-orange/30 animate-pulse pointer-events-none group-hover:bg-accent-orange/50" />
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};
