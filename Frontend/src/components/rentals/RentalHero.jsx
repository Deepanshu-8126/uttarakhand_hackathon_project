import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, Shield, ShieldCheck, MapPin, ChevronLeft, ChevronRight, 
  Play, Pause, Sparkles, Navigation, LocateFixed, Zap, Star,
  Compass
} from 'lucide-react';

const RENTAL_SLIDES = [
  {
    title: 'Rent Your Mountain Ride',
    subtitle: 'Your road. Your pace. Zero hidden charges.',
    description: 'Conquer steep hairpins, misty pine passes & sacred valleys with 100% hill-tested 4x4 SUVs, cruisers & sedans.',
    tag: 'Alpine Mountain Highway',
    hubText: 'Char Dham All-Weather Corridor (NH-07 / NH-58)',
    // Reliable high-resolution scenic driving & mountain highway imagery
    src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=85&w=1920&auto=format&fit=crop',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-on-a-curved-road-in-the-mountains-41544-large.mp4',
    badge: '4x4 & All-Weather Ready',
    stats: '45+ Fleets Active Today'
  },
  {
    title: '4x4 Snow & Terrain Expeditions',
    subtitle: 'Engineered for high gradients & mountain trust.',
    description: 'Specialized 4-wheel-drive Mahindra Thar, Scorpio & Isuzu fleets inspected for steep ascents, monsoon grip & gravel passes.',
    tag: 'High-Altitude 4x4 Expedition',
    hubText: 'Joshimath • Mana • Tungnath • Munsiyari Pass',
    src: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=85&w=1920&auto=format&fit=crop',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-fog-over-the-mountain-forest-41551-large.mp4',
    badge: 'Braking & Grip Inspected',
    stats: '100% Mountain Tested'
  },
  {
    title: 'Royal Enfield & Himalayan Touring',
    subtitle: 'Pure Himalayan freedom along sacred rivers.',
    description: 'Fully equipped Royal Enfield Himalayan 450, Scram & Classic 350 ready with luggage panniers, crash guards & USB charging.',
    tag: 'Bike & Solo Cruiser Circuit',
    hubText: 'Rishikesh • Dehradun • Haridwar Railhead Pickups',
    src: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=85&w=1920&auto=format&fit=crop',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-mountain-stream-flowing-down-a-valley-41549-large.mp4',
    badge: 'Touring Panniers Included',
    stats: 'Instant Railhead Pickup'
  },
  {
    title: 'Chauffeur & Self-Drive Hill Cabs',
    subtitle: 'From airport & railway gate directly to the hills.',
    description: 'Verified native pahadi drivers with 10+ years experience in snow, fog & high passes. 0% commission transparent rates.',
    tag: 'Gateway City Hubs',
    hubText: 'Jolly Grant Airport • Kathgodam Station • Haldwani Hub',
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=85&w=1920&auto=format&fit=crop',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-over-mountain-peaks-41548-large.mp4',
    badge: 'Zero Surge Guarantee',
    stats: '15+ Gateway City Hubs'
  }
];

