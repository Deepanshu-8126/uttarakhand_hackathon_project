import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function NotificationsTab({
  actionItems = [],
  bookings = [],
  onNavigateTab
}) {
  // Synthesize real action-oriented notifications from live state
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Partner Action Notifications
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Operational alerts, reservation updates, and compliance reminders.
          </p>
        </div>

        <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {(actionItems.length + pendingBookings.length)} Active Items
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        
        {/* Pending Bookings Notification */}
        {pendingBookings.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-200/60 text-amber-900 shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  {pendingBookings.length} New Booking Reservation{pendingBookings.length > 1 ? 's' : ''} Awaiting Action
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Confirm traveler check-in or seat allotment to guarantee booking lock.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('bookings')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-900 text-white text-xs font-bold hover:bg-amber-950 transition cursor-pointer shrink-0"
            >
              Review Bookings
            </button>
          </div>
        )}

        {/* Action Items from Backend */}
        {actionItems.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-[#0f3d2e] shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{item.title || item.message}</h4>
                <p className="text-xs text-stone-500 mt-0.5">{item.description || item.actionType}</p>
              </div>
            </div>

            {item.tab && (
              <button
                onClick={() => onNavigateTab(item.tab)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold transition cursor-pointer shrink-0"
              >
                <span>Fix</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        ))}

        {/* Fallback Clean State */}
        {actionItems.length === 0 && pendingBookings.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">All Operations Clear</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              No outstanding document issues or urgent reservation confirmations. Your business is operating smoothly.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
