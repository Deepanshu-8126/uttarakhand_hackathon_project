import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Calendar, Users, Mountain, Sparkles, Compass, CloudSun, DollarSign, BedDouble, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../../api/api';
import useChatStore from '../../store/chatStore';

export default function TripContextPanel({ tripId, isOpen, onClose }) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { sendMessage, activeChat, sending } = useChatStore();

  useEffect(() => {
    if (tripId) {
      setLoading(true);
      api.get(`/trips/${tripId}`)
        .then(res => setTrip(res.data.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setTrip(null);
    }
  }, [tripId]);

  // Extract latest live context and cards from conversation
  const latestAssistantMsg = (activeChat?.messages || []).slice().reverse().find(
    m => m && m.role === 'assistant' && (m.metadata?.structuredCards || m.metadata?.tripContext)
  );
  const liveCards = latestAssistantMsg?.metadata?.structuredCards || {};
  const liveRoute = liveCards.route;
  const liveWeather = liveCards.weather;
  const liveBudget = liveCards.budget;
  const liveStays = liveCards.stays;

  const hasLiveContext = liveRoute || liveWeather || liveBudget || (liveStays && liveStays.length > 0);

  const handleQuickAction = (text) => {
    if (sending) return;
    sendMessage(activeChat?._id, text, tripId);
  };

  return (
    <div className={`copilot-context-panel ${isOpen ? 'open' : ''} flex flex-col h-full bg-[#06140c] border-l border-white/[0.08] text-stone-200 select-none overflow-y-auto`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/[0.08] bg-[#07190f]/70 shrink-0">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
          <Mountain size={15} className="text-emerald-400" />
          <span>Trip Workspace</span>
        </h3>
        {onClose && (
          <button 
            type="button"
            className="lg:hidden p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors flex items-center justify-center cursor-pointer" 
            onClick={onClose}
            aria-label="Close context"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-xs text-stone-400 text-center space-y-2">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Syncing mountain data...</p>
        </div>
      ) : trip ? (
        <div className="p-4 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
            <Mountain size={22} />
          </div>
          <h4 className="font-bold text-sm text-white text-center">
            {trip.title || trip.name || 'Uttarakhand Expedition'}
          </h4>
          
          <div className="text-xs text-stone-300 space-y-2 bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.08]">
             <div className="flex items-center gap-2">
               <MapPin size={13} className="text-emerald-400 shrink-0" />
               <span className="truncate">{trip.destinations?.map(d => d.name).join(', ') || trip.destination?.name || 'Uttarakhand'}</span>
             </div>
             <div className="flex items-center gap-2">
               <Calendar size={13} className="text-emerald-400 shrink-0" />
               <span>{trip.duration || trip.days?.length || '?'} Days Itinerary</span>
             </div>
             <div className="flex items-center gap-2">
               <Users size={13} className="text-emerald-400 shrink-0" />
               <span>{trip.travelers || '2 Travelers'}</span>
             </div>
          </div>
          
          <div className="pt-2 space-y-2">
            <h5 className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
              Quick Inquiries
            </h5>
            <div className="space-y-1.5">
              <button 
                type="button"
                className="w-full text-left p-2.5 text-xs font-medium bg-white/[0.03] hover:bg-emerald-950/50 hover:border-emerald-500/30 text-stone-200 hover:text-white rounded-xl border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                onClick={() => handleQuickAction("Optimize my trip budget")} 
                disabled={sending}
              >
                <Sparkles size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate">Optimize my budget</span>
              </button>
              <button 
                type="button"
                className="w-full text-left p-2.5 text-xs font-medium bg-white/[0.03] hover:bg-emerald-950/50 hover:border-emerald-500/30 text-stone-200 hover:text-white rounded-xl border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                onClick={() => handleQuickAction("Check the route and weather for my trip")} 
                disabled={sending}
              >
                <Compass size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate">Check route & weather</span>
              </button>
            </div>
          </div>
        </div>
      ) : hasLiveContext ? (
        <div className="p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-400/25">
              Live Terrain Context
            </span>
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" /> Grounded
            </span>
          </div>

          {liveRoute && (
            <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] text-xs space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Compass size={13} className="text-emerald-400" />
                <span>{liveRoute.origin || 'Origin'} → {liveRoute.destination || 'Destination'}</span>
              </div>
              <div className="text-stone-400 flex items-center gap-2 text-[11px]">
                {liveRoute.estimatedDistanceKm && <span>{liveRoute.estimatedDistanceKm} km</span>}
                {liveRoute.estimatedDurationHours && <span>• ~{liveRoute.estimatedDurationHours} hrs drive</span>}
              </div>
              {liveRoute.corridor && (
                <div className="text-[10px] text-emerald-300/80 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {liveRoute.corridor}
                </div>
              )}
            </div>
          )}

          {liveWeather && (
            <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CloudSun size={18} className="text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-xs">{liveWeather.condition || 'Mountain Weather'}</div>
                  <div className="text-[10px] text-stone-400">Wind: {liveWeather.windSpeedKmh || 5} km/h</div>
                </div>
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {liveWeather.temperatureC != null ? `${liveWeather.temperatureC}°C` : ''}
              </div>
            </div>
          )}

          {liveBudget && (
            <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <DollarSign size={13} className="text-emerald-400" /> Budget Breakdown
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  ₹{Number(liveBudget.totalEstimatedCost || 0).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-stone-400 pt-1">
                <div>Stay: ₹{Number(liveBudget.breakdown?.accommodation || 0).toLocaleString()}</div>
                <div>Transit: ₹{Number(liveBudget.breakdown?.transport || 0).toLocaleString()}</div>
                <div>Food: ₹{Number(liveBudget.breakdown?.food || 0).toLocaleString()}</div>
                <div>Buffer: ₹{Number(liveBudget.breakdown?.activitiesAndBuffer || 0).toLocaleString()}</div>
              </div>
            </div>
          )}

          {liveStays && liveStays.length > 0 && (
            <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] text-xs space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <BedDouble size={13} className="text-emerald-400" /> Verified Stays ({liveStays.length})
              </div>
              <div className="space-y-1">
                {liveStays.slice(0, 3).map((st, sIdx) => (
                  <div key={sIdx} className="text-[11px] text-stone-300 truncate flex items-center justify-between">
                    <span>• {st.name || st.title}</span>
                    <span className="text-emerald-400 font-semibold">{st.pricePerNight ? `₹${st.pricePerNight}` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-1 space-y-2">
            <h5 className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
              Quick Inquiries
            </h5>
            <div className="space-y-1.5">
              <button 
                type="button"
                className="w-full text-left p-2.5 text-xs font-medium bg-white/[0.03] hover:bg-emerald-950/50 hover:border-emerald-500/30 text-stone-200 hover:text-white rounded-xl border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                onClick={() => handleQuickAction("What are the road conditions and daylight driving safety?")} 
                disabled={sending}
              >
                <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate">Road safety advisory</span>
              </button>
              <button 
                type="button"
                className="w-full text-left p-2.5 text-xs font-medium bg-white/[0.03] hover:bg-emerald-950/50 hover:border-emerald-500/30 text-stone-200 hover:text-white rounded-xl border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                onClick={() => handleQuickAction("Show verified local activities and sacred spots")} 
                disabled={sending}
              >
                <Sparkles size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate">Sacred spots & activities</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center space-y-4 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
            <Mountain size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider">
              Himalayan Radar
            </h4>
            <p className="text-[11px] text-stone-400 leading-relaxed max-w-[200px] mx-auto">
              Ask about any mountain destination to view real-time routes, weather forecasts, and stays here.
            </p>
          </div>
          <button 
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:brightness-110 text-white py-2 px-3.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/60 cursor-pointer border border-emerald-400/30"
            onClick={() => handleQuickAction("I want to explore Chopta, Tungnath, and Chandrashila")}
          >
            <Sparkles size={13} className="text-amber-300" />
            <span>Explore Chopta Trek</span>
          </button>
        </div>
      )}
    </div>
  );
}
