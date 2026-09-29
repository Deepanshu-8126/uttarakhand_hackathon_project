import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Layers, 
  Edit3, 
  Trash2, 
  Clock, 
  Tag, 
  ShieldCheck, 
  AlertCircle, 
  Send, 
  ImageIcon,
  Car,
  Home,
  Compass,
  MapPin,
  Bike,
  Mountain,
  Eye,
  PauseCircle,
  PlayCircle,
  Star,
  X
} from 'lucide-react';

const categoryIcons = {
  rentals: Car,
  bike_rental: Bike,
  scooty_rental: Bike,
  car_rental: Car,
  stays: Home,
  guides: Compass,
  activities: Mountain,
  transport: Car,
  mobility: Car
};

const categoryLabels = {
  stays: 'Stay / Homestay',
  bike_rental: 'Bike Rental',
  scooty_rental: 'Scooty Rental',
  car_rental: 'Car / Taxi Fleet',
  rentals: 'Vehicle Rental',
  guides: 'Mountain Guide',
  activities: 'Activity / Trek',
  transport: 'Transport / Cab',
  mobility: 'Shared / Private Ride'
};

const STATUS_EXPLANATIONS = {
  ACTIVE: {
    title: 'Live on Discovery Uttarakhand',
    badge: 'Live ✓',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Your service is verified and visible to tourists across the state. Travelers can discover and book it immediately.'
  },
  VERIFIED: {
    title: 'Verified',
    badge: 'Verified ✓',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Admin verification approved. Your service is ready to receive traveler reservations.'
  },
  PENDING_VERIFICATION: {
    title: 'Under Review',
    badge: 'Under Review',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Our team is reviewing the information and photos you submitted. We ensure all platform listings meet quality and safety standards.'
  },
  REJECTED: {
    title: 'Needs Changes',
    badge: 'Needs Changes',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Your service requires updates before it can go live. Click Manage to review admin feedback, correct the details, and resubmit.'
  },
  DRAFT: {
    title: 'Draft',
    badge: 'Draft',
    color: 'bg-stone-100 text-stone-700 border-stone-200',
    description: 'This service is only visible to you. Complete any missing information and click "Submit for Review" when you are ready.'
  },
  SUSPENDED: {
    title: 'Temporarily Paused',
    badge: 'Paused',
    color: 'bg-stone-200 text-stone-700 border-stone-300',
    description: 'This service has been paused temporarily and is not accepting bookings right now.'
  }
};

