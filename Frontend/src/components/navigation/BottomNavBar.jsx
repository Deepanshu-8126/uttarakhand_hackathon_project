import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Bed, 
  User, 
  Heart,
  Navigation,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';

export default function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { favoriteCount } = useFavorites();

  // Hide on auth / specialized full-screen pages
  const hiddenRoutes = ['/login', '/register', '/admin', '/copilot'];
  const isHidden = hiddenRoutes.some(path => location.pathname.startsWith(path));

  if (isHidden) {
    return null;
  }

  const currentPath = location.pathname;

  const isExploreActive = currentPath === '/' || currentPath.startsWith('/destinations') || currentPath.startsWith('/spiritual');
  const isSavedActive = currentPath.startsWith('/profile') && currentPath.includes('favorites') || currentPath.startsWith('/saved');
  const isStaysActive = currentPath.startsWith('/stays');
  const isMyTripsActive = currentPath.startsWith('/my-trip') || currentPath.startsWith('/profile');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-stone-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] safe-area-bottom">
      
      {/* ── Central Elevated PLAN Button ── */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button
          type="button"
          onClick={() => navigate('/trip-planner')}
          className="group flex items-center justify-center gap-1.5 px-4 py-2 rounded-full shadow-[0_8px_20px_rgba(15,61,46,0.35)] border-2 border-white transition-all transform active:scale-95 cursor-pointer bg-gradient-to-r from-[#0f3d2e] to-[#1a5c44] text-white hover:brightness-110"
          aria-label="Plan a Trip"
        >
          <Navigation size={13} className="text-[#00FF88]" />
          <span className="text-[10.5px] font-black uppercase tracking-wider">PLAN</span>
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

        {/* Tab 2: Saved / Favorites ❤️ */}
        <Link
          to="/profile?tab=favorites"
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all mr-6 ${
            isSavedActive ? 'text-rose-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`relative w-7 h-7 flex items-center justify-center rounded-lg ${isSavedActive ? 'bg-rose-50 text-rose-600' : ''}`}>
            <Heart
              size={18}
              strokeWidth={isSavedActive ? 2.5 : 2}
              className={isSavedActive ? 'fill-rose-500 text-rose-500' : ''}
            />
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm border border-white">
                {favoriteCount > 9 ? '9+' : favoriteCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Saved</span>
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

