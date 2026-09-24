import React, { useState } from 'react';
import { Mountain, HeartPulse, AlertTriangle, ShieldCheck, CheckCircle2, Wind, Clock, ArrowRight, X } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Discovery Uttarakhand - Altitude Sickness Guard Modal
 * Prompt 1: High Altitude (>3000m) Health Risk Assessment & Acclimatization Lock
 */
export default function AltitudeGuardModal({ 
  destination = 'Kedarnath', 
  altitude = 3584, 
  isOpen, 
  onClose, 
  onProceed 
}) {
  const [age, setAge] = useState(28);
  const [hasHeartCondition, setHasHeartCondition] = useState(false);
  const [hasAsthma, setHasAsthma] = useState(false);
  const [hasBpIssues, setHasBpIssues] = useState(false);
  const [previousAms, setPreviousAms] = useState(false);
  const [directAscent, setDirectAscent] = useState(true);

  if (!isOpen) return null;

  // Local real-time risk calculation
  let riskScore = 0;
  const factors = [];
  if (age >= 55) { riskScore += 30; factors.push('Senior age group (55+)'); }
  if (hasHeartCondition) { riskScore += 40; factors.push('Cardiovascular condition'); }
  if (hasAsthma) { riskScore += 35; factors.push('Respiratory vulnerability (Asthma)'); }
  if (hasBpIssues) { riskScore += 25; factors.push('Hypertension risks under barometric drops'); }
  if (previousAms) { riskScore += 30; factors.push('Prior Acute Mountain Sickness history'); }
  if (directAscent) { riskScore += 20; factors.push('Direct rapid same-day ascent'); }

  const isHighRisk = riskScore >= 60;
  const isMediumRisk = riskScore >= 30 && riskScore < 60;
  const isLowRisk = riskScore < 30;

  const handleContinue = () => {
    if (isHighRisk) {
      alert('High Altitude Guard: Please add an acclimatization night at Guptkashi / Joshimath before final booking.');
      return;
    }
    if (onProceed) onProceed();
    onClose();
  };

  const destName = typeof destination === 'string' ? destination : (destination?.name || destination?.city || 'High Altitude Destination');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg overflow-hidden border rounded-3xl bg-[#0e1d17] border-[#224233] shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-slate-100">
        
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-[#1b382a] bg-[#091510]">
          <button
            onClick={onClose}
            className="absolute p-2 text-white/50 transition-colors rounded-full top-4 right-4 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 border rounded-2xl bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
              <Mountain size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                <Wind size={12} /> High Altitude Guard ({altitude}m)
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {destName} Health Clearance
              </h3>
            </div>
          </div>
          <p className="mt-2 text-xs text-emerald-100/70">
            At {altitude} meters, atmospheric oxygen drops by ~35%. Complete this clearance check to calculate your Acute Mountain Sickness (AMS) risk score.
          </p>
        </div>

        {/* Questionnaire */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-emerald-900/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          
          {/* Age slider */}
          <div className="p-3.5 border rounded-2xl bg-[#091510]/80 border-[#1b382a] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white">Traveler Age:</span>
              <span className="text-sm font-extrabold text-cyan-400">{age} Years</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Health Checkboxes */}
          <div className="space-y-2">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Pre-Existing Medical Conditions:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Asthma / Respiratory', checked: hasAsthma, set: setHasAsthma },
                { label: 'Heart / Cardiac Condition', checked: hasHeartCondition, set: setHasHeartCondition },
                { label: 'High BP / Hypertension', checked: hasBpIssues, set: setHasBpIssues },
                { label: 'Previous Altitude Sickness', checked: previousAms, set: setPreviousAms },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => item.set(!item.checked)}
                  className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                    item.checked 
                      ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-xs' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <input type="checkbox" checked={item.checked} readOnly className="accent-rose-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rapid Direct Ascent Toggle */}
          <div className="p-3.5 border rounded-2xl bg-slate-900/80 border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white">Direct Same-Day Ascent?</div>
              <div className="text-[11px] text-slate-400">Going directly from plains without rest night</div>
            </div>
            <button
              type="button"
              onClick={() => setDirectAscent(!directAscent)}
              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
                directAscent 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {directAscent ? 'Yes (Rapid)' : 'No (Gradual)'}
            </button>
          </div>

          {/* Real-time Risk Scorecard */}
          <div className={`p-4 rounded-2xl border ${
            isHighRisk 
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' 
              : isMediumRisk 
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' 
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <HeartPulse size={16} /> Altitude Risk Assessment
              </span>
              <span className={`px-2 py-0.5 rounded-full font-black text-xs ${
                isHighRisk ? 'bg-rose-500/20 text-rose-400' : isMediumRisk ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {isHighRisk ? 'HIGH RISK (Action Required)' : isMediumRisk ? 'MEDIUM RISK' : 'LOW RISK (Cleared)'}
              </span>
            </div>
            
            {isHighRisk ? (
              <div className="space-y-1.5 text-[11px]">
                <p className="font-bold text-rose-300">
                  ⚠️ Direct booking restricted: You have high cardiovascular or altitude susceptibility.
                </p>
                <p className="text-slate-300">
                  <strong>Pahadi Safety Mandate:</strong> We automatically enforce a 1-night acclimatization halt at lower altitude (e.g. Guptkashi or Joshimath) before ascending.
                </p>
              </div>
            ) : isMediumRisk ? (
              <p className="text-[11px] text-slate-300">
                Caution advised. Only book stays with verified <strong>[Oxygen Cylinder Available]</strong> tags.
              </p>
            ) : (
              <p className="text-[11px] text-slate-300">
                You are fit for high altitude trekking. Maintain standard 3-4 liters daily hydration.
              </p>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleContinue}
            className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              isHighRisk
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                : 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-cyan-900/30'
            }`}
          >
            {isHighRisk ? (
              <>
                <span>Lock Acclimatization Route & View Safe Stays</span>
                <Clock size={16} />
              </>
            ) : (
              <>
                <span>Proceed to Safe Booking</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
