import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Sparkles, 
  Bed, 
  User, 
  Car, 
  Plus, 
  MapPin,
  ShieldCheck,
  Navigation
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

  const navItems = [
    {
      id: 'explore',
      label: 'Explore',
      icon: Compass,
      path: '/',
      isActive: currentPath === '/' || currentPath.startsWith('/destinations')
    },
    {
      id: 'planner',
      label: 'Planner',
      icon: Navigation,
      path: '/trip-planner',
      isActive: currentPath === '/trip-planner'
    },
    {
      id: 'stays',
      label: 'Stays',
      icon: Bed,
      path: '/stays',
      isActive: currentPath.startsWith('/stays') || currentPath.startsWith('/rentals')
    },
    {
      id: 'mytrip',
      label: 'My Trips',
      icon: User,
      path: '/my-trip',
      isActive: currentPath.startsWith('/my-trip') || currentPath.startsWith('/profile')
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-area-bottom">
      
      {/* ── Central Floating Action Button (Plan Trip FAB) ── */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button
          type="button"
          onClick={() => navigate('/trip-planner')}
          className="group flex items-center justify-center gap-1 bg-[#0f3d2e] hover:bg-[#144c3a] text-white px-4 py-2.5 rounded-full shadow-lg shadow-[#0f3d2e]/30 border-2 border-white transition-transform active:scale-95 cursor-pointer"
          aria-label="Plan a Trip"
        >
          <Navigation size={13} className="text-emerald-300" />
          <span className="text-[11px] font-black uppercase tracking-wider">Plan</span>
        </button>
      </div>

      {/* ── 4 Tab Navigation Bar ── */}
      <nav className="flex items-center justify-between px-3 py-1.5 pt-2 max-w-md mx-auto">
        
        {/* Tab 1: Explore */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all ${
            navItems[0].isActive ? 'text-[#0f3d2e] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${navItems[0].isActive ? 'bg-emerald-50 text-[#0f3d2e]' : ''}`}>
            <Compass size={18} strokeWidth={navItems[0].isActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Explore</span>
        </Link>

        {/* Tab 2: AI Planner */}
        <Link
          to="/trip-planner"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all mr-6 ${
            navItems[1].isActive ? 'text-[#0f3d2e] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${navItems[1].isActive ? 'bg-emerald-50 text-[#0f3d2e]' : ''}`}>
            <Sparkles size={18} strokeWidth={navItems[1].isActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">AI Planner</span>
        </Link>

        {/* Tab 3: Stays */}
        <Link
          to="/stays"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all ml-6 ${
            navItems[2].isActive ? 'text-[#0f3d2e] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${navItems[2].isActive ? 'bg-emerald-50 text-[#0f3d2e]' : ''}`}>
            <Bed size={18} strokeWidth={navItems[2].isActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Stays</span>
        </Link>

        {/* Tab 4: My Trips / Profile */}
        <Link
          to="/my-trip"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all ${
            navItems[3].isActive ? 'text-[#0f3d2e] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${navItems[3].isActive ? 'bg-emerald-50 text-[#0f3d2e]' : ''}`}>
            <User size={18} strokeWidth={navItems[3].isActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">My Trips</span>
        </Link>

      </nav>

    </div>
  );
}
