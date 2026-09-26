import React from 'react';
import { X, Smartphone, Download, ExternalLink, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function DownloadAppModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const RELEASE_APK_URL = 'https://github.com/Deepanshu-8126/uttarakhand_hackathon_project/releases/download/v1.0.4-apk/Discover-Uttarakhand-v1.0.4.apk';
  const GITHUB_RELEASES_URL = 'https://github.com/Deepanshu-8126/uttarakhand_hackathon_project/releases';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#06140c] border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-950/80 p-6 sm:p-8 text-white z-10 space-y-6 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none -mr-20 -mt-20" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] shadow-lg shadow-emerald-950/60">
              <div className="w-full h-full bg-[#040e09] rounded-[15px] flex items-center justify-center">
                <Smartphone size={20} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Download Android App
              </h3>
              <p className="text-xs text-emerald-400/90 font-medium">
                Official Discovery Uttarakhand APK
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Release Pill Badge */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs">
          <div className="space-y-0.5">
            <div className="text-stone-300 font-medium">Release Version</div>
            <div className="font-mono text-emerald-300 font-bold">v1.0.4-apk (Universal)</div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            Verified Build
          </span>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2 text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>Offline Mountain Maps &amp; GPS Elevation tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>One-tap Emergency SOS with offline SMS fallback</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>Real-time Devbhoomi Live AI Voice Copilot</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <a
            href={RELEASE_APK_URL}
            download
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 border border-emerald-400/30 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download size={16} />
            <span>Download APK Directly (v1.0.4)</span>
          </a>

          <a
            href={GITHUB_RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>View All GitHub Releases &amp; Source</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Installation Tip */}
        <p className="text-[11px] text-stone-400 text-center leading-relaxed">
          Downloaded as an APK. If prompted by Android, tap <em>"Allow from this source"</em> to install.
        </p>
      </div>
    </div>
  );
}
