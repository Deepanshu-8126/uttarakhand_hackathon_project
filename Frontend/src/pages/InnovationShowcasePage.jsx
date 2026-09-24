import React, { useState } from 'react';
import { 
  Sparkles, Layers, Zap, Mountain, QrCode, 
  Radio, Coins, Activity, ArrowRight, ShieldCheck 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ClaudeSkillsPanel from '../components/features/ClaudeSkillsPanel';
import StitchSyncDashboard from '../components/features/StitchSyncDashboard';
import AltitudeSafetyAI from '../components/features/AltitudeSafetyAI';
import OfflineEscrowHandshake from '../components/features/OfflineEscrowHandshake';
import CommunitySafetyGrid from '../components/features/CommunitySafetyGrid';
import PahadiCoinsWallet from '../components/features/PahadiCoinsWallet';
import LiveMountainTelemetry from '../components/features/LiveMountainTelemetry';
import Footer from '../components/Footer';

const TABS = [
  { id: 'all', label: 'All Capabilities', icon: Sparkles },
  { id: 'telemetry', label: 'Live Mountain Dashboard', icon: Zap },
  { id: 'claude', label: 'AI Travel Tools', icon: Mountain },
  { id: 'altitude', label: 'Altitude & AMS Safety', icon: Activity },
  { id: 'escrow', label: 'Offline Escrow Voucher', icon: QrCode },
  { id: 'stitch', label: 'Real-Time Inventory Sync', icon: Layers },
  { id: 'safety', label: 'Community Safety Grid', icon: Radio },
  { id: 'wallet', label: 'Pahadi Coins Wallet', icon: Coins }
];

export default function InnovationShowcasePage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Apple-Style Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles size={14} className="text-emerald-700" />
            <span>Pioneering Mountain Tech Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-stone-900 tracking-tight mb-3">
            Intelligent Mountain Travel Suite
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Built specifically for the Himalayan terrain — featuring live GIS crowd radar, offline escrow vouchers, autonomous altitude safeguards, and community mesh rescue.
          </p>
        </div>

        {/* Clean Pill Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#0f3d2e] text-white shadow-md shadow-[#0f3d2e]/20 scale-102'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/90 shadow-2xs'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-emerald-300' : 'text-stone-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Components Showcase (All matching light travel theme) */}
        <div className="space-y-12">
          
          {(activeTab === 'all' || activeTab === 'telemetry') && (
            <section id="telemetry">
              <LiveMountainTelemetry />
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'claude') && (
            <section id="claude-skills">
              <ClaudeSkillsPanel />
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'altitude') && (
            <section id="altitude-safety">
              <AltitudeSafetyAI />
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'escrow') && (
            <section id="offline-escrow">
              <OfflineEscrowHandshake />
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'stitch') && (
            <section id="stitch-sync">
              <StitchSyncDashboard />
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'safety') && (
            <section id="safety-grid">
              <CommunitySafetyGrid />
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'wallet') && (
            <section id="pahadi-wallet">
              <PahadiCoinsWallet />
            </section>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
