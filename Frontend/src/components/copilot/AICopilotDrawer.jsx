import React from 'react';
import ChatWindow from '../../chat/ChatWindow.jsx';
import './AICopilotDrawer.css';

export default function AICopilotDrawer({ isOpen, onClose, tripId: _tripId, pageContext: _pageContext }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* ── Desktop: Right-side slide-in panel / Mobile: Bottom slide-up sheet ── */}
      <div
        className={`
          fixed z-[9991] shadow-2xl border-white/10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          flex flex-col overflow-hidden select-none
          /* Mobile: bottom slide-up sheet */
          bottom-0 left-0 right-0 top-auto
          w-full rounded-t-[24px] border-t border-stone-200 bg-white
          max-h-[92dvh] h-[92dvh]
          /* SM+: right-side panel */
          sm:inset-y-0 sm:right-0 sm:left-auto sm:top-0 sm:bottom-0
          sm:w-[480px] sm:max-h-full sm:h-full sm:rounded-none sm:border-t-0 sm:border-l sm:border-stone-200
          ${isOpen
            ? 'translate-y-0 sm:translate-x-0'
            : 'translate-y-full sm:translate-x-full sm:translate-y-0'
          }
        `}
        style={{
          overscrollBehavior: 'contain',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Mobile drag handle with click-to-close */}
        <div
          onClick={onClose}
          className="sm:hidden flex justify-center items-center pt-3 pb-2 cursor-pointer flex-shrink-0 bg-white rounded-t-[24px] active:opacity-75 transition-opacity touch-none"
        >
          <div className="w-10 h-1.5 rounded-full bg-stone-300 active:bg-stone-400 transition-colors" />
        </div>

        {/* Chat Window Container */}
        <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden">
          <ChatWindow isOpen={isOpen} onClose={onClose} />
        </div>
      </div>
    </>
  );
}