import React from 'react';
import { Wallet, ArrowUpRight, Clock, CheckCircle2, AlertCircle, RefreshCcw, IndianRupee } from 'lucide-react';

const statusConfig = {
  SETTLED_TO_PARTNER: { label: 'Settled', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  PENDING_ESCROW_RELEASE: { label: 'In Escrow', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
  REFUNDED_TO_TRAVELER: { label: 'Refunded', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: RefreshCcw },
  DISPUTED: { label: 'Disputed', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle }
};

const SettlementsTab = ({ settlements = [], summary = {} }) => {
  if (!settlements || settlements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Wallet className="text-gray-300 mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-700 mb-1">No Settlements Yet</h3>
        <p className="text-sm text-gray-500 max-w-md">Settlement data will appear here once your listings receive confirmed bookings and payments are processed through Razorpay.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Gross</p>
          <p className="text-2xl font-bold text-gray-900 flex items-center gap-1"><IndianRupee size={18}/>{(summary.totalGross || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Platform Fee</p>
          <p className="text-2xl font-bold text-gray-900 flex items-center gap-1"><IndianRupee size={18}/>{(summary.totalPlatformFee || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Your Earnings</p>
          <p className="text-2xl font-bold text-emerald-900 flex items-center gap-1"><IndianRupee size={18}/>{(summary.totalPartnerAmount || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Settlements</p>
          <p className="text-2xl font-bold text-gray-900">{summary.settledCount || 0} <span className="text-sm font-medium text-gray-500">/ {summary.totalCount || 0}</span></p>
        </div>
      </div>

      {/* Settlement Records */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Settlement History</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {settlements.map((s) => {
            const cfg = statusConfig[s.settlementStatus] || statusConfig.PENDING;
            const StatusIcon = cfg.icon;
            return (
              <div key={s._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">{s.bookingReference}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
                      <StatusIcon size={11}/> {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{s.method?.toUpperCase()} • {s.capturedAt ? new Date(s.capturedAt).toLocaleDateString('en-IN') : new Date(s.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <div className="text-right">
                    <p className="text-gray-500">Gross</p>
                    <p className="font-bold text-gray-900">₹{(s.grossAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Fee</p>
                    <p className="font-bold text-gray-600">₹{(s.platformFee || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-600 font-semibold">Your Amount</p>
                    <p className="font-bold text-emerald-700">₹{(s.partnerAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettlementsTab;
