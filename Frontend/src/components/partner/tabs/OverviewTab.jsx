import React from 'react';
import { 
  CalendarCheck, 
  DollarSign, 
  Layers, 
  Clock, 
  ArrowUpRight, 
  AlertCircle,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Star,
  AlertTriangle,
  ChevronRight,
  IndianRupee,
  Phone,
  User,
  Building2,
  FileText,
  Eye
} from 'lucide-react';

const OverviewTab = ({ 
  dashboardStats, 
  partnerProfile,
  actionItems = [],
  onNavigateTab,
  onViewPublicProfile
}) => {
  const stats = dashboardStats || {};
  const recentBookings = stats.recentBookings || [];
  const verificationStatus = partnerProfile?.verificationStatus || 'DRAFT';
  const isVerified = verificationStatus === 'VERIFIED' || verificationStatus === 'ACTIVE';

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const partnerName = partnerProfile?.contactPerson || partnerProfile?.businessName || 'Partner';

  // Find the next upcoming or today's booking
  const nextBooking = recentBookings.find(b => 
    !['cancelled', 'completed', 'CANCELLED', 'COMPLETED'].includes(b.status)
  ) || recentBookings[0] || null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          1. BUSINESS STATUS & COMMAND CENTER
          ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-[#0f3d2e] to-stone-900 text-white shadow-xl border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-black">
                Discovery Uttarakhand Partner OS
              </span>
              <span className="text-emerald-500">•</span>
              <span className="text-[10px] text-emerald-200/80 font-bold uppercase tracking-wider">
                Command Center
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {greeting}, {partnerName} 👋
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
              {partnerProfile?.businessName || 'Your Tourism Business'} • {partnerProfile?.city || partnerProfile?.district || 'Uttarakhand'}
            </p>

            {/* Business Status Human Indicator */}
            <div className="mt-3 flex items-center gap-2">
              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Your business is LIVE &amp; ACTIVE ✓
                </span>
              ) : verificationStatus === 'PENDING_VERIFICATION' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Clock size={14} className="text-amber-400" />
                  Under review — Admin team is checking your details
                </span>
              ) : verificationStatus === 'REJECTED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <AlertTriangle size={14} className="text-rose-400" />
                  Needs changes — Please update your documents
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-500/20 text-stone-300 border border-stone-500/40">
                  <ShieldCheck size={14} className="text-stone-300" />
                  Setup Mode — Submit details to start receiving bookings
                </span>
              )}
            </div>
          </div>

          {/* Quick Hub Controls */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('add-listing')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>+ Add Service</span>
            </button>

            <button
              onClick={() => onViewPublicProfile ? onViewPublicProfile() : onNavigateTab('profile')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <Eye size={15} className="text-emerald-300" />
              <span>View Public Profile</span>
            </button>

            <button
              onClick={() => onNavigateTab('profile')}
              className="px-4 py-2.5 rounded-xl bg-stone-900/60 hover:bg-stone-900 text-stone-200 font-semibold text-xs transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 size={15} />
              <span>Manage Business</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ACTION CENTER
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${actionItems.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-500">
              Action Center
            </h3>
          </div>
          {actionItems.length > 0 && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              {actionItems.length} require{actionItems.length === 1 ? 's' : ''} attention
            </span>
          )}
        </div>

        {actionItems.length > 0 ? (
          <div className="space-y-2.5">
            {actionItems.slice(0, 3).map((item, i) => (
              <div 
                key={i} 
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-100/70 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.priority === 'critical' ? 'bg-rose-100 text-rose-700' :
                    item.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.type === 'document' ? <FileText size={16} /> :
                     item.type === 'verification' ? <ShieldCheck size={16} /> :
                     item.type === 'booking' ? <CalendarCheck size={16} /> : <AlertCircle size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab(item.action || 'overview')}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-emerald-600 text-stone-800 hover:text-emerald-800 text-xs font-bold transition-all shadow-2xs self-start sm:self-center shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Review</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>All clear! No urgent actions needed right now.</span>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. TODAY & UPCOMING OPERATIONAL SUMMARY
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Next / Upcoming Booking Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                Next Upcoming Booking
              </span>
              <button 
                onClick={() => onNavigateTab('bookings')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {nextBooking ? (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-stone-900 truncate">
                      {nextBooking.partnerListing?.title || nextBooking.listingSnapshot?.title || 'Tour / Stay Reservation'}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                      <User size={13} className="text-stone-400" />
                      <span>{nextBooking.traveler?.name || nextBooking.user?.name || 'Tourist Guest'}</span>
                      {nextBooking.guests && <span>• {nextBooking.guests} guest{nextBooking.guests > 1 ? 's' : ''}</span>}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {(nextBooking.status || 'CONFIRMED').toUpperCase()}
                  </span>
                </div>

                <div className="pt-2 border-t border-emerald-200/50 flex items-center justify-between text-xs text-stone-600">
                  <span className="flex items-center gap-1 font-semibold text-stone-700">
                    <CalendarCheck size={13} className="text-emerald-700" />
                    {nextBooking.startDate ? new Date(nextBooking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today'}
                  </span>
                  <span className="font-extrabold text-stone-900 text-sm">
                    ₹{(nextBooking.pricingSnapshot?.total || nextBooking.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center bg-stone-50/60 rounded-2xl border border-dashed border-stone-200">
                <CalendarCheck size={28} className="text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-700">No bookings scheduled right now</p>
                <p className="text-[11px] text-stone-400 mt-0.5">New reservations will appear here automatically.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Active Reservations Today</span>
            <span className="font-bold text-stone-800">{stats.todayBookingsCount ?? 0}</span>
          </div>
        </div>

        {/* This Month Earnings Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                Earnings This Month
              </span>
              <button 
                onClick={() => onNavigateTab('earnings')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Payouts</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-stone-500 font-semibold">₹</span>
                <span className="text-3xl font-black text-stone-900 tracking-tight">
                  {(stats.thisMonthRevenue ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Net earnings credited from completed tourist reservations
              </p>

              <div className="mt-3 pt-3 border-t border-stone-200/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-stone-400">Total Bookings</span>
                  <p className="font-bold text-stone-800 text-sm mt-0.5">
                    {stats.totalBookingsCount ?? recentBookings.length}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400">Customer Rating</span>
                  <p className="font-bold text-stone-800 text-sm mt-0.5 flex items-center gap-1">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span>4.9 / 5.0</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">Overall Lifetime Earnings</span>
            <span className="text-xs font-bold text-emerald-800">
              ₹{(stats.totalRevenue ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. WHAT SHOULD I DO NEXT? (QUICK ACTIONS)
          ───────────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onNavigateTab('add-listing')}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-700 hover:shadow-xs text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Plus size={18} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-stone-900">+ Add Service</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Publish a homestay, vehicle, guide, or trek</p>
          </button>

          <button
            onClick={() => onNavigateTab('bookings')}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-700 hover:shadow-xs text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CalendarCheck size={18} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-stone-900">Manage Bookings</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Check guest check-ins, departures &amp; dates</p>
          </button>

          <button
            onClick={() => onNavigateTab('profile')}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-700 hover:shadow-xs text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Building2 size={18} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-stone-900">My Business Profile</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Update phone, location, photos &amp; credentials</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
