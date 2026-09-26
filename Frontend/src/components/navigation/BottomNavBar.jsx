import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Bed, 
  User, 
  Route, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNavBar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Hide on auth / specialized full-screen pages
  const hiddenRoutes = ['/login', '/register', '/admin', '/copilot'];
  const isHidden = hiddenRoutes.some(path => location.pathname.startsWith(path));

  if (isHidden) {
    return null;
  }

  const currentPath = location.pathname;

  const isExploreActive = currentPath === '/' || currentPath === '/explore' || currentPath.startsWith('/destinations') || currentPath.startsWith('/spiritual');
  const isPlannerActive = currentPath === '/trip-planner';
  const isStaysActive = currentPath.startsWith('/stays');
  const isMyTripsActive = currentPath.startsWith('/my-trip') || currentPath.startsWith('/profile');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-stone-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] safe-area-bottom">
      
      {/* ── Central Elevated Action Button (Pahadi AI Copilot) ── */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('du_toggle_copilot'))}
          className="group flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full shadow-[0_8px_25px_rgba(15,61,46,0.4)] border-2 border-white transition-all transform active:scale-95 cursor-pointer bg-gradient-to-r from-[#0f3d2e] to-[#17523f] text-white hover:brightness-110"
          aria-label="Launch AI Copilot"
        >
          <Sparkles size={14} className="text-amber-300 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">PLAN</span>
        </button>
      </div>

      {/* ── 4 Distinct Tab Navigation Bar ── */}
      <nav className="flex items-center justify-between px-3 py-2 pt-2.5 max-w-md mx-auto">
        
        {/* Tab 1: Explore */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all ${
            isExploreActive ? 'text-[#0f3d2e] font-extrabold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-xl ${isExploreActive ? 'bg-emerald-100/80 text-[#0f3d2e]' : ''}`}>
            <Compass size={18} strokeWidth={isExploreActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-extrabold">Explore</span>
        </Link>

        {/* Tab 2: Trip Planner */}
        <Link
          to="/trip-planner"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all mr-5 ${
            isPlannerActive ? 'text-[#0f3d2e] font-extrabold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-xl ${isPlannerActive ? 'bg-emerald-100/80 text-[#0f3d2e]' : ''}`}>
            <Route size={18} strokeWidth={isPlannerActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-extrabold">AI Planner</span>
        </Link>

        {/* Tab 3: Stays */}
        <Link
          to="/stays"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all ml-5 ${
            isStaysActive ? 'text-[#0f3d2e] font-extrabold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-xl ${isStaysActive ? 'bg-emerald-100/80 text-[#0f3d2e]' : ''}`}>
            <Bed size={18} strokeWidth={isStaysActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-extrabold">Stays</span>
        </Link>

        {/* Tab 4: My Trips / Profile */}
        <Link
          to="/my-trip"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all ${
            isMyTripsActive ? 'text-[#0f3d2e] font-extrabold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-xl ${isMyTripsActive ? 'bg-emerald-100/80 text-[#0f3d2e]' : ''}`}>
            <User size={18} strokeWidth={isMyTripsActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-extrabold">My Trips</span>
        </Link>

      </nav>

    </div>
  );
}
