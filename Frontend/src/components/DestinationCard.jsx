import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCardImages, getHimalayanFallbackImage } from '../utils/imageHelpers';
import { useFreshImage } from '../utils/images';

/**
 * Minimal & Clean DestinationCard with Fresh Pexels/HD Auto-Loading
 */
const DestinationCard = ({ destination, distance }) => {
  const locationParts = [destination.district, destination.region].filter(Boolean);
  const locationLabel = locationParts.length > 0 ? locationParts.join(' • ') : (destination.district || 'Uttarakhand');

  const images = getCardImages(destination);
  const baseFallback = images[0] || getHimalayanFallbackImage(destination);
  const coverImage = useFreshImage(destination.slug || destination.name, baseFallback);

  return (
    <Link
      to={`/destinations/${destination.slug || destination._id}`}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-stone-200/80 group text-left"
    >
      {/* 1. Clean Destination Photo with Self-Healing Fallback */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-stone-100">
        <img
          src={coverImage}
          alt={destination.name || 'Destination in Uttarakhand'}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getHimalayanFallbackImage(destination);
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>

      {/* 2. Content */}
      <div className="p-4 sm:p-6 flex flex-col flex-grow justify-between space-y-3 sm:space-y-4">
        <div>
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#1a4331] transition-colors leading-snug">
            {destination.name}
          </h3>

          {/* Location Name (District • Region) */}
          {locationLabel && (
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium my-2">
              <MapPin size={12} className="text-emerald-700 shrink-0" />
              <span>{locationLabel}</span>
            </div>
          )}

          {/* Description text */}
          <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
            {destination.shortDescription || destination.tagline || destination.description || 'Discover pristine mountain valleys, heritage, and serene landscapes across Uttarakhand.'}
          </p>

          {/* Distance badge if provided */}
          {distance && (
            <p className="text-emerald-800 text-xs font-bold flex items-center gap-1 mt-2">
              <MapPin size={11} />
              {distance.toFixed(1)} km away
            </p>
          )}
        </div>

        {/* Footer with "EXPLORE →" button */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Devbhoomi</span>
            <span className="text-xs font-bold text-slate-700">Experience</span>
          </div>
          <span className="bg-[#1a4331] text-white text-xs font-bold px-5 py-2 rounded-xl group-hover:bg-[#245a43] transition-colors uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <span>Explore</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default DestinationCard;
