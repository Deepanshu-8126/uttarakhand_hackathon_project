import React, { useState } from 'react';
import { 
  Activity, Sun, CheckCircle2, Wind, Users, 
  MapPin, TrendingUp, Sparkles, Clock, AlertTriangle, ShieldCheck, Compass 
} from 'lucide-react';

export default function LiveMountainTelemetry() {
  const [selectedCluster, setSelectedCluster] = useState('Kedarnath Circuit');

  const clusters = [
    { 
      name: 'Kedarnath Circuit', 
      densityLevel: 'High',
      densityPercent: 82, 
      aqi: 38, 
      weather: 'Clear 12°C', 
      road: 'Open (Ghat route normal)', 
      color: 'bg-rose-500',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: 'bg-rose-500',
      tip: 'Early morning trek recommended to avoid afternoon valley crowds.'
    },
    { 
      name: 'Badrinath - Mana Valley', 
      densityLevel: 'Moderate',
      densityPercent: 58, 
      aqi: 28, 
      weather: 'Sunny 14°C', 
      road: 'Open (NH-58 clear)', 
      color: 'bg-amber-500',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      barColor: 'bg-amber-500',
      tip: 'Smooth traffic flow through Joshimath bypass corridor.'
    },
    { 
      name: 'Valley of Flowers / Hemkund', 
      densityLevel: 'Low',
      densityPercent: 24, 
      aqi: 15, 
      weather: 'Misty 9°C', 
      road: 'Trek Open', 
      color: 'bg-emerald-500',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      barColor: 'bg-emerald-500',
      tip: 'Ideal peaceful trekking window with pristine alpine flowers.'
    },
    { 
      name: 'Chopta - Tungnath - Chandrashila', 
      densityLevel: 'Moderate',
      densityPercent: 62, 
      aqi: 22, 
      weather: 'Clear 16°C', 
      road: 'Open', 
      color: 'bg-amber-500',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      barColor: 'bg-amber-500',
      tip: 'Sunrise summit trek popular; book homestay early in Sari/Chopta.'
    },
    { 
      name: 'Munsiyari - Milam Base', 
      densityLevel: 'Serene / Low',
      densityPercent: 14, 
      aqi: 12, 
      weather: 'Partly Cloudy 17°C', 
      road: 'Open', 
      color: 'bg-emerald-500',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      barColor: 'bg-emerald-500',
      tip: 'Zero crowd density; crystal clear views of Panchachuli peaks.'
    }
  ];

  const activeClusterData = clusters.find(c => c.name === selectedCluster) || clusters[0];

  return (
    <div className="w-full bg-[#fcfaf6] text-slate-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.04)] relative overflow-hidden font-sans">
      
      {/* Subtle Warm Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>Live Mountain Safety Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display tracking-tight">
            Live Mountain Conditions & Crowd Heatmap
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Real-time weather telemetry, road connectivity, and tourist footfall indicators across Uttarakhand corridors.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-stone-200/90 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-xs self-start sm:self-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Satellite & GIS Telemetry</span>
        </div>
      </div>

      {/* Top 4 Stats Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Metric 1: Crowd Level */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Crowd Density</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">Moderate (65%)</div>
          <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
            <Clock size={12} className="text-stone-400" />
            <span>Peak window: 10:00 AM – 02:00 PM</span>
          </div>
        </div>

        {/* Metric 2: Weather */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mountain Weather</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Sun size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">Clear 18°C</div>
          <div className="text-xs text-stone-500 mt-1">Wind: 12 km/h • 0% Rain Probability</div>
        </div>

        {/* Metric 3: Road Status */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ghat Road Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0f3d2e] flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0f3d2e]">All Highways Open</div>
          <div className="text-xs text-stone-500 mt-1">Normal flow across Char Dham NH</div>
        </div>

        {/* Metric 4: Air Quality */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Himalayan Air</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wind size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">Pure (AQI 32)</div>
          <div className="text-xs text-stone-500 mt-1">Pristine oxygen-rich alpine air</div>
        </div>

      </div>

      {/* Regional Corridors List (Itinerary Style) */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Tourist Footfall Density by Regional Corridor
            </h3>
            <p className="text-xs text-stone-500">
              Select a corridor to view live micro-advisories and crowd pacing.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-stone-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> High</span>
          </div>
        </div>

        <div className="space-y-3">
          {clusters.map((c) => {
            const isSelected = selectedCluster === c.name;
            return (
              <div
                key={c.name}
                onClick={() => setSelectedCluster(c.name)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/40 border-[#0f3d2e] shadow-md ring-1 ring-[#0f3d2e]/20'
                    : 'bg-stone-50/60 border-stone-200/70 hover:bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Title & Stats */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-stone-700 shrink-0 shadow-2xs">
                      <MapPin size={18} className="text-[#0f3d2e]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-stone-900">{c.name}</h4>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${c.badgeColor}`}>
                          {c.densityLevel} ({c.densityPercent}%)
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-3 flex-wrap">
                        <span>☀️ {c.weather}</span>
                        <span>•</span>
                        <span>🚗 {c.road}</span>
                        <span>•</span>
                        <span>🍃 AQI {c.aqi}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full md:w-56 shrink-0">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-600 mb-1">
                      <span>Occupancy</span>
                      <span className="font-bold">{c.densityPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${c.barColor}`}
                        style={{ width: `${c.densityPercent}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Selected Corridor Live Tip */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/60 text-xs text-emerald-950 font-medium flex items-center gap-2 animate-fadeIn">
                    <Sparkles size={14} className="text-emerald-700 shrink-0" />
                    <span><strong>AI Advisory:</strong> {c.tip}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
