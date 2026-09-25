import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, CheckCircle2, ChevronRight, Car, Bike, X, Plus, Navigation } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import ImageCarousel from './common/ImageCarousel';
import { getCardImages } from '../utils/imageHelpers';
import { useMapStore } from '../store/mapStore';
import { calculateDistanceKm, UTTARAKHAND_CITY_COORDINATES } from '../utils/geoHelpers';

export default function RentalCard({ rental, userCoords }) {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  const getFormattedPrice = (price, pricePerDay) => {
    if (!price && !pricePerDay) return null;
    if (typeof price === 'object' && price !== null) {
      if (price.amount !== undefined && price.amount !== null) {
        return typeof price.amount === 'number' ? price.amount.toLocaleString('en-IN') : String(price.amount);
      }
      return null;
    }
    const val = price || pricePerDay;
    if (typeof val === 'number') return val.toLocaleString('en-IN');
    if (typeof val === 'string' && val.trim() !== '') return val;
    return null;
  };

  const formattedPrice = getFormattedPrice(rental.price, rental.pricePerDay);
  const locationText = rental.city 
    ? `${rental.city}${rental.district ? `, ${rental.district}` : ''}`
    : (rental.district || 'Uttarakhand');

  const isTwoWheeler = rental.type === 'Scooter' || rental.type === 'Motorcycle' || (rental.category && (rental.category.toLowerCase().includes('bike') || rental.category.toLowerCase().includes('scooter')));

  const images = getCardImages(rental);
  const hasImages = images.length > 0 && !images.includes('/assets/fallback.svg');
  const rentalId = rental._id || rental.slug || rental.id;

  const handleBadgeClick = (e) => {
    e.stopPropagation();
    if (window.innerWidth < 640) {
      setShowMobileSheet(true);
    } else {
      setShowTooltip(!showTooltip);
    }
  };

  const distanceKm = useMemo(() => {
    if (!userCoords || !Array.isArray(userCoords) || userCoords.length !== 2) return null;
    const [userLat, userLng] = userCoords;
    let rLat = null;
    let rLng = null;
    if (rental.location?.coordinates && rental.location.coordinates.length === 2) {
      rLng = rental.location.coordinates[0];
      rLat = rental.location.coordinates[1];
    } else if (rental.city) {
      const cityKey = rental.city.trim().toLowerCase();
      const coords = UTTARAKHAND_CITY_COORDINATES[cityKey];
      if (coords) {
        rLat = coords[0];
        rLng = coords[1];
      }
    }
    if (rLat !== null && rLng !== null) {
      return calculateDistanceKm(userLat, userLng, rLat, rLng);
    }
    return null;
  }, [userCoords, rental]);

  const getVehicleSpecs = (name = '', type = '') => {
    const n = (name + ' ' + type).toLowerCase();
    if (n.includes('himalayan') || n.includes('scram') || n.includes('xpulse')) {
      return [
        { label: '411cc High Torque', icon: '⚡' },
        { label: 'Luggage Panniers', icon: '🧳' },
        { label: 'Dual ABS', icon: '🛡️' },
        { label: '2 Helmets', icon: '🪖' },
      ];
    }
    if (n.includes('classic') || n.includes('bullet') || n.includes('meteor') || n.includes('hunter')) {
      return [
        { label: '349cc Engine', icon: '⚡' },
        { label: 'Hill Cruise Gear', icon: '⚙️' },
        { label: 'Pillion Backrest', icon: '🛡️' },
        { label: 'Helmet Included', icon: '🪖' },
      ];
    }
    if (n.includes('thar') || n.includes('gurkha') || n.includes('4x4')) {
      return [
        { label: '4x4 High/Low Range', icon: '🏔️' },
        { label: '2.2L mHawk Diesel', icon: '⚡' },
        { label: '226mm Clearance', icon: '📐' },
        { label: 'Hill Descent Control', icon: '🛡️' },
      ];
    }
    if (n.includes('scorpio') || n.includes('innova') || n.includes('fortuner') || n.includes('xuv')) {
      return [
        { label: '7-Seater SUV', icon: '👥' },
        { label: 'Turbo Diesel', icon: '⚡' },
        { label: 'All-Terrain Tires', icon: '🛞' },
        { label: 'Dual AC + Roof Rack', icon: '❄️' },
      ];
    }
    if (n.includes('activa') || n.includes('jupiter') || n.includes('ntorq') || n.includes('access') || n.includes('scooter')) {
      return [
        { label: '110cc Automatic', icon: '⚡' },
        { label: '50 km/l Fuel Avg', icon: '⛽' },
        { label: 'Boot Storage', icon: '📦' },
        { label: 'Helmet Included', icon: '🪖' },
      ];
    }
    return [
      { label: 'Pahadi Tested', icon: '🏔️' },
      { label: 'Full Insurance', icon: '📜' },
      { label: 'GPS Live Beacon', icon: '📡' },
      { label: 'Zero Security Deposit', icon: '💳' },
    ];
  };

  const specs = getVehicleSpecs(rental.name, rental.type || rental.category);

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden card-shadow flex flex-col h-full border border-stone-200/80 hover:border-stone-400 transition-all duration-300 justify-between">
        
        {/* ── 1. Image Container (16:9 Mobile, 4:3 Desktop) ───────────────────── */}
        <div className="relative aspect-[16/9] sm:aspect-[4/3] w-full overflow-hidden bg-stone-100 group">
          {hasImages ? (
            <ImageCarousel
              images={images}
              alt={rental.name}
              aspectRatio="aspect-[16/9] sm:aspect-[4/3] w-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-[#0f3d2e] p-4 select-none">
              {isTwoWheeler ? (
                <Bike size={40} className="text-[#0f3d2e]/70 mb-2" strokeWidth={1.5} />
              ) : (
                <Car size={40} className="text-[#0f3d2e]/70 mb-2" strokeWidth={1.5} />
              )}
              <span className="text-xs font-bold text-slate-800 text-center line-clamp-1">{rental.name}</span>
            </div>
          )}
          
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

            {/* Desktop Hover Tooltip */}
            {showTooltip && (
              <div className="hidden sm:block absolute left-0 top-full mt-1.5 w-64 p-3 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-xl text-[11px] font-medium z-50 border border-slate-700 animate-in fade-in duration-150">
                <div className="font-bold text-emerald-300 text-xs mb-1 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Verified Vehicle Fleet</span>
                </div>
                <p className="text-slate-300 leading-relaxed m-0 text-[10.5px]">
                  GPS Verified • Video KYC Passed • Live Selfie Matched
                </p>
              </div>
            )}
          </div>

          {/* Top-Right: Favorite Button */}
          <div className="absolute top-3.5 right-3.5 z-20">
            <FavoriteButton 
              itemType="rental" 
              item={rental} 
              className="min-h-[44px] min-w-[44px] rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 hover:text-red-500 hover:bg-white transition-all shadow-sm"
              size={15}
            />
          </div>
        </div>

        {/* ── 2. Card Content ───────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300/60">
                {rental.type || rental.category || 'Rental Vehicle'}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Escrow Protected
              </span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-[#0f3d2e] transition-colors line-clamp-1">
              {rental.name}
            </h3>

            <div className="text-xs text-slate-600 font-medium mb-2.5 flex items-center justify-between gap-1">
              <span className="flex items-center gap-1 truncate">
                <span className="text-emerald-700">📍</span>
                <span className="truncate font-semibold">{locationText}</span>
              </span>
              {distanceKm !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                  distanceKm <= 8 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                }`}>
                  <Navigation size={9} className="rotate-45" />
                  <span>{distanceKm <= 8 ? 'In your city' : `~${distanceKm} km`}</span>
                </span>
              )}
            </div>

            {/* Technical Mountain Vehicle Specs Grid */}
            <div className="grid grid-cols-2 gap-1.5 mb-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
              {specs.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700 truncate">
                  <span className="text-xs">{spec.icon}</span>
                  <span className="truncate">{spec.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3. Price & Action Bar ───────────────────────────────────── */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                Daily Tariff
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-black text-slate-900">
                  ₹{formattedPrice || '3,500'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">/ day</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  useMapStore.getState().openAddToTripModal({
                    id: rentalId,
                    name: rental.name,
                    type: 'rental',
                    location: locationText,
                    price: formattedPrice,
                    image: images[0],
                    rating: rental.rating || 4.8
                  });
                }}
                className="min-h-[44px] px-2.5 rounded-xl border border-stone-200 hover:border-[#0f3d2e] hover:bg-emerald-50 text-slate-700 hover:text-[#0f3d2e] transition flex items-center justify-center gap-1 text-xs font-bold cursor-pointer shadow-2xs group/add"
                title="Add to Itinerary Day"
              >
                <Plus size={15} className="group-hover/add:rotate-90 transition-transform text-emerald-800" />
                <span className="hidden sm:inline">Add to Trip</span>
              </button>

              <Link
                to={`/checkout/rental/${rentalId}`}
                className="min-h-[44px] px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#09261c] text-white text-xs font-bold transition shadow-xs flex items-center justify-center active:scale-95"
              >
                Book
              </Link>
              <Link
                to={`/rentals`}
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
                    3-Layer Verified Vehicle Fleet
                  </h4>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase">
                    Zero Advance Breakdown Risk
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
                  <strong className="text-stone-900 block font-bold">GPS Geofence &amp; Fitness Pass</strong>
                  <p className="text-[11px] text-stone-500 mt-0.5">Commercial vehicle permit, mountain fitness certificate, and live GPS beacon verified.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-stone-200">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-stone-900 block font-bold">Video KYC Passed Driver/Host</strong>
                  <p className="text-[11px] text-stone-500 mt-0.5">Driver license, police verification, and fleet owner KYC verified.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-stone-200">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-stone-900 block font-bold">Handshake OTP Release</strong>
                  <p className="text-[11px] text-stone-500 mt-0.5">Payment stays locked in Escrow. Share your 4-digit OTP only after checking keys and taking test drive.</p>
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
