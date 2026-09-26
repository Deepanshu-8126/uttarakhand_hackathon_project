import React from 'react';
import { Menu, Info } from 'lucide-react';
import ChatWindow from '../../chat/ChatWindow.jsx';

export default function ChatArea({ activeChat, tripIdContext, onToggleSidebar, onToggleContext }) {
  return (
    <div className="relative w-full h-full flex flex-col bg-[#fcfbfa] overflow-hidden">
      {/* Top Mobile/Auxiliary Action Bar */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-stone-200/80 z-20 shrink-0 shadow-2xs">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-slate-900 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
          title="Open Conversation History"
        >
          <Menu size={15} className="text-[#0f3d2e]" />
          <span>History</span>
        </button>
        
        <span className="text-xs font-extrabold text-[#0f3d2e]">
          Devbhoomi AI
        </span>

        <button
          type="button"
          onClick={onToggleContext}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-slate-900 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
          title="Open Trip Radar"
        >
          <Info size={15} className="text-[#0f3d2e]" />
          <span>Trip Radar</span>
        </button>
      </div>

      <div className="flex-1 w-full h-full overflow-hidden">
        <ChatWindow embedded={true} />
      </div>
    </div>
  );
}
