import React from 'react';
import ChatWindow from '../../chat/ChatWindow.jsx';
import './AICopilotDrawer.css';

export default function AICopilotDrawer({ isOpen, onClose, tripId: _tripId, pageContext: _pageContext }) {
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

      {/* Slide-out Drawer Panel docked to right */}
      <aside
        aria-label="Devbhoomi AI Copilot"
        className={`
          fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 z-[9991]
          transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div
          className="
            w-screen max-w-[480px] bg-white shadow-2xl flex flex-col justify-between
            border-l border-slate-200/80 h-[100dvh] overflow-hidden
          "
        >
          <ChatWindow isOpen={isOpen} onClose={onClose} />
        </div>
      </aside>
    </div>
  );
}