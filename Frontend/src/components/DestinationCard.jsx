import React from 'react';
import { MapPin, Heart, ShieldCheck, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCardImages, getHimalayanFallbackImage } from '../utils/imageHelpers';
import { useFreshImage } from '../utils/images';
import { useFavorites } from '../context/FavoritesContext';

/**
 * Minimal & Clean DestinationCard with Fresh Pexels/HD Auto-Loading + Favorites Heart
 */
const DestinationCard = ({ destination, distance }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [heartAnim, setHeartAnim] = React.useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();
  const favored = isFavorite('destination', destination._id || destination.id || destination.slug);

  const handleToggleFavorite = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
    toggleFavorite('destination', destination);
  }, [destination, toggleFavorite]);

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

  const displayImages = React.useMemo(() => {
    return allImages.length > 0 ? allImages.slice(0, 5) : [getHimalayanFallbackImage(destination)];
  }, [allImages, destination]);

  const [currentImgIndex, setCurrentImgIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  // Auto-rotate destination photography with smooth cinematic blend
  React.useEffect(() => {
    if (displayImages.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % displayImages.length);
    }, 4200); // Cycles photo smoothly every 4.2 seconds
    return () => clearInterval(timer);
  }, [displayImages.length, isHovered]);

  const destinationSlug = typeof destination.slug === 'string' && destination.slug.length > 0
    ? destination.slug 
    : (typeof destination._id === 'string' ? destination._id : (destination.name ? destination.name.toLowerCase().replace(/\s+/g, '-') : 'uttarakhand'));

  return (
    <Link
      to={`/destinations/${destinationSlug}`}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-stone-200/80 group text-left"
    >
      {/* 1. Dynamic Auto-Cycling Destination Photo Carousel with Smooth Blend / Transition */}
      <div 
        className="relative h-48 sm:h-56 w-full overflow-hidden bg-stone-900 select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {displayImages.map((src, idx) => {
          const isActive = idx === (currentImgIndex % displayImages.length);
          return (
            <div
              key={src || idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out pointer-events-none will-change-[opacity,transform] ${
                isActive 
                  ? 'opacity-100 scale-100 z-10' 
                  : 'opacity-0 scale-105 z-0'
              }`}
            >
              <img
                src={src}
                alt={destination.name || 'Destination in Uttarakhand'}
                loading={idx === 0 ? 'eager' : 'lazy'}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getHimalayanFallbackImage(destination);
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          );
        })}

        {/* Ambient bottom vignette for pristine indicator contrast */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-20" />

        {/* ── Community Verified Badge (Top-Left) ── */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0f3d2e]/90 backdrop-blur-md border border-emerald-500/30 shadow-md">
          <ShieldCheck size={11} className="text-emerald-400 shrink-0" />
          <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider whitespace-nowrap">Community Verified</span>
        </div>

        {/* ── Heart / Favorites Button (Top-Right) ── */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          title={favored ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={favored ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-3 right-3 z-30 w-8 h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-md border transition-all duration-200 cursor-pointer
            ${favored
              ? 'bg-rose-500 border-rose-400/50 hover:bg-rose-400'
              : 'bg-white/90 border-white/50 hover:bg-white'
            } ${heartAnim ? 'scale-125' : 'scale-100'}`}
        >
          <Heart
            size={15}
            className={`transition-all duration-200 ${
              favored ? 'fill-white text-white' : 'fill-transparent text-stone-500 hover:text-rose-500'
            }`}
          />
        </button>

        {displayImages.length > 1 && (
          <div 
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md z-30 shadow-xs border border-white/10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {displayImages.map((_, idx) => {
              const isActive = idx === (currentImgIndex % displayImages.length);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImgIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    isActive
                      ? 'w-5 bg-[#00FF88] shadow-[0_0_8px_rgba(0,255,136,0.7)]'
                      : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`Show photo ${idx + 1}`}
                />
              );
            })}
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
