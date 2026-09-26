import React, { useState } from 'react';
import { Plus, X, Trash2, MessageSquare, Search, Edit2, Check, Sparkles } from 'lucide-react';
import useChatStore from '../../store/chatStore';

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
};

const isThisWeek = (date) => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  return date > weekAgo && !isToday(date) && !isYesterday(date);
};

export default function ChatHistorySidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const { updateChatTitle } = useChatStore();

  const handleStartRename = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditTitle(chat.title || 'Untitled Trip');
  };

  const handleSaveRename = async (chatId, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await updateChatTitle(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const safeChats = Array.isArray(chats) ? chats : [];

  const filteredChats = safeChats.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = (c?.title || '').toLowerCase().includes(term);
    const msgList = Array.isArray(c?.messages) ? c.messages : [];
    const contentMatch = msgList.some(m => (m?.content || m?.text || '').toLowerCase().includes(term));
    return titleMatch || contentMatch;
  });

  const groupedChats = filteredChats.reduce((acc, chat) => {
    if (!chat) return acc;
    const date = new Date(chat.updatedAt || chat.createdAt || Date.now());
    let group = 'Older';
    if (isToday(date)) group = 'Today';
    else if (isYesterday(date)) group = 'Yesterday';
    else if (isThisWeek(date)) group = 'Last 7 days';

    if (!acc[group]) acc[group] = [];
    acc[group].push(chat);
    return acc;
  }, {});

  const groupOrder = ['Today', 'Yesterday', 'Last 7 days', 'Older'];

  return (
    <div className={`copilot-sidebar ${isOpen ? 'open' : ''} flex flex-col h-full bg-[#06140c] border-r border-white/[0.08] text-stone-200 select-none`}>
      {/* Header & New Chat */}
      <div className="flex flex-col gap-2.5 p-3.5 border-b border-white/[0.08] bg-[#07190f]/70">
        <div className="flex items-center justify-between gap-2">
          <button 
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-emerald-950/60 border border-emerald-400/30 transition-all active:scale-95 cursor-pointer"
            onClick={onNewChat}
          >
            <Plus size={15} />
            <span>New Journey</span>
          </button>
          {onClose && (
            <button 
              type="button"
              className="lg:hidden p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors flex items-center justify-center cursor-pointer" 
              onClick={onClose} 
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Chat Search Box */}
        <div className="relative w-full">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-400 focus:bg-white/[0.06] text-white placeholder:text-stone-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
        {filteredChats.length === 0 ? (
          <div className="text-center py-8 px-4 text-stone-500 space-y-2">
            <MessageSquare size={20} className="mx-auto text-stone-600" />
            <p className="text-xs">{searchTerm ? 'No matching conversations' : 'No past conversations'}</p>
          </div>
        ) : (
          groupOrder.map((group) => {
            if (!groupedChats[group] || groupedChats[group].length === 0) return null;
            return (
              <div key={group} className="space-y-1">
                <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
                  {group}
                </h4>
                <div className="space-y-0.5">
                  {groupedChats[group].map((chat) => {
                    const isActive = activeChatId === chat._id;
                    return (
                      <div
                        key={chat._id}
                        className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150 ${
                          isActive
                            ? 'bg-emerald-950/70 text-emerald-200 border border-emerald-500/30 shadow-sm font-semibold'
                            : 'text-stone-300 hover:text-white hover:bg-white/[0.04] border border-transparent'
                        }`}
                        onClick={() => onSelectChat(chat._id)}
                      >
                        <MessageSquare 
                          size={14} 
                          className={`shrink-0 ${isActive ? 'text-emerald-400' : 'text-stone-500 group-hover:text-emerald-400/80 transition-colors'}`} 
                        />
                        
                        <div className="flex-1 min-w-0">
                          {editingChatId === chat._id ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRename(chat._id, e);
                                  if (e.key === 'Escape') setEditingChatId(null);
                                }}
                                autoFocus
                                className="w-full text-xs px-2 py-0.5 rounded bg-black/60 border border-emerald-400 text-white focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={(e) => handleSaveRename(chat._id, e)}
                                className="p-1 text-emerald-400 hover:text-emerald-200 cursor-pointer"
                                title="Save"
                              >
                                <Check size={12} />
                              </button>
                            </div>
                          ) : (
                            <div className="truncate text-xs">
                              {chat.title || 'Untitled Trip'}
                            </div>
                          )}
                        </div>

                        {/* Action buttons on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {editingChatId !== chat._id && (
                            <button
                              type="button"
                              className="p-1 rounded text-stone-400 hover:text-emerald-300 transition-colors cursor-pointer"
                              onClick={(e) => handleStartRename(chat, e)}
                              title="Rename Chat"
                            >
                              <Edit2 size={12} />
                            </button>
                          )}
                          {onDeleteChat && (
                            <button 
                              type="button"
                              className="p-1 rounded text-stone-400 hover:text-rose-400 transition-colors cursor-pointer" 
                              onClick={(e) => { e.stopPropagation(); onDeleteChat(chat._id); }}
                              title="Delete Chat"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
