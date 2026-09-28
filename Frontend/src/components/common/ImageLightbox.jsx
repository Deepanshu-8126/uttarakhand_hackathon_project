import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';

export default function ImageLightbox({ images = [], activeIndex = 0, onClose, onNavigate }) {
  useEffect(() => {
    if (!images || images.length === 0) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      } else if (e.key === 'ArrowLeft') {
        onNavigate?.((activeIndex - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        onNavigate?.((activeIndex + 1) % images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, images, onClose, onNavigate]);

  if (!images || images.length === 0) return null;

  const current = images[activeIndex] || images[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    onNavigate?.((activeIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    onNavigate?.((activeIndex + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-stone-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-6 transition-all duration-300 animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between z-20 text-white pt-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="bg-[#0f3d2e] text-[#00FF88] px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border border-[#00FF88]/30 flex items-center gap-1.5">
            <Sparkles size={12} />
            <span>4K Telemetry Visual</span>
          </span>
          <span className="text-white/60 text-xs font-semibold">
            {activeIndex + 1} of {images.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
          aria-label="Close Lightbox"
        >
          <X size={20} />
        </button>
      </div>

      {/* Center Image Container with Navigation Arrows */}
      <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center py-4">
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-[#0f3d2e] text-white transition-all backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Previous Image"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div className="relative max-h-[75vh] max-w-full flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-black/40" onClick={(e) => e.stopPropagation()}>
          <img
            src={current.url || current}
            alt={current.title || 'Uttarakhand High-Res Landscape'}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl select-none"
          />
        </div>

        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-[#0f3d2e] text-white transition-all backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Next Image"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom Info & Thumbnails Strip */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-3 z-20 pb-2" onClick={(e) => e.stopPropagation()}>
        {current.title && (
          <div className="text-center">
            <p className="text-white text-sm sm:text-base font-bold drop-shadow-md">
              {current.title}
            </p>
            {current.source && (
              <span className="text-white/50 text-xs inline-flex items-center gap-1 mt-0.5">
                <span>Source: {current.source}</span>
                {current.source.startsWith('http') && <ExternalLink size={10} />}
              </span>
            )}
          </div>
        )}

        {/* Thumbnails row */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 no-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onNavigate?.(i)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  activeIndex === i
                    ? 'border-[#00FF88] scale-105 shadow-md shadow-[#00FF88]/30'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img.thumb || img.url || img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
