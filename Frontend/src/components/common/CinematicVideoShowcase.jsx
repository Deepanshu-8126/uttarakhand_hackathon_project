import React, { useState, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, 
  Sparkles, Film, Moon, Sun, Mountain, Camera, Layers, CheckCircle2 
} from 'lucide-react';
import { getAssetUrl } from '../../utils/imageHelpers';

const SCENE_PRESETS = [
  {
    id: 'night',
    title: 'Night Sky & Star Trails',
    location: 'Chopta & Bugyal Ridges (Night 0-4s)',
    desc: 'Breathtaking 0-light-pollution night vistas, constellation views and snow-lit Himalayan horizons.',
    icon: Moon,
    tag: '🌌 Celestial Night View',
    startTime: 0,
    endTime: 4
  },
  {
    id: 'pithoragarh',
    title: 'Pithoragarh & Mountain Ridges',
    location: 'Pithoragarh & Trishul Ranges (4-8s)',
    desc: 'Cinematic drone & telephoto perspectives capturing 7,000m+ Himalayan summits across Pithoragarh & Kumaon.',
    icon: Camera,
    tag: '🏔️ Pithoragarh 4K Aerial',
    startTime: 4,
    endTime: 8
  },
  {
    id: 'corridors',
    title: 'River Valleys & Sacred Ghats',
    location: 'Rishikesh & Devprayag Sangam (8-12s)',
    desc: 'Emerald waters meeting sacred confluence ghats during twilight hours.',
    icon: Layers,
    tag: '🌊 Sacred Waters',
    startTime: 8,
    endTime: 12
  }
];

export default function CinematicVideoShowcase() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeScene, setActiveScene] = useState(SCENE_PRESETS[0]);

  const handleSelectScene = (scene) => {
    setActiveScene(scene);
    if (videoRef.current) {
      videoRef.current.currentTime = scene.startTime;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeScene) return;
    if (activeScene.endTime && videoRef.current.currentTime >= activeScene.endTime) {
      videoRef.current.currentTime = activeScene.startTime;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  return (
    <div className="my-8 relative w-full overflow-hidden rounded-3xl bg-stone-950 border border-emerald-500/30 shadow-2xl shadow-emerald-950/40 group">
      
      {/* ── 1. Video Player Container ───────────────────────────────────────── */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-stone-950 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        >
          <source src={getAssetUrl('/assets/devbhoomi_reel.mp4')} type="video/mp4" />
          <source src={getAssetUrl('/assets/videos/devbhoomi_reel.mp4')} type="video/mp4" />
        </video>

        {/* Ambient Gradient Overlays for readability & cinematic feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-stone-950/80 pointer-events-none" />

        {/* Top-Left Live Telemetry Badge */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex flex-wrap items-center gap-2">
          <span className="bg-[#0f3d2e]/90 backdrop-blur-xl text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-emerald-400/40 shadow-lg flex items-center gap-2">
            <Film size={13} className="text-emerald-400 animate-pulse" />
            <span>Cinematic Devbhoomi Reel</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-emerald-300 text-[10.5px] font-bold px-3 py-1.5 rounded-full border border-white/10">
            <Sparkles size={12} />
            <span>Night &amp; Pithoragarh Scenes</span>
          </span>
        </div>

        {/* Top-Right Player Controls */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-emerald-900/80 backdrop-blur-xl text-white flex items-center justify-center transition border border-white/20 cursor-pointer active:scale-95 shadow-md"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={16} className="text-stone-300" /> : <Volume2 size={16} className="text-emerald-400" />}
          </button>
          
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-emerald-900/80 backdrop-blur-xl text-white flex items-center justify-center transition border border-white/20 cursor-pointer active:scale-95 shadow-md"
            title={isPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={handleFullscreen}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-emerald-900/80 backdrop-blur-xl text-white flex items-center justify-center transition border border-white/20 cursor-pointer active:scale-95 shadow-md"
            title="Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Bottom Hero Overlay Information */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 text-white pointer-events-none">
          <div className="max-w-xl">
            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30 mb-2">
              {activeScene.tag}
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
              {activeScene.title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-200/90 font-medium mt-1 line-clamp-2 leading-relaxed drop-shadow-sm">
              {activeScene.desc}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Scene Selector Tabs ─────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 bg-stone-950/90 backdrop-blur-xl border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SCENE_PRESETS.map((scene) => {
          const Icon = scene.icon;
          const isSelected = activeScene.id === scene.id;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => handleSelectScene(scene)}
              className={`p-3 rounded-2xl text-left transition-all duration-300 border cursor-pointer flex items-start gap-3 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#0f3d2e] to-emerald-950 border-emerald-400/50 shadow-lg text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-300 hover:text-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                isSelected ? 'bg-emerald-400 text-stone-950' : 'bg-white/10 text-emerald-400'
              }`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black truncate">{scene.title}</span>
                  {isSelected && <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />}
                </div>
                <p className="text-[10.5px] text-stone-400 truncate mt-0.5">{scene.location}</p>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
