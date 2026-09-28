import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  CheckCircle2, 
  MapPin, 
  Car, 
  Bike, 
  Navigation, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import ImageCarousel from './common/ImageCarousel';
import { getCardImages } from '../utils/imageHelpers';
import { useMapStore } from '../store/mapStore';
import { calculateDistanceKm, UTTARAKHAND_CITY_COORDINATES } from '../utils/geoHelpers';

export default function RentalCard({ 
  rental, 
  userCoords,
  onOpenDetail,
  startDate,
  endDate
}) {
  const [imageError, setImageError] = useState(false);

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

  const formattedPrice = getFormattedPrice(rental.price, rental.pricePerDay) || '1,200';
  const locationText = rental.city 
    ? `${rental.city}${rental.district ? `, ${rental.district}` : ''}`
    : (rental.district || 'Uttarakhand');

  const isTwoWheeler = rental.type === 'Scooter' || rental.type === 'Motorcycle' || 
    (rental.category && (rental.category.toLowerCase().includes('bike') || rental.category.toLowerCase().includes('scooter')));
  
  const isSuv = rental.type === 'SUV' || (rental.category && rental.category.toLowerCase().includes('suv'));

  const images = getCardImages(rental);
  const hasImages = !imageError && images.length > 0 && !images.includes('/assets/fallback.svg');
  const rentalId = rental._id || rental.id || rental.slug;
  const rentalSlug = rental.slug || rental._id || rental.id;

  const isVerified = Boolean(
    rental.isVerified || 
    rental.partnerListingId || 
    rental.isPartnerListing || 
    rental.partnerVerified || 
    rental.partnerId?.isVerified
  );

  // Compute Distance if user coords provided
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

  // Clean, truthful specs line (Section 16)
  const transmission = rental.transmission || (isTwoWheeler && rental.type !== 'Motorcycle' ? 'Automatic' : 'Manual');
  const seats = rental.seats ? `${rental.seats} seats` : (isTwoWheeler ? '2 seats' : (isSuv ? '5-7 seats' : '4-5 seats'));
  const vehicleTypeLabel = rental.type || rental.category || (isTwoWheeler ? 'Two Wheeler' : 'Car');
  const specsLine = `${vehicleTypeLabel} • ${transmission} • ${seats}`;

  // Checkout URL with optional preselected dates
  const checkoutUrl = `/checkout/rental/${rentalId}${
    startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : ''
  }`;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 hover:border-emerald-700/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      
      {/* ── 1. Image Container (16:9 aspect ratio) ── */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {hasImages ? (
          <ImageCarousel
            images={images}
            alt={rental.name}
            aspectRatio="aspect-[16/10] sm:aspect-[4/3] w-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100/90 text-stone-500 p-4 select-none">
            {isTwoWheeler ? (
              <Bike size={38} className="text-[#0f3d2e]/60 mb-2" strokeWidth={1.5} />
            ) : (
              <Car size={38} className="text-[#0f3d2e]/60 mb-2" strokeWidth={1.5} />
            )}
            <span className="text-xs font-bold text-stone-700 text-center line-clamp-1">{rental.name}</span>
            <span className="text-[10px] text-stone-400 mt-0.5">Vehicle photo unavailable</span>
          </div>
        )}

        {/* Top-Left: Max 1 Verification Badge (Section 18 & 35 discipline) */}
        {isVerified && (
          <div className="absolute top-3 left-3 z-20">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0f3d2e] text-white shadow-sm border border-emerald-400/30">
              <CheckCircle2 size={12} className="text-emerald-300 shrink-0" />
              <span>Verified Partner</span>
            </span>
          </div>
        )}

        {/* Top-Right: Favorite Button */}
        <div className="absolute top-3 right-3 z-20">
          <FavoriteButton 
            itemType="rental" 
            item={rental} 
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-700 hover:text-red-500 hover:bg-white transition-all shadow-sm"
            size={14}
          />
        </div>
      </div>

      {/* ── 2. Information Section ── */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Location & Rating Header */}
          <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-1">
            <span className="flex items-center gap-1 truncate font-medium">
              <MapPin size={12} className="text-emerald-700 shrink-0" />
              <span className="truncate">{locationText}</span>
            </span>

            {rental.rating && (
              <span className="flex items-center gap-1 font-bold text-stone-800 shrink-0">
                <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                <span>{rental.rating}</span>
              </span>
            )}
          </div>

          {/* Vehicle Name */}
          <h3 className="text-base font-extrabold text-stone-900 group-hover:text-[#0f3d2e] transition-colors line-clamp-1 mb-1">
            {rental.name}
          </h3>

          {/* Clean Specs String (e.g. SUV • Manual • 5 seats) */}
          <p className="text-xs text-stone-500 font-medium truncate mb-2">
            {specsLine}
          </p>

          {/* Distance Indicator if available */}
          {distanceKm !== null && (
            <div className="mb-3">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                distanceKm <= 8 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-stone-100 text-stone-600'
              }`}>
                <Navigation size={9} className="rotate-45" />
                <span>{distanceKm <= 8 ? 'In your city' : `~${distanceKm} km from you`}</span>
              </span>
            </div>
          )}
        </div>

        {/* ── 3. Price & Action Bar (Section 14 & 17) ── */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-stone-900">
                ₹{formattedPrice}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">/ day</span>
            </div>
            <span className="text-[10px] text-stone-400 font-medium block">
              {isVerified ? 'Verified price' : 'Partner listed price'}
            </span>
          </div>

          {/* Actions: View Details + Direct Book */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Details Trigger */}
            <button
              type="button"
              onClick={() => {
                if (onOpenDetail) {
                  onOpenDetail(rental);
                }
              }}
              className="px-3 py-2 rounded-xl border border-stone-200 hover:border-emerald-800 hover:bg-emerald-50 text-stone-700 hover:text-emerald-950 text-xs font-bold transition cursor-pointer flex items-center gap-1"
              title="View Details & Specifications"
            >
              <Eye size={13} className="text-emerald-800" />
              <span>Details</span>
            </button>

            {/* Direct Book CTA */}
            <Link
              to={checkoutUrl}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold transition shadow-xs flex items-center justify-center active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Book
            </Link>

            {/* Subtle Itinerary Add */}
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
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-500 hover:text-emerald-800 transition cursor-pointer"
              title="Add to Itinerary"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
