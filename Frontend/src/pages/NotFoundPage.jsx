import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain, Compass, MapPin, Sparkles, Home, ArrowLeft, ShieldAlert } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#040d08] text-stone-100 flex flex-col font-sans selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1 flex items-center justify-center relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 overflow-hidden">
        {/* Ambient Himalayan Emerald Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-950/30 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl w-full text-center space-y-8 backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] p-8 sm:p-12 rounded-3xl shadow-2xl shadow-black/80">
          
          {/* Mountain Icon Beacon */}
          <div className="inline-flex items-center justify-center relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-950 via-[#0f3d2e] to-stone-900 border border-emerald-500/30 flex items-center justify-center shadow-xl shadow-emerald-950/60">
              <Mountain size={42} className="text-emerald-400 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#040d08]" />
            </span>
          </div>

          {/* Error Code & Headings */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-xs font-mono font-bold uppercase tracking-widest">
              <span>Trail Error 404</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              Lost in the Himalayas?
            </h1>
            <p className="text-sm sm:text-base text-stone-300/90 max-w-lg mx-auto leading-relaxed">
              This high-altitude pass doesn't exist or has moved. Don't worry—the mountain corridors are safe. Let's guide you back to familiar terrain.
            </p>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link
              to="/"
              className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-emerald-950/50 border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 flex flex-col items-center gap-2 text-center cursor-pointer shadow-md hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 group-hover:bg-emerald-500/25 text-emerald-400 flex items-center justify-center transition-colors">
                <Home size={18} />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Home Valley
              </div>
              <div className="text-[11px] text-stone-400 leading-tight">
                Return to the main overview
              </div>
            </Link>

            <Link
              to="/explore"
              className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-emerald-950/50 border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 flex flex-col items-center gap-2 text-center cursor-pointer shadow-md hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 group-hover:bg-emerald-500/25 text-emerald-400 flex items-center justify-center transition-colors">
                <Compass size={18} />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Explore Places
              </div>
              <div className="text-[11px] text-stone-400 leading-tight">
                Discover mountain destinations
              </div>
            </Link>

            <Link
              to="/map"
              className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-emerald-950/50 border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 flex flex-col items-center gap-2 text-center cursor-pointer shadow-md hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 group-hover:bg-emerald-500/25 text-emerald-400 flex items-center justify-center transition-colors">
                <MapPin size={18} />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Interactive Map
              </div>
              <div className="text-[11px] text-stone-400 leading-tight">
                Live radar and routes
              </div>
            </Link>
          </div>

          {/* Bottom Primary Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Go Back</span>
            </button>

            <Link
              to="/copilot"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:brightness-110 text-white shadow-lg shadow-emerald-950/60 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-emerald-400/30"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span>Ask AI Copilot for Directions</span>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
