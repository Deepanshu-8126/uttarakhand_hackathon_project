import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Wifi, Car, Coffee, Mountain, Eye, ShieldCheck, CheckCircle2, ChevronRight, X, Lock, Plus } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import ImageCarousel from './common/ImageCarousel';
import { getCardImages } from '../utils/imageHelpers';
import { useMapStore } from '../store/mapStore';

export default function StayCard({ stay }) {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  const getFormattedPrice = (price, pricePerNight) => {
    if (!price && !pricePerNight) return null;
    if (typeof price === 'object' && price !== null) {
      if (price.amount !== undefined && price.amount !== null) {
        return typeof price.amount === 'number' ? price.amount.toLocaleString('en-IN') : String(price.amount);
      }
      return null;
    }
    const val = price || pricePerNight;
    if (typeof val === 'number') return val.toLocaleString('en-IN');
    if (typeof val === 'string' && val.trim() !== '') return val;
    return null;
  };

  const formattedPrice = getFormattedPrice(stay.price, stay.pricePerNight);
  const locationText = typeof stay.location === 'string' 
    ? stay.location 
    : (stay.city ? `${stay.city}${stay.district ? `, ${stay.district}` : ''}` : (stay.district || 'Uttarakhand'));

  const images = getCardImages(stay, (stay.isGovt || stay.name?.includes('KMVN')) ? '/assets/kmvn-stay.svg' : '/assets/fallback.svg');
  const stayId = stay._id || stay.slug || stay.id;

  const handleBadgeClick = (e) => {
    e.stopPropagation();
    if (window.innerWidth < 640) {
      setShowMobileSheet(true);
    } else {
      setShowTooltip(!showTooltip);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden card-shadow group border border-stone-200/80 hover:border-stone-300 transition-all duration-300 h-full flex flex-col justify-between">
        
        {/* ── 1. Image Container (16:9 on Mobile, 240px Desktop) ────────────────────── */}
        <div className="relative aspect-[16/9] sm:h-60 w-full overflow-hidden bg-stone-100">
          <ImageCarousel
            images={images}
            alt={stay.name}
            aspectRatio="aspect-[16/9] sm:h-60 w-full"
          />
          
          {/* Top-Left: Prominent 3-Layer Verified Green Shield Badge */}
          <div 
            className="absolute top-3.5 left-3.5 z-30"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={handleBadgeClick}
          >
            <button 
              type="button"
              className="bg-[#0f3d2e] text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-emerald-400/30 cursor-pointer active:scale-95 transition-transform"
            >
              <ShieldCheck size={13} className="text-emerald-300 shrink-0" />
              <span>3-Layer Verified</span>
            </button>

            {/* Clean Desktop Hover Tooltip */}
            {showTooltip && (
              <div className="hidden sm:block absolute left-0 top-full mt-1.5 w-64 p-3 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-xl text-[11px] font-medium z-50 border border-slate-700 animate-in fade-in duration-150">
                <div className="font-bold text-emerald-300 text-xs mb-1 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Verified Trust Guarantee</span>
                </div>
                <p className="text-slate-300 leading-relaxed m-0 text-[10.5px]">
                  GPS Verified • Video KYC Passed • Live Selfie Matched
                </p>
              </div>
            )}
          </div>

          {/* Top-Right: Rating & Favorite */}
          <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
            {stay.rating && stay.rating > 0 && (
              <div className="bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span>{stay.rating}</span>
              </div>
            )}
            <FavoriteButton 
              itemType="stay" 
              item={stay} 
              className="min-h-[44px] min-w-[44px] rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 hover:text-red-500 hover:bg-white transition-all shadow-sm"
              size={15}
            />
          </div>
        </div>

        {/* ── 2. Card Content ───────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
          <div>
            {/* Category Tag */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                {stay.category || 'Verified Homestay'}
              </span>
              <span className="text-[10px] text-stone-400 font-semibold">
                Escrow Protected
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-[#0f3d2e] transition-colors line-clamp-1">
              {stay.name}
            </h3>
            
            {/* Location */}
            <p className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-1">
              <span className="text-slate-400">📍</span>
              <span className="truncate">{locationText}</span>
            </p>

            {/* Facilities / Amenities */}
            {Array.isArray(stay.facilities) && stay.facilities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {stay.facilities.slice(0, 3).map((f, i) => (
                  <span key={i} className="text-[10px] bg-stone-100 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── 3. Price & Action Bar ───────────────────────────────────── */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                Official Rate
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-black text-slate-900">
                  ₹{formattedPrice || '2,400'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">/ night</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  useMapStore.getState().openAddToTripModal({
                    id: stayId,
                    name: stay.name,
                    type: 'stay',
                    location: locationText,
                    price: formattedPrice,
                    image: images[0],
                    rating: stay.rating || 4.8
                  });
                }}
                className="min-h-[44px] px-2.5 rounded-xl border border-stone-200 hover:border-[#0f3d2e] hover:bg-emerald-50 text-slate-700 hover:text-[#0f3d2e] transition flex items-center justify-center gap-1 text-xs font-bold cursor-pointer shadow-2xs group/add"
                title="Add to Itinerary Day"
              >
                <Plus size={15} className="group-hover/add:rotate-90 transition-transform text-emerald-800" />
                <span className="hidden sm:inline">Add to Trip</span>
              </button>

              <Link
                to={`/checkout/stay/${stayId}`}
                className="min-h-[44px] px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#09261c] text-white text-xs font-bold transition shadow-xs flex items-center justify-center active:scale-95"
              >
                Book
              </Link>
              <Link
                to={`/stays/${stay.slug || stayId}`}
                className="min-h-[44px] min-w-[36px] sm:min-w-[44px] rounded-xl border border-stone-200 hover:bg-stone-50 text-slate-600 transition flex items-center justify-center"
                title="View Details"
              >
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* ── Mobile Bottom Sheet for 3-Layer Verified Badge (<640px) ── */}
      {showMobileSheet && (
        <div className="sm:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowMobileSheet(false)} />
          <div className="relative w-full bg-[#fdfbf7] rounded-t-3xl p-6 border-t border-stone-200 shadow-2xl z-10 animate-in slide-in-from-bottom-8 duration-200">
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4" />
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-emerald-300 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-stone-900 leading-tight">
                    3-Layer Verified Trust
                  </h4>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase">
                    Zero Advance Scam Protection
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowMobileSheet(false)}
                className="w-8 h-8 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs text-stone-700">
              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-stone-200">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-stone-900 block font-bold">GPS Geo-Fence Verified</strong>
                  <p className="text-[11px] text-stone-500 mt-0.5">Physical property location and mountain road access confirmed via satellite telemetry.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-stone-200">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-stone-900 block font-bold">Govt / Video KYC Passed</strong>
                  <p className="text-[11px] text-stone-500 mt-0.5">Host identity and Tourism Department homestay permit verified.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-stone-200">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-stone-900 block font-bold">Live Selfie &amp; Handshake OTP</strong>
                  <p className="text-[11px] text-stone-500 mt-0.5">Payment is held securely in Escrow and released only when you share your 4-digit check-in OTP.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileSheet(false)}
              className="w-full py-3 bg-[#0f3d2e] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
