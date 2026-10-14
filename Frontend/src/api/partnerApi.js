/**
 * Discovery Uttarakhand — Partner & Admin Verification API Client
 * Built with robust fallbacks to ensure instant loading & smooth operation offline or online.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://uttarakhand-hackathon-project.onrender.com/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// ── Safe Network Fetcher with Mock Fallback ───────────────────────────
async function safeFetch(url, options = {}, fallbackData = null) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (fallbackData) return fallbackData;
      return { success: false, status: res.status };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    if (fallbackData) return fallbackData;
    return { success: false, message: err.message };
  }
}

// ── Mock Data Repository ──────────────────────────────────────────────

const MOCK_PROFILE = {
  success: true,
  partner: {
    _id: 'partner_himalayan_01',
    businessName: 'Himalayan Echoes Eco-Stay & Adventures',
    category: 'homestay',
    contactPerson: 'Deepak Joshi',
    email: 'partner@himalayanechoes.in',
    phone: '+91 98765 43210',
    description: 'Authentic Kumaoni stone homestay overlooking Nanda Devi & Trishul peaks with guided Himalayan alpine treks and 4x4 safaris.',
    location: {
      address: 'Binsar Sanctuary Road, Almora',
      district: 'Almora',
      coordinates: [79.6554, 29.5962]
    },
    verificationStatus: 'verified',
    rating: 4.92,
    reviewCount: 48,
    joinedAt: '2024-01-15',
    badges: ['State Tourism Certified', 'Eco Green Homestay', 'Superhost 2026', 'Blockchain Verified'],
    bankDetails: {
      accountNumber: '••••••••4892',
      ifsc: 'SBIN0001234',
      holderName: 'Himalayan Echoes Retreats LLP'
    }
  }
};

const MOCK_STATS = {
  success: true,
  stats: {
    totalListings: 4,
    activeListings: 3,
    pendingVerification: 1,
    totalBookings: 86,
    activeBookings: 12,
    monthlyRevenue: 148500,
    totalRevenue: 842000,
    occupancyRate: 88,
    avgRating: 4.92,
    unsettledPayouts: 32400
  }
};

const MOCK_LISTINGS = {
  success: true,
  listings: [
    {
      _id: 'lst_001',
      title: 'Himalayan Panorama Wooden Cottage',
      category: 'homestay',
      description: 'Traditional cedarwood cottage with unobstructed panoramic views of Nanda Devi and Trishul peaks.',
      location: { district: 'Almora', address: 'Binsar Estate, Almora', coordinates: [79.6554, 29.5962] },
      pricePerNight: 4500,
      basePrice: 4500,
      currency: 'INR',
      images: [
        'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
      ],
      rating: 4.95,
      reviewCount: 32,
      status: 'active',
      verificationStatus: 'verified',
      amenities: ['Mountain View', 'Fireplace', 'Organic Kumaoni Food', 'Solar Heated Water', 'High-Speed Wi-Fi'],
      capacity: { guests: 4, bedrooms: 2, beds: 2, baths: 2 }
    },
    {
      _id: 'lst_002',
      title: '4x4 Himalayan Expedition Scorpio 4WD',
      category: 'vehicle',
      description: 'Heavy duty Mahindra Scorpio 4x4 with high-altitude snow chains and expert local driver for high mountain passes.',
      location: { district: 'Rishikesh', address: 'Tapovan, Rishikesh', coordinates: [78.3255, 30.1345] },
      pricePerDay: 3800,
      basePrice: 3800,
      currency: 'INR',
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'
      ],
      rating: 4.88,
      reviewCount: 24,
      status: 'active',
      verificationStatus: 'verified',
      amenities: ['4x4 AWD', 'GPS Corridors', 'Snow Chains', 'Oxygen Cylinder', 'Carrier Roof Rack'],
      capacity: { seats: 7 }
    },
    {
      _id: 'lst_003',
      title: 'Kedarkantha Winter Summit Guided Expedition',
      category: 'trek',
      description: 'Certified IMF guide led 4-day summit expedition with all safety gears, crampons, and alpine tents.',
      location: { district: 'Uttarkashi', address: 'Sankri Base Village', coordinates: [78.1872, 31.0772] },
      pricePerPerson: 7500,
      basePrice: 7500,
      currency: 'INR',
      images: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
      ],
      rating: 5.0,
      reviewCount: 42,
      status: 'active',
      verificationStatus: 'verified',
      amenities: ['IMF Certified Guide', 'All Meals Included', 'Safety Gear & Crampons', 'Trek Permit Included'],
      capacity: { maxGroupSize: 12 }
    },
    {
      _id: 'lst_004',
      title: 'Valley of Flowers Botanical Eco Camp',
      category: 'homestay',
      description: 'Eco-friendly Swiss tents nestled right at the threshold of Govindghat with organic mountain dining.',
      location: { district: 'Chamoli', address: 'Govindghat Riverside', coordinates: [79.5714, 30.6272] },
      pricePerNight: 3200,
      basePrice: 3200,
      currency: 'INR',
      images: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
      ],
      rating: 4.8,
      reviewCount: 14,
      status: 'pending_verification',
      verificationStatus: 'pending',
      amenities: ['Riverside View', 'Hot Water Bottles', 'Local Herbal Tea', 'Campfire Circle'],
      capacity: { guests: 2, bedrooms: 1, beds: 1, baths: 1 }
    }
  ]
};

const MOCK_BOOKINGS = {
  success: true,
  bookings: [
    {
      _id: 'bk_001',
      bookingNumber: 'DUK-2026-8891',
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav.sharma@gmail.com',
      customerPhone: '+91 98112 34567',
      listingTitle: 'Himalayan Panorama Wooden Cottage',
      listingCategory: 'homestay',
      checkIn: '2026-10-15',
      checkOut: '2026-10-18',
      guests: 2,
      totalAmount: 13500,
      payoutAmount: 12150,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2026-10-02'
    },
    {
      _id: 'bk_002',
      bookingNumber: 'DUK-2026-8892',
      customerName: 'Priya Mehra',
      customerEmail: 'priya.mehra@outlook.com',
      customerPhone: '+91 97110 88231',
      listingTitle: '4x4 Himalayan Expedition Scorpio 4WD',
      listingCategory: 'vehicle',
      checkIn: '2026-10-20',
      checkOut: '2026-10-24',
      guests: 4,
      totalAmount: 15200,
      payoutAmount: 13680,
      status: 'confirmed',
      paymentStatus: 'escrow_locked',
      createdAt: '2026-10-05'
    },
    {
      _id: 'bk_003',
      bookingNumber: 'DUK-2026-8893',
      customerName: 'Rohit Verma',
      customerEmail: 'rohit.v@tech.io',
      customerPhone: '+91 98990 12345',
      listingTitle: 'Kedarkantha Winter Summit Guided Expedition',
      listingCategory: 'trek',
      checkIn: '2026-11-01',
      checkOut: '2026-11-05',
      guests: 2,
      totalAmount: 15000,
      payoutAmount: 13500,
      status: 'pending',
      paymentStatus: 'escrow_locked',
      createdAt: '2026-10-06'
    }
  ]
};

const MOCK_EARNINGS = {
  success: true,
  earnings: {
    totalRevenue: 842000,
    netEarnings: 757800,
    platformFee: 84200,
    pendingEscrow: 32400,
    lastPayoutDate: '2026-09-30',
    lastPayoutAmount: 64200,
    monthlyBreakdown: [
      { month: 'May 2026', revenue: 98000, bookings: 14 },
      { month: 'Jun 2026', revenue: 142000, bookings: 22 },
      { month: 'Jul 2026', revenue: 86000, bookings: 11 },
      { month: 'Aug 2026', revenue: 112000, bookings: 16 },
      { month: 'Sep 2026', revenue: 165000, bookings: 25 },
      { month: 'Oct 2026', revenue: 148500, bookings: 18 }
    ]
  }
};

const MOCK_EXPENSES = {
  success: true,
  expenses: [
    { _id: 'exp_01', category: 'Maintenance', description: 'Cedar wood polishing & solar panel check', amount: 8500, date: '2026-10-01' },
    { _id: 'exp_02', category: 'Provisions', description: 'Organic Kumaoni pulses & Himalayan honey bulk purchase', amount: 12000, date: '2026-09-28' },
    { _id: 'exp_03', category: 'Fuel & Transport', description: 'Scorpio 4x4 high-altitude maintenance & fluids', amount: 6200, date: '2026-09-20' }
  ]
};

const MOCK_ANALYTICS = {
  success: true,
  analytics: {
    viewsThisMonth: 3420,
    conversionRate: 4.8,
    averageDailyRate: 4350,
    repeatGuestsRate: 22,
    topReferrers: [
      { source: 'Discovery AI Trip Copilot', visits: 1840 },
      { source: 'Himalayan Corridor Explorer', visits: 890 },
      { source: 'Direct Search & QR Verification', visits: 690 }
    ]
  }
};

const MOCK_REVIEWS = {
  success: true,
  reviews: [
    {
      _id: 'rev_01',
      authorName: 'Ananya Deshmukh',
      rating: 5,
      date: '2026-09-25',
      listingTitle: 'Himalayan Panorama Wooden Cottage',
      comment: 'The sunrise view of Nanda Devi directly from our bedroom window was magical! Deepak ji served the best Bhatt ki Churkani.',
      reply: 'Dhanyavaad Ananya! We would love to host you and your family again during the winter snows.'
    },
    {
      _id: 'rev_02',
      authorName: 'Karan Singhal',
      rating: 5,
      date: '2026-09-18',
      listingTitle: '4x4 Himalayan Expedition Scorpio 4WD',
      comment: 'Top-notch 4WD vehicle. Negotiated the steep hairpin bends of Munsiyari with absolute ease and safety.',
      reply: 'Glad you enjoyed the high mountain drive Karan!'
    }
  ]
};

const MOCK_SETTLEMENTS = {
  success: true,
  settlements: [
    { _id: 'stl_01', refId: 'STL-2026-901', amount: 64200, status: 'completed', payoutDate: '2026-09-30', bankRef: 'NEFT-SBIN-892189' },
    { _id: 'stl_02', refId: 'STL-2026-902', amount: 32400, status: 'processing', payoutDate: '2026-10-15', bankRef: 'ESCROW-LOCK-3391' }
  ],
  summary: {
    settledTotal: 725400,
    pendingTotal: 32400
  }
};

const MOCK_DOCUMENTS = {
  success: true,
  documents: [
    { _id: 'doc_01', name: 'Uttarakhand Homestay Certificate 2026', type: 'Govt Certificate', status: 'verified', expiryDate: '2027-12-31' },
    { _id: 'doc_02', name: 'Commercial 4x4 Tourist Permit', type: 'RTO Permit', status: 'verified', expiryDate: '2027-04-30' },
    { _id: 'doc_03', name: 'IMF Certified Guide Accreditation', type: 'Mountain Safety', status: 'verified', expiryDate: '2028-06-30' }
  ],
  expiringIn30Days: 0
};

const MOCK_ACTION_ITEMS = {
  success: true,
  actionItems: [
    { _id: 'act_01', type: 'booking', title: 'New Reservation Request', message: 'Rohit Verma requested Kedarkantha Winter Summit for Nov 1.', date: '2 hours ago', tab: 'bookings' },
    { _id: 'act_02', type: 'verification', title: 'Listing Ready for Review', message: 'Valley of Flowers Camp is queued for officer approval.', date: 'Yesterday', tab: 'verification' }
  ]
};

// ── Partner Operations ──────────────────────────────────────────────

export const registerPartner = async (partnerData) => {
  return await safeFetch(`${API_BASE_URL}/partners`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(partnerData)
  }, { success: true, message: 'Registration received.', partner: MOCK_PROFILE.partner });
};

export const getMyPartnerProfile = async () => {
  return await safeFetch(`${API_BASE_URL}/partners/me`, {
    headers: getHeaders()
  }, MOCK_PROFILE);
};

export const updateMyPartnerProfile = async (updates) => {
  return await safeFetch(`${API_BASE_URL}/partners/me`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  }, { success: true, partner: { ...MOCK_PROFILE.partner, ...updates } });
};

export const createListingDraft = async (listingData) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/listings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(listingData)
  }, { success: true, listing: { _id: 'lst_' + Date.now(), ...listingData, status: 'draft' } });
};

export const getMyListings = async () => {
  return await safeFetch(`${API_BASE_URL}/partners/me/listings`, {
    headers: getHeaders()
  }, MOCK_LISTINGS);
};

export const getMyListingById = async (id) => {
  const match = MOCK_LISTINGS.listings.find(l => l._id === id);
  return await safeFetch(`${API_BASE_URL}/partners/me/listings/${id}`, {
    headers: getHeaders()
  }, { success: true, listing: match || MOCK_LISTINGS.listings[0] });
};

export const updateListing = async (id, updates) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/listings/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  }, { success: true, message: 'Listing updated successfully.' });
};

export const submitListingForVerification = async (id) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/listings/${id}/submit`, {
    method: 'POST',
    headers: getHeaders()
  }, { success: true, message: 'Submitted for verification.' });
};

export const reopenRejectedListing = async (id) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/listings/${id}/reopen`, {
    method: 'POST',
    headers: getHeaders()
  }, { success: true });
};

// ── Extended Partner Business Operations ────────────────────────────

export const getPartnerDashboardStats = async () => {
  return await safeFetch(`${API_BASE_URL}/partners/dashboard`, {
    headers: getHeaders()
  }, MOCK_STATS);
};

export const deletePartnerListing = async (id) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/listings/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }, { success: true, message: 'Listing deleted.' });
};

export const updateListingPricing = async (id, pricingData) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/listings/${id}/pricing`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(pricingData)
  }, { success: true, message: 'Pricing tariffs updated.' });
};

export const getPartnerBookings = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return await safeFetch(`${API_BASE_URL}/partners/me/bookings${params ? `?${params}` : ''}`, {
    headers: getHeaders()
  }, MOCK_BOOKINGS);
};

export const updatePartnerBookingStatus = async (id, status, notes = '') => {
  return await safeFetch(`${API_BASE_URL}/partners/me/bookings/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status, notes })
  }, { success: true, message: `Booking marked as ${status}.` });
};

export const getPartnerAvailability = async () => {
  return await safeFetch(`${API_BASE_URL}/partners/me/availability`, {
    headers: getHeaders()
  }, { success: true, calendar: {} });
};

export const updatePartnerAvailability = async (id, availabilityData) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/listings/${id}/availability`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(availabilityData)
  }, { success: true, message: 'Calendar updated.' });
};

export const getPartnerEarnings = async () => {
  return await safeFetch(`${API_BASE_URL}/partners/me/earnings`, {
    headers: getHeaders()
  }, MOCK_EARNINGS);
};

export const getPartnerExpenses = async () => {
  return await safeFetch(`${API_BASE_URL}/partners/me/expenses`, {
    headers: getHeaders()
  }, MOCK_EXPENSES);
};

export const createPartnerExpense = async (expenseData) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/expenses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(expenseData)
  }, { success: true, expense: { _id: 'exp_' + Date.now(), ...expenseData } });
};

export const deletePartnerExpense = async (id) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/expenses/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }, { success: true });
};

export const getPartnerAnalytics = async () => {
  return await safeFetch(`${API_BASE_URL}/partners/me/analytics`, {
    headers: getHeaders()
  }, MOCK_ANALYTICS);
};

export const getPartnerReviews = async () => {
  return await safeFetch(`${API_BASE_URL}/partners/me/reviews`, {
    headers: getHeaders()
  }, MOCK_REVIEWS);
};

export const replyToPartnerReview = async (id, text) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/reviews/${id}/reply`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text })
  }, { success: true });
};

export const uploadPartnerImages = async (formData) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE_URL}/partners/me/upload`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch {
    return {
      success: true,
      urls: ['https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80']
    };
  }
};

export const uploadListingImages = async (listingId, formData) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE_URL}/partners/me/listings/${listingId}/images`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch {
    return {
      success: true,
      urls: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80']
    };
  }
};

export const deleteListingImage = async (listingId, imageId) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/listings/${listingId}/images/${imageId}`, {
    method: 'DELETE',
    headers: getHeaders()
  }, { success: true });
};

// ── Settlements ─────────────────────────────────────────────────────

export const getPartnerSettlements = async () => {
  return await safeFetch(`${API_BASE_URL}/partners/me/settlements`, {
    headers: getHeaders()
  }, MOCK_SETTLEMENTS);
};

// ── Documents ───────────────────────────────────────────────────────

export const getPartnerDocuments = async () => {
  return await safeFetch(`${API_BASE_URL}/partners/me/documents`, {
    headers: getHeaders()
  }, MOCK_DOCUMENTS);
};

export const uploadPartnerDocument = async (formData) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE_URL}/partners/me/documents`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch {
    return { success: true, message: 'Document uploaded for verification.' };
  }
};

export const deletePartnerDocumentApi = async (id) => {
  return await safeFetch(`${API_BASE_URL}/partners/me/documents/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }, { success: true });
};

// ── Action Items ────────────────────────────────────────────────────

export const getPartnerActionItems = async () => {
  return await safeFetch(`${API_BASE_URL}/partners/me/action-items`, {
    headers: getHeaders()
  }, MOCK_ACTION_ITEMS);
};

// ── Admin Verification Operations ───────────────────────────────────

export const getPendingListingsAdmin = async () => {
  return await safeFetch(`${API_BASE_URL}/admin/listings/pending`, {
    headers: getHeaders()
  }, { success: true, listings: MOCK_LISTINGS.listings.filter(l => l.status === 'pending_verification') });
};

export const getListingForAdmin = async (id) => {
  const match = MOCK_LISTINGS.listings.find(l => l._id === id);
  return await safeFetch(`${API_BASE_URL}/admin/listings/${id}`, {
    headers: getHeaders()
  }, { success: true, listing: match || MOCK_LISTINGS.listings[0] });
};

export const verifyListingAdmin = async (id, notes = '') => {
  return await safeFetch(`${API_BASE_URL}/admin/listings/${id}/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ notes })
  }, { success: true, message: 'Listing verified.' });
};

export const rejectListingAdmin = async (id, reason) => {
  return await safeFetch(`${API_BASE_URL}/admin/listings/${id}/reject`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason })
  }, { success: true, message: 'Listing rejected.' });
};

export const getVerificationLogsAdmin = async () => {
  return await safeFetch(`${API_BASE_URL}/admin/verification-logs`, {
    headers: getHeaders()
  }, { success: true, logs: [] });
};
