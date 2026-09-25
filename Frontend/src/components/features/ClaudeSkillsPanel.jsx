import React, { useState } from 'react';
import { 
  Mountain, Map, MessageSquare, 
  Sparkles, CheckCircle2, ArrowRight, Radio
} from 'lucide-react';

const TOOLS = [
  {
    id: 'altitude',
    name: 'Altitude Safety Checker',
    icon: Mountain,
    badge: 'AMS Protection Active',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Monitors ascent rates and automatically enforces acclimatization halt days.',
    visualCard: {
      title: 'Altitude Advisory Triggered',
      subtitle: 'Kedarnath Trek Circuit (3,583m)',
      type: 'warning',
      message: '⚠️ High ascent detected (+2,100m in 24h). AI automatically scheduled a rest & acclimatization day at Guptkashi (1,319m) for your safety.',
      actionText: 'View Medical Safety Protocol'
    }
  },
  {
    id: 'route',
    name: 'Smart Ghat Route Optimizer',
    icon: Map,
    badge: 'Real-time Road Sync',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Calculates optimal mountain drives avoiding landslides and bottleneck bridges.',
    visualCard: {
      title: 'Fastest Safe Corridor Identified',
      subtitle: 'Rishikesh → Devprayag → Rudraprayag → Joshimath',
      type: 'success',
      message: '🚗 254 km • ~7h 45m total travel time. NH-58 is fully open with zero reported landslide blockages.',
      actionText: 'Open GPS Navigation Map'
    }
  },
  {
    id: 'dialect',
    name: 'Local Pahadi Translator',
    icon: MessageSquare,
    badge: 'Garhwali & Kumaoni',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Helps travelers converse respectfully with local homestay families and village elders.',
    visualCard: {
      title: 'Pahadi Homestay Greeting',
      subtitle: 'English → Garhwali Translation',
      type: 'info',
      message: '“उबळ्युं पाणी अर उन्या कम्बल कख मिलला?” (Phonetic: Ubalyun paani ar unya kambal kakh mil-la?) — Where can I find warm water and blankets?',
      actionText: 'Listen to Pronunciation Audio'
    }
  },
  {
    id: 'sos',
    name: 'Offline Valley SOS Relay',
    icon: Radio,
    badge: 'Zero-Signal Mesh',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Broadcasts emergency coordinates to nearby trekking guides without active internet.',
    visualCard: {
      title: 'Emergency Mesh Node Ready',
      subtitle: 'Tungnath Valley (3,680m)',
      type: 'mesh',
      message: '📡 Offline beacon connects with 4 SDRF mountain checkpoints and certified local guides within 5km radius.',
      actionText: 'Test Offline Beacon'
    }
  }
];

export default function ClaudeSkillsPanel() {
  const [selectedTool, setSelectedTool] = useState(TOOLS[0]);

  return (
    <div className="w-full bg-[#fcfaf6] text-slate-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.04)] font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} className="text-emerald-700" />
            <span>AI Mountain Travel Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display tracking-tight">
            Intelligent Safety & Travel Tools
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Autonomous algorithms built to protect, guide, and enrich every step of your Himalayan journey.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-stone-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-xs self-start sm:self-center">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <span>All 4 Mountain Tools Active</span>
        </div>
      </div>

      {/* Grid: Left Tool Selector Pills + Right Interactive Visual Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Tools List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool.id === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setSelectedTool(tool)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-white border-[#0f3d2e] shadow-md ring-2 ring-[#0f3d2e]/10'
                    : 'bg-white/80 border-stone-200/80 hover:bg-white hover:border-stone-300 shadow-2xs'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-[#0f3d2e] text-white shadow-xs' : 'bg-stone-100 text-stone-700'
                }`}>
                  <Icon size={18} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-stone-900">{tool.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Visual Feature Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
                Live Feature Demonstration
              </span>
              <span className="text-xs font-bold text-[#0f3d2e] bg-[#0f3d2e]/10 px-2.5 py-1 rounded-full">
                {selectedTool.name}
              </span>
            </div>

            {/* Travel Alert Banner */}
            <div className={`p-5 rounded-2xl border mb-5 ${
              selectedTool.visualCard.type === 'warning'
                ? 'bg-amber-50/70 border-amber-200/90 text-amber-950'
                : selectedTool.visualCard.type === 'success'
                ? 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950'
                : selectedTool.visualCard.type === 'info'
                ? 'bg-blue-50/70 border-blue-200/90 text-blue-950'
                : 'bg-stone-50 border-stone-200 text-stone-900'
            }`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white shadow-2xs shrink-0">
                  <selectedTool.icon size={20} className="text-[#0f3d2e]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    {selectedTool.visualCard.title}
                  </h4>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {selectedTool.visualCard.subtitle}
                  </p>
                  <p className="text-sm font-medium text-stone-800 mt-3 leading-relaxed">
                    {selectedTool.visualCard.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-[11px] font-bold text-stone-500 uppercase block">Response Time</span>
                <span className="text-sm font-extrabold text-stone-900">&lt; 50ms Real-Time</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-[11px] font-bold text-stone-500 uppercase block">Reliability</span>
                <span className="text-sm font-extrabold text-[#0f3d2e]">100% Offline Compatible</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              Verified with Uttarakhand Tourism guidelines
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0f3d2e] hover:text-emerald-800 bg-[#0f3d2e]/10 hover:bg-[#0f3d2e]/15 px-4 py-2 rounded-full transition-colors"
            >
              <span>{selectedTool.visualCard.actionText}</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
