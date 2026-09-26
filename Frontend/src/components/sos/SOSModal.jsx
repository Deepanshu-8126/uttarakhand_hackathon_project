import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  X,
  Phone,
  Radio,
  MapPin,
  Battery,
  BatteryCharging,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  AlertTriangle,
  HeartPulse,
  Mountain,
  Car,
  Compass,
  UserCheck,
  Share2,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Trash2
} from 'lucide-react';
import useSOS from '../../hooks/useSOS';

const INCIDENT_TYPES = [
  { id: 'GENERAL_SOS', label: 'General SOS', icon: ShieldAlert, color: 'from-rose-600 to-red-700' },
  { id: 'MEDICAL', label: 'Medical Emergency', icon: HeartPulse, color: 'from-red-600 to-rose-700' },
  { id: 'AMS_ALTITUDE', label: 'Altitude / AMS', icon: Mountain, color: 'from-amber-600 to-orange-700' },
  { id: 'LANDSLIDE_STRANDED', label: 'Landslide / Blocked', icon: AlertTriangle, color: 'from-orange-600 to-amber-700' },
  { id: 'LOST_TRAIL', label: 'Lost on Mountain', icon: Compass, color: 'from-blue-600 to-cyan-700' },
  { id: 'WOMEN_SAFETY', label: 'Women Solo Alert', icon: UserCheck, color: 'from-pink-600 to-rose-700' },
  { id: 'VEHICLE_BREAKDOWN', label: 'Vehicle Breakdown', icon: Car, color: 'from-emerald-600 to-teal-700' }
];

