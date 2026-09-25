import React from 'react';
import ChatWindow from '../../chat/ChatWindow.jsx';
import './AICopilotDrawer.css';

export default function AICopilotDrawer({ isOpen, onClose, tripId, pageContext }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* ── Desktop: Right-side slide-in panel ── */}
      <div
        className={`
          fixed z-[9991] shadow-2xl border-white/10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          /* Mobile: bottom slide-up sheet */
          bottom-0 left-0 right-0 top-auto
          w-full rounded-t-[20px] border-t
          h-[92dvh]
          /* SM+: right-side panel */
          sm:inset-y-0 sm:right-0 sm:left-auto sm:top-0 sm:bottom-0
          sm:w-[480px] sm:h-full sm:rounded-none sm:border-t-0 sm:border-l
          ${isOpen
            ? 'translate-y-0 sm:translate-x-0'
            : 'translate-y-full sm:translate-x-full sm:translate-y-0'
          }
        `}
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center items-center pt-2.5 pb-1 cursor-grab flex-shrink-0 bg-[#040e09] rounded-t-[20px]">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>

        <ChatWindow isOpen={isOpen} onClose={onClose} />
      </div>
    </>
  );
}