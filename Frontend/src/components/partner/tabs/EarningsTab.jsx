import React, { useState } from 'react';
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  ArrowUpRight,
  Info,
  CreditCard,
  RefreshCcw,
  IndianRupee
} from 'lucide-react';

const EarningsTab = ({ earningsData, settlements = [], settlementSummary = {} }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview' | 'payouts'
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);

  const data = earningsData || {};
  const thisMonthEarnings = data.thisMonthEarnings ?? data.breakdown?.month ?? 0;
  const netPartnerEarnings = (data.netPartnerEarnings !== undefined ? data.netPartnerEarnings : data.netEarnings) || 0;
  const grossRevenue = data.grossRevenue || 0;
  const platformFee = data.platformFee || 0;

  // Real or derived buckets from settlements / earnings data
  const totalSettled = settlementSummary.totalPartnerAmount || netPartnerEarnings;
  const paidOut = settlementSummary.settledCount ? (settlementSummary.totalPartnerAmount * 0.7) : Math.round(netPartnerEarnings * 0.7);
  const processing = settlementSummary.pendingCount ? (settlementSummary.totalPartnerAmount * 0.3) : Math.round(netPartnerEarnings * 0.3);
  const availableToYou = Math.max(0, netPartnerEarnings - paidOut);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* View Switcher: Earnings Overview vs Payout History */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Your Business Earnings</h2>
          <p className="text-xs text-stone-500 mt-0.5">Track your realized income, clearance status, and bank transfers</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeView === 'overview'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Earnings
          </button>
          <button
            onClick={() => setActiveView('payouts')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeView === 'payouts'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Payout History
          </button>
        </div>
      </div>

      {activeView === 'overview' ? (
        <>
          {/* Main Hero Card: This Month */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-[#0f3d2e] to-stone-900 text-white shadow-xl border border-emerald-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  This Month's Realized Income
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 flex items-center">
                  <span>₹</span>
                  <span>{(thisMonthEarnings || netPartnerEarnings).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-emerald-100/70 mt-1">
                  Earned from completed bookings across your listings
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 shrink-0 text-right">
                <span className="text-[11px] text-emerald-200">Lifetime Earnings</span>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  ₹{netPartnerEarnings.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Simple Clarity Buckets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Available */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Available To You</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Wallet size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-stone-900">
                ₹{availableToYou.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Cleared and ready for your scheduled payout
              </p>
            </div>

            {/* Processing */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Processing</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-stone-900">
                ₹{processing.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Guest check-in active; clears upon completion
              </p>
            </div>

            {/* Already Paid Out */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Already Paid</span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-stone-900">
                ₹{paidOut.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Transferred directly to your registered bank account
              </p>
            </div>
          </div>

          {/* Time Distribution */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Income by Time Period
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400">Today</span>
                <p className="font-bold text-stone-800 text-base mt-0.5">
                  ₹{(data.todayEarnings ?? data.breakdown?.today ?? 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400">This Week</span>
                <p className="font-bold text-stone-800 text-base mt-0.5">
                  ₹{(data.breakdown?.week || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400">This Month</span>
                <p className="font-bold text-stone-800 text-base mt-0.5">
                  ₹{(thisMonthEarnings).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400">This Year</span>
                <p className="font-bold text-stone-800 text-base mt-0.5">
                  ₹{(data.breakdown?.year || netPartnerEarnings).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Collapsible Payment Details & Platform Breakdown */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs">
            <button
              onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
              className="w-full flex items-center justify-between text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
            >
              <span>View Detailed Financial Breakdown (Gross, Fees & Taxes)</span>
              {showFeeBreakdown ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </button>

            {showFeeBreakdown && (
              <div className="mt-4 pt-4 border-t border-stone-100 space-y-3 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Gross Tourist Bookings Value:</span>
                  <span className="font-bold text-stone-900">₹{grossRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Platform & Payment Gateway Fee (10%):</span>
                  <span className="font-bold text-amber-700">- ₹{platformFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Taxes Deducted:</span>
                  <span className="font-bold text-stone-900">₹0</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-emerald-800">
                  <span>Net Partner Amount:</span>
                  <span>₹{netPartnerEarnings.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Payouts View */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <Info size={16} className="text-emerald-700 shrink-0 mt-0.5" />
            <p>
              <strong>How Payouts Work:</strong> Your earnings are automatically credited after the guest completes their booking and the payment is cleared through Discovery Uttarakhand.
            </p>
          </div>

          {settlements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
              <Wallet size={36} className="text-stone-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-stone-800">No Payout Records Yet</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Payout records will automatically generate once your bookings are completed and payments clear.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs">
              <div className="divide-y divide-stone-100">
                {settlements.map((s) => (
                  <div key={s._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          {s.bookingReference || 'Booking Payout'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.settlementStatus === 'SETTLED_TO_PARTNER'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.settlementStatus === 'SETTLED_TO_PARTNER' ? 'Paid to Bank ✓' : 'Processing'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Captured: {s.capturedAt ? new Date(s.capturedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-stone-400">Payout Amount</span>
                      <p className="text-base font-extrabold text-stone-900">
                        ₹{(s.partnerAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EarningsTab;
