import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Bed, 
  User, 
  Car, 
  Navigation,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Hide on auth / specialized full-screen pages
  const hiddenRoutes = ['/login', '/register', '/admin', '/copilot'];
  const isHidden = hiddenRoutes.some(path => location.pathname.startsWith(path));

  if (isHidden) {
    return null;
  }

  const currentPath = location.pathname;

  const isExploreActive = currentPath === '/' || currentPath.startsWith('/destinations') || currentPath.startsWith('/spiritual');
  const isRentalsActive = currentPath.startsWith('/rentals');
  const isPlannerActive = currentPath === '/trip-planner';
  const isStaysActive = currentPath.startsWith('/stays');
  const isMyTripsActive = currentPath.startsWith('/my-trip') || currentPath.startsWith('/profile');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-area-bottom">
      
      {/* ── Central Elevated Action Button (Plan Trip) ── */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button
          type="button"
          onClick={() => navigate('/trip-planner')}
          className={`group flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full shadow-lg border-2 border-white transition-all transform active:scale-95 cursor-pointer ${
            isPlannerActive 
              ? 'bg-forest-green text-white shadow-forest-green/40 ring-2 ring-forest-green/20' 
              : 'bg-[#0f3d2e] hover:bg-[#144c3a] text-white shadow-[#0f3d2e]/30'
          }`}
          aria-label="AI Trip Planner"
        >
          <Sparkles size={14} className="text-amber-300 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider">Plan</span>
        </button>
      </div>

      {/* ── 4 Distinct Tab Navigation Bar ── */}
      <nav className="flex items-center justify-between px-3 py-1.5 pt-2 max-w-md mx-auto">
        
        {/* Tab 1: Explore */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all ${
            isExploreActive ? 'text-[#0f3d2e] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${isExploreActive ? 'bg-emerald-50 text-[#0f3d2e]' : ''}`}>
            <Compass size={18} strokeWidth={isExploreActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Explore</span>
        </Link>

        {/* Tab 2: Rentals & Fleets */}
        <Link
          to="/rentals"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all mr-6 ${
            isRentalsActive ? 'text-[#0f3d2e] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${isRentalsActive ? 'bg-emerald-50 text-[#0f3d2e]' : ''}`}>
            <Car size={18} strokeWidth={isRentalsActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Rentals</span>
        </Link>

        {/* Tab 3: Stays */}
        <Link
          to="/stays"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all ml-6 ${
            isStaysActive ? 'text-[#0f3d2e] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${isStaysActive ? 'bg-emerald-50 text-[#0f3d2e]' : ''}`}>
            <Bed size={18} strokeWidth={isStaysActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Stays</span>
        </Link>

        {/* Tab 4: My Trips / Profile */}
        <Link
          to="/my-trip"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all ${
            isMyTripsActive ? 'text-[#0f3d2e] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${isMyTripsActive ? 'bg-emerald-50 text-[#0f3d2e]' : ''}`}>
            <User size={18} strokeWidth={isMyTripsActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">My Trips</span>
        </Link>

      </nav>

    </div>
  );
}
