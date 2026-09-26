import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import SOSModal from './SOSModal';
import useSOS from '../../hooks/useSOS';

export default function SOSFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeAlert } = useSOS();
  const isAlertActive = activeAlert && activeAlert.status !== 'RESOLVED' && activeAlert.status !== 'CANCELLED';

  return (
    <>
      {/* Floating Emergency SOS Pill Button */}
      <div 
        className="fixed bottom-20 left-4 z-[9980] flex items-center select-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Emergency Mountain SOS"
          className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer ${
            isAlertActive
              ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white border-2 border-rose-400 animate-pulse shadow-rose-950/80 ring-4 ring-rose-500/30'
              : 'bg-[#0b1710]/90 hover:bg-rose-950/70 border border-rose-500/30 hover:border-rose-400/60 text-rose-300 hover:text-white backdrop-blur-xl shadow-black/80'
          }`}
        >
          {/* Animated beacon ring */}
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAlertActive ? 'bg-white' : 'bg-rose-400'}`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isAlertActive ? 'bg-white' : 'bg-rose-500'}`} />
          </span>

          <ShieldAlert size={16} className={isAlertActive ? "animate-bounce text-white" : "text-rose-400"} />
          
          <span className="text-xs font-black tracking-wider uppercase">
            {isAlertActive ? 'SOS ACTIVE' : 'SOS'}
          </span>
        </button>
      </div>

      {/* SOS Modal */}
      <SOSModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
