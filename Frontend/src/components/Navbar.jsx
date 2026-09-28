import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Menu, 
  X, 
  LogOut,
  Briefcase,
  ShieldCheck,
  Compass,
  ChevronDown,
  Sparkles,
  Bed,
  Car,
  Map,
  Languages,
  MapPin,
  Route,
  Mountain,
  ArrowRight,
  Globe,
  Landmark,
  Footprints,
  HeartHandshake,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMapStore } from '../store/mapStore';
import { useLanguage } from '../context/LanguageContext';
import GlobalLocationModal from './GlobalLocationModal';
import { getStoredUserLocation } from '../utils/geoHelpers';
import TopNavWeatherBadge from './widgets/TopNavWeatherBadge';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const activeTripSession = useMapStore((state) => state.activeTripSession);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(getStoredUserLocation());
  const [showLocationModal, setShowLocationModal] = useState(false);

  const userRef = useRef(null);

  // Sync global location updates
  useEffect(() => {
    const handleLocationUpdate = (e) => {
      if (e.detail) {
        setUserLocation(e.detail);
      }
    };
    window.addEventListener('discovery_location_updated', handleLocationUpdate);
    return () => window.removeEventListener('discovery_location_updated', handleLocationUpdate);
  }, []);

  // Auto-hide Navbar on auth / dedicated full dashboard pages
  const hiddenRoutes = ['/login', '/register', '/admin', '/partner'];
  const isHidden = hiddenRoutes.some(path => location.pathname.startsWith(path));

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile overlay on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (isHidden) {
    return null;
  }

  // Active trip details for progress badge
  const activeTripDestination = (isAuthenticated && activeTripSession)
    ? (activeTripSession?.destination?.name || activeTripSession?.destination || null)
    : null;
  const activeTripDuration = activeTripSession?.duration || (activeTripSession?.dayPlans?.length ? `${activeTripSession.dayPlans.length} Days` : null);
  const activeTripUrl = activeTripSession?._id || activeTripSession?.tripId 
    ? `/my-trip/${activeTripSession._id || activeTripSession.tripId}` 
    : '/my-trip';

  const navLinks = [
    { label: 'Explore', path: '/explore', icon: Compass, isExplore: true },
    { label: 'Trip Planner', path: '/trip-planner', icon: Route },
    { label: 'Stays & Hotels', path: '/stays', icon: Bed },
    { label: 'Rentals', path: '/rentals', icon: Car },
    { label: 'Map', path: '/map', icon: Map },
    { label: 'Web3 & Tech', path: '/innovations', icon: ShieldCheck, badge: 'Web3' },
  ];

  const handleNavClick = (link, e) => {
    if (link.isExplore) {
      if (e) e.preventDefault();
      setMobileMenuOpen(false);
      if (location.pathname === '/' || location.pathname === '/explore') {
        const el = document.getElementById('explore');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          navigate('/explore');
        }
      } else {
        navigate('/explore');
      }
      return;
    }
    setMobileMenuOpen(false);
  };

  const isDark = false;

  return (
    <>
      <header className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-300 ${
        isDark 
          ? 'bg-[#040e09]/95 border-b border-white/[0.08] shadow-md text-white' 
          : 'bg-white/95 border-b border-stone-200/90 shadow-sm text-stone-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20 gap-3">

            {/* ── 1. Logo - NEVER squish ─────────────────────────────────── */}
            <Link to="/" className="shrink-0 flex items-center gap-2.5 sm:gap-3 group">
              <img
                src="/logo.png"
                alt="Discovery Uttarakhand"
                className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 object-contain rounded-2xl shadow-xs group-hover:scale-105 transition-transform duration-300 shrink-0 ${
                  isDark ? 'border border-emerald-500/30 bg-[#06140c]' : 'border border-emerald-900/15 bg-white'
                }`}
              />
              <div className="shrink-0">
                <span className={`text-base sm:text-lg lg:text-xl font-black tracking-tight block leading-none whitespace-nowrap ${
                  isDark ? 'text-white' : 'text-[#0f3d2e]'
                }`}>
                  Discovery
                </span>
                <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase block whitespace-nowrap mt-0.5 ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}>
                  Uttarakhand
                </span>
              </div>
            </Link>

            {/* ── 2. Tablet Navigation (768px - 1024px): Max 3 items ─────── */}
            <div className="hidden md:flex lg:hidden items-center gap-1.5">
              {navLinks.slice(0, 3).map((link) => {
                const Icon = link.icon;
                const isCurrent = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={(e) => handleNavClick(link, e)}
                    className={`whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                      isCurrent 
                        ? (isDark ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-[#0f3d2e]') 
                        : (isDark ? 'text-stone-300 hover:text-white' : 'text-stone-700 hover:text-[#0f3d2e]')
                    }`}
                  >
                    <Icon size={12} className={isDark ? "text-emerald-400 shrink-0" : "text-emerald-700 shrink-0"} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* ── 3. Desktop Navigation Links (> 1024px): All items row ─── */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-5">
              <nav className={`flex items-center gap-0.5 p-1 rounded-full backdrop-blur-md transition-colors ${
                isDark 
                  ? 'bg-white/[0.04] border border-white/10' 
                  : 'bg-stone-100/80 border border-stone-200/70'
              }`}>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isCurrent = link.path === '/' 
                    ? location.pathname === '/' 
                    : link.isExplore
                      ? location.pathname === '/explore' || location.hash === '#explore'
                      : location.pathname.startsWith(link.path);

                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={(e) => handleNavClick(link, e)}
                      className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight transition-all duration-200 ${
                        isCurrent 
                          ? (isDark ? 'bg-emerald-950/80 text-emerald-300 shadow-xs border border-emerald-500/40' : 'bg-white text-[#0f3d2e] shadow-xs border border-emerald-900/10') 
                          : (isDark ? 'text-stone-300 hover:text-white hover:bg-white/[0.06]' : 'text-stone-600 hover:text-[#0f3d2e] hover:bg-white/70')
                      }`}
                    >
                      <Icon size={12} className={isCurrent ? (isDark ? 'text-emerald-400 shrink-0' : 'text-emerald-700 shrink-0') : 'text-stone-400 shrink-0'} />
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full shadow-2xs shrink-0 ${
                          isDark 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                            : 'bg-emerald-100 text-[#0f3d2e] border border-emerald-300/80'
                        }`}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Weather + Location Pill */}
              <div className="flex items-center gap-1.5 shrink-0">
                <TopNavWeatherBadge isDark={isDark} />

                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
                    isDark 
                      ? 'border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-stone-200' 
                      : 'border border-stone-200 bg-white hover:bg-emerald-50 text-stone-800'
                  }`}
                  title="Change location"
                >
                  <MapPin size={11} className={isDark ? "text-emerald-400 shrink-0" : "text-emerald-800 shrink-0"} />
                  <span className={`whitespace-nowrap max-w-[85px] truncate ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                    {userLocation?.city || 'Location'}
                  </span>
                </button>
              </div>
            </div>

            {/* ── 4. Right Controls: Auth Profile + Plan Trip CTA + Hamburger Button ── */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
                  isDark 
                    ? 'border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-stone-200' 
                    : 'border border-stone-200 bg-stone-50 hover:bg-emerald-50 text-stone-700'
                }`}
                title={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
              >
                <Languages size={13} className={isDark ? "text-emerald-400 shrink-0" : "text-emerald-700 shrink-0"} />
                <span className="whitespace-nowrap">{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
              </button>

              {/* User Profile / Sign In */}
              <div className="relative shrink-0" ref={userRef}>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-1.5 p-1 rounded-full transition cursor-pointer shadow-2xs ${
                      isDark ? 'border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]' : 'border border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                    aria-label="User Menu"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {currentUser?.name ? currentUser.name[0].toUpperCase() : <User size={13} />}
                    </div>
                    <ChevronDown size={13} className="text-stone-400 pr-1 hidden sm:block shrink-0" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className={`whitespace-nowrap inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 ${
                      isDark 
                        ? 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-stone-200' 
                        : 'bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800'
                    }`}
                  >
                    <User size={13} className={isDark ? "text-emerald-400 shrink-0" : "text-[#0f3d2e] shrink-0"} />
                    <span>{t('nav_signin') || 'Sign In'}</span>
                  </button>
                )}

                {/* User Dropdown */}
                {userDropdownOpen && isAuthenticated && (
                  <div className={`absolute top-11 right-0 w-52 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                    isDark ? 'bg-[#06140c] border border-emerald-500/30 text-white shadow-emerald-950/80' : 'bg-white border border-stone-200'
                  }`}>
                    <div className={`px-3 py-2 border-b ${isDark ? 'border-white/10' : 'border-stone-100'}`}>
                      <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentUser?.name}</div>
                      <div className={`text-[10px] truncate ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{currentUser?.email}</div>
                    </div>

                    <div className="py-1 space-y-0.5 text-xs font-medium">
                      {currentUser?.role === 'partner' ? (
                        <Link
                          to="/partner"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold ${
                            isDark ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300' : 'bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e]'
                          }`}
                        >
                          <Briefcase size={14} className={isDark ? "text-emerald-400" : "text-emerald-700"} />
                          <span className="whitespace-nowrap">Partner Hub</span>
                        </Link>
                      ) : currentUser?.role === 'admin' ? (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold ${
                            isDark ? 'hover:bg-white/[0.06] text-emerald-300' : 'hover:bg-slate-50 text-[#0f3d2e]'
                          }`}
                        >
                          <ShieldCheck size={14} className="shrink-0" />
                          <span className="whitespace-nowrap">Admin Dashboard</span>
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/my-trip"
                            onClick={() => setUserDropdownOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold ${
                              isDark ? 'hover:bg-white/[0.06] text-emerald-300' : 'hover:bg-slate-50 text-emerald-800'
                            }`}
                          >
                            <Compass size={14} className="shrink-0" />
                            <span className="whitespace-nowrap">My Trips &amp; SOS</span>
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold ${
                              isDark ? 'hover:bg-white/[0.06] text-stone-300' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <User size={14} className={isDark ? "text-stone-400" : "text-slate-400"} />
                            <span className="whitespace-nowrap">{t('nav_profile') || 'Profile'}</span>
                          </Link>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold cursor-pointer ${
                          isDark ? 'hover:bg-rose-950/40 text-rose-400' : 'hover:bg-red-50 text-red-600'
                        }`}
                      >
                        <LogOut size={14} className="shrink-0" />
                        <span className="whitespace-nowrap">{t('nav_signout') || 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Plan Trip CTA (> 1024px) */}
              <div className="hidden lg:block">
                <Link
                  to="/trip-planner"
                  className={`whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
                    isDark 
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:brightness-110 shadow-md shadow-emerald-950/60 border border-emerald-400/30' 
                      : 'bg-[#0f3d2e] hover:bg-[#185340] shadow-xs hover:shadow-md'
                  }`}
                >
                  <Sparkles size={13} className={isDark ? "text-amber-300" : "text-emerald-300"} />
                  <span>{t('nav_plantrip') || 'Plan Trip'}</span>
                </Link>
              </div>

              {/* Hamburger Toggle Button (mobile & tablet < 1024px) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-lg transition cursor-pointer shrink-0 ${
                  isDark ? 'hover:bg-white/[0.06] text-stone-200' : 'hover:bg-stone-100 text-stone-700'
                }`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* ── 5. Luxury Himalayan Alpine Mobile & Tablet Navigation Drawer (< 1024px) ── */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm lg:hidden flex justify-end animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-full sm:max-w-md h-[100dvh] bg-[#fdfbf7] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 border-l border-stone-200/80"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Drawer Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-stone-200 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Discovery Uttarakhand"
                  className="w-9 h-9 object-contain rounded-xl shadow-xs border border-emerald-900/10 bg-white"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base text-[#0f3d2e] leading-tight">Discovery Uttarakhand</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="text-[11px] font-semibold text-stone-500 block">AI &amp; Web3 Himalayan Portal</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-emerald-50 border border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-1 transition cursor-pointer"
                  title="Toggle Language"
                >
                  <Globe size={13} className="text-emerald-700" />
                  <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* 2. Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-copilot-scrollbar">
              
              {/* Active Trip Banner if available */}
              {activeTripDestination && (
                <Link
                  to={activeTripUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0f3d2e] to-stone-900 text-white border border-emerald-500/30 shadow-sm group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Trip in Progress
                    </span>
                    <span className="text-xs text-emerald-300 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Resume <ArrowRight size={12} />
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-white truncate">
                    {activeTripDestination} {activeTripDuration ? `• ${activeTripDuration}` : ''}
                  </div>
                </Link>
              )}

              {/* Quick 2x2 Feature Grid */}
              <div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-1">
                  MAIN DISCOVERY
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/explore"
                    onClick={(e) => handleNavClick({ label: 'Explore', path: '/explore', isExplore: true }, e)}
                    className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col gap-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0f3d2e] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Compass size={18} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900 leading-tight">Explore</div>
                      <div className="text-[10px] text-stone-500 font-medium">106+ Curated Places</div>
                    </div>
                  </Link>

                  <Link
                    to="/map"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:border-blue-500/50 transition-all flex flex-col gap-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Map size={18} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900 leading-tight">Live Map</div>
                      <div className="text-[10px] text-stone-500 font-medium">3D GPS &amp; Corridors</div>
                    </div>
                  </Link>

                  <Link
                    to="/stays"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:border-amber-500/50 transition-all flex flex-col gap-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Bed size={18} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900 leading-tight">Stays &amp; KMVN</div>
                      <div className="text-[10px] text-stone-500 font-medium">Verified Homestays</div>
                    </div>
                  </Link>

                  <Link
                    to="/rentals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:border-purple-500/50 transition-all flex flex-col gap-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Car size={18} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900 leading-tight">Bike &amp; Cabs</div>
                      <div className="text-[10px] text-stone-500 font-medium">Himalayan Fleet</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Exploration Hubs List */}
              <div className="space-y-1.5 bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-1">
                  THEMATIC CIRCUITS
                </div>

                <Link
                  to="/trip-planner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 transition text-stone-800 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Route size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900">AI Trip Planner</div>
                      <div className="text-[10px] text-stone-500">Auto-generate day-by-day itineraries</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Smart AI
                  </span>
                </Link>

                <Link
                  to="/spiritual"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 transition text-stone-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                      <Landmark size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900">Spiritual Yatras</div>
                      <div className="text-[10px] text-stone-500">Char Dham, Panch Kedar &amp; Hemkund</div>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/culture"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 transition text-stone-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                      <HeartHandshake size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900">Culture &amp; Heritage</div>
                      <div className="text-[10px] text-stone-500">Folk festivals, Pahadi cuisine &amp; art</div>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/activities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 transition text-stone-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                      <Footprints size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900">Treks &amp; Adventure</div>
                      <div className="text-[10px] text-stone-500">High passes, rafting &amp; camping</div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Critical Safety & Web3 Section */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/rescue-ops"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-rose-50/80 border border-rose-200/90 rounded-2xl flex flex-col gap-1 shadow-xs hover:border-rose-400 transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                      <PhoneCall size={14} />
                    </div>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <div className="font-extrabold text-xs text-rose-900 mt-1">🚨 Rescue Ops &amp; SOS</div>
                  <div className="text-[10px] text-rose-700 font-medium">SDRF Emergency Grid</div>
                </Link>

                <Link
                  to="/innovations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex flex-col gap-1 shadow-xs hover:border-emerald-400 transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <ShieldCheck size={14} />
                    </div>
                    <span className="text-[9px] font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded-full border border-emerald-200">
                      Web3
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-emerald-950 mt-1">🛡️ Web3 Verification</div>
                  <div className="text-[10px] text-emerald-800 font-medium">Proof-of-Trek &amp; Escrow</div>
                </Link>
              </div>

              {/* User Profile / Auth Card in Drawer */}
              <div className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {isAuthenticated ? (currentUser?.name?.[0]?.toUpperCase() || 'U') : <User size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {isAuthenticated ? (currentUser?.name || currentUser?.email || 'Authenticated Explorer') : 'Guest Explorer'}
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium truncate">
                      {isAuthenticated ? 'DevBhoomi Member' : 'Sign in to sync saved trips'}
                    </div>
                  </div>
                </div>

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-600 text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    <LogOut size={14} />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition shrink-0"
                  >
                    Sign In
                  </Link>
                )}
              </div>

            </div>

            {/* 3. Bottom Sticky CTA */}
            <div className="p-4 bg-white border-t border-stone-200 shrink-0">
              <Link
                to="/trip-planner"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#0f3d2e] hover:bg-[#185340] text-white font-black text-xs sm:text-sm text-center uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Sparkles size={16} className="text-amber-300" />
                <span>{t('nav_plantrip') || 'Plan Uttarakhand Trip'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Global Location Modal */}
      <GlobalLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
}
