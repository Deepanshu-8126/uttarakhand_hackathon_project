import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  QrCode, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Compass, 
  CheckCircle2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function DownloadAppModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('download'); // 'download' | 'qr' | 'guide'

  if (!isOpen) return null;

  const RELEASE_APK_URL = 'https://github.com/Deepanshu-8126/uttarakhand_hackathon_project/releases/download/v1.0.4-apk/Discover-Uttarakhand-v1.0.4.apk';
  const DEBUG_APK_URL = 'https://github.com/Deepanshu-8126/uttarakhand_hackathon_project/releases/download/v1.0.4-apk/Discover-Uttarakhand-v1.0.4-Debug.apk';
  const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(RELEASE_APK_URL)}&bgcolor=06120b&color=34d399&margin=10`;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in select-none">
      
      {/* ── Ambient Glows ── */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Modal Card ── */}
      <div className="relative w-full max-w-lg rounded-3xl bg-[#06120b]/95 border border-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.2)] backdrop-blur-3xl p-5 sm:p-7 text-white overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-[1px] shadow-lg shadow-emerald-950/60 shrink-0">
              <div className="w-full h-full bg-[#040e09] rounded-[15px] flex items-center justify-center">
                <Smartphone size={22} className="text-emerald-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Download Android APK
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold">
                  v1.0.4
                </span>
              </div>
              <p className="text-xs text-stone-400">Discovery Uttarakhand Mobile App</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-400 hover:text-white transition-colors border border-white/10 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-white/[0.03] p-1 border border-white/[0.06] my-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'download'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Download size={13} />
            <span>Direct APK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <QrCode size={13} />
            <span>Scan QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={13} />
            <span>Install Steps</span>
          </button>
        </div>

        {/* Tab 1: Direct Download */}
        {activeTab === 'download' && (
          <div className="space-y-4 animate-fade-in">
            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2">
                <Radio size={14} className="text-rose-400 shrink-0" />
                <span className="text-stone-300 font-medium truncate">Offline SOS & SDRF Mesh</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2">
                <Compass size={14} className="text-emerald-400 shrink-0" />
                <span className="text-stone-300 font-medium truncate">3D Relief GIS Radar</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2">
                <Sparkles size={14} className="text-teal-400 shrink-0" />
                <span className="text-stone-300 font-medium truncate">Gemini Live Voice AI</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2">
                <Zap size={14} className="text-amber-400 shrink-0" />
                <span className="text-stone-300 font-medium truncate">Escrow QR Pass Vault</span>
              </div>
            </div>

            {/* Primary Release APK Button */}
            <a
              href={RELEASE_APK_URL}
              download="Discover-Uttarakhand-v1.0.4.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/80 hover:brightness-110 active:scale-98 transition-all border border-emerald-300/30 cursor-pointer"
            >
              <Download size={18} />
              <span>Download Release APK (High Speed)</span>
            </a>

            {/* Secondary Debug APK Button */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-stone-400">Testing on older phone?</span>
              <a
                href={DEBUG_APK_URL}
                download="Discover-Uttarakhand-v1.0.4-Debug.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Download Debug APK</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {/* Tab 2: Scan QR Code */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-2 animate-fade-in">
            <div className="p-3 rounded-2xl bg-[#040e09] border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/80">
              <img
                src={QR_CODE_URL}
                alt="Scan to Download APK"
                className="w-44 h-44 rounded-xl"
              />
            </div>
            <p className="text-xs text-stone-300 max-w-xs leading-relaxed">
              Scan this QR code with your phone camera or Google Lens to instantly download and install the APK.
            </p>
          </div>
        )}

        {/* Tab 3: Installation Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-3 text-xs leading-relaxed animate-fade-in">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-emerald-200">Tap Download APK</strong>
                <p className="text-stone-400 text-[11px]">Save the file <code className="text-emerald-300">Discover-Uttarakhand-v1.0.4.apk</code> to your device.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-emerald-200">Allow Installation</strong>
                <p className="text-stone-400 text-[11px]">If Android prompts "File might be harmful", tap <strong>Download anyway</strong> / <strong>Allow from this source</strong>.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-emerald-200">Open &amp; Explore Devbhoomi</strong>
                <p className="text-stone-400 text-[11px]">Tap <strong>Install</strong> and launch the Discovery Uttarakhand app!</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
