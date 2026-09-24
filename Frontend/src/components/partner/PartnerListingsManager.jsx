import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Send, 
  Edit3, 
  RotateCcw,
  Sparkles,
  MapPin,
  Tag
} from 'lucide-react';
import { 
  getMyPartnerProfile, 
  registerPartner, 
  getMyListings, 
  createListingDraft, 
  submitListingForVerification, 
  reopenRejectedListing 
} from '../../api/partnerApi';

export default function PartnerListingsManager() {
  const [partner, setPartner] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Registration form
  const [partnerForm, setPartnerForm] = useState({
    businessName: '',
    partnerType: 'Homestay',
    phone: '',
    email: '',
    district: 'Nainital',
    credentialType: '',
    credentialReference: ''
  });

  // Listing form
  const [listingForm, setListingForm] = useState({
    listingType: 'Stay',
    title: '',
    district: 'Nainital',
    city: '',
    description: '',
    pricingAmount: '',
    pricingUnit: 'night'
  });

  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPartnerData = async () => {
    setLoading(true);
    try {
      const pRes = await getMyPartnerProfile();
      if (pRes.success) {
        setPartner(pRes.data);
        const lRes = await getMyListings();
        if (lRes.success) {
          setListings(lRes.data || []);
        }
      } else {
        setPartner(null);
      }
    } catch (err) {
      setPartner(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerData();
  }, []);

  const handleApplyPartner = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await registerPartner(partnerForm);
      if (res.success) {
        setShowApplyModal(false);
        setMessage({ type: 'success', text: 'Partner profile registered successfully!' });
        loadPartnerData();
      } else {
        alert(res.message || 'Registration failed');
      }
    } catch (err) {
      alert('Error registering partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        listingType: listingForm.listingType,
        title: listingForm.title,
        district: listingForm.district,
        city: listingForm.city,
        description: listingForm.description,
        pricing: {
          amount: Number(listingForm.pricingAmount),
          unit: listingForm.pricingUnit
        }
      };

      const res = await createListingDraft(payload);
      if (res.success) {
        setShowCreateModal(false);
        setMessage({ type: 'success', text: 'Listing draft created in DRAFT status.' });
        loadPartnerData();
      } else {
        alert(res.message || 'Failed to create listing');
      }
    } catch (err) {
      alert('Error creating listing draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitVerification = async (id) => {
    if (!window.confirm('Submit this listing for admin verification review?')) return;
    try {
      const res = await submitListingForVerification(id);
      if (res.success) {
        setMessage({ type: 'success', text: 'Listing submitted for verification (Status: PENDING_VERIFICATION).' });
        loadPartnerData();
      } else {
        alert(res.message || 'Submission failed');
      }
    } catch (err) {
      alert('Error submitting listing');
    }
  };

  const handleReopen = async (id) => {
    try {
      const res = await reopenRejectedListing(id);
      if (res.success) {
        setMessage({ type: 'success', text: 'Listing reopened to DRAFT. You can now edit and resubmit.' });
        loadPartnerData();
      } else {
        alert(res.message || 'Failed to reopen');
      }
    } catch (err) {
      alert('Error reopening listing');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-muted-text">Loading partner portal...</div>;
  }

  // Not a partner yet: Show Partner Onboarding CTA
  if (!partner) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 text-center max-w-2xl mx-auto my-4 shadow-sm shadow-emerald-950/5">
        <div className="w-14 h-14 rounded-2xl bg-[#0f3d2e] text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Building size={28} className="text-emerald-400" />
        </div>
        
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100/80 text-emerald-900 border border-emerald-200 mb-2">
          <Sparkles size={12} className="text-emerald-700" /> Direct Host & Partner Network
        </span>

        <h3 className="font-display font-black text-2xl text-slate-900 mb-2.5">
          Become a Discovery Uttarakhand Partner
        </h3>
        
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 max-w-lg mx-auto">
          List your authentic Himalayan homestay, registered taxi &amp; rental fleet, or certified mountain guide services. Enjoy <strong className="text-[#0f3d2e]">0% platform commission</strong> and direct payments with administrative escrow security.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mb-8">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-base block mb-1">🏡</span>
            <div className="font-bold text-xs text-slate-900">Homestays &amp; Lodges</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Direct bookings from pilgrims &amp; trekkers</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-base block mb-1">🚗</span>
            <div className="font-bold text-xs text-slate-900">Taxi &amp; 4x4 Fleet</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Himalayan road-trip &amp; Yatra car rentals</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-base block mb-1">🧭</span>
            <div className="font-bold text-xs text-slate-900">Licensed Guides</div>
            <p className="text-[11px] text-slate-500 mt-0.5">High-altitude expedition expeditions</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowApplyModal(true)}
          className="bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold text-xs sm:text-sm py-3 px-8 rounded-xl inline-flex items-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
        >
          <Sparkles size={16} className="text-emerald-400" />
          <span>Register Business Partner Account</span>
        </button>

        {/* Onboarding Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 text-left shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <h3 className="font-black text-lg text-slate-900">Partner Registration</h3>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleApplyPartner} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business / Host Name</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.businessName}
                    onChange={(e) => setPartnerForm({ ...partnerForm, businessName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-slate-900 text-xs focus:bg-white focus:border-[#0f3d2e] focus:outline-none"
                    placeholder="e.g. Nanda Devi Eco Homestay"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Partner Type</label>
                  <select
                    value={partnerForm.partnerType}
                    onChange={(e) => setPartnerForm({ ...partnerForm, partnerType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-slate-900 text-xs focus:bg-white focus:border-[#0f3d2e] focus:outline-none cursor-pointer"
                  >
                    <option value="Homestay">Homestay Host</option>
                    <option value="Hotel">Hotel / Lodge</option>
                    <option value="Guide">Certified Mountain Guide</option>
                    <option value="TrekOperator">Trek Operator</option>
                    <option value="VehicleRental">Vehicle Rental / Cab</option>
                    <option value="ActivityProvider">Activity Provider</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      value={partnerForm.phone}
                      onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-slate-900 text-xs focus:bg-white focus:border-[#0f3d2e] focus:outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={partnerForm.email}
                      onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-slate-900 text-xs focus:bg-white focus:border-[#0f3d2e] focus:outline-none"
                      placeholder="host@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operating District</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.district}
                    onChange={(e) => setPartnerForm({ ...partnerForm, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-slate-900 text-xs focus:bg-white focus:border-[#0f3d2e] focus:outline-none"
                    placeholder="e.g. Chamoli, Pithoragarh, Nainital"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering…' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Registered Partner Dashboard inside Profile
  return (
    <div className="space-y-6">
      {/* Partner Business Banner */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm shadow-emerald-950/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0f3d2e] bg-emerald-100/80 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {partner.partnerType} Partner
            </span>
            <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle size={10} className="text-emerald-600" /> 0% Commission Host
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            {partner.businessName}
          </h2>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <MapPin size={12} className="text-slate-400" /> {partner.district} District • {partner.phone} • {partner.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <a
            href="/partner"
            className="bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] border border-emerald-200 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Full Partner Portal</span>
            <span className="text-xs">↗</span>
          </a>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-98 cursor-pointer"
          >
            <Plus size={14} /> 
            <span>New Listing Draft</span>
          </button>
        </div>
      </div>


      {message && (
        <div className="p-3 rounded-xl text-xs font-bold bg-green-50 text-forest-green border border-green-200">
          ✓ {message.text}
        </div>
      )}

      {/* Listings List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            My Marketplace Listings ({listings.length})
          </h3>
          <span className="text-[11px] text-slate-500">Managed with 0% commission</span>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-stone-200 text-center">
            <p className="text-xs text-slate-500">No listings created yet. Click "New Listing Draft" above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((l) => {
              const statusBadgeClasses = {
                DRAFT: 'bg-stone-100 text-slate-700 border-stone-200',
                PENDING_VERIFICATION: 'bg-amber-50 text-amber-800 border-amber-200',
                VERIFIED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                ACTIVE: 'bg-emerald-100/80 text-[#0f3d2e] border-emerald-300 font-black',
                REJECTED: 'bg-rose-50 text-rose-800 border-rose-200'
              };

              return (
                <div key={l._id} className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-sm shadow-emerald-950/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-bold ${statusBadgeClasses[l.status] || 'bg-stone-100 text-slate-700 border-stone-200'}`}>
                        {l.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {l.listingType}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{l.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" /> {l.district}
                    </p>
                    <div className="mt-2 text-xs font-bold text-[#0f3d2e] bg-emerald-50/60 border border-emerald-100 p-2 rounded-xl flex items-center justify-between">
                      <span>Tariff: ₹{l.pricing?.amount} / {l.pricing?.unit}</span>
                      <span className="text-[9px] font-medium text-slate-500">
                        {l.pricing?.provenance || 'Host direct'}
                      </span>
                    </div>

                    {/* Rejection Feedback if any */}
                    {l.status === 'REJECTED' && l.verificationNotes && (
                      <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800">
                        <strong>Admin Feedback:</strong> "{l.verificationNotes}"
                      </div>
                    )}
                  </div>

                  {/* State Action Buttons */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 mt-4 text-xs">
                    {l.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={() => handleSubmitVerification(l._id)}
                        className="px-3.5 py-1.5 font-bold text-white bg-[#0f3d2e] hover:bg-[#144c3a] rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                      >
                        <Send size={12} /> 
                        <span>Submit for Verification</span>
                      </button>
                    )}

                    {l.status === 'REJECTED' && (
                      <button
                        type="button"
                        onClick={() => handleReopen(l._id)}
                        className="px-3.5 py-1.5 font-bold text-slate-800 bg-stone-100 hover:bg-stone-200 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RotateCcw size={12} /> 
                        <span>Reopen to DRAFT</span>
                      </button>
                    )}

                    {l.status === 'ACTIVE' && (
                      <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle size={12} className="text-emerald-600" /> Published on Marketplace
                      </span>
                    )}

                    {l.status === 'PENDING_VERIFICATION' && (
                      <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Clock size={12} className="text-amber-600" /> Awaiting Admin Verification
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-black text-lg text-slate-900">Create Listing Draft</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Listing Type</label>
                <select
                  value={listingForm.listingType}
                  onChange={(e) => setListingForm({ ...listingForm, listingType: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-slate-900 text-xs focus:bg-white focus:border-[#0f3d2e] focus:outline-none cursor-pointer"
                >
                  <option value="Stay">Stay / Homestay</option>
                  <option value="Guide">Local Guide Service</option>
                  <option value="Rental">Vehicle Rental</option>
                  <option value="Activity">Activity / Trek</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={listingForm.title}
                  onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-slate-900 text-xs focus:bg-white focus:border-[#0f3d2e] focus:outline-none"
                  placeholder="e.g. Traditional Himalayan Cedar Wood Cottage"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tariff (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={listingForm.pricingAmount}
                    onChange={(e) => setListingForm({ ...listingForm, pricingAmount: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-slate-900 text-xs focus:bg-white focus:border-[#0f3d2e] focus:outline-none"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pricing Unit</label>
                  <select
                    value={listingForm.pricingUnit}
                    onChange={(e) => setListingForm({ ...listingForm, pricingUnit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-slate-900 text-xs focus:bg-white focus:border-[#0f3d2e] focus:outline-none cursor-pointer"
                  >
                    <option value="night">Per Night</option>
                    <option value="day">Per Day</option>
                    <option value="person">Per Person</option>
                    <option value="trip">Per Trip</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  required
                  value={listingForm.district}
                  onChange={(e) => setListingForm({ ...listingForm, district: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-slate-900 text-xs focus:bg-white focus:border-[#0f3d2e] focus:outline-none"
                  placeholder="e.g. Nainital, Chamoli"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={listingForm.description}
                  onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-slate-900 text-xs focus:bg-white focus:border-[#0f3d2e] focus:outline-none"
                  placeholder="Describe your authentic experience and facilities..."
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving…' : 'Save Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

