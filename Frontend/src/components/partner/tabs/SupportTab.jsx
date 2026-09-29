import React from 'react';
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  ExternalLink, 
  FileQuestion, 
  Compass,
  AlertTriangle
} from 'lucide-react';

export default function SupportTab() {
  const faqs = [
    {
      q: 'When do guest booking payouts arrive in my bank account?',
      a: 'All guest payments are held in secure escrow. Payouts are automatically triggered upon verified customer check-in or ride completion minus the standard 10% platform fee.'
    },
    {
      q: 'How do I submit my homestay or vehicle for Govt. verification?',
      a: 'Navigate to "Documents" tab, upload your RC / Homestay Tourism Certificate, and click "Submit for Verification" in the Verification tab. UTDB admins review within 24-48 hours.'
    },
    {
      q: 'What should I do during high-altitude landslides or weather warnings?',
      a: 'Discovery Uttarakhand transmits real-time IMD & Disaster Management corridor advisories. You can temporarily mark your service unavailable with 1-click in the Services tab.'
    },
    {
      q: 'How does the Web3 verification certificate work?',
      a: 'Once approved by admin, a cryptographic proof is anchored to the Polygon Amoy blockchain. Travelers can scan your listing QR code to verify your official credentials offline.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0f3d2e] to-[#165642] text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <HelpCircle size={13} />
              <span>Partner Help Center</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Devbhoomi Partner Assistance &amp; Support
            </h2>
            <p className="text-xs text-stone-200 mt-1 max-w-xl">
              24x7 local host support, regulatory guidance, and operational assistance for Uttarakhand tourism operators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:18001804141"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0f3d2e] hover:bg-stone-100 text-xs font-bold transition shadow-xs"
            >
              <Phone size={14} />
              <span>Toll Free: 1800-180-4141</span>
            </a>
          </div>
        </div>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
            <Phone size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Partner Helpline</h3>
          <p className="text-xs text-stone-500 mt-1">Available 07:00 AM – 10:00 PM for urgent reservation changes.</p>
          <div className="mt-3 text-xs font-bold text-[#0f3d2e]">+91 135 255 9898</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mb-3">
            <Mail size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Escrow &amp; Payouts Desk</h3>
          <p className="text-xs text-stone-500 mt-1">Settlement disputes, banking IFSC updates, and GST invoices.</p>
          <div className="mt-3 text-xs font-bold text-[#0f3d2e]">partners@discoveryuttarakhand.in</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Mountain SOS Desk</h3>
          <p className="text-xs text-stone-500 mt-1">High-altitude medical distress or corridor landslide emergencies.</p>
          <div className="mt-3 text-xs font-bold text-rose-700">112 / SDRF Dehradun</div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
          <FileQuestion size={16} className="text-emerald-700" />
          <span>Frequently Answered Operational Questions</span>
        </h3>

        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
              <h4 className="text-xs font-bold text-slate-900">{f.q}</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
