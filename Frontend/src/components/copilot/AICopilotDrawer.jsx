import React, { useEffect } from 'react';
import ChatWindow from '../../chat/ChatWindow.jsx';
import './AICopilotDrawer.css';

// Fix 1: unused props removed — tripId/pageContext passed directly to ChatWindow if needed
export default function AICopilotDrawer({ isOpen, onClose, tripId, pageContext }) {

  // Fix 4: Body scroll lock when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <div
      id="devbhoomi-ai-drawer-container"
      className={`fixed inset-0 z-[9990] overflow-hidden transition-all duration-300 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Subtle backdrop scrim overlay matching user mockup */}
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Fix 2: aside is now `absolute` — parent div is already `fixed inset-0` */}
      {/* Fix 3: removed pl-0 sm:pl-10 gap — drawer shows flush to right edge */}
      <aside
        aria-label="Devbhoomi AI Copilot"
        className={`
          absolute inset-y-0 right-0 max-w-full flex z-[9991]
          transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Fix 5: removed justify-between — ChatWindow controls its own layout */}
        <div
          className="
            w-screen max-w-[480px] bg-white shadow-2xl flex flex-col
            border-l border-slate-200/80 h-[100dvh] overflow-hidden
          "
        >
          <ChatWindow isOpen={isOpen} onClose={onClose} tripId={tripId} pageContext={pageContext} />
        </div>
      </aside>
    </div>
  );
}