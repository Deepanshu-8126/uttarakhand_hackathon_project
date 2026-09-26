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
  Heart,
  Navigation,
  CheckCircle2,
  Send
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
      }, 4000);
    }
  };

  const GITHUB_REPO_URL = 'https://github.com/Deepanshu-8126/uttarakhand_hackathon_project';

  return (
    <>
      {/* Inspirational Quote Section */}
      {isHome && (
        <section className="px-4 md:px-8 max-w-[1100px] mx-auto w-full mb-16 text-center relative mt-12">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-forest-green/10 text-9xl font-serif select-none pointer-events-none">
            "
          </div>
          <div className="relative z-10 bg-gradient-to-b from-forest-green/[0.03] to-transparent p-8 md:p-12 rounded-3xl border border-forest-green/10">
            <p className="text-2xl md:text-3xl lg:text-4xl text-forest-green font-bold leading-relaxed mb-6 font-serif italic">
              "Uttarakhand is not just a destination, it is a feeling you carry long after the mountains disappear from view."
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="w-10 h-px bg-earth-brown/40"></span>
              <span className="text-earth-brown font-extrabold tracking-widest uppercase text-xs sm:text-sm">
                Devbhoomi Uttarakhand • Land of the Gods
              </span>
              <span className="w-10 h-px bg-earth-brown/40"></span>
            </div>
          </div>
        </section>
      )}

      {/* Modern Professional Footer */}
      <footer className="bg-[#05130d] text-white pt-20 pb-10 px-4 sm:px-6 lg:px-8 rounded-t-[3rem] mt-auto border-t border-emerald-900/30 relative overflow-hidden">
        {/* Ambient background glow elements */}
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Top Newsletter / Trust Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-14 border-b border-emerald-900/40 items-center">
            <div className="lg:col-span-7 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
                <Sparkles size={13} className="text-emerald-400" />
                <span>Smart Devbhoomi Tourism Portal</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Plan Your Sacred & Adventure Journey Safely
              </h3>
              <p className="text-stone-400 text-sm max-w-xl leading-relaxed">
                Stay updated on high-altitude weather alerts, Char Dham slot availability, authentic homestays, and verified local trek guides.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md focus-within:border-emerald-500/60 transition-all">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email for travel updates..."
                    required
                    className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-stone-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#04120a] font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                  >
                    <span>Subscribe</span>
                    <Send size={13} />
                  </button>
                </div>
                {subscribed && (
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 pl-2 animate-fadeIn">
                    <CheckCircle2 size={13} /> Subscribed successfully! You'll receive genuine mountain updates.
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 py-16">
            
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Discover Uttarakhand Logo"
                  className="w-11 h-11 object-contain rounded-xl border border-emerald-500/30 bg-white/95 p-1 shadow-sm"
                />
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                    Discover Uttarakhand
                  </h2>
                  <p className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase mt-0.5">
                    Official Web3 & AI Tourism Portal
                  </p>
                </div>
              </div>

              <p className="text-stone-300 text-sm leading-relaxed max-w-sm">
                Empowering pilgrims and adventure seekers with verified homestays, licensed local guides, real-time AMS spatial telemetry, and trusted Web3 verification.
              </p>

              {/* Quick 24/7 Helpline Card */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 backdrop-blur-sm max-w-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      24/7 Tourism & Safety Support
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">Toll Free: 1364</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-stone-300 pt-1">
                  <span className="flex items-center gap-1.5">
                    <PhoneCall size={12} className="text-emerald-400" />
                    +91 135 2559898
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail size={12} className="text-emerald-400" />
                    support@discoveruttarakhand.in
                  </span>
                </div>
              </div>
            </div>
            
            {/* Column 1: Explore */}
            <div className="space-y-4">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2 text-emerald-400">
                <Compass size={14} />
                <span>Explore</span>
              </h3>
              <ul className="space-y-2.5 text-stone-300 font-medium text-sm">
                <li>
                  <Link to="/explore" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    Destinations
                  </Link>
                </li>
                <li>
                  <Link to="/stays" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    Mountain Stays
                  </Link>
                </li>
                <li>
                  <Link to="/rentals" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    4x4 &amp; Bike Rentals
                  </Link>
                </li>
                <li>
                  <Link to="/spiritual" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    Sacred Shrines &amp; Temples
                  </Link>
                </li>
                <li>
                  <Link to="/culture" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    Heritage &amp; Culture
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Safety & AI Tech */}
            <div className="space-y-4">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2 text-emerald-400">
                <ShieldCheck size={14} />
                <span>Safety &amp; Technology</span>
              </h3>
              <ul className="space-y-2.5 text-stone-300 font-medium text-sm">
                <li>
                  <Link to="/map" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    Spatial GIS Live Map
                  </Link>
                </li>
                <li>
                  <Link to="/copilot" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    AI Travel Voice Companion
                  </Link>
                </li>
                <li>
                  <Link to="/rescue-ops" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-rose-300 hover:text-rose-200">
                    <ArrowRight size={11} className="text-rose-500" />
                    Emergency Rescue &amp; SOS
                  </Link>
                </li>
                <li>
                  <Link to="/guides" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    Certified Mountain Guides
                  </Link>
                </li>
                <li>
                  <Link to="/innovations" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    Web3 Trust &amp; Verification
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Travel Planning & Legal */}
            <div className="space-y-4">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2 text-emerald-400">
                <Navigation size={14} />
                <span>Trip Planning</span>
              </h3>
              <ul className="space-y-2.5 text-stone-300 font-medium text-sm">
                <li>
                  <Link to="/trip-planner" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    AI Itinerary Generator
                  </Link>
                </li>
                <li>
                  <Link to="/activities" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    Adventure Activities
                  </Link>
                </li>
                <li>
                  <Link to="/partner/register" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ArrowRight size={11} className="text-stone-500" />
                    Register as Guide/Host
                  </Link>
                </li>
                <li>
                  <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-stone-400 text-xs pt-1"
                  >
                    <span>Developer Resources</span>
                    <ExternalLink size={11} />
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Badges */}
          <div className="border-t border-emerald-900/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400">
            <div className="flex items-center gap-2 flex-wrap text-center md:text-left">
              <p>© {new Date().getFullYear()} Discover Uttarakhand. All Rights Reserved.</p>
              <span className="hidden md:inline text-stone-600">•</span>
              <p className="text-stone-500 flex items-center gap-1">
                Crafted with <Heart size={11} className="text-rose-500 fill-rose-500 inline" /> for Uttarakhand Tourism
              </p>
            </div>

            <div className="flex items-center gap-6 text-stone-400">
              <Link to="/innovations" className="hover:text-white transition-colors">
                Privacy &amp; Security
              </Link>
              <Link to="/innovations" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <a 
                href={GITHUB_REPO_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors flex items-center gap-1 text-emerald-400 font-medium"
              >
                <span>GitHub</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;
