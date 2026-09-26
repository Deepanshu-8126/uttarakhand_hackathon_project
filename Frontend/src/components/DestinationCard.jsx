import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCardImages, getHimalayanFallbackImage } from '../utils/imageHelpers';
import { useFreshImage } from '../utils/images';

/**
 * Minimal & Clean DestinationCard with Fresh Pexels/HD Auto-Loading
 */
const DestinationCard = ({ destination, distance }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const locationParts = [destination.district, destination.region].filter(Boolean);
  const locationLabel = locationParts.length > 0 ? locationParts.join(' • ') : (destination.district || 'Uttarakhand');

  // 1. Gather all available photos (DB images array, gallery, local mapping)
  const allImages = React.useMemo(() => {
    const list = [];
    if (typeof destination.coverImage === 'string' && destination.coverImage) list.push(destination.coverImage);
    else if (destination.coverImage?.url) list.push(destination.coverImage.url);
    if (destination.image) list.push(destination.image);
    if (destination.imageUrl) list.push(destination.imageUrl);

    const helperImages = getCardImages(destination);
    if (Array.isArray(helperImages)) list.push(...helperImages);

    if (Array.isArray(destination.gallery)) {
      destination.gallery.forEach((g) => {
        if (typeof g === 'string') list.push(g);
        else if (g?.url) list.push(g.url);
      });
    }

    const fallback = getHimalayanFallbackImage(destination);
    if (fallback && !list.includes(fallback)) list.push(fallback);

    return Array.from(new Set(list.filter(Boolean)));
  }, [destination]);

  const [currentImgIndex, setCurrentImgIndex] = React.useState(0);

  // Auto-rotate destination photography smoothly
  React.useEffect(() => {
    if (allImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
    }, 4500); // Cycles photo smoothly every 4.5 seconds
    return () => clearInterval(timer);
  }, [allImages]);

  const activeImageSrc = allImages[currentImgIndex] || allImages[0] || getHimalayanFallbackImage(destination);

  const destinationSlug = typeof destination.slug === 'string' && destination.slug.length > 0
    ? destination.slug 
    : (typeof destination._id === 'string' ? destination._id : (destination.name ? destination.name.toLowerCase().replace(/\s+/g, '-') : 'uttarakhand'));

  return (
    <Link
      to={`/destinations/${destinationSlug}`}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-stone-200/80 group text-left"
    >
      {/* 1. Dynamic Auto-Cycling Destination Photo Carousel */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-stone-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-pulse" />
        )}
        <img
          key={activeImageSrc}
          src={activeImageSrc}
          alt={destination.name || 'Destination in Uttarakhand'}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getHimalayanFallbackImage(destination);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        />

        {/* Gallery Dots Indicator if multiple photos exist */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs">
            {allImages.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === (currentImgIndex % 5) ? 'w-4 bg-emerald-400' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
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
