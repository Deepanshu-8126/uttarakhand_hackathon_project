import React, { useState } from 'react';
import { 
  Mountain, AlertTriangle, ShieldCheck, HeartPulse, 
  CheckSquare, Square, Info, ArrowUpRight, Activity, CheckCircle2 
} from 'lucide-react';

export default function AltitudeSafetyAI() {
  const [symptoms, setSymptoms] = useState({
    headache: false,
    nausea: false,
    dizziness: false,
    shortnessOfBreath: false,
    fatigue: false
  });

  const toggleSymptom = (key) => {
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeSymptomCount = Object.values(symptoms).filter(Boolean).length;

  return (
    <div className="w-full bg-[#fcfaf6] text-slate-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.04)] relative overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
            <HeartPulse size={14} className="text-rose-600" />
            <span>High-Altitude Safety Sentinel</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display tracking-tight">
            Altitude Acclimatization & AMS Guard
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Real-time elevation profile tracking, rate-of-ascent monitoring, and symptom screening for high Himalayan routes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-stone-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-xs self-start sm:self-center">
          <ShieldCheck size={14} className="text-[#0f3d2e]" />
          <span>Active Altitude Guard</span>
        </div>
      </div>

      {/* Top: Elevation Profile Graphic */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Route Elevation Gradient: Rishikesh (370m) → Kedarnath (3,583m)
            </h3>
            <p className="text-xs text-stone-500">Gradual ascent curve with safe acclimatization halt markers.</p>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full self-start sm:self-center">
            Max Summit: 3,583m
          </span>
        </div>

        {/* Clean Visual Elevation Chart */}
        <div className="relative h-44 w-full bg-stone-50/80 rounded-2xl p-4 border border-stone-200/80 overflow-hidden flex flex-col justify-end">
          
          {/* Safe & Caution Zones */}
          <div className="absolute top-0 left-0 right-0 h-[45%] bg-rose-50/50 border-b border-rose-200/80 flex items-center justify-end pr-4">
            <span className="text-[11px] text-rose-700 font-bold uppercase tracking-wider">
              ⚠️ High Risk AMS Zone (&gt; 2,500m)
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-emerald-50/40 flex items-center justify-end pr-4">
            <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">
              ✓ Safe Gradual Acclimatization Zone
            </span>
          </div>

          {/* SVG Elevation Curve */}
          <svg className="w-full h-full absolute inset-0 z-10" preserveAspectRatio="none" viewBox="0 0 500 150">
            <defs>
              <linearGradient id="elevationGradLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f3d2e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0f3d2e" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d="M 0 140 Q 120 135 180 100 T 320 60 T 500 15 L 500 150 L 0 150 Z"
              fill="url(#elevationGradLight)"
            />
            <path
              d="M 0 140 Q 120 135 180 100 T 320 60 T 500 15"
              fill="none"
              stroke="#0f3d2e"
              strokeWidth="3.5"
            />
            
            {/* Markers */}
            <circle cx="0" cy="140" r="5" fill="#0f3d2e" />
            <circle cx="180" cy="100" r="5" fill="#0f3d2e" />
            <circle cx="320" cy="60" r="6" fill="#d97706" />
            <circle cx="500" cy="15" r="7" fill="#e11d48" />
          </svg>

          {/* Stop Labels */}
          <div className="relative z-20 flex justify-between text-[11px] font-bold text-stone-700 pt-2 border-t border-stone-200">
            <span>Rishikesh (370m)</span>
            <span>Devprayag (830m)</span>
            <span className="text-amber-700">Guptkashi (1,319m) [AI Halt]</span>
            <span className="text-rose-700">Kedarnath (3,583m)</span>
          </div>

        </div>
      </div>

      {/* Bottom: Interactive Symptom Self-Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Checkboxes (7 Cols) */}
        <div className="md:col-span-7 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm">
          <h4 className="text-sm font-bold text-stone-900 mb-1">
            Quick AMS Symptom Self-Screening
          </h4>
          <p className="text-xs text-stone-500 mb-4">
            Check any symptoms experienced at altitudes above 2,500m for instant medical advice.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'headache', label: 'Throbbing Headache' },
              { id: 'nausea', label: 'Nausea or Appetite Loss' },
              { id: 'dizziness', label: 'Dizziness / Lightheaded' },
              { id: 'shortnessOfBreath', label: 'Shortness of Breath at Rest' },
              { id: 'fatigue', label: 'Severe Exhaustion / Fatigue' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleSymptom(item.id)}
                className={`p-3 rounded-2xl border text-xs font-bold text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  symptoms[item.id]
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                    : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {symptoms[item.id] ? (
                  <CheckSquare size={16} className="text-rose-600 shrink-0" />
                ) : (
                  <Square size={16} className="text-stone-400 shrink-0" />
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: AI Recommendation Outcome (5 Cols) */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Safety Assessment
              </span>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                activeSymptomCount === 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : activeSymptomCount <= 2
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {activeSymptomCount === 0 ? 'Optimal' : activeSymptomCount <= 2 ? 'Mild Symptoms' : 'High Risk'}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              activeSymptomCount === 0
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : activeSymptomCount <= 2
                ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                : 'bg-rose-50/60 border-rose-200 text-rose-950'
            }`}>
              <div className="text-sm font-bold">
                {activeSymptomCount === 0
                  ? '✓ Safe to Continue Ascent'
                  : activeSymptomCount <= 2
                  ? '⚠️ Hydrate & Rest at Current Elevation'
                  : '🚨 Immediate Descent Advised (Descend 500m)'}
              </div>
              <p className="text-xs mt-1.5 leading-relaxed opacity-90">
                {activeSymptomCount === 0
                  ? 'Your ascent pace conforms to Himalayan acclimatization standards. Drink 3-4L water daily.'
                  : activeSymptomCount <= 2
                  ? 'Do not ascend further today. Take warm liquids, garlic soup, and rest for 12 hours.'
                  : 'Notify your certified guide immediately. Oxygen canisters available at GMVN medical posts.'}
              </p>
            </div>
          </div>

          <div className="pt-3 text-[11px] text-stone-500 font-medium">
            Emergency Medical SOS: <strong>Dial 108 / SDRF Helpline</strong>
          </div>
        </div>

      </div>

    </div>
  );
}