export default function SOSModal({ isOpen, onClose }) {
  const {
    location,
    battery,
    isOnline,
    activeAlert,
    isTriggering,
    holdProgress,
    isSirenPlaying,
    emergencyContacts,
    saveEmergencyContacts,
    startHold,
    cancelHold,
    triggerSOS,
    cancelSOS,
    toggleSiren
  } = useSOS();

  const [selectedIncident, setSelectedIncident] = useState('GENERAL_SOS');
  const [customNotes, setCustomNotes] = useState('');
  const [showContactsManager, setShowContactsManager] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: 'Family' });
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!isOpen) return null;

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;
    saveEmergencyContacts([...emergencyContacts, newContact]);
    setNewContact({ name: '', phone: '', relation: 'Family' });
  };

  const handleRemoveContact = (index) => {
    saveEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const generateWhatsAppShareUrl = () => {
    const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    const text = encodeURIComponent(
      `🚨 EMERGENCY SOS ALERT from Uttarakhand!\n` +
      `Incident: ${selectedIncident.replace(/_/g, ' ')}\n` +
      `My Live GPS Location: ${mapsUrl}\n` +
      `Altitude: ${location.altitude}m | Battery: ${battery.level}%\n` +
      `Please notify SDRF Uttarakhand (1070) or Police (112) immediately!`
    );
    return `https://wa.me/?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      
      {/* ── Main SOS Card ── */}
      <div className="relative w-full max-w-xl max-h-[94vh] flex flex-col rounded-3xl bg-[#080d0a] border border-rose-500/30 shadow-[0_0_50px_rgba(225,29,72,0.2)] overflow-hidden text-white">
        
        {/* Subtle top alert glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 animate-pulse" />

        {/* ── Modal Header ── */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400">
              <ShieldAlert size={20} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide bg-gradient-to-r from-rose-200 via-white to-red-200 bg-clip-text text-transparent uppercase">
                Mountain Emergency SOS
              </h2>
              <p className="text-[10px] sm:text-[11px] text-stone-400 flex items-center gap-2">
                <span className="text-rose-400 font-semibold">SDRF Uttarakhand Grid</span>
                <span>•</span>
                <span>Direct Satellite Link</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleSiren}
              title={isSirenPlaying ? "Stop Distress Siren" : "Sound Distress Siren"}
              className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                isSirenPlaying
                  ? 'bg-amber-500/30 border-amber-400 text-amber-200 animate-bounce'
                  : 'bg-white/5 border-white/10 text-stone-400 hover:text-amber-300'
              }`}
            >
              {isSirenPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
          
          {/* 1. Telemetry Bar (GPS + Battery + Network) */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
            {/* GPS Telemetry */}
            <div className="flex items-center gap-2 px-2 py-1">
              <MapPin size={14} className="text-rose-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-stone-400">GPS Live</div>
                <div className="font-mono text-[11px] font-bold text-stone-200 truncate">
                  {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
                </div>
              </div>
            </div>

            {/* Battery Level */}
            <div className="flex items-center gap-2 px-2 py-1 border-x border-white/10">
              {battery.isCharging ? (
                <BatteryCharging size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <Battery size={14} className={battery.level < 20 ? "text-rose-400 shrink-0" : "text-amber-400 shrink-0"} />
              )}
              <div className="min-w-0">
                <div className="text-[10px] text-stone-400">Battery</div>
                <div className="font-mono text-[11px] font-bold text-stone-200">
                  {battery.level}% {battery.isCharging && '⚡'}
                </div>
              </div>
            </div>

            {/* Network / Offline Queue status */}
            <div className="flex items-center gap-2 px-2 py-1">
              {isOnline ? (
                <Wifi size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <WifiOff size={14} className="text-amber-400 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-[10px] text-stone-400">Signal</div>
                <div className="text-[11px] font-bold text-stone-200 truncate">
                  {isOnline ? 'Online' : 'Offline Q'}
                </div>
              </div>
            </div>
          </div>

          {/* ── CASE A: Active Alert is LIVE ── */}
          {activeAlert && activeAlert.status !== 'RESOLVED' && activeAlert.status !== 'CANCELLED' ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                    </span>
                    <span className="font-bold text-rose-200 text-sm">
                      BEACON ACTIVE: {activeAlert.alertCode}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-mono font-bold">
                    {activeAlert.status}
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  Your coordinates have been dispatched to the Uttarakhand Disaster Response Force (SDRF) and local mountain sentinels.
                </p>

                {activeAlert.rescueDetails && (
                  <div className="pt-2 border-t border-rose-500/20 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400">Assigned Rescue Base:</span>
                      <div className="font-semibold text-rose-200 truncate">
                        {activeAlert.rescueDetails.assignedTeam}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400">Response Officer:</span>
                      <div className="font-semibold text-rose-200">
                        {activeAlert.rescueDetails.officerPhone || '1070 (SDRF)'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for Active Alert */}
              <div className="flex items-center gap-2">
                <a
                  href={generateWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-950/50"
                >
                  <Share2 size={15} />
                  <span>Share Location via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-300 hover:text-white font-bold text-xs transition-all active:scale-95 border border-white/10"
                >
                  Cancel SOS
                </button>
              </div>
            </div>
          ) : (
            /* ── CASE B: Trigger Mode (Hold to Trigger) ── */
            <div className="space-y-5">
              
              {/* Incident Category Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                  1. Select Emergency Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INCIDENT_TYPES.map((inc) => {
                    const Icon = inc.icon;
                    const isSelected = selectedIncident === inc.id;
                    return (
                      <button
                        key={inc.id}
                        type="button"
                        onClick={() => setSelectedIncident(inc.id)}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-950/60 border-rose-500 text-white shadow-md shadow-rose-950/50 ring-1 ring-rose-500/50'
                            : 'bg-white/[0.02] border-white/10 text-stone-400 hover:bg-white/[0.06] hover:text-stone-200'
                        }`}
                      >
                        <div className={`p-1.5 rounded-xl bg-gradient-to-tr ${inc.color} text-white shrink-0 shadow-sm`}>
                          <Icon size={14} />
                        </div>
                        <span className="truncate text-[11px]">{inc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. HOLD TO TRIGGER CIRCULAR BUTTON (Safe_Trail style) */}
              <div className="flex flex-col items-center justify-center py-3">
                <div className="relative flex items-center justify-center">
                  
                  {/* Outer Pulsing Aura */}
                  {holdProgress > 0 && (
                    <div
                      className="absolute inset-0 rounded-full bg-rose-600/30 blur-xl animate-pulse"
                      style={{ transform: `scale(${1 + holdProgress / 100})` }}
                    />
                  )}

                  {/* Circular SVG Progress Ring */}
                  <svg className="w-36 h-36 transform -rotate-90 pointer-events-none">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="#f43f5e"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={402}
                      strokeDashoffset={402 - (402 * holdProgress) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-75"
                    />
                  </svg>

                  {/* Main Hold Button */}
                  <button
                    type="button"
                    onPointerDown={() => startHold({ incidentType: selectedIncident, message: customNotes })}
                    onPointerUp={cancelHold}
                    onPointerLeave={cancelHold}
                    onContextMenu={(e) => e.preventDefault()}
                    disabled={isTriggering}
                    className={`absolute w-28 h-28 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-transform active:scale-95 touch-none cursor-pointer ${
                      holdProgress > 0
                        ? 'bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 scale-105'
                        : 'bg-gradient-to-tr from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-950/80'
                    }`}
                  >
                    <ShieldAlert size={28} className={holdProgress > 0 ? "animate-bounce" : ""} />
                    <span className="text-lg tracking-wider mt-0.5">SOS</span>
                    <span className="text-[9px] font-semibold text-rose-100 opacity-90">
                      {holdProgress > 0 ? `${holdProgress}%` : 'HOLD 2s'}
                    </span>
                  </button>
                </div>

                <p className="text-xs font-semibold text-stone-300 mt-4 text-center">
                  {holdProgress > 0 ? (
                    <span className="text-rose-400 font-bold animate-pulse">
                      Hold firm... broadcasting distress signal ({holdProgress}%)
                    </span>
                  ) : (
                    <span>Hold button for 2 seconds to prevent accidental dispatch</span>
                  )}
                </p>
              </div>

            </div>
          )}

          {/* 3. Direct Speed-Dial Emergency Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Official Mountain Helplines (Toll-Free)
              </label>
              <button
                type="button"
                onClick={() => setShowContactsManager(!showContactsManager)}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                {showContactsManager ? 'Hide Contacts' : 'Manage Contacts'}
              </button>
            </div>

            {/* Emergency Contacts Drawer */}
            {showContactsManager && (
              <div className="p-3.5 mb-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5 text-xs animate-fade-in">
                <div className="font-bold text-stone-200">Personal Emergency Contacts:</div>
                <div className="space-y-1.5">
                  {emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5">
                      <div>
                        <div className="font-semibold text-stone-200">{contact.name} ({contact.relation})</div>
                        <div className="text-[11px] text-stone-400 font-mono">{contact.phone || 'No phone set'}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(idx)}
                        className="p-1 rounded text-stone-500 hover:text-rose-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddContact}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Hotlines Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href="tel:1070"
                className="p-2.5 rounded-2xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 text-left space-y-0.5 transition-all group active:scale-95"
              >
                <div className="text-[10px] text-stone-400 font-semibold">SDRF Control</div>
                <div className="text-sm font-black text-rose-300 group-hover:text-white flex items-center gap-1">
                  <Phone size={11} className="text-rose-400" /> 1070
                </div>
              </a>

              <a
                href="tel:112"
                className="p-2.5 rounded-2xl bg-blue-950/30 hover:bg-blue-900/40 border border-blue-500/30 text-left space-y-0.5 transition-all group active:scale-95"
              >
                <div className="text-[10px] text-stone-400 font-semibold">National Police</div>
                <div className="text-sm font-black text-blue-300 group-hover:text-white flex items-center gap-1">
                  <Phone size={11} className="text-blue-400" /> 112
                </div>
              </a>

              <a
                href="tel:108"
                className="p-2.5 rounded-2xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-left space-y-0.5 transition-all group active:scale-95"
              >
                <div className="text-[10px] text-stone-400 font-semibold">Himalayan Med</div>
                <div className="text-sm font-black text-emerald-300 group-hover:text-white flex items-center gap-1">
                  <Phone size={11} className="text-emerald-400" /> 108
                </div>
              </a>

              <a
                href="tel:1090"
                className="p-2.5 rounded-2xl bg-pink-950/30 hover:bg-pink-900/40 border border-pink-500/30 text-left space-y-0.5 transition-all group active:scale-95"
              >
                <div className="text-[10px] text-stone-400 font-semibold">Women Safety</div>
                <div className="text-sm font-black text-pink-300 group-hover:text-white flex items-center gap-1">
                  <Phone size={11} className="text-pink-400" /> 1090
                </div>
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* ── Cancel Confirmation Modal ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90">
          <div className="w-full max-w-sm rounded-2xl bg-[#0d1410] border border-white/10 p-5 space-y-4 text-white">
            <h3 className="font-bold text-base text-rose-300">Cancel Emergency SOS?</h3>
            <p className="text-xs text-stone-300">
              Only cancel if you have reached safety or the situation is under control.
            </p>
            <input
              type="text"
              placeholder="Reason (e.g. Reached camp, False alarm)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  cancelSOS(cancelReason);
                  setShowCancelModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white"
              >
                Confirm Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-stone-300"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
