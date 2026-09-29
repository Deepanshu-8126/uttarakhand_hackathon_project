import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getMyPartnerProfile, 
  updateMyPartnerProfile,
  getPartnerDashboardStats, 
  getMyListings, 
  createListingDraft, 
  updateListing, 
  deletePartnerListing,
  submitListingForVerification,
  getPartnerBookings, 
  updatePartnerBookingStatus, 
  getPartnerAvailability, 
  updatePartnerAvailability, 
  updateListingPricing, 
  getPartnerEarnings, 
  getPartnerExpenses, 
  createPartnerExpense, 
  deletePartnerExpense, 
  getPartnerAnalytics, 
  getPartnerReviews, 
  replyToPartnerReview,
  getPartnerSettlements,
  getPartnerDocuments,
  uploadPartnerDocument,
  deletePartnerDocumentApi,
  getPartnerActionItems
} from '../../api/partnerApi';
import PartnerSidebar from '../../components/partner/PartnerSidebar';
import PartnerHeader from '../../components/partner/PartnerHeader';
import OverviewTab from '../../components/partner/tabs/OverviewTab';
import ListingsTab from '../../components/partner/tabs/ListingsTab';
import ListingFormTab from '../../components/partner/tabs/ListingFormTab';
import BookingsTab from '../../components/partner/tabs/BookingsTab';
import AvailabilityTab from '../../components/partner/tabs/AvailabilityTab';
import PricingTab from '../../components/partner/tabs/PricingTab';
import EarningsTab from '../../components/partner/tabs/EarningsTab';
import ExpensesTab from '../../components/partner/tabs/ExpensesTab';
import AnalyticsTab from '../../components/partner/tabs/AnalyticsTab';
import ReviewsTab from '../../components/partner/tabs/ReviewsTab';
import ProfileTab from '../../components/partner/tabs/ProfileTab';
import SettlementsTab from '../../components/partner/tabs/SettlementsTab';
import DocumentsTab from '../../components/partner/tabs/DocumentsTab';
import VerificationTab from '../../components/partner/tabs/VerificationTab';
import NotificationsTab from '../../components/partner/tabs/NotificationsTab';
import SupportTab from '../../components/partner/tabs/SupportTab';
import SettingsTab from '../../components/partner/tabs/SettingsTab';
import CustomerPreviewModal from '../../components/partner/CustomerPreviewModal';
import { Loader2, AlertCircle } from 'lucide-react';

const validTabs = [
  'overview', 'listings', 'services', 'add-listing', 'bookings',
  'availability', 'pricing', 'earnings', 'settlements', 'expenses',
  'analytics', 'reviews', 'verification', 'documents', 'profile', 'business',
  'notifications', 'support', 'settings'
];

