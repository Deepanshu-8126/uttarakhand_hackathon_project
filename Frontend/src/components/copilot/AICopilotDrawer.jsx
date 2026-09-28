import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import ChatWindow from '../../chat/ChatWindow.jsx';
import './AICopilotDrawer.css';

export default function AICopilotDrawer({ isOpen, onClose, tripId, pageContext }) {

  // Body scroll lock when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
        window.dispatchEvent(new CustomEvent('du_close_copilot'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      id="devbhoomi-ai-drawer-container"
      className={`fixed inset-0 z-[9990] overflow-hidden transition-all duration-300 ${
        isOpen ? 'pointer-events-auto opacity-100 visible' : 'pointer-events-none opacity-0 invisible'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Subtle backdrop scrim overlay matching user mockup */}
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 cursor-pointer ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose?.();
          window.dispatchEvent(new CustomEvent('du_close_copilot'));
        }}
      />

      <aside
        aria-label="Devbhoomi AI Copilot"
        className={`
          absolute inset-y-0 right-0 max-w-full flex z-[9991]
          transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Floating Close Button Tab on Drawer edge for instant accessibility */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
            window.dispatchEvent(new CustomEvent('du_close_copilot'));
          }}
          className="hidden sm:flex absolute top-4 -left-10 w-10 h-10 rounded-l-xl bg-white border-y border-l border-slate-200/90 shadow-xl items-center justify-center text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer z-[9999]"
          title="Close Devbhoomi AI (Escape)"
          aria-label="Close Devbhoomi AI"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div
          className="
            w-screen max-w-[480px] bg-white shadow-2xl flex flex-col
            border-l border-slate-200/80 h-[100dvh] overflow-hidden relative
          "
        >
          <ChatWindow isOpen={isOpen} onClose={onClose} tripId={tripId} pageContext={pageContext} />
        </div>
      </aside>
    </div>
  );
}