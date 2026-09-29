import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  Globe, 
  Save
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function SettingsTab({
  partnerProfile,
  onUpdateProfile
}) {
  const { logout } = useAuth();
  const [operatingHours, setOperatingHours] = useState(partnerProfile?.operatingHours || '08:00 AM - 08:00 PM');
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({ operatingHours });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="pb-3 border-b border-stone-200">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Partner Hub Settings &amp; Preferences
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Configure operational schedules, notification alerts, and account security.
        </p>
      </div>

      {isSaved && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* 1. Operational Settings */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Settings size={16} className="text-emerald-700" />
          <span>Business Operating Schedules</span>
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Standard Daily Operating Hours
          </label>
          <input
            type="text"
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
            placeholder="e.g. 08:00 AM - 09:00 PM"
            className="w-full max-w-md bg-stone-50 text-sm font-medium border border-stone-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#0f3d2e]"
          />
          <p className="text-[11px] text-stone-400 mt-1">
            Shown to travelers on your public profile and booking voucher.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Save size={13} />
          <span>Save Operating Hours</span>
        </button>
      </div>

      {/* 2. Notification Preferences */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell size={16} className="text-emerald-700" />
          <span>Instant Traveler Dispatch Alerts</span>
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-900">WhatsApp Booking Alerts</div>
              <div className="text-[11px] text-stone-500">Receive instant reservation pings on your WhatsApp number</div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-900">Daily Payout &amp; Settlement Digest</div>
              <div className="text-[11px] text-stone-500">Email summary of completed guest stays and transferred funds</div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>

      {/* 3. Account Actions */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sign Out of Partner Portal</h3>
          <p className="text-xs text-stone-500 mt-0.5">Safely end this session on this device.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to sign out of Discovery Uttarakhand Partner Hub?')) {
              logout();
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );
}