const ListingsTab = ({ 
  listings = [], 
  onAddListing, 
  onEditListing, 
  onPreviewService,
  onManagePricing, 
  onManageAvailability, 
  onDeleteListing,
  onSubmitVerification,
  isDeleting
}) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusModalItem, setStatusModalItem] = useState(null);

  const filteredListings = listings.filter((item) => {
    let matchesCategory = true;
    if (filterCategory !== 'all') {
      if (filterCategory === 'bike_rental') {
        matchesCategory = item.category === 'bike_rental' || (item.category === 'rentals' && item.specifications?.vehicleType?.toLowerCase() === 'bike');
      } else if (filterCategory === 'car_rental') {
        matchesCategory = item.category === 'car_rental' || (item.category === 'rentals' && ['car', 'suv', 'tempo traveller'].includes(item.specifications?.vehicleType?.toLowerCase()));
      } else {
        matchesCategory = item.category === filterCategory || item.listingType?.toLowerCase() === filterCategory.toLowerCase();
      }
    }

    const matchesSearch = 
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusInfo = (rawStatus, isActive) => {
    if (rawStatus === 'ACTIVE' || (rawStatus === 'VERIFIED' && isActive)) return STATUS_EXPLANATIONS.ACTIVE;
    if (rawStatus === 'VERIFIED') return STATUS_EXPLANATIONS.VERIFIED;
    if (rawStatus === 'PENDING_VERIFICATION') return STATUS_EXPLANATIONS.PENDING_VERIFICATION;
    if (rawStatus === 'REJECTED') return STATUS_EXPLANATIONS.REJECTED;
    if (rawStatus === 'SUSPENDED') return STATUS_EXPLANATIONS.SUSPENDED;
    return STATUS_EXPLANATIONS.DRAFT;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">My Services</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Operational control of your rooms, fleet vehicles, transport routes &amp; treks
          </p>
        </div>

        <button
          onClick={onAddListing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>+ Add Service</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service title, vehicle model or city..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:border-[#0f3d2e] focus:ring-1 focus:ring-[#0f3d2e]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'stays', label: 'Stays' },
            { id: 'car_rental', label: 'Cars & Taxis' },
            { id: 'bike_rental', label: 'Bikes' },
            { id: 'guides', label: 'Guides' },
            { id: 'activities', label: 'Treks' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterCategory(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterCategory === pill.id
                  ? 'bg-[#0f3d2e] text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center shadow-xs">
          <Layers size={36} className="text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Services Found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {searchQuery 
              ? 'No services match your search query.' 
              : 'You have not added any services in this category yet. Click "+ Add Service" to publish your first offering.'}
          </p>
          <button
            onClick={onAddListing}
            className="mt-4 px-4 py-2.5 rounded-xl bg-[#0f3d2e] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={14} /> <span>+ Add Service</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((item) => {
            const coverPhoto = 
              (item.photos && item.photos.length > 0 ? item.photos[0] : null) || 
              (item.images && item.images.length > 0 ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url) : null);
            
            const CategoryIcon = categoryIcons[item.category] || categoryIcons[item.listingType?.toLowerCase()] || Layers;
            const price = item.pricingDetails?.pricePerDay || item.pricing?.amount || item.pricing?.price || 0;
            const pricingUnit = item.pricing?.unit || (item.listingType === 'Stay' ? 'night' : item.listingType === 'Activity' ? 'person' : 'day');
            const statusInfo = getStatusInfo(item.status, item.isActive);

            return (
              <div 
                key={item._id} 
                className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Image Banner */}
                  <div className="relative h-44 bg-stone-100 overflow-hidden">
                    {coverPhoto ? (
                      <img 
                        src={coverPhoto} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50">
                        <ImageIcon size={28} />
                        <span className="text-[11px] mt-1">No photo uploaded</span>
                      </div>
                    )}

                    {/* Category Label */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-stone-900/80 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                        <CategoryIcon size={11} />
                        {categoryLabels[item.category] || item.category || item.listingType}
                      </span>
                    </div>

                    {/* Human Status Badge (Clickable for explanation) */}
                    <button
                      onClick={() => setStatusModalItem({ item, statusInfo })}
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-xs shadow-xs transition-transform hover:scale-105 cursor-pointer ${statusInfo.color}`}
                    >
                      {statusInfo.badge}
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-0.5 text-xs text-amber-600 font-bold shrink-0">
                        <Star size={12} className="fill-amber-500 text-amber-500" />
                        <span>{item.rating || 4.8}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <MapPin size={12} className="text-stone-400 shrink-0" />
                      <span className="truncate">{item.city || item.district || 'Uttarakhand'}</span>
                    </div>

                    {/* Price and Operational Status */}
                    <div className="pt-2 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-slate-900">
                          ₹{Number(price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-stone-500">/ {pricingUnit}</span>
                      </div>
                      <span className="text-[11px] text-stone-400 font-medium">
                        {item.bookingCount || 0} bookings
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: MANAGE + VIEW AS CUSTOMER */}
                <div className="p-4 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* MANAGE button */}
                    <button
                      onClick={() => onEditListing(item)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>Manage</span>
                    </button>

                    {/* VIEW AS CUSTOMER button */}
                    <button
                      onClick={() => onPreviewService && onPreviewService(item)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-800/40 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Inspect what travelers see"
                    >
                      <Eye size={12} className="text-emerald-700" />
                      <span>Preview</span>
                    </button>

                    {['DRAFT', 'REJECTED'].includes(item.status) && (
                      <button
                        onClick={() => onSubmitVerification(item._id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Send size={11} />
                        <span>Submit</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteListing(item._id, item.title)}
                    disabled={isDeleting}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove service"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Explanation Modal */}
      {statusModalItem && (
        <div className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Listing Status</span>
              <button 
                onClick={() => setStatusModalItem(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusModalItem.statusInfo.color}`}>
                {statusModalItem.statusInfo.badge}
              </span>
              <h4 className="text-sm font-bold text-stone-900">
                {statusModalItem.statusInfo.title}
              </h4>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {statusModalItem.statusInfo.description}
            </p>

            <button
              onClick={() => setStatusModalItem(null)}
              className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingsTab;
