import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Car,
  Home,
  Compass,
  AlertCircle
} from 'lucide-react';
import { getFirstValidImage } from '../../utils/imageUtils';

export default function CustomerPreviewModal({
  isOpen,
  onClose,
  service,
  partnerProfile
}) {
  if (!isOpen) return null;

  const isProfileMode = !service && partnerProfile;
  const title = service ? (service.title || service.name) : (partnerProfile?.businessName || 'Partner Business');
  const category = service?.category || service?.listingType || partnerProfile?.partnerType || 'Tourism Service';
  const price = service?.pricing?.amount || service?.price || 0;
  const unit = service?.pricing?.unit || 'night';
  const district = service?.district || partnerProfile?.district || 'Uttarakhand';
  const city = service?.city || partnerProfile?.city || '';
  const photos = service?.images || partnerProfile?.photos || [];
  const heroImage = photos.length > 0 
    ? (photos[0]?.url || photos[0]) 
    : getFirstValidImage([], category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Preview Banner */}
        <div className="bg-[#0f3d2e] text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Customer Marketplace Preview</span>
            <span className="text-emerald-300 font-mono text-[10px] hidden sm:inline">— Booking Disabled in Preview</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Hero Visual */}
          <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
            <img
              src={heroImage}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#0f3d2e] text-xs font-bold shadow-md">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>Verified Partner Listing</span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-gradient-to-t from-stone-950/80 via-stone-950/40 to-transparent text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md">
                {category}
              </span>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                {title}
              </h3>
            </div>
          </div>

          {/* Business & Location Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <MapPin size={13} className="text-emerald-700" />
                <span>{city ? `${city}, ${district}` : district}, Uttarakhand</span>
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                Hosted by: <span className="text-[#0f3d2e]">{partnerProfile?.businessName || 'Local Pahadi Partner'}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Star size={13} className="fill-emerald-600 text-emerald-600" />
              <span>4.9 (Verified Reviews)</span>
            </div>
          </div>

          {/* Service Specs / Details */}
          {service && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Service Highlights</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {service.listingType === 'Stay' && (
                  <>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
                      <Home size={15} className="text-emerald-700" />
                      <span>{service.stayDetails?.roomType || 'Private Room'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
                      <Users size={15} className="text-emerald-700" />
                      <span>Max {service.stayDetails?.maxGuests || 4} Guests</span>
                    </div>
                  </>
                )}

                {(service.listingType === 'Rental' || service.listingType === 'Transport') && (
                  <>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
                      <Car size={15} className="text-emerald-700" />
                      <span>{service.vehicleDetails?.model || 'Mountain 4x4'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
                      <Users size={15} className="text-emerald-700" />
                      <span>{service.vehicleDetails?.seatingCapacity || 4} Seats</span>
                    </div>
                  </>
                )}

                {service.listingType === 'Guide' && (
                  <>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
                      <Compass size={15} className="text-emerald-700" />
                      <span>Certified Trekker</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
                      <Clock size={15} className="text-emerald-700" />
                      <span>{service.guideDetails?.experienceYears || 5}+ Yrs Exp</span>
                    </div>
                  </>
                )}

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-700" />
                  <span>AMS Support</span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">About This Offering</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {service.description || 'Authentic Himalayan hospitality backed by Discovery Uttarakhand verified safety standards and direct host assistance.'}
                </p>
              </div>
            </div>
          )}

          {/* Public Profile Mode (All Offerings Summary) */}
          {isProfileMode && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Business Overview</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {partnerProfile.description || 'Official hospitality & mobility partner registered with Discovery Uttarakhand.'}
              </p>
              
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Operating Hours:</div>
                  <div className="text-stone-500">{partnerProfile.operatingHours || '08:00 AM - 08:00 PM'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">Service Coverage:</div>
                  <div className="text-emerald-800 font-medium">{partnerProfile.city || district}, Uttarakhand</div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing & Customer CTA Simulation */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">Marketplace Price</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  ₹{Number(price).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-500 font-medium">/ {unit}</span>
              </div>
            </div>

            <div className="relative group">
              <button
                type="button"
                disabled
                className="px-6 py-3 rounded-2xl bg-stone-300 text-stone-600 text-xs font-bold cursor-not-allowed flex items-center gap-1.5"
              >
                <span>Book Now</span>
                <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-500">Preview Mode</span>
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-amber-600" />
            <span>This is exactly what travelers see on the Discovery Uttarakhand mobile web portal.</span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">Customer Preview Mode</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
