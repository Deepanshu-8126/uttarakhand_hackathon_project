import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Smartphone, Download, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import DownloadAppModal from './common/DownloadAppModal';

const Footer = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const RELEASE_APK_URL = 'https://github.com/Deepanshu-8126/uttarakhand_hackathon_project/releases/download/v1.0.4-apk/Discover-Uttarakhand-v1.0.4.apk';
  const GITHUB_RELEASES_URL = 'https://github.com/Deepanshu-8126/uttarakhand_hackathon_project/releases';

  return (
    <>
      {/* Inspirational Quote Section */}
      {isHome && (
        <section className="px-4 md:px-8 max-w-[1000px] mx-auto w-full mb-16 text-center relative mt-8">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-forest-green/10 text-9xl font-serif select-none pointer-events-none">
            "
          </div>
          <div className="relative z-10">
            <p className="text-2xl md:text-3xl lg:text-4xl text-forest-green font-bold leading-relaxed mb-6 font-serif italic">
              "Uttarakhand is not just a destination, it is a feeling you carry long after the mountains disappear from view."
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-earth-brown"></span>
              <span className="text-earth-brown font-bold tracking-widest uppercase text-sm">Discover Uttarakhand</span>
              <span className="w-8 h-px bg-earth-brown"></span>
            </div>
          </div>
        </section>
      )}

      {/* Actual Footer */}
      <footer className="bg-[#061810] text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 rounded-t-[3rem] mt-auto border-t border-emerald-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8 mb-16">
            
            {/* Brand Col */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/logo.png"
                  alt="Discovery Uttarakhand"
                  className="w-10 h-10 object-contain rounded-xl border border-emerald-500/30 bg-white p-0.5"
                />
                <h2 className="text-2xl font-black text-white tracking-tight">Discover Uttarakhand</h2>
              </div>

              <p className="text-white/80 font-medium leading-relaxed max-w-sm text-sm mb-5">
                Uttarakhand's official Web3 &amp; AI tourism platform. Sacred shrines, verified stays, mountain bike rentals &amp; real-time AMS safeguards.
              </p>

              {/* Prominent GitHub Android APK Download Banner */}
              <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 backdrop-blur-md max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Smartphone size={18} className="text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Android App (v1.0.4)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    GitHub Release
                  </span>
                </div>

                <p className="text-[11px] text-stone-300 mb-3 leading-snug">
                  Experience full offline maps, emergency SOS panic button &amp; mountain guides on your phone.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={RELEASE_APK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#040e09] font-extrabold text-xs transition shadow-sm cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download APK (Direct)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowDownloadModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer border border-white/10"
                  >
                    <span>Scan QR</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm opacity-90">Explore</h3>
              <div className="flex flex-col gap-3 text-white/80 font-medium text-sm">
                <Link to="/explore" className="hover:text-emerald-400 transition-colors w-fit">Destinations</Link>
                <Link to="/stays" className="hover:text-emerald-400 transition-colors w-fit">Mountain Stays</Link>
                <Link to="/rentals" className="hover:text-emerald-400 transition-colors w-fit">4x4 Bike Rentals</Link>
                <Link to="/copilot" className="hover:text-emerald-400 transition-colors w-fit">AI Voice Companion</Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm opacity-90">Safety &amp; Tech</h3>
              <div className="flex flex-col gap-3 text-white/80 font-medium text-sm">
                <Link to="/map" className="hover:text-emerald-400 transition-colors w-fit">Spatial GIS Map</Link>
                <Link to="/rescue-ops" className="hover:text-emerald-400 transition-colors w-fit">🚨 Rescue Ops &amp; SOS</Link>
                <Link to="/guide" className="hover:text-emerald-400 transition-colors w-fit">🏔️ Guide Portal</Link>
                <Link to="/innovations" className="hover:text-emerald-400 transition-colors w-fit">🛡️ Web3 Verification</Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm opacity-90">Plan &amp; Downloads</h3>
              <div className="flex flex-col gap-3 text-white/80 font-medium text-sm">
                <Link to="/trip-planner" className="hover:text-emerald-400 transition-colors w-fit">Trip Planner</Link>
                <a
                  href={RELEASE_APK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 text-emerald-300 font-bold"
                >
                  <Download size={13} />
                  <span>Download APK</span>
                </a>
                <a
                  href={GITHUB_RELEASES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 text-stone-400 text-xs"
                >
                  <ExternalLink size={12} />
                  <span>GitHub Releases</span>
                </a>
              </div>
            </div>

          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60 font-medium">
            <p>© 2026 Discover Uttarakhand. Built for Uttarakhand Hackathon.</p>
            <div className="flex items-center gap-6">
              <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1 text-xs">
                <span>GitHub Repository</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Download App Modal */}
      <DownloadAppModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </>
  );
};

export default Footer;
