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

      {/* ── Desktop: Floating Centered Modal / Mobile: Bottom slide-up sheet (Matching Image 2) ── */}
      <div
        className={`
          fixed z-[9991] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          /* Mobile: bottom slide-up sheet */
          inset-x-0 bottom-0 top-auto
          /* Desktop: centered floating card with surrounding breathing room */
          sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 md:p-6 lg:p-8 sm:pointer-events-none
          ${isOpen
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full sm:translate-y-4 opacity-0 pointer-events-none'
          }
        `}
      >
        <div
          className="
            w-full bg-white flex flex-col overflow-hidden shadow-2xl select-none sm:pointer-events-auto
            /* Mobile sheet */
            rounded-t-[28px] border-t border-stone-200 max-h-[92dvh] h-[92dvh]
            /* Desktop floating card matching Image 2 */
            sm:rounded-[32px] sm:border sm:border-stone-200/90 sm:max-w-2xl sm:h-[86vh] sm:max-h-[760px]
          "
          style={{
            overscrollBehavior: 'contain',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {/* Mobile drag handle with click-to-close */}
          <div
            onClick={onClose}
            className="sm:hidden flex justify-center items-center pt-3 pb-1.5 cursor-pointer flex-shrink-0 bg-white rounded-t-[28px] active:opacity-75 transition-opacity touch-none"
          >
            <div className="w-10 h-1.5 rounded-full bg-stone-300 active:bg-stone-400 transition-colors" />
          </div>

          {/* Chat Window Container */}
          <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden">
            <ChatWindow isOpen={isOpen} onClose={onClose} />
          </div>
        </div>
      </div>
    </>
  );
}