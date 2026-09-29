import React from 'react';
import { Menu, Plus, RefreshCw, ShieldCheck, AlertCircle, Eye, Bell } from 'lucide-react';

const PartnerHeader = ({ 
  title, 
  partnerProfile, 
  onMenuClick, 
  onAddListingClick, 
  onViewPublicProfile,
  onRefresh, 
  isRefreshing,
  unreadNotificationsCount = 0,
  onOpenNotifications
}) => {
  const isLive = partnerProfile?.verificationStatus === 'VERIFIED' || partnerProfile?.verificationStatus === 'ACTIVE';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3.5 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Mobile Menu Button & Tab Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 lg:hidden cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                {title}
              </h1>
              {isLive ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Setup Mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium truncate mt-0.5">
              <span className="font-semibold text-slate-700 truncate">{partnerProfile?.businessName || 'Business Partner'}</span>
              <span>•</span>
              <span className="text-emerald-800 font-semibold">{partnerProfile?.city || partnerProfile?.district || 'Uttarakhand'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Primary and Secondary CTAs */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Data"
            className="p-2 sm:p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-emerald-700' : ''} />
          </button>

          {/* Secondary CTA: View Public Profile */}
          <button
            onClick={onViewPublicProfile}
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl border border-stone-200 hover:border-emerald-800/40 bg-white hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-900 text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Eye size={14} className="text-emerald-700" />
            <span className="hidden md:inline">View Public Profile</span>
            <span className="md:hidden">Preview</span>
          </button>

          {/* Primary CTA: Add Service */}
          <button
            onClick={onAddListingClick}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} />
            <span>+ Add Service</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default PartnerHeader;
