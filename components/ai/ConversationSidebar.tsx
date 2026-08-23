"use client";

import React, { useState } from "react";
import { Plus, Search, MessageSquare, Edit2, Trash2, X, Sparkles, Check } from "lucide-react";
import { VeeraAILogo } from "./VeeraAILogo";

export interface ConversationItem {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: { messages: number };
}

interface ConversationSidebarProps {
  conversations: ConversationItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onCloseMobile?: () => void;
  userEmail?: string;
  userRole?: string;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  onCloseMobile,
  userEmail,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Helper date grouping
  const groupConversations = (items: ConversationItem[]) => {
    const now = new Date();
    const today: ConversationItem[] = [];
    const yesterday: ConversationItem[] = [];
    const last7Days: ConversationItem[] = [];
    const older: ConversationItem[] = [];

    const filtered = items.filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach(item => {
      const date = new Date(item.updatedAt || item.createdAt);
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1 && date.getDate() === now.getDate()) {
        today.push(item);
      } else if (diffDays <= 2) {
        yesterday.push(item);
      } else if (diffDays <= 7) {
        last7Days.push(item);
      } else {
        older.push(item);
      }
    });

    return { today, yesterday, last7Days, older };
  };

  const { today, yesterday, last7Days, older } = groupConversations(conversations);

  const startRename = (conv: ConversationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="w-72 h-full bg-white border-r border-concrete-200 flex flex-col justify-between shrink-0 select-none shadow-sm">
      {/* Top Header */}
      <div className="p-4 border-b border-concrete-200 flex items-center justify-between bg-concrete-50/50">
        <div className="flex items-center gap-2.5">
          <VeeraAILogo size="sm" />
          <div>
            <h2 className="text-sm font-bold text-charcoal-black flex items-center gap-1.5">
              Veera AI <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-orange/10 text-accent-orange font-mono">v2.0</span>
            </h2>
            <p className="text-[11px] text-concrete-500">RAG Assistant</p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-concrete-500 hover:text-charcoal-black hover:bg-concrete-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* New Chat Button & Search */}
      <div className="p-3 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-3 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-concrete-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search chats..."
            className="w-full py-1.5 pl-8 pr-3 bg-concrete-50 border border-concrete-200 rounded-lg text-xs text-charcoal-black placeholder-concrete-400 focus:outline-none focus:border-accent-orange/60"
          />
        </div>
      </div>

      {/* Conversation List Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4 scrollbar-thin scrollbar-thumb-concrete-200">
        {[
          { label: "Today", items: today },
          { label: "Yesterday", items: yesterday },
          { label: "Previous 7 Days", items: last7Days },
          { label: "Older", items: older }
        ].map(group => (
          group.items.length > 0 && (
            <div key={group.label} className="space-y-1">
              <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-concrete-500">
                {group.label}
              </h3>

              {group.items.map(conv => {
                const isActive = conv.id === activeId;
                const isEditing = conv.id === editingId;

                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelect(conv.id)}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive 
                        ? "bg-accent-orange/10 text-accent-orange font-bold border border-accent-orange/30 shadow-sm" 
                        : "text-concrete-700 hover:bg-concrete-100 hover:text-charcoal-black"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-10">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-accent-orange" : "text-concrete-400"}`} />
                      
                      {isEditing ? (
                        <form onSubmit={(e) => saveRename(conv.id, e)} className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            autoFocus
                            className="w-32 px-1.5 py-0.5 bg-white text-charcoal-black border border-accent-orange rounded text-xs focus:outline-none"
                          />
                          <button type="submit" className="p-0.5 text-emerald-600 hover:text-emerald-700">
                            <Check className="w-3 h-3" />
                          </button>
                        </form>
                      ) : (
                        <span className="truncate">{conv.title || "New Chat"}</span>
                      )}
                    </div>

                    {/* Action buttons on hover */}
                    {!isEditing && (
                      <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white px-1 py-0.5 rounded-lg border border-concrete-200 shadow-sm">
                        <button
                          onClick={(e) => startRename(conv, e)}
                          className="p-1 text-concrete-500 hover:text-accent-orange transition-colors"
                          title="Rename Chat"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this chat conversation?")) {
                              onDelete(conv.id);
                            }
                          }}
                          className="p-1 text-concrete-500 hover:text-error-red transition-colors"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ))}

        {conversations.length === 0 && (
          <div className="text-center py-8 px-4 text-xs text-concrete-400">
            No previous conversations yet. Start a new chat above!
          </div>
        )}
      </div>

      {/* User Footer Info */}
      <div className="p-3 border-t border-concrete-200 bg-concrete-50 flex items-center justify-between text-xs text-concrete-600">
        <div className="min-w-0 pr-2">
          <div className="font-bold text-charcoal-black truncate">{userEmail || "User Portal"}</div>
          <div className="text-[10px] text-accent-orange font-semibold capitalize">{userRole || "Enterprise User"}</div>
        </div>
        <Sparkles className="w-4 h-4 text-accent-orange shrink-0" />
      </div>
    </aside>
  );
};
