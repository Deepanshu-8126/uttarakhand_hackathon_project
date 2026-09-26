import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Compass, 
  ShieldCheck, 
  MapPin, 
  PhoneCall, 
  Mail, 
  ExternalLink, 
  Sparkles, 
  ArrowRight,
  Mountain,
  Navigation,
  CheckCircle2,
  Send,
  Bed,
  Car,
  AlertTriangle
} from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
        setSubscribed(false);
      }, 3500);
    }
  };

  const GITHUB_REPO_URL = 'https://github.com/Deepanshu-8126/uttarakhand_hackathon_project';

  return (
    <>
      {/* Inspirational Quote Section (Clean, Disciplined, Alpine) */}
      {isHome && (
        <section className="px-4 sm:px-6 max-w-5xl mx-auto w-full mb-10 text-center relative mt-6">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-7 shadow-xs">
            <p className="text-lg sm:text-xl md:text-2xl text-[#0f3d2e] font-serif font-bold italic leading-snug mb-3">
              "Uttarakhand is not just a destination, it is a feeling you carry long after the mountains disappear from view."
            </p>
            <div className="flex items-center justify-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider">
              <span className="w-6 h-px bg-stone-200 shrink-0"></span>
              <span>Devbhoomi Uttarakhand</span>
              <span className="w-6 h-px bg-stone-200 shrink-0"></span>
            </div>
          </div>
        </section>
      )}

      {/* Clean Alpine Light Footer */}
      <footer className="bg-[#fdfbf7] text-slate-900 pt-12 pb-8 px-4 sm:px-6 lg:px-8 border-t border-stone-200/80 mt-auto">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Newsletter & Assistance Banner */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-xs mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              
              <div className="lg:col-span-7 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 whitespace-nowrap inline-flex items-center gap-1 shrink-0">
                    <Sparkles size={11} className="text-emerald-700 shrink-0" />
                    <span>Live Tourism & High-Altitude Safety</span>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Stay updated on Char Dham passes, weather alerts & verified stays
                </h3>
                <p className="text-xs text-stone-500 max-w-xl leading-normal">
                  Get real-time mountain updates, verified homestays, and certified guide availability directly.
                </p>
              </div>

              <div className="lg:col-span-5">
                <form onSubmit={handleSubscribe} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-50 border border-stone-200 focus-within:border-emerald-600 focus-within:bg-white transition-all">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email for travel updates..."
                      required
                      className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 placeholder-stone-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0f3d2e] hover:bg-[#185340] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                    >
                      <span>Subscribe</span>
                      <Send size={12} className="shrink-0" />
                    </button>
                  </div>
                  {subscribed && (
                    <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 pl-1">
                      <CheckCircle2 size={12} className="shrink-0 text-emerald-600" /> Subscribed successfully to official alerts.
                    </p>
                  )}
                </form>
              </div>

            </div>
          </div>

          {/* Main Footer Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 pb-10">
            
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-3.5">
              <Link to="/" className="inline-flex items-center gap-2.5 shrink-0">
                <img
                  src="/logo.png"
                  alt="Discovery Uttarakhand"
                  className="w-9 h-9 object-contain rounded-xl border border-stone-200 bg-white p-1 shadow-2xs shrink-0"
                />
                <div className="shrink-0">
                  <span className="text-base font-black text-[#0f3d2e] tracking-tight block leading-none">
                    Discovery Uttarakhand
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mt-0.5">
                    Official Web3 & AI Tourism Platform
                  </span>
                </div>
              </Link>

              <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
                Empowering travellers and pilgrims with verified mountain homestays, licensed local guides, real-time AMS telemetry, and Web3 cryptographic verification.
              </p>

              {/* 24/7 Helpline & Support */}
              <div className="bg-white rounded-xl border border-stone-200/80 p-3 shadow-xs space-y-1.5 max-w-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#0f3d2e] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    24/7 State Tourism Helpline
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-mono font-bold text-stone-700">
                    Toll-Free: 1364
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pt-0.5">
                  <span className="flex items-center gap-1 font-medium">
                    <PhoneCall size={12} className="text-[#0f3d2e] shrink-0" />
                    +91 135 2559898
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Mail size={12} className="text-[#0f3d2e] shrink-0" />
                    support@discoveruttarakhand.in
                  </span>
                </div>
              </div>
            </div>
            
            {/* Column 1: Explore */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={13} className="text-[#0f3d2e] shrink-0" />
                <span>Explore</span>
              </h4>
              <ul className="space-y-2 text-xs font-medium text-stone-600">
                <li>
                  <Link to="/explore" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    Destinations & Shrines
                  </Link>
                </li>
                <li>
                  <Link to="/stays" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    Verified Mountain Stays
                  </Link>
                </li>
                <li>
                  <Link to="/rentals" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    4x4 & Bike Rentals
                  </Link>
                </li>
                <li>
                  <Link to="/spiritual" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    Char Dham & Spiritual
                  </Link>
                </li>
                <li>
                  <Link to="/culture" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    Heritage & Local Culture
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Safety & AI Tech */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#0f3d2e] shrink-0" />
                <span>Safety & AI Tech</span>
              </h4>
              <ul className="space-y-2 text-xs font-medium text-stone-600">
                <li>
                  <Link to="/map" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    Spatial GIS Live Map
                  </Link>
                </li>
                <li>
                  <Link to="/copilot" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    AI Travel Companion
                  </Link>
                </li>
                <li>
                  <Link to="/rescue-ops" className="hover:text-rose-700 text-rose-700 transition-colors flex items-center gap-1.5 font-semibold">
                    <AlertTriangle size={11} className="shrink-0 text-rose-600" />
                    Rescue Ops & SOS
                  </Link>
                </li>
                <li>
                  <Link to="/guides" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    Certified Mountain Guides
                  </Link>
                </li>
                <li>
                  <Link to="/innovations" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    Web3 Trust & Proofs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Trip Planning */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation size={13} className="text-[#0f3d2e] shrink-0" />
                <span>Trip Planning</span>
              </h4>
              <ul className="space-y-2 text-xs font-medium text-stone-600">
                <li>
                  <Link to="/trip-planner" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    AI Itinerary Planner
                  </Link>
                </li>
                <li>
                  <Link to="/activities" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    Adventure Activities
                  </Link>
                </li>
                <li>
                  <Link to="/partner/register" className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-stone-400 shrink-0" />
                    Register as Guide / Host
                  </Link>
                </li>
                <li>
                  <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1 text-stone-500 text-xs pt-0.5"
                  >
                    <span>Developer Resources</span>
                    <ExternalLink size={10} className="shrink-0" />
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Terms */}
          <div className="border-t border-stone-200/80 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-500">
            <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
              <p>© {new Date().getFullYear()} Discover Uttarakhand. All Rights Reserved.</p>
              <span className="hidden sm:inline text-stone-300">•</span>
              <p className="text-stone-400">
                Built for Devbhoomi Tourism &amp; High-Altitude Safety
              </p>
            </div>

            <div className="flex items-center gap-5 text-stone-500">
              <Link to="/innovations" className="hover:text-[#0f3d2e] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/innovations" className="hover:text-[#0f3d2e] transition-colors">
                Terms of Service
              </Link>
              <a 
                href={GITHUB_REPO_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#0f3d2e] transition-colors flex items-center gap-1 font-semibold text-[#0f3d2e]"
              >
                <span>GitHub</span>
                <ExternalLink size={10} className="shrink-0" />
              </a>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;
