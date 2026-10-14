import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, fetchItems } from '../api/adminApi';
import { Link } from 'react-router-dom';
import PartnerVerificationQueue from '../components/admin/PartnerVerificationQueue';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Compass, 
  Hotel, 
  Bike, 
  Sparkles, 
  Mountain, 
  UserCheck, 
  CalendarCheck, 
  Star, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Plus, 
  Eye, 
  Layers, 
  Activity as ActivityIcon, 
  Landmark,
  ExternalLink,
  Search
} from 'lucide-react';
import { resolveEntityImage, formatLocation } from '../utils/imageUtils';

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('destinations');
  const [sampleItems, setSampleItems] = useState([]);
  const [samplesLoading, setSamplesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const loadSampleData = async () => {
      setSamplesLoading(true);
      try {
        const res = await fetchItems(activeTab);
        if (res.success && Array.isArray(res.data)) {
          setSampleItems(res.data.slice(0, 6));
        } else {
          setSampleItems([]);
        }
      } catch (err) {
        console.error('Error fetching sample items', err);
        setSampleItems([]);
      } finally {
        setSamplesLoading(false);
      }
    };
    loadSampleData();
  }, [activeTab]);

  const statItems = [
    { label: 'Destinations', type: 'destinations', count: stats?.destinations || 0, icon: Compass, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Himalayan peaks, valleys & towns' },
    { label: 'Stays', type: 'stays', count: stats?.stays || 0, icon: Hotel, color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'Homestays, KMVN & alpine resorts' },
    { label: 'Rentals', type: 'rentals', count: stats?.rentals || 0, icon: Bike, color: 'text-blue-700 bg-blue-50 border-blue-200', desc: 'Bikes, scooters & 4x4 vehicles' },
    { label: 'Spiritual', type: 'spiritual', count: stats?.spiritual || 0, icon: Landmark, color: 'text-purple-700 bg-purple-50 border-purple-200', desc: 'Char Dham, Panch Kedar & shrines' },
    { label: 'Activities', type: 'activities', count: stats?.activities || 0, icon: Mountain, color: 'text-teal-700 bg-teal-50 border-teal-200', desc: 'Treks, rafting, skiing & safaris' },
    { label: 'Culture', type: 'culture', count: stats?.culture || 0, icon: Sparkles, color: 'text-rose-700 bg-rose-50 border-rose-200', desc: 'Folklore, crafts & heritage spots' },
    { label: 'Guides', type: 'guides', count: stats?.guides || 0, icon: UserCheck, color: 'text-cyan-700 bg-cyan-50 border-cyan-200', desc: 'Certified mountain & cultural guides' },
    { label: 'Users', type: 'users', count: stats?.users || 0, icon: Users, color: 'text-slate-700 bg-slate-100 border-slate-200', desc: 'Tourists, partners & officers' },
  ];

  const operationalStats = [
    { label: 'Bookings', type: 'bookings', count: stats?.bookingsByStatus ? Object.values(stats.bookingsByStatus).reduce((a, b) => a + b, 0) : 0, icon: CalendarCheck, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { label: 'Reviews', type: 'reviews', count: stats?.reviewsByStatus ? Object.values(stats.reviewsByStatus).reduce((a, b) => a + b, 0) : 0, icon: Star, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  ];

  const filteredSamples = sampleItems.filter(item => {
    const name = item.name || item.title || item.vehicleName || '';
    const loc = formatLocation(item, '');
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || loc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* Header Hero Bar (Signature Himalayan Emerald + Clean White Structure) */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0f3d2e] via-[#144c3a] to-[#0f3d2e] p-6 sm:p-8 text-white shadow-md border border-emerald-900/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={14} className="text-emerald-300" />
                State Tourism Administration Suite
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Himalayan Master Admin Portal
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
                Logged in as <span className="text-white font-bold underline decoration-emerald-400">{currentUser?.name || 'Administrator'}</span> ({currentUser?.email}) — Full clearance to manage real photography, stays, rentals, shrines, guides, and bookings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link 
                to="/audit" 
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap active:scale-95"
              >
                <span>⚡ System Health & Audit</span>
              </Link>
              <Link
                to="/innovations"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap active:scale-95"
              >
                <Sparkles size={14} className="text-amber-300" />
                <span>Showcase</span>
              </Link>
              <button 
                onClick={logout} 
                className="px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer shadow-xs"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Core Categories Grid (Clean White Cards) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <Layers className="text-[#0f3d2e]" size={22} />
                Live Tourism Inventories
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Click any category card to view, add, inspect photography, and edit live items.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  to={`/admin/${item.type}`} 
                  key={item.type} 
                  className="group bg-white rounded-3xl p-5 border border-stone-200/90 shadow-sm hover:border-[#0f3d2e] hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold ${item.color}`}>
                        <Icon size={22} />
                      </div>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">
                        {loading ? '...' : item.count}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0f3d2e] transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3.5 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#0f3d2e]">
                    <span>Manage &amp; Add Photos</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Operational / Transactional Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {operationalStats.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                to={`/admin/${item.type}`}
                key={item.type}
                className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-sm hover:border-[#0f3d2e] hover:shadow-md flex items-center justify-between transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${item.color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-[#0f3d2e] transition-colors">
                      Live {item.label}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Manage orders, clearance and verification status</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900">{loading ? '...' : item.count}</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-[#0f3d2e] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Live Photography & Data Showcase Stream */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Real Website Data &amp; Photography Showcase
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Visual preview of actual inventory active on the tourism portal.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/80">
              {[
                { id: 'destinations', label: 'Destinations' },
                { id: 'stays', label: 'Stays' },
                { id: 'rentals', label: 'Rentals' },
                { id: 'spiritual', label: 'Spiritual' },
                { id: 'activities', label: 'Activities' },
                { id: 'guides', label: 'Guides' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                    activeTab === tab.id
                      ? 'bg-[#0f3d2e] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filter Search & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab} by name or location...`}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 text-slate-900 placeholder-slate-400 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20 focus:border-[#0f3d2e] transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                to={`/admin/${activeTab}`}
                className="px-4 py-2.5 bg-[#0f3d2e] hover:bg-[#144c3a] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap active:scale-95 cursor-pointer"
              >
                <Plus size={14} /> Add New {activeTab.slice(0, -1)}
              </Link>
              <Link
                to={`/admin/${activeTab}`}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer"
              >
                Manage All ({sampleItems.length})
              </Link>
            </div>
          </div>

          {/* Visual Cards Grid */}
          {samplesLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm animate-pulse font-medium">
              Loading photography and live records...
            </div>
          ) : filteredSamples.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSamples.map((item) => {
                const img = resolveEntityImage(item, activeTab);
                const title = item.name || item.title || item.vehicleName || 'Uttarakhand Entity';
                const loc = formatLocation(item);
                const price = item.price || item.pricePerDay || item.pricePerNight || item.startingPrice;

                return (
                  <div 
                    key={item._id}
                    className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-[#0f3d2e] transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                      <img 
                        src={img} 
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {price && (
                        <span className="absolute bottom-2.5 left-2.5 bg-[#0f3d2e] text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-xs">
                          ₹{price.toLocaleString()} {item.pricePerDay ? '/ day' : item.pricePerNight ? '/ night' : 'onwards'}
                        </span>
                      )}

                      {item.rating && (
                        <span className="absolute top-2.5 right-2.5 bg-white/90 text-slate-800 font-bold text-xs px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1 border border-stone-200 shadow-2xs">
                          <Star size={12} className="fill-amber-400 text-amber-500" />
                          {item.rating}
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base group-hover:text-[#0f3d2e] transition-colors line-clamp-1">
                          {title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                          📍 {loc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <Link
                          to={`/admin/${activeTab}`}
                          className="font-bold text-[#0f3d2e] hover:underline transition-colors"
                        >
                          Edit &amp; Photos →
                        </Link>
                        {item.slug && (
                          <Link
                            to={activeTab === 'destinations' ? `/destinations/${item.slug}` : `/${activeTab}/${item.slug}`}
                            target="_blank"
                            className="text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors font-medium"
                          >
                            <span>Live View</span>
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">
              No items matching your query in {activeTab}.
            </div>
          )}
        </section>

        {/* Phase 3: Partner Verification Queue & Officer Clearance */}
        <section>
          <PartnerVerificationQueue />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