const PartnerDashboardPage = () => {
  const { tab } = useParams();
  const navigate = useNavigate();

  // Normalize canonical tab aliases
  let rawTab = (tab && validTabs.includes(tab)) ? tab : 'overview';
  if (rawTab === 'services') rawTab = 'listings';
  if (rawTab === 'business') rawTab = 'profile';
  const activeTab = rawTab;

  const handleTabChange = (newTab) => {
    if (newTab === 'add-listing') {
      setEditingListing(null);
    }
    navigate(`/partner/${newTab}`);
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Core Data States
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [settlementSummary, setSettlementSummary] = useState({});
  const [documents, setDocuments] = useState([]);
  const [expiringDocsCount, setExpiringDocsCount] = useState(0);
  const [actionItems, setActionItems] = useState([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Form State for Editing Listing
  const [editingListing, setEditingListing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Marketplace Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewService, setPreviewService] = useState(null);

  const handleOpenPreview = (service = null) => {
    setPreviewService(service);
    setPreviewModalOpen(true);
  };

  // Fetch all partner data in parallel
  const loadPartnerData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [
        profileRes,
        statsRes,
        listingsRes,
        bookingsRes,
        earningsRes,
        expensesRes,
        analyticsRes,
        reviewsRes,
        settlementsRes,
        documentsRes,
        actionsRes
      ] = await Promise.all([
        getMyPartnerProfile(),
        getPartnerDashboardStats(),
        getMyListings(),
        getPartnerBookings(),
        getPartnerEarnings(),
        getPartnerExpenses(),
        getPartnerAnalytics(),
        getPartnerReviews(),
        getPartnerSettlements().catch(() => ({ success: false })),
        getPartnerDocuments().catch(() => ({ success: false })),
        getPartnerActionItems().catch(() => ({ success: false }))
      ]);

      if (profileRes?.success) setPartnerProfile(profileRes.partner || profileRes.data);
      if (statsRes?.success) setDashboardStats(statsRes.stats || statsRes.data);
      if (listingsRes?.success) setListings(listingsRes.listings || listingsRes.data || []);
      if (bookingsRes?.success) setBookings(bookingsRes.bookings || bookingsRes.data || []);
      if (earningsRes?.success) setEarnings(earningsRes.earnings || earningsRes.data);
      if (expensesRes?.success) setExpenses(expensesRes.expenses || expensesRes.data || []);
      if (analyticsRes?.success) setAnalytics(analyticsRes.analytics || analyticsRes.data);
      if (reviewsRes?.success) setReviews(reviewsRes.reviews || reviewsRes.data || []);
      if (settlementsRes?.success) {
        setSettlements(settlementsRes.settlements || settlementsRes.data || []);
        setSettlementSummary(settlementsRes.summary || {});
      }
      if (documentsRes?.success) {
        setDocuments(documentsRes.documents || documentsRes.data || []);
        setExpiringDocsCount(documentsRes.expiringIn30Days || 0);
      }
      if (actionsRes?.success) {
        setActionItems(actionsRes.actionItems || actionsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load partner dashboard data:', err);
      setError('Unable to load partner business data. Please check connection and try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPartnerData();
  }, [loadPartnerData]);

  // Handler: Save Listing (Create Draft or Update)
  const handleSaveListing = async (payload) => {
    setIsSubmitting(true);
    try {
      if (editingListing?._id) {
        const res = await updateListing(editingListing._id, payload);
        if (res.success) {
          if (payload.submitForVerification) {
            await submitListingForVerification(editingListing._id);
          }
          await loadPartnerData(true);
          setEditingListing(null);
          handleTabChange('listings');
        } else {
          alert(res.message || 'Failed to update service.');
        }
      } else {
        const res = await createListingDraft(payload);
        if (res.success) {
          const newId = res.listing?._id || res.data?._id;
          if (payload.submitForVerification && newId) {
            await submitListingForVerification(newId);
          }
          await loadPartnerData(true);
          setEditingListing(null);
          handleTabChange('listings');
        } else {
          alert(res.message || 'Failed to create service.');
        }
      }
    } catch (err) {
      console.error('Error saving service:', err);
      alert('An error occurred while saving the service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Delete or Archive Listing
  const handleDeleteListing = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"? If it has past bookings, it will be safely archived.`)) {
      return;
    }
    try {
      const res = await deletePartnerListing(id);
      if (res.success) {
        await loadPartnerData(true);
      } else {
        alert(res.message || 'Failed to delete service.');
      }
    } catch (err) {
      console.error('Delete service error:', err);
      alert('Failed to delete service.');
    }
  };

  // Handler: Submit Listing to Platform Admin for Verification
  const handleSubmitVerification = async (id) => {
    try {
      const res = await submitListingForVerification(id);
      if (res.success) {
        await loadPartnerData(true);
        alert('Service submitted to Discovery Uttarakhand Admin for verification.');
      } else {
        alert(res.message || 'Failed to submit for verification.');
      }
    } catch (err) {
      console.error('Submit verification error:', err);
    }
  };

  // Handler: Update Availability
  const handleUpdateAvailability = async (id, data) => {
    setIsSubmitting(true);
    try {
      const res = await updatePartnerAvailability(id, data);
      if (res.success) {
        await loadPartnerData(true);
      } else {
        alert(res.message || 'Failed to update availability.');
      }
    } catch (err) {
      console.error('Update availability error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Update Pricing
  const handleUpdatePricing = async (id, pricingData) => {
    setIsSubmitting(true);
    try {
      const res = await updateListingPricing(id, pricingData);
      if (res.success) {
        await loadPartnerData(true);
      } else {
        alert(res.message || 'Failed to update pricing.');
      }
    } catch (err) {
      console.error('Update pricing error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Update Booking Status
  const handleUpdateBookingStatus = async (id, status, notes) => {
    setIsSubmitting(true);
    try {
      const res = await updatePartnerBookingStatus(id, status, notes);
      if (res.success) {
        await loadPartnerData(true);
      } else {
        alert(res.message || 'Failed to update booking status.');
      }
    } catch (err) {
      console.error('Update booking status error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Expenses
  const handleCreateExpense = async (payload) => {
    setIsSubmitting(true);
    try {
      const res = await createPartnerExpense(payload);
      if (res.success) {
        await loadPartnerData(true);
      } else {
        alert(res.message || 'Failed to record expense.');
      }
    } catch (err) {
      console.error('Create expense error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const res = await deletePartnerExpense(id);
      if (res.success) {
        await loadPartnerData(true);
      } else {
        alert(res.message || 'Failed to delete expense.');
      }
    } catch (err) {
      console.error('Delete expense error:', err);
    }
  };

  // Handler: Reply to Review
  const handleReplyReview = async (reviewId, replyText) => {
    setIsSubmitting(true);
    try {
      const res = await replyToPartnerReview(reviewId, replyText);
      if (res.success) {
        await loadPartnerData(true);
      } else {
        alert(res.message || 'Failed to submit reply.');
      }
    } catch (err) {
      console.error('Reply review error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Update Business Profile
  const handleUpdateProfile = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await updateMyPartnerProfile(formData);
      if (res.success) {
        await loadPartnerData(true);
        alert('Business profile updated successfully.');
      } else {
        alert(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      alert('Failed to update business profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Upload and Delete Documents
  const handleUploadDocument = async (formData) => {
    setIsUploadingDoc(true);
    try {
      const res = await uploadPartnerDocument(formData);
      if (res.success) {
        await loadPartnerData(true);
      } else {
        alert(res.message || 'Failed to upload document.');
      }
    } catch (err) {
      console.error('Upload document error:', err);
      alert('Failed to upload document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await deletePartnerDocumentApi(id);
      if (res.success) {
        await loadPartnerData(true);
      } else {
        alert(res.message || 'Failed to delete document.');
      }
    } catch (err) {
      console.error('Delete document error:', err);
    }
  };

  // Tab Title Map
  const tabTitles = {
    overview: 'Partner Business Hub',
    listings: 'My Services & Fleet',
    'add-listing': editingListing ? 'Edit Service' : 'Add New Service',
    bookings: 'Reservations & Bookings',
    availability: 'Availability Calendar',
    pricing: 'Pricing Matrix & Tariffs',
    earnings: 'Earnings & Direct Payouts',
    settlements: 'Escrow Settlements & Ledger',
    expenses: 'Expenses & Profit / Loss',
    analytics: 'Performance Analytics',
    reviews: 'Guest Ratings & Reviews',
    verification: 'Business Verification Status',
    documents: 'Compliance Documents',
    profile: 'My Business Profile',
    notifications: 'Action Notifications',
    support: 'Partner Help Center',
    settings: 'Settings & Preferences'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-emerald-800 mb-3" />
        <p className="text-xs font-bold text-stone-700 tracking-wider uppercase">
          Loading Discovery Partner Hub...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans selection:bg-emerald-500 selection:text-white">
      {/* Sidebar Navigation */}
      <PartnerSidebar
        activeTab={activeTab === 'add-listing' && editingListing ? 'listings' : activeTab}
        setActiveTab={handleTabChange}
        partnerProfile={partnerProfile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header with Dual CTAs: View Public Profile + Add Service */}
        <PartnerHeader
          title={tabTitles[activeTab] || 'Partner Hub'}
          partnerProfile={partnerProfile}
          onMenuClick={() => setSidebarOpen(true)}
          onAddListingClick={() => {
            setEditingListing(null);
            handleTabChange('add-listing');
          }}
          onViewPublicProfile={() => handleOpenPreview(null)}
          onRefresh={() => loadPartnerData(true)}
          isRefreshing={isRefreshing}
          unreadNotificationsCount={actionItems.length}
          onOpenNotifications={() => handleTabChange('notifications')}
        />

        {/* Tab Content Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: Overview (Home Command Center) */}
          {activeTab === 'overview' && (
            <OverviewTab
              dashboardStats={dashboardStats}
              partnerProfile={partnerProfile}
              actionItems={actionItems}
              onNavigateTab={(tab) => {
                if (tab === 'add-listing') setEditingListing(null);
                handleTabChange(tab);
              }}
              onViewPublicProfile={() => handleOpenPreview(null)}
            />
          )}

          {/* TAB 2: My Services */}
          {activeTab === 'listings' && (
            <ListingsTab
              listings={listings}
              onAddListing={() => {
                setEditingListing(null);
                handleTabChange('add-listing');
              }}
              onEditListing={(item) => {
                setEditingListing(item);
                handleTabChange('add-listing');
              }}
              onPreviewService={(item) => handleOpenPreview(item)}
              onManagePricing={() => handleTabChange('pricing')}
              onManageAvailability={() => handleTabChange('availability')}
              onDeleteListing={handleDeleteListing}
              onSubmitVerification={handleSubmitVerification}
              isDeleting={isSubmitting}
            />
          )}

          {/* TAB 3: Add / Edit Service Form */}
          {activeTab === 'add-listing' && (
            <ListingFormTab
              initialData={editingListing}
              onSave={handleSaveListing}
              onCancel={() => {
                setEditingListing(null);
                handleTabChange('listings');
              }}
              isSubmitting={isSubmitting}
            />
          )}

          {/* TAB 4: Bookings */}
          {activeTab === 'bookings' && (
            <BookingsTab
              bookings={bookings}
              onUpdateStatus={handleUpdateBookingStatus}
              isUpdating={isSubmitting}
            />
          )}

          {/* TAB 5: Availability */}
          {activeTab === 'availability' && (
            <AvailabilityTab
              listings={listings}
              onUpdateAvailability={handleUpdateAvailability}
              isUpdating={isSubmitting}
            />
          )}

          {/* TAB 6: Pricing */}
          {activeTab === 'pricing' && (
            <PricingTab
              listings={listings}
              onUpdatePricing={handleUpdatePricing}
              isUpdating={isSubmitting}
            />
          )}

          {/* TAB 7: Earnings & Settlements */}
          {activeTab === 'earnings' && (
            <EarningsTab 
              earningsData={earnings} 
              settlements={settlements}
              settlementSummary={settlementSummary}
            />
          )}

          {activeTab === 'settlements' && (
            <EarningsTab
              earningsData={earnings}
              settlements={settlements}
              summary={settlementSummary}
            />
          )}

          {/* TAB 8: Expenses & P&L */}
          {activeTab === 'expenses' && (
            <ExpensesTab
              expenses={expenses}
              listings={listings}
              grossRevenue={earnings?.grossRevenue || 0}
              onCreateExpense={handleCreateExpense}
              onDeleteExpense={handleDeleteExpense}
              isSubmitting={isSubmitting}
            />
          )}

          {/* TAB 9: Analytics */}
          {activeTab === 'analytics' && (
            <AnalyticsTab analyticsData={analytics} />
          )}

          {/* TAB 10: Reviews */}
          {activeTab === 'reviews' && (
            <ReviewsTab
              reviews={reviews}
              onReplyReview={handleReplyReview}
              isReplying={isSubmitting}
            />
          )}

          {/* TAB 11: Verification */}
          {activeTab === 'verification' && (
            <VerificationTab
              partnerProfile={partnerProfile}
              onNavigateTab={handleTabChange}
            />
          )}

          {/* TAB 12: Documents */}
          {activeTab === 'documents' && (
            <DocumentsTab
              documents={documents}
              expiringCount={expiringDocsCount}
              onUpload={handleUploadDocument}
              onDelete={handleDeleteDocument}
              isUploading={isUploadingDoc}
            />
          )}

          {/* TAB 13: My Business Profile */}
          {activeTab === 'profile' && (
            <ProfileTab
              partnerProfile={partnerProfile}
              onUpdateProfile={handleUpdateProfile}
              isUpdating={isSubmitting}
            />
          )}

          {/* TAB 14: Action Notifications */}
          {activeTab === 'notifications' && (
            <NotificationsTab
              actionItems={actionItems}
              bookings={bookings}
              onNavigateTab={handleTabChange}
            />
          )}

          {/* TAB 15: Support & Help */}
          {activeTab === 'support' && (
            <SupportTab />
          )}

          {/* TAB 16: Settings */}
          {activeTab === 'settings' && (
            <SettingsTab
              partnerProfile={partnerProfile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (< 1024px) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 lg:hidden px-3 py-1.5 flex items-center justify-around shadow-lg">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'text-emerald-800 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="text-lg">🏠</span>
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => handleTabChange('listings')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'listings' || activeTab === 'add-listing' ? 'text-emerald-800 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="text-lg">📦</span>
            <span className="text-[10px]">Services</span>
          </button>

          <button
            onClick={() => handleTabChange('bookings')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'bookings' ? 'text-emerald-800 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="text-lg">📅</span>
            <span className="text-[10px]">Bookings</span>
          </button>

          <button
            onClick={() => handleTabChange('earnings')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'earnings' || activeTab === 'settlements' ? 'text-emerald-800 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="text-lg">💰</span>
            <span className="text-[10px]">Earnings</span>
          </button>

          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <span className="text-lg">⋯</span>
            <span className="text-[10px]">More</span>
          </button>
        </nav>
      </div>

      {/* Customer Marketplace Preview Modal */}
      <CustomerPreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewService(null);
        }}
        service={previewService}
        partnerProfile={partnerProfile}
      />
    </div>
  );
};

export default PartnerDashboardPage;
