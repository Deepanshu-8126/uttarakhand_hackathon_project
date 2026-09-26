import React from 'react';
import { Menu, Info } from 'lucide-react';
import ChatWindow from '../../chat/ChatWindow.jsx';

export default function ChatArea({ activeChat, tripIdContext, onToggleSidebar, onToggleContext }) {
  return (
    <div className="relative w-full h-full flex flex-col bg-[#040e09] overflow-hidden">
      {/* Top Mobile/Auxiliary Action Bar */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-[#06140c]/90 backdrop-blur-xl border-b border-white/[0.08] z-20 shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-stone-300 hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer"
          title="Open Conversation History"
        >
          <Menu size={15} className="text-emerald-400" />
          <span>History</span>
        </button>
        
        <span className="text-xs font-bold bg-gradient-to-r from-emerald-100 via-white to-teal-200 bg-clip-text text-transparent">
          Devbhoomi AI
        </span>

        <button
          type="button"
          onClick={onToggleContext}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-stone-300 hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer"
          title="Open Trip Radar"
        >
          <Info size={15} className="text-emerald-400" />
          <span>Trip Radar</span>
        </button>
      </div>

      <div className="flex-1 w-full h-full overflow-hidden">
        <ChatWindow embedded={true} />
      </div>
    </div>
  );
}