export default function RentalHero({
  categories = [],
  selectedCategory = 'All',
  onSelectCategory,
  onDetectLocation,
  isDetectingLocation = false,
  userLocation = null
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoErrors, setVideoErrors] = useState({});
  const videoRefs = useRef([]);

  // Auto-advance slides every 5.5s when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % RENTAL_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // When active slide changes, try to play its video
  useEffect(() => {
    const video = videoRefs.current[currentIndex];
    if (video && !videoErrors[currentIndex]) {
      video.currentTime = 0;
      video.play().catch(() => {
        // Autoplay may be restricted by browser until user gesture
      });
    }
  }, [currentIndex, videoErrors]);

  const handleVideoError = (idx) => {
    setVideoErrors((prev) => ({ ...prev, [idx]: true }));
  };

  const currentSlide = RENTAL_SLIDES[currentIndex];

  const quickPills = [
    { label: 'All Fleets', value: 'All', icon: '🌟' },
    { label: '4x4 Mountain SUVs', value: 'SUV', icon: '🚙' },
    { label: 'Bikes & Cruisers', value: 'Bike', icon: '🏍️' },
    { label: 'Self-Drive Sedans', value: 'Sedan', icon: '🚗' },
    { label: 'Scooters', value: 'Scooter', icon: '🛵' },
    { label: 'Tempo Travelers', value: 'Tempo Traveler', icon: '🚐' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-8">
      <div className="relative w-full min-h-[460px] sm:min-h-[500px] md:min-h-[540px] rounded-[2.5rem] overflow-hidden bg-stone-900 shadow-2xl flex flex-col justify-between p-6 sm:p-10 md:p-12 text-white group select-none">
        
        {/* ── 1. Layered Background Media with Seamless Crossfade & Ken-Burns Zoom ── */}
        {RENTAL_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const hasError = videoErrors[idx];

          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            >
              {slide.videoSrc && !hasError ? (
                <video
                  ref={(el) => (videoRefs.current[idx] = el)}
                  src={slide.videoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onError={() => handleVideoError(idx)}
                  className="w-full h-full object-cover object-center scale-102"
                />
              ) : (
                <img
                  src={slide.src}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center ken-burns-hero"
                />
              )}
            </div>
          );
        })}

        {/* ── 2. Cinematic Gradient Overlay ── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/60 z-1" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/30 z-1" />

        {/* ── 3. Top Floating Glassmorphic Header & Status Bar ── */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Active Corridor & Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-black text-emerald-300 tracking-wide uppercase text-[11px]">
              {currentSlide.tag}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-white/90 font-medium text-[11px] truncate max-w-[200px] sm:max-w-none">
              {currentSlide.hubText}
            </span>
          </div>

          {/* Quick GPS & Verification Badge */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white shadow-sm">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>{currentSlide.badge}</span>
            </div>

            {onDetectLocation && (
              <button
                type="button"
                onClick={onDetectLocation}
                disabled={isDetectingLocation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/40 text-[11px] font-black text-white shadow-sm transition-all cursor-pointer disabled:opacity-70 active:scale-95"
                title="Match nearest vehicle hub via GPS"
              >
                {isDetectingLocation ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : userLocation ? (
                  <>
                    <LocateFixed size={13} className="text-emerald-200" />
                    <span>📍 {userLocation.city || 'Hub Located'}</span>
                  </>
                ) : (
                  <>
                    <LocateFixed size={13} className="text-emerald-200" />
                    <span>Auto-Match Hub</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── 4. Main Hero Typography & Dynamic Slide Content ── */}
        <div className="relative z-10 my-auto py-6 sm:py-8 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black tracking-wider uppercase mb-3">
            <Sparkles size={11} />
            <span>Verified Himalayan Mountain Fleets</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] mb-3 drop-shadow-md">
            {currentSlide.title}
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-emerald-200/95 font-bold mb-3 drop-shadow-sm">
            {currentSlide.subtitle}
          </p>

          <p className="text-xs sm:text-sm md:text-base text-white/80 font-medium leading-relaxed max-w-2xl drop-shadow-sm">
            {currentSlide.description}
          </p>
        </div>

        {/* ── 5. Bottom Interactive Controls, Category Quick-Pills & Slide Indicators ── */}
        <div className="relative z-10 space-y-4 pt-2">
          
          {/* 1-Tap Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/60 shrink-0 mr-1 hidden sm:inline">
              Choose Vehicle:
            </span>
            {quickPills.map((pill) => {
              const isSelected = selectedCategory === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) {
                      onSelectCategory(pill.value);
                    }
                    // Smoothly scroll down to rentals list
                    const target = document.getElementById('rentals-fleet-grid');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-300 font-black scale-102'
                      : 'bg-black/40 hover:bg-black/60 text-white/90 border border-white/20 backdrop-blur-md'
                  }`}
                >
                  <span>{pill.icon}</span>
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Bar: Trust Badges & Slide Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/15">
            {/* Live Trust Metrics */}
            <div className="flex items-center gap-4 text-[11px] text-white/80 font-semibold overflow-x-auto no-scrollbar">
              <span className="flex items-center gap-1.5 shrink-0">
                <Shield size={13} className="text-emerald-400" />
                <span>100% Hill-Tested Fleet</span>
              </span>
              <span className="flex items-center gap-1.5 shrink-0">
                <Zap size={13} className="text-yellow-400" />
                <span>Instant Station &amp; Doorstep Delivery</span>
              </span>
              <span className="hidden md:flex items-center gap-1.5 shrink-0">
                <Star size={13} className="text-emerald-400" />
                <span>4.9★ Mountain Trust Score</span>
              </span>
            </div>

            {/* Slide Navigation Dots & Play/Pause */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition cursor-pointer"
                title={isPlaying ? 'Pause slideshow' : 'Resume slideshow'}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) => (prev - 1 + RENTAL_SLIDES.length) % RENTAL_SLIDES.length)
                }
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition cursor-pointer"
                title="Previous slide"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Progress Indicator Pills */}
              <div className="flex items-center gap-1.5 px-1">
                {RENTAL_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? 'w-7 bg-emerald-400 shadow-sm'
                        : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % RENTAL_SLIDES.length)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition cursor-pointer"
                title="Next slide"
              >
                <ChevronRight size={14} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
