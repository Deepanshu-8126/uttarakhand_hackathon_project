import React from 'react';
import { Menu, Info } from 'lucide-react';
import ChatWindow from '../../chat/ChatWindow.jsx';

export default function ChatArea({ activeChat, tripIdContext, onToggleSidebar, onToggleContext }) {
  return (
    <div className="relative w-full h-full flex flex-col bg-[#040e09] overflow-hidden">
      {/* Top Mobile/Auxiliary Action Bar */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-black/60 border-b border-white/10 z-20">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg bg-white/5 text-stone-300 hover:text-white"
        >
          <Menu size={18} />
        </button>
        <span className="text-xs font-semibold text-emerald-300">Devbhoomi Copilot</span>
        <button
          type="button"
          onClick={onToggleContext}
          className="p-1.5 rounded-lg bg-white/5 text-stone-300 hover:text-white"
        >
          <Info size={18} />
        </button>
      </div>

      <div className="flex-1 w-full h-full overflow-hidden">
        <ChatWindow embedded={true} />
      </div>
    </div>
  );
}
