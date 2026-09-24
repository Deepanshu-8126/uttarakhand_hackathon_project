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
  Map
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMapStore } from '../store/mapStore';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const activeTripSession = useMapStore((state) => state.activeTripSession);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userRef = useRef(null);

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

  const activeTripDestination = activeTripSession?.destination?.name || activeTripSession?.destination || null;
  const activeTripDuration = activeTripSession?.duration || (activeTripSession?.dayPlans?.length ? `${activeTripSession.dayPlans.length} Days` : null);
  const activeTripUrl = activeTripSession?._id || activeTripSession?.tripId 
    ? `/my-trip/${activeTripSession._id || activeTripSession.tripId}` 
    : '/my-trip';

  const navLinks = [
    { label: 'Explore', path: '/#explore', icon: Compass },
    { label: 'Trip Planner', path: '/trip-planner', icon: Navigation },
    { label: 'Stays', path: '/stays', icon: Bed },
    { label: 'Rentals', path: '/rentals', icon: Car },
    { label: 'Spiritual', path: '/spiritual', icon: Landmark },
    { label: 'Map', path: '/map', icon: Map },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          
          {/* ── 1. Left: Brand Logo ───────────────────────────────────────── */}
          <div className="flex items-center space-x-3 mr-4 sm:mr-6">
            <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#0f3d2e] flex items-center justify-center text-[#fdfbf7] shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <Mountain size={22} className="text-emerald-400" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight block text-[#0f3d2e] leading-none">
                  Discovery
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-emerald-700">
                  Uttarakhand
                </span>
              </div>
            </Link>
          </div>

          {/* ── 2. Center: Desktop Navigation Links (>1024px) ─────────────── */}
          <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-slate-700">
            {navLinks.map((link) => {
              const isCurrent = link.path === '/' 
                ? location.pathname === '/' 
                : !link.path.startsWith('/#') && location.pathname.startsWith(link.path);

              if (link.path.startsWith('/#')) {
                return (
                  <a
                    key={link.label}
                    href={link.path.replace('/', '')}
                    className="hover:text-[#0f3d2e] transition-colors font-semibold tracking-tight"
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`transition-colors font-semibold tracking-tight ${
                    isCurrent ? 'text-[#0f3d2e] font-bold border-b-2 border-[#0f3d2e] pb-1' : 'hover:text-[#0f3d2e]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── 3. Right: Profile + Tablet Hamburger / Desktop CTA ─ */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            
            {/* User Profile Menu */}
            <div className="relative" ref={userRef}>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                  aria-label="User Menu"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-xs">
                    {currentUser?.name ? currentUser.name[0].toUpperCase() : <User size={14} />}
                  </div>
                  <ChevronDown size={13} className="text-slate-400 pr-1 hidden sm:block" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-300 hover:bg-stone-50 text-slate-700 text-xs font-semibold transition"
                >
                  <User size={14} className="text-slate-500" />
                  <span>Sign In</span>
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
                    <Link
                      to="/my-trip"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-emerald-800 font-semibold"
                    >
                      <Compass size={14} />
                      <span>My Active Trips &amp; SOS</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <User size={14} className="text-slate-400" />
                      <span>Profile &amp; Bookings</span>
                    </Link>

                    {currentUser?.role === 'partner' && (
                      <Link
                        to="/partner"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-[#0f3d2e] font-semibold"
                      >
                        <Briefcase size={14} />
                        <span>Partner Portal</span>
                      </Link>
                    )}

                    {currentUser?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-[#0f3d2e] font-semibold"
                      >
                        <ShieldCheck size={14} />
                        <span>Admin Management</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-left font-semibold"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Global State Indicator: Active Trip in Progress */}
            {activeTripDestination && (
              <Link
                to={activeTripUrl}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#0f3d2e] text-xs font-bold transition-all shadow-2xs group"
                title="View Active Trip Itinerary Dashboard"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="truncate max-w-[130px] md:max-w-[200px]">
                  Trip in Progress: <span className="font-extrabold text-emerald-950">{activeTripDestination}</span> {activeTripDuration ? `(${activeTripDuration})` : ''}
                </span>
                <ArrowRight size={12} className="text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            )}

            {/* Desktop Plan Trip CTA (>1024px) */}
            <div className="hidden lg:block">
              <Link
                to="/trip-planner"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95"
              >
                <Sparkles size={13} className="text-emerald-300" />
                <span>Plan Trip</span>
              </Link>
            </div>

            {/* Tablet Hamburger Button (768px - 1024px) */}
            <div className="hidden md:block lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 rounded-full border border-stone-200 bg-white flex items-center justify-center text-slate-700 hover:text-[#0f3d2e] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* ── Tablet Slide-Out Drawer (768px - 1024px) ── */}
      {mobileMenuOpen && (
        <div className="hidden md:block lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#fdfbf7] p-6 shadow-2xl border-l border-stone-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
                <span className="font-bold text-sm text-[#0f3d2e]">Navigation Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 flex items-center justify-center text-stone-700"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Active Trip in Progress Drawer Banner */}
              {activeTripDestination && (
                <Link
                  to={activeTripUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#0f3d2e] block shadow-2xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Trip in Progress
                    </span>
                    <ArrowRight size={13} className="text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="font-extrabold text-sm text-emerald-950 truncate">
                    {activeTripDestination} {activeTripDuration ? `(${activeTripDuration})` : ''}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Tap to open Live Workspace →
                  </span>
                </Link>
              )}

              <div className="space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-stone-200/80 hover:border-[#0f3d2e] text-stone-800 font-bold text-sm shadow-2xs transition-all"
                    >
                      <Icon size={18} className="text-[#0f3d2e]" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <Link
                to="/trip-planner"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#0f3d2e] text-white font-black text-xs uppercase tracking-wider shadow-md"
              >
                <Sparkles size={15} className="text-emerald-300" />
                <span>Plan Your Trip</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
