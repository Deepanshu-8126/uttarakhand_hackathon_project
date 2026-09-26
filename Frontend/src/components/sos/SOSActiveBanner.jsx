import React, { useState } from 'react';
import { ShieldAlert, Share2, Phone, X } from 'lucide-react';
import useSOS from '../../hooks/useSOS';
import SOSModal from './SOSModal';

export default function SOSActiveBanner() {
  const { activeAlert } = useSOS();
  const [showModal, setShowModal] = useState(false);

  if (!activeAlert || activeAlert.status === 'RESOLVED' || activeAlert.status === 'CANCELLED') {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-rose-900 via-red-800 to-rose-950 text-white px-3 sm:px-6 py-2 border-b border-rose-500/40 flex items-center justify-between z-[9970] text-xs shadow-lg animate-fade-in select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <div className="truncate">
            <span className="font-black uppercase tracking-wider text-rose-200">
              EMERGENCY SOS BEACON LIVE ({activeAlert.alertCode}):
            </span>{' '}
            <span className="text-stone-200 hidden sm:inline">
              SDRF rescue grid dispatched to your GPS coordinates.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] transition-all cursor-pointer"
          >
            View Details
          </button>
          <a
            href="tel:1070"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-[11px]"
          >
            <Phone size={11} /> Call SDRF (1070)
          </a>
        </div>
      </div>

      <SOSModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
