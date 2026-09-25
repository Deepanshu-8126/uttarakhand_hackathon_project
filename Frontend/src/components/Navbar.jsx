import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Menu, 
  X, 
  Mountain, 
  LogOut,
  Briefcase,
  ShieldCheck,
  Compass,
  ChevronDown,
  Navigation,
  ArrowRight,
  Sparkles,
  Bed,
  Car,
  Landmark,
  Map,
  Building,
  Calendar,
  Languages,
  MapPin,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMapStore } from '../store/mapStore';
import { useLanguage } from '../context/LanguageContext';
import GlobalLocationModal from './GlobalLocationModal';
import { getStoredUserLocation } from '../utils/geoHelpers';

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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (isHidden) {
    return null;
  }

  // Only show active trip in progress if user is authenticated and has an active trip
  const activeTripDestination = (isAuthenticated && activeTripSession)
    ? (activeTripSession?.destination?.name || activeTripSession?.destination || null)
    : null;
  const activeTripDuration = activeTripSession?.duration || (activeTripSession?.dayPlans?.length ? `${activeTripSession.dayPlans.length} Days` : null);
  const activeTripUrl = activeTripSession?._id || activeTripSession?.tripId 
    ? `/my-trip/${activeTripSession._id || activeTripSession.tripId}` 
    : '/my-trip';

  const navLinks = [
    { label: t('nav_explore'), path: '/explore', icon: Compass, isExplore: true },
    { label: t('nav_stays'), path: '/stays', icon: Bed },
    { label: t('nav_rentals'), path: '/rentals', icon: Car },
    { label: t('nav_map'), path: '/map', icon: Map },
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

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-stone-200/70 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* ── 1. Left: Brand Logo ───────────────────────────────────────── */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 mr-2 sm:mr-6">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <img
                src="/logo.png"
                alt="Discovery Uttarakhand"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-2xl shadow-sm group-hover:scale-105 transition-transform shrink-0 border border-emerald-900/10 bg-white"
              />
              <div>
                <span className="text-sm sm:text-lg font-black tracking-tight block text-[#0f3d2e] leading-none">
                  Discovery
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold tracking-widest uppercase text-emerald-700">
                  {lang === 'hi' ? 'उत्तराखंड' : 'Uttarakhand'}
                </span>
              </div>
            </Link>
          </div>

          {/* ── 2. Center: Desktop Navigation Links (>1024px Fluffy Pill Bar) ─ */}
          <nav className="hidden lg:flex items-center gap-1 p-1.5 rounded-full bg-stone-100/80 border border-stone-200/70 shadow-2xs backdrop-blur-md">
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
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-200 ${
                    isCurrent 
                      ? 'bg-white text-[#0f3d2e] shadow-xs border border-emerald-900/10' 
                      : 'text-stone-600 hover:text-[#0f3d2e] hover:bg-white/70'
                  }`}
                >
                  <Icon size={13} className={isCurrent ? 'text-emerald-700' : 'text-stone-400'} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0f3d2e] border border-emerald-300/80 shadow-2xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── 3. Right: Location Pill + Language Switcher + Profile / Sign In + Hamburger ─ */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Global Location Selector Pill (Clickable Anywhere) */}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-[11px] font-bold text-slate-800 transition cursor-pointer shadow-2xs group shrink-0"
              title="Change origin or detect current GPS location"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <MapPin size={12} className="text-emerald-800 shrink-0" />
              <span className="truncate max-w-[65px] sm:max-w-[100px] text-stone-700 group-hover:text-emerald-900">
                {userLocation?.city || 'Location'}
              </span>
            </button>

            {/* Safety / SOS Button */}
            <Link
              to="/rescue-ops"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-rose-300/60 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-[10px] font-bold transition shadow-2xs"
              title="Trek Safety & Rescue Operations"
            >
              <AlertTriangle size={11} className="text-rose-500" />
              <span>Safety</span>
            </Link>

            {/* Language Switcher Button (Desktop & Mobile) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-stone-200 bg-stone-50/90 hover:bg-emerald-50 hover:border-emerald-300 text-[11px] font-bold text-slate-700 transition cursor-pointer shadow-2xs"
              title={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
            >
              <Languages size={13} className="text-emerald-700" />
              <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* User Profile / Sign In Button (ALWAYS VISIBLE on Mobile & Desktop) */}
            <div className="relative" ref={userRef}>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                  aria-label="User Menu"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-xs">
                    {currentUser?.name ? currentUser.name[0].toUpperCase() : <User size={14} />}
                  </div>
                  <ChevronDown size={13} className="text-slate-400 pr-1 hidden sm:block" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200/90 text-stone-800 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <User size={13} className="text-[#0f3d2e]" />
                  <span>{t('nav_signin')}</span>
                </button>
              )}

              {/* User Dropdown */}
              {userDropdownOpen && isAuthenticated && (
                <div className="absolute top-11 right-0 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <div className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{currentUser?.email}</div>
                    <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {currentUser?.role || 'Traveler'}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5 text-xs font-medium text-slate-700">
                    {currentUser?.role === 'partner' ? (
                      <>
                        <Link
                          to="/partner"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 text-[#0f3d2e] font-bold transition-colors"
                        >
                          <Briefcase size={14} className="text-emerald-700" />
                          <span>Partner Business Hub</span>
                        </Link>
                        <Link
                          to="/partner/listings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                        >
                          <Building size={14} className="text-slate-400" />
                          <span>Manage Listings</span>
                        </Link>
                        <Link
                          to="/partner/bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                        >
                          <Calendar size={14} className="text-slate-400" />
                          <span>Guest Bookings &amp; OTP</span>
                        </Link>
                        <Link
                          to="/partner/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                        >
                          <ShieldCheck size={14} className="text-slate-400" />
                          <span>Business KYC &amp; Profile</span>
                        </Link>
                      </>
                    ) : currentUser?.role === 'admin' ? (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-[#0f3d2e] font-bold"
                        >
                          <ShieldCheck size={14} />
                          <span>Admin Management</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <User size={14} className="text-slate-400" />
                          <span>Admin Profile</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/my-trip"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-emerald-800 font-semibold"
                        >
                          <Compass size={14} />
                          <span>My Active Trips &amp; SOS</span>
                        </Link>

                        <Link
                          to="/guide"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-50 transition-colors text-[#0f3d2e] font-bold"
                        >
                          <Mountain size={14} className="text-emerald-700" />
                          <span>🏔️ Guide Portal</span>
                        </Link>

                        <Link
                          to="/rescue-ops"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors text-rose-700 font-bold"
                        >
                          <Radio size={14} className="text-rose-500" />
                          <span>🚨 Rescue Ops</span>
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <User size={14} className="text-slate-400" />
                          <span>{t('nav_profile')} &amp; Bookings</span>
                        </Link>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-left font-semibold cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>{t('nav_signout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Plan Trip CTA (>1024px) */}
            <div className="hidden lg:block">
              <Link
                to="/trip-planner"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0f3d2e] hover:bg-[#185340] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
              >
                <Sparkles size={13} className="text-emerald-300" />
                <span>{t('nav_plantrip')}</span>
              </Link>
            </div>

            {/* Mobile & Tablet Hamburger Button (<1024px) */}
            <div className="block lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-slate-700 hover:text-[#0f3d2e] transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* ── Mobile Slide-Out Drawer (<1024px) ── */}
      {mobileMenuOpen && (
        <div className="block lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#fdfbf7] p-5 sm:p-6 shadow-2xl border-l border-stone-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logo.png"
                    alt="Discovery Uttarakhand"
                    className="w-8 h-8 object-contain rounded-xl shadow-xs border border-emerald-900/10 bg-white"
                  />
                  <span className="font-bold text-sm text-[#0f3d2e]">Discovery Uttarakhand</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 flex items-center justify-center text-stone-700 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Language Switch in Drawer */}
              <div className="mb-4 flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200/90">
                <span className="text-xs font-bold text-slate-700">Language / भाषा:</span>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800"
                >
                  {lang === 'en' ? 'Switch to हिन्दी' : 'Switch to English'}
                </button>
              </div>

              {/* Active Trip in Progress Drawer Banner */}
              {activeTripDestination && (
                <Link
                  to={activeTripUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#0f3d2e] block shadow-2xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Trip in Progress
                    </span>
                    <ArrowRight size={13} className="text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="font-extrabold text-xs text-emerald-950 truncate">
                    {activeTripDestination} {activeTripDuration ? `(${activeTripDuration})` : ''}
                  </div>
                </Link>
              )}

              <div className="space-y-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={(e) => handleNavClick(link, e)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-stone-200/80 hover:border-[#0f3d2e] text-stone-800 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className="text-[#0f3d2e]" />
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#0f3d2e] border border-emerald-200">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Safety: Guide Portal & Rescue Ops */}
                <Link
                  to="/guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#0f3d2e] font-bold text-xs shadow-2xs transition-all"
                >
                  <Mountain size={16} className="text-emerald-700" />
                  <span>🏔️ Guide Portal</span>
                </Link>
                <Link
                  to="/rescue-ops"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-700 font-bold text-xs shadow-2xs transition-all"
                >
                  <AlertTriangle size={16} className="text-rose-500" />
                  <span>🚨 Rescue Ops</span>
                </Link>
              </div>

            </div>

            <div className="pt-4 border-t border-stone-200 space-y-2">
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-stone-300 text-slate-800 font-bold text-xs shadow-2xs"
                >
                  <User size={14} className="text-slate-500" />
                  <span>{t('nav_signin')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs"
                >
                  <LogOut size={14} />
                  <span>{t('nav_signout')}</span>
                </button>
              )}

              <Link
                to="/trip-planner"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#0f3d2e] text-white font-black text-xs uppercase tracking-wider shadow-md"
              >
                <Sparkles size={14} className="text-emerald-300" />
                <span>{t('nav_plantrip')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Global Location & Gateway Modal */}
      <GlobalLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
}
