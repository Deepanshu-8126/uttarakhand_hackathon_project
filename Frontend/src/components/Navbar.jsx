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
  MapPin
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
    { label: t('nav_explore') || 'Explore', path: '/explore', icon: Compass, isExplore: true },
    { label: t('nav_stays') || 'Stays', path: '/stays', icon: Bed },
    { label: t('nav_rentals') || 'Rentals', path: '/rentals', icon: Car },
    { label: t('nav_map') || 'Map', path: '/map', icon: Map },
    { label: 'AI Copilot', path: '/copilot', icon: Sparkles, badge: 'AI' },
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
      <header className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-colors duration-200 ${
        isDark 
          ? 'bg-[#040e09]/95 border-b border-white/[0.08] shadow-md text-white' 
          : 'bg-white/95 border-b border-stone-200/80 shadow-xs text-stone-900'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* ── 1. Logo - NEVER squish ─────────────────────────────────── */}
            <Link to="/" className="shrink-0 flex items-center gap-2 sm:gap-2.5 group">
              <img
                src="/logo.png"
                alt="Discovery Uttarakhand"
                className={`w-7 h-7 sm:w-9 sm:h-9 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0 ${
                  isDark ? 'border border-emerald-500/30 bg-[#06140c]' : 'border border-emerald-900/10 bg-white'
                }`}
              />
              <div className="shrink-0">
                <span className={`text-sm sm:text-base font-black tracking-tight block leading-none whitespace-nowrap ${
                  isDark ? 'text-white' : 'text-[#0f3d2e]'
                }`}>
                  Discovery
                </span>
                <span className={`text-[8px] sm:text-[9px] font-bold tracking-widest uppercase block whitespace-nowrap ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}>
                  {lang === 'hi' ? 'उत्तराखंड' : 'Uttarakhand'}
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

        {/* ── 5. Mobile & Tablet Full-Screen Overlay (< 1024px) ───────────────── */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-6 p-6 lg:hidden overflow-y-auto animate-in fade-in duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xl cursor-pointer"
              aria-label="Close menu"
            >
              ✕
            </button>

            {/* Brand Logo in Overlay */}
            <div className="flex items-center gap-3 mb-2 shrink-0">
              <img
                src="/logo.png"
                alt="Discovery Uttarakhand"
                className="w-10 h-10 object-contain rounded-xl shadow-xs border border-emerald-900/10 bg-white"
              />
              <span className="font-extrabold text-xl text-[#0f3d2e]">Discovery Uttarakhand</span>
            </div>

            {/* Active Trip Banner if available */}
            {activeTripDestination && (
              <Link
                to={activeTripUrl}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full max-w-sm p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#0f3d2e] text-center shadow-xs"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-0.5">
                  🟢 Trip in Progress
                </span>
                <span className="font-extrabold text-sm text-emerald-950 block truncate">
                  {activeTripDestination} {activeTripDuration ? `(${activeTripDuration})` : ''}
                </span>
              </Link>
            )}

            {/* Navigation Overlay Links */}
            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={(e) => handleNavClick(link, e)}
                  className="whitespace-nowrap text-lg font-bold text-stone-800 hover:text-[#0f3d2e] transition-colors py-1"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                to="/guide"
                onClick={() => setMobileMenuOpen(false)}
                className="whitespace-nowrap text-lg font-bold text-emerald-800 hover:text-[#0f3d2e] transition-colors py-1"
              >
                🏔️ Guide Portal
              </Link>

              <Link
                to="/rescue-ops"
                onClick={() => setMobileMenuOpen(false)}
                className="whitespace-nowrap text-lg font-bold text-rose-600 hover:text-rose-700 transition-colors py-1"
              >
                🚨 Rescue Ops &amp; SOS
              </Link>

              <Link
                to="/innovations"
                onClick={() => setMobileMenuOpen(false)}
                className="whitespace-nowrap text-lg font-bold text-emerald-700 hover:text-emerald-900 transition-colors py-1"
              >
                🛡️ Web3 Verification
              </Link>

              {/* Language Switcher in Overlay */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="mt-1 px-4 py-2 rounded-full bg-stone-100 hover:bg-emerald-50 border border-stone-200 text-sm font-bold text-stone-800 transition"
              >
                {lang === 'en' ? 'Switch to हिन्दी' : 'Switch to English'}
              </button>

              {/* Plan Trip Primary CTA */}
              <Link
                to="/trip-planner"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full mt-1 py-3.5 px-6 rounded-full bg-[#0f3d2e] text-white font-extrabold text-sm text-center uppercase tracking-wider shadow-md active:scale-95"
              >
                {t('nav_plantrip') || 'Plan Trip Now'}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Location Modal */}
      <GlobalLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
}
