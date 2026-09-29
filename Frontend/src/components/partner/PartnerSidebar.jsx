import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  CalendarCheck, 
  Clock, 
  Tag, 
  DollarSign, 
  TrendingDown, 
  BarChart3, 
  MessageSquare, 
  Building2, 
  ArrowLeft,
  ShieldCheck, 
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Car,
  Bell,
  HelpCircle,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PartnerSidebar = ({ activeTab, setActiveTab, partnerProfile, isOpen, onClose }) => {
  const [showMoreTools, setShowMoreTools] = useState(
    ['verification', 'documents', 'availability', 'pricing', 'expenses', 'analytics', 'settlements', 'notifications', 'support', 'settings'].includes(activeTab)
  );

  const isTransport = [
    'VehicleRental', 'TransportOperator', 'MobilityPartner', 'DriverPartner', 'SharedRideOperator'
  ].includes(partnerProfile?.partnerType);

  const primaryNav = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'profile', label: 'My Business', icon: Building2 },
    { 
      id: 'listings', 
      label: isTransport ? 'My Fleet & Services' : 'My Services', 
      icon: isTransport ? Car : Layers 
    },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'earnings', label: 'Earnings & Payouts', icon: DollarSign },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  ];

  const moreTools = [
    { id: 'verification', label: 'Verification Status', icon: ShieldCheck },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'availability', label: 'Availability Calendar', icon: Clock },
    { id: 'pricing', label: 'Pricing Matrix', icon: Tag },
    { id: 'expenses', label: 'Expenses & P&L', icon: TrendingDown },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'support', label: 'Support & Help', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck size={12} /> Live ✓
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle size={12} /> Under Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Needs Changes
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            Setup Mode
          </span>
        );
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#FCFDFD] border-r border-stone-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand / Logo */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-white">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Discovery Uttarakhand"
              className="w-10 h-10 object-contain rounded-xl shadow-xs border border-emerald-900/10 bg-white shrink-0"
            />
            <div className="min-w-0">
              <div className="text-sm font-bold text-stone-900 tracking-tight leading-none truncate">
                Discovery Uttarakhand
              </div>
              <div className="text-[11px] font-semibold text-emerald-800 mt-1 uppercase tracking-wider">
                Partner Business Center
              </div>
            </div>
          </Link>
        </div>

        {/* Partner Identity Pill */}
        <div className="p-3.5 mx-4 mt-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-stone-900 truncate">
                {partnerProfile?.businessName || 'My Tourism Business'}
              </h4>
              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                {partnerProfile?.partnerType || 'Partner'} • {partnerProfile?.city || partnerProfile?.district || 'Uttarakhand'}
              </p>
            </div>
            <div className="shrink-0">
              {getStatusBadge(partnerProfile?.verificationStatus)}
            </div>
          </div>
        </div>

        {/* Quick Add Action */}
        <div className="px-4 mt-3">
          <button
            onClick={() => {
              setActiveTab('add-listing');
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>+ Add Service</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-4 py-3 overflow-y-auto space-y-1">
          {/* Primary Core Items */}
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-wider px-2 py-1">
            Core Operations
          </div>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'earnings' && activeTab === 'settlements');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0f3d2e] text-white shadow-xs font-bold'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-white' : 'text-stone-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Collapsible More Business Tools */}
          <div className="pt-2">
            <button
              onClick={() => setShowMoreTools(!showMoreTools)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-black text-stone-400 uppercase tracking-wider hover:text-stone-700 transition-colors cursor-pointer"
            >
              <span>More Tools</span>
              {showMoreTools ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {showMoreTools && (
              <div className="mt-1 space-y-1 pl-1">
                {moreTools.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-900 font-bold'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-emerald-800' : 'text-stone-400'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer / Switch back to Tourist View */}
        <div className="p-4 border-t border-stone-200/80 bg-white space-y-2">
          <Link
            to="/profile"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Switch to Tourist View</span>
          </Link>
          <div className="text-[10px] text-center text-stone-400 font-medium">
            Discovery Uttarakhand Partner OS
          </div>
        </div>
      </aside>
    </>
  );
};

export default PartnerSidebar;
