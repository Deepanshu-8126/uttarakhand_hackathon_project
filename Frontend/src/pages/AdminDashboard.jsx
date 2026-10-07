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
    { label: 'Destinations', type: 'destinations', count: stats?.destinations || 0, icon: Compass, color: 'from-emerald-600 to-teal-700', desc: 'Himalayan peaks, valleys & towns' },
    { label: 'Stays', type: 'stays', count: stats?.stays || 0, icon: Hotel, color: 'from-amber-600 to-orange-700', desc: 'Homestays, KMVN & alpine resorts' },
    { label: 'Rentals', type: 'rentals', count: stats?.rentals || 0, icon: Bike, color: 'from-blue-600 to-indigo-700', desc: 'Bikes, scooters & 4x4 vehicles' },
    { label: 'Spiritual', type: 'spiritual', count: stats?.spiritual || 0, icon: Landmark, color: 'from-purple-600 to-pink-700', desc: 'Char Dham, Panch Kedar & temples' },
    { label: 'Activities', type: 'activities', count: stats?.activities || 0, icon: Mountain, color: 'from-green-600 to-emerald-700', desc: 'Treks, rafting, skiing & safaris' },
    { label: 'Culture', type: 'culture', count: stats?.culture || 0, icon: Sparkles, color: 'from-rose-600 to-red-700', desc: 'Folklore, crafts & heritage spots' },
    { label: 'Guides', type: 'guides', count: stats?.guides || 0, icon: UserCheck, color: 'from-teal-600 to-cyan-700', desc: 'Certified mountain & cultural guides' },
    { label: 'Users', type: 'users', count: stats?.users || 0, icon: Users, color: 'from-slate-700 to-stone-800', desc: 'Tourists, partners & officers' },
  ];

  const operationalStats = [
    { label: 'Bookings', type: 'bookings', count: stats?.bookingsByStatus ? Object.values(stats.bookingsByStatus).reduce((a, b) => a + b, 0) : 0, icon: CalendarCheck, color: 'text-emerald-500' },
    { label: 'Reviews', type: 'reviews', count: stats?.reviewsByStatus ? Object.values(stats.reviewsByStatus).reduce((a, b) => a + b, 0) : 0, icon: Star, color: 'text-amber-500' },
  ];

  const filteredSamples = sampleItems.filter(item => {
    const name = item.name || item.title || item.vehicleName || '';
    const loc = formatLocation(item, '');
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || loc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        
        {/* Header Hero Bar */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f3d2e] via-[#09261e] to-stone-950 p-6 sm:p-10 border border-emerald-500/20 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                <ShieldCheck size={14} className="text-emerald-400" />
                State Tourism Administration Suite
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Himalayan Master Admin Portal
              </h1>
              <p className="text-stone-300 text-sm sm:text-base max-w-2xl">
                Logged in as <span className="text-emerald-400 font-semibold">{currentUser?.name || 'Administrator'}</span> ({currentUser?.email}) — Full clearance to manage real photography, stays, rentals, shrines, guides, and bookings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link 
                to="/audit" 
                className="px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-950/50 hover:-translate-y-0.5"
              >
                <span>⚡ System Health & Audit</span>
              </Link>
              <Link
                to="/innovations"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-md hover:-translate-y-0.5"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Showcase</span>
              </Link>
              <button 
                onClick={logout} 
                className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Core Categories Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
                <Layers className="text-emerald-600 dark:text-emerald-400" size={24} />
                Live Tourism Inventories
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                Click any category card to view, add, inspect photography, and edit live items.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  to={`/admin/${item.type}`} 
                  key={item.type} 
                  className="group relative bg-white dark:bg-stone-900/90 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon size={22} />
                      </div>
                      <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                        {loading ? '...' : item.count}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Manage & Add Photos</span>
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
                className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md flex items-center justify-between transition-all hover:border-emerald-500/40"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <Icon size={24} className={item.color} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-white text-base">Live {item.label}</h4>
                    <p className="text-xs text-stone-500">Manage orders, clearance and verification status</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-stone-900 dark:text-white">{loading ? '...' : item.count}</span>
                  <ArrowRight size={16} className="text-stone-400" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Live Photography & Data Showcase Stream */}
        <section className="bg-white dark:bg-stone-900/80 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                  Real Website Data & Photography Showcase
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Visual preview of actual inventory active on the tourism portal.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-stone-100 dark:bg-stone-800/80 p-1.5 rounded-2xl">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab} by name or location...`}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                to={`/admin/${activeTab}`}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={14} /> Add New {activeTab.slice(0, -1)}
              </Link>
              <Link
                to={`/admin/${activeTab}`}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold transition-all"
              >
                Manage All ({sampleItems.length})
              </Link>
            </div>
          </div>

          {/* Visual Cards Grid */}
          {samplesLoading ? (
            <div className="py-12 text-center text-stone-400 text-sm animate-pulse">
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
                    className="group bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700/70 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-200 dark:bg-stone-800">
                      <img 
                        src={img} 
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      
                      {price && (
                        <span className="absolute bottom-2.5 left-2.5 bg-emerald-600/90 text-white font-bold text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm shadow">
                          ₹{price.toLocaleString()} {item.pricePerDay ? '/ day' : item.pricePerNight ? '/ night' : 'onwards'}
                        </span>
                      )}

                      {item.rating && (
                        <span className="absolute top-2.5 right-2.5 bg-black/60 text-amber-400 font-bold text-xs px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                          <Star size={12} className="fill-amber-400" />
                          {item.rating}
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-stone-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {title}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                          📍 {loc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-xs">
                        <Link
                          to={`/admin/${activeTab}`}
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Edit & Photos →
                        </Link>
                        {item.slug && (
                          <Link
                            to={activeTab === 'destinations' ? `/destinations/${item.slug}` : `/${activeTab}/${item.slug}`}
                            target="_blank"
                            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center gap-1"
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
            <div className="p-8 text-center text-stone-400 text-sm">
              No items matching your query in {activeTab}.
            </div>
          )}
        </section>

        {/* Phase 3: Partner Verification Queue & Officer Clearance */}
        <section className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xl">
          <PartnerVerificationQueue />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

