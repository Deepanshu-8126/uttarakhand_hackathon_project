import React from 'react';
import { Sparkles } from 'lucide-react';

const CategoryHero = ({ title, subtitle, description, bgImage, videoSrc = null, tag = null }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-10 select-none">
      <div className="relative w-full min-h-[380px] md:min-h-[460px] rounded-[2.5rem] overflow-hidden bg-stone-900 shadow-2xl flex flex-col items-center justify-center text-center p-6 sm:p-10 group">
        
        {/* Layered Media with Ken-Burns animation */}
        {videoSrc ? (
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-102"
          />
        ) : bgImage ? (
          <img 
            src={bgImage} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover object-center ken-burns-hero"
          />
        ) : null}

        {/* Cinematic dark / forest-green overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/60 z-1" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-1" />
        
        {/* Content */}
        <div className="relative z-10 px-4 max-w-3xl flex flex-col items-center justify-center my-auto">
          {tag && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] sm:text-xs font-black tracking-wider uppercase mb-3 shadow-sm backdrop-blur-md">
              <Sparkles size={12} />
              <span>{tag}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight drop-shadow-lg leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-lg sm:text-xl md:text-2xl text-emerald-200/95 font-bold drop-shadow-md mb-3">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-xs sm:text-sm md:text-base text-white/80 font-medium drop-shadow-md max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Subtle bottom glowing indicator bar */}
        <div className="relative z-10 flex items-center gap-2 pt-2 text-[11px] text-white/60 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Uttarakhand Tourism Certified Experience</span>
        </div>

      </div>
    </div>
  );
};

export default CategoryHero;
