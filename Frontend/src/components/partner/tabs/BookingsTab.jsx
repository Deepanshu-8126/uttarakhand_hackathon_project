import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  IndianRupee,
  ChevronRight,
  X,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

const BookingsTab = ({ 
  bookings = [], 
  onUpdateStatus, 
  isUpdating 
}) => {
  const [filterTab, setFilterTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    const statusLower = (b.status || '').toLowerCase();
    const startDateVal = b.startDate || b.bookingDates?.startDate || b.checkIn;
    const bookingStartStr = startDateVal ? new Date(startDateVal).toISOString().split('T')[0] : '';

    let matchesTab = true;
    if (filterTab === 'today') {
      matchesTab = bookingStartStr === todayStr && statusLower !== 'cancelled';
    } else if (filterTab === 'upcoming') {
      matchesTab = statusLower === 'confirmed' || statusLower === 'pending';
    } else if (filterTab === 'completed') {
      matchesTab = statusLower === 'completed';
    } else if (filterTab === 'cancelled') {
      matchesTab = statusLower === 'cancelled';
    }

    const matchesSearch = 
      !searchQuery ||
      (b.user?.name || b.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.user?.phone || b.customerPhone || '').includes(searchQuery) ||
      (b.partnerListing?.title || b.details?.vehicleName || b.details?.propertyName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (rawStatus) => {
    const status = (rawStatus || '').toLowerCase();
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} /> Confirmed ✓
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock size={12} /> Pending Your Response
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Reservations & Bookings</h2>
          <p className="text-xs text-stone-500 mt-0.5">Manage tourist check-ins, guest contacts, and schedules</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200">
        {[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'today', label: "Today" },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'all', label: 'All Bookings' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              filterTab === tab.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings Card List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <CalendarCheck size={36} className="text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No Reservations In This View</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'No bookings match your search query.' : 'When guests book your services, their reservation details will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => {
            const customerName = b.user?.name || b.customerName || 'Tourist Guest';
            const customerPhone = b.user?.phone || b.customerPhone || '';
            const serviceTitle = b.partnerListing?.title || b.details?.vehicleName || b.details?.propertyName || 'Tour / Stay Service';
            const startDateVal = b.startDate || b.bookingDates?.startDate || b.checkIn;
            const endDateVal = b.endDate || b.bookingDates?.endDate || b.checkOut;
            const totalFare = Number(b.pricingSnapshot?.total || b.amount || b.totalAmount || 0);
            const statusLower = (b.status || '').toLowerCase();

            return (
              <div 
                key={b._id} 
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Customer & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {customerName}
                        </h4>
                        {customerPhone && (
                          <a 
                            href={`tel:${customerPhone}`}
                            className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone size={11} /> {customerPhone}
                          </a>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(b.status)}
                  </div>

                  {/* Service Info */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-2 text-xs">
                    <p className="font-semibold text-stone-800 truncate">
                      {serviceTitle}
                    </p>

                    <div className="flex items-center justify-between text-stone-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-emerald-700" />
                        {startDateVal ? new Date(startDateVal).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Flexible'}
                        {endDateVal && ` — ${new Date(endDateVal).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                      </span>
                      {b.guests && <span>{b.guests} Guests</span>}
                    </div>
                  </div>
                </div>

                {/* Bottom Total & Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400">Total Amount</span>
                    <p className="text-base font-extrabold text-stone-900">
                      ₹{totalFare.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {statusLower === 'pending' && (
                      <button
                        onClick={() => onUpdateStatus(b._id, 'confirmed')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-2xs"
                      >
                        Accept
                      </button>
                    )}

                    {statusLower === 'confirmed' && (
                      <button
                        onClick={() => onUpdateStatus(b._id, 'completed')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs"
                      >
                        Complete
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setShowAdvancedDetails(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Details Modal (Progressive Disclosure) */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-stone-400 font-bold">Booking Summary</span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                  {selectedBooking.partnerListing?.title || selectedBooking.details?.vehicleName || 'Reservation Details'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-semibold text-stone-600">Current Status</span>
              {getStatusBadge(selectedBooking.status)}
            </div>

            {/* Customer Contact */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Customer</h4>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-stone-900">
                    {selectedBooking.user?.name || selectedBooking.customerName || 'Guest'}
                  </p>
                  {(selectedBooking.user?.phone || selectedBooking.customerPhone) && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      {selectedBooking.user?.phone || selectedBooking.customerPhone}
                    </p>
                  )}
                </div>
                {(selectedBooking.user?.phone || selectedBooking.customerPhone) && (
                  <a
                    href={`tel:${selectedBooking.user?.phone || selectedBooking.customerPhone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Phone size={13} />
                    <span>Call Guest</span>
                  </a>
                )}
              </div>
            </div>

            {/* Dates & Guests */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-stone-400">Check-in / Start</span>
                <p className="font-bold text-stone-800 mt-1">
                  {selectedBooking.startDate ? new Date(selectedBooking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not specified'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-stone-400">Total Price</span>
                <p className="font-extrabold text-stone-900 mt-1 text-sm">
                  ₹{Number(selectedBooking.pricingSnapshot?.total || selectedBooking.amount || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Collapsible Advanced Technical Details */}
            <div className="pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
                className="w-full flex items-center justify-between text-xs font-semibold text-stone-500 hover:text-stone-800 py-1 transition-colors"
              >
                <span>Payment & Technical Details</span>
                {showAdvancedDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {showAdvancedDetails && (
                <div className="mt-3 p-3.5 rounded-2xl bg-stone-100/70 border border-stone-200/80 space-y-2 text-[11px] font-mono text-stone-600">
                  <div className="flex justify-between">
                    <span>Booking ID:</span>
                    <span className="text-stone-900">{selectedBooking._id}</span>
                  </div>
                  {selectedBooking.bookingReference && (
                    <div className="flex justify-between">
                      <span>Reference:</span>
                      <span className="text-stone-900">{selectedBooking.bookingReference}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className="text-emerald-800 font-bold">{selectedBooking.paymentStatus || 'CONFIRMED'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created Date:</span>
                    <span>{new Date(selectedBooking.createdAt || Date.now()).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
