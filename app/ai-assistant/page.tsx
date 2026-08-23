"use client";

import React, { useState, useEffect, useRef } from "react";
import { ConversationSidebar, ConversationItem } from "@/components/ai/ConversationSidebar";
import { ChatMessageItem, MessageItemProps } from "@/components/ai/ChatMessageItem";
import { ChatComposer } from "@/components/ai/ChatComposer";
import { VeeraAILogo } from "@/components/ai/VeeraAILogo";
import { RAGSourceMetadata } from "@/lib/types/ai";
import { Menu, Plus, Sparkles, ShieldCheck, Cpu, ArrowLeft, Layers, Calculator, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItemProps[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userSession, setUserSession] = useState<{ email?: string; role?: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUserSession({
          email: data.user?.email,
          role: data.user?.role?.roleName || data.user?.role
        });
      }
    } catch (e) {
      console.error("Failed to load session", e);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/ai/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
    }
  };

  const fetchConversationDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        const conv = data.conversation;
        if (conv && conv.messages) {
          setMessages(
            conv.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              sources: m.sources,
              timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          );
        }
      }
    } catch (e) {
      console.error("Failed to load conversation messages", e);
    }
  };

  // Fetch session & conversation list on mount
  useEffect(() => {
    fetchSession();
    fetchConversations();
  }, []);

  // Fetch single conversation messages when activeConvId changes
  useEffect(() => {
    if (activeConvId) {
      fetchConversationDetails(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleNewChat = async () => {
    setActiveConvId(null);
    setMessages([]);
    setInput("");
    if (mobileSidebarOpen) setMobileSidebarOpen(false);
  };

  const handleRename = async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/ai/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) {
        setConversations(prev =>
          prev.map(c => (c.id === id ? { ...c, title: newTitle } : c))
        );
      }
    } catch (e) {
      console.error("Failed to rename conversation", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/conversations/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConvId === id) {
          handleNewChat();
        }
      }
    } catch (e) {
      console.error("Failed to delete conversation", e);
    }
  };

  const handleSendPrompt = async (promptToSend?: string) => {
    const prompt = (promptToSend || input).trim();
    if (!prompt || isStreaming) return;

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    // Add user message to UI immediately
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        content: prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setInput("");
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          conversationId: activeConvId
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        let errMessage = "Failed to connect to Veera AI.";
        if (response.status === 401) {
          errMessage = "🔒 **Authentication Required**: Please [Log In](/login) to your Veera RMC account to use the AI assistant.";
        } else {
          try {
            const errData = await response.json();
            if (errData.error) errMessage = `⚠️ ${errData.error}`;
          } catch (_) {}
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
      if (!reader) throw new Error("Readable stream unavailable");

      let fullAssistantText = "";
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
                if (data.conversationId) {
                  setActiveConvId(data.conversationId);
                  fetchConversations(); // refresh sidebar titles
                }
                if (data.sources) retrievedSources = data.sources;
              } else if (eventType === "token") {
                fullAssistantText += data.token;
                const newText = fullAssistantText;
                const newSources = retrievedSources;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: newText, sources: newSources }
                      : m
                  )
                );
              } else if (eventType === "error") {
                fullAssistantText = `⚠️ ${data.message || "An error occurred."}`;
              }
            } catch (e) {
              console.error("SSE JSON parse error", e);
            }
          }
        }
      }

      // Complete stream
      const finalAssistantText = fullAssistantText;
      const finalSources = retrievedSources;
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: finalAssistantText, sources: finalSources, isStreaming: false }
            : m
        )
      );

    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Stream aborted by user");
      } else {
        console.error("[Chat Error]", error);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: "⚠️ Veera AI is temporarily unavailable. Please try again shortly.",
                  isStreaming: false
                }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const suggestedQuestions = [
    "What is M25 concrete?",
    "Which grade is suitable for house foundations?",
    "How much concrete do I need for a 1000 sq ft slab?",
    "What services does Veera RMC provide?",
    "How to request an official quotation?",
    "What's the difference between M30 and M40?"
  ];

  return (
    <div className="flex h-screen w-full bg-concrete-50 text-charcoal-black overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConvId}
          onSelect={(id) => setActiveConvId(id)}
          onNewChat={handleNewChat}
          onRename={handleRename}
          onDelete={handleDelete}
          userEmail={userSession?.email}
          userRole={userSession?.role}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-charcoal-black/60 backdrop-blur-sm animate-fadeIn">
          <ConversationSidebar
            conversations={conversations}
            activeId={activeConvId}
            onSelect={(id) => {
              setActiveConvId(id);
              setMobileSidebarOpen(false);
            }}
            onNewChat={handleNewChat}
            onRename={handleRename}
            onDelete={handleDelete}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            userEmail={userSession?.email}
            userRole={userSession?.role}
          />
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-concrete-50 relative">
        {/* Top Header */}
        <header className="h-16 border-b border-concrete-200 px-4 sm:px-6 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-concrete-600 hover:text-charcoal-black hover:bg-concrete-100 border border-concrete-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-xs text-concrete-600 hover:text-accent-orange font-semibold transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>

            <div className="flex items-center gap-2.5">
              <VeeraAILogo size="sm" animated={isStreaming} />
              <div>
                <h1 className="text-sm font-bold text-charcoal-black flex items-center gap-2">
                  Veera AI
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 font-mono font-normal">
                    Online
                  </span>
                </h1>
                <p className="text-[11px] text-concrete-500 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-accent-orange" /> Gemini 1.5 Flash + Pinecone RAG
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-accent-orange text-white hover:bg-accent-orange/90 font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> New Chat
            </button>
            <div className="hidden lg:flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl bg-concrete-100 border border-concrete-200 text-concrete-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Grounded Context
            </div>
          </div>
        </header>

        {/* Message Viewport */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-concrete-300">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-8 animate-fadeIn">
              <div className="space-y-3">
                <VeeraAILogo size="lg" className="mx-auto shadow-lg" animated={false} />
                <h2 className="text-2xl font-black text-charcoal-black tracking-tight">
                  Welcome to <span className="text-accent-orange">Veera AI</span>
                </h2>
                <p className="text-sm text-concrete-600 max-w-lg mx-auto leading-relaxed">
                  Your intelligent assistant for ready mix concrete specifications, grade comparisons, slump guidelines, pricing estimates, and project advice.
                </p>
              </div>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left max-w-3xl mx-auto">
                {[
                  {
                    icon: Layers,
                    title: "Ask About Concrete",
                    desc: "Grade specs for M10 through M50",
                    prompt: "Explain the technical specifications of M25 concrete."
                  },
                  {
                    icon: ShieldCheck,
                    title: "Compare Grades",
                    desc: "Find the ideal grade for slab vs footing",
                    prompt: "Compare M25 vs M30 concrete for residential construction."
                  },
                  {
                    icon: Calculator,
                    title: "Calculate Concrete",
                    desc: "Estimate required volume & slumps",
                    prompt: "How do I calculate required volume for a 10m x 15m slab of 150mm thickness?"
                  },
                  {
                    icon: FileText,
                    title: "Request Quote",
                    desc: "Learn about Veera delivery options",
                    prompt: "How can I place an order for ready mix concrete with Veera RMC?"
                  }
                ].map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(card.prompt)}
                    className="group p-4 rounded-2xl bg-white border border-concrete-200 hover:border-accent-orange/60 hover:shadow-md transition-all duration-200 shadow-sm text-left flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center text-accent-orange group-hover:scale-110 transition-transform">
                        <card.icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold text-charcoal-black group-hover:text-accent-orange flex items-center justify-between">
                        {card.title} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-[11px] text-concrete-500 leading-normal">{card.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Message List */
            <div className="pb-8">
              {messages.map((m, idx) => (
                <ChatMessageItem
                  key={m.id || idx}
                  id={m.id}
                  role={m.role}
                  content={m.content}
                  isStreaming={m.isStreaming}
                  sources={m.sources}
                  timestamp={m.timestamp}
                  onRegenerate={
                    idx === messages.length - 1 && m.role === "assistant" && !isStreaming
                      ? () => {
                          const lastUserMsg = [...messages].reverse().find(x => x.role === "user");
                          if (lastUserMsg) handleSendPrompt(lastUserMsg.content);
                        }
                      : undefined
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Composer Footer */}
        <div className="border-t border-concrete-200 bg-white/90 backdrop-blur-md pt-3">
          <ChatComposer
            input={input}
            setInput={setInput}
            onSend={(val) => handleSendPrompt(val)}
            onStop={handleStopStream}
            isStreaming={isStreaming}
            suggestedQuestions={suggestedQuestions}
            onSelectSuggestion={(q) => handleSendPrompt(q)}
          />
        </div>
      </main>
    </div>
  );
}
