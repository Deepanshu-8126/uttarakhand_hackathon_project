# Partner Dashboard Ecosystem — Complete Audit Report
> Discovery Uttarakhand — Module 03 Pre-Implementation Audit
> Generated: 2026-09-29

---

## 1. BACKEND MODELS INVENTORY

### Partner.js
- **Fields**: user (ref:User), businessName, legalBusinessName, partnerType (enum: Homestay/Hotel/Guide/TrekOperator/VehicleRental/ActivityProvider), phone, email, district, city, locality, address, location (GeoJSON), logo (imageSchema), coverImage (imageSchema), operatingHours, pickupInformation, description, status (PENDING_APPROVAL/APPROVED/SUSPENDED), verificationStatus (DRAFT/PENDING_VERIFICATION/VERIFIED/REJECTED), verificationNotes, credentialType, credentialReference, reviewedBy, submittedAt, verifiedAt, rejectedAt, isActive
- **GAPS**: 
  - Missing: `displayName`, `contactPerson`, `alternatePhone`, `state`, `pincode`, `serviceCategories[]`, `languages[]`, `profileImage`, `socialLinks`, `operatingAreas[]`
  - `partnerType` enum too narrow — needs future mobility types
  - No `NOT_STARTED` or `SUSPENDED`/`REVOKED` in verificationStatus enum
  - Missing `state` field (defaults assume Uttarakhand only)

### PartnerListing.js
- **Fields**: partner, ownerUser, listingType (Stay/Guide/Rental/Activity), title, slug, category, district, city, locality, destination, destinationSlug, address, location, description, amenities[], images[], capacity, specifications, pricingDetails, availabilityDetails, pricing (structured with provenance), status (DRAFT/PENDING_VERIFICATION/VERIFIED/ACTIVE/REJECTED/SUSPENDED/REVOKED), web3Sync
- **GOOD**: Already has web3Sync, pricing provenance, structured availability, specifications
- **GAPS**: 
  - `listingType` enum too narrow — needs Transport/Mobility/SharedRide/Experience etc.
  - No `capacity.seating` for mobility
  - Missing type-specific configuration subdocument pattern

### Booking.js
- **Fields**: user, type (stay/rental/guide/partner_listing/transport), partnerListing, stay, rental, guide, trip, bookingReference, vehicle snapshot, dates, financial snapshots, status state machine, escrow + OTP, cancellation
- **GOOD**: Has escrow, OTP, immutable snapshots, cancellation schema
- **STATE MACHINE**: PENDING/CONFIRMED/CHECKED_IN/CANCELLED/COMPLETED

### Payment.js
- **Fields**: bookingId, userId, partnerId, razorpay fields, status state machine, financialBreakdown (gross/platformFee/taxes/partnerAmount/settlementStatus/settlementReference), refund fields
- **GOOD**: Has financial breakdown, settlement status, partner reference
- **GAPS**: No dedicated PartnerSettlement model (currently inline in Payment)

### Review.js
- **Fields**: user, rating, comment, targetType (many options including PartnerListing), target, status, reply
- **GOOD**: Has reply mechanism, partner listing support

### VerificationAuditLog.js
- **Fields**: admin, targetType (PartnerListing/Partner), targetId, action (APPROVE/REJECT/PUBLISH/SUSPEND/UPDATE_PRICE_PROVENANCE), previousStatus, newStatus, reason, verificationVersion, changedFields, decisionSource
- **GOOD**: Immutable, well-indexed, supports both Partner and PartnerListing

### User.js
- **Roles**: user/citizen/tourist/trekker/local/partner/owner/guide/admin

---

## 2. BACKEND CONTROLLER AUDIT (partnerController.js — 1470 lines)

### Implemented Functions (18 total):
1. `registerPartner` — POST /api/partners (creates Partner + elevates user role)
2. `getMyPartnerProfile` — GET /api/partners/me
3. `updateMyPartnerProfile` — PATCH /api/partners/me (allowlist: businessName, legalBusinessName, phone, email, district, city, locality, address, description, credentialType, credentialReference)
4. `createListingDraft` — POST /api/partners/me/listings
5. `getMyListings` — GET /api/partners/me/listings
6. `getMyListingById` — GET /api/partners/me/listings/:id
7. `updateListing` — PATCH /api/partners/me/listings/:id
8. `submitListingForVerification` — POST /api/partners/me/listings/:id/submit
9. `reopenRejectedListing` — POST /api/partners/me/listings/:id/reopen
10. `getPartnerDashboard` — GET /api/partners/dashboard (real metrics)
11. `deleteListing` — DELETE /api/partners/me/listings/:id
12. `updateListingPricing` — PATCH /api/partners/me/listings/:id/pricing (PARTNER_CLAIMED)
13. `getPartnerBookings` — GET /api/partners/me/bookings (with filters)
14. `updatePartnerBookingStatus` — PATCH /api/partners/me/bookings/:id/status
15. `getPartnerAvailability` — GET /api/partners/me/availability
16. `updatePartnerAvailability` — PATCH /api/partners/me/availability/:id
17. `getPartnerEarnings` — GET /api/partners/me/earnings (real calculation)
18. `getPartnerExpenses` — GET/POST/DELETE expenses
19. `getPartnerAnalytics` — GET /api/partners/me/analytics
20. `getPartnerReviews` — GET /api/partners/me/reviews
21. `replyToReview` — POST /api/partners/me/reviews/:id/reply
22. `uploadListingImages` — POST /api/partners/me/listings/:id/images
23. `deleteListingImage` — DELETE /api/partners/me/listings/:id/images/:imageId

### Security Features:
- ✅ No client role injection
- ✅ Partners cannot set VERIFIED/ACTIVE
- ✅ Cross-partner isolation (ownerUser check)
- ✅ Editing only in DRAFT/REJECTED states
- ✅ Pricing updates always PARTNER_CLAIMED
- ✅ Booking ownership verification

### ISSUES FOUND:
- ⚠️ `updateListing` (line 486) auto-promotes to ACTIVE without admin verification — VIOLATES state machine contract
- ⚠️ `createListingDraft` (line 337) sets pricing provenance to VERIFIED — should be PARTNER_CLAIMED for new drafts
- ⚠️ `updateListing` (line 480) sets pricing provenance to VERIFIED — should remain PARTNER_CLAIMED
- ⚠️ No settlements endpoint
- ⚠️ No documents management endpoint
- ⚠️ No notifications endpoint
- ⚠️ Earnings hardcodes 10% platform fee (line 1052) — should be configurable

---

## 3. FRONTEND AUDIT

### Existing Components:
- `PartnerDashboardPage.jsx` (494 lines) — Tab-based dashboard page
- `PartnerSidebar.jsx` — 11 nav items, verification badge
- `PartnerHeader.jsx` — Title bar
- 11 Tab Components: Overview, Listings, ListingForm, Bookings, Availability, Pricing, Earnings, Expenses, Analytics, Reviews, Profile

### Routing:
- `/partner` → PartnerDashboardPage (ProtectedRoute partnerOnly)
- `/partner/:tab` → Same page with tab param

### API Layer (partnerApi.js — 275 lines):
- All 23 backend endpoints have frontend API functions

### ISSUES FOUND:
- ⚠️ OverviewTab has hardcoded demo escrow booking with fake OTP "849201" (line 26-34) — VIOLATES "no fake data" rule
- ⚠️ OverviewTab displays "MMT-Killer Architecture" badge — marketing text, not production UI
- ⚠️ No Verification Center tab (verification only shown as badge)
- ⚠️ No Documents tab
- ⚠️ No Settlements tab  
- ⚠️ No Notifications tab
- ⚠️ No Action Center
- ⚠️ Missing responsive mobile bottom nav

---

## 4. WHAT ALREADY WORKS (DO NOT REWRITE)

1. ✅ Partner registration with role elevation
2. ✅ Partner profile CRUD with field allowlist
3. ✅ Listing lifecycle (DRAFT → PENDING → VERIFIED → ACTIVE)
4. ✅ State machine enforcement (mostly)
5. ✅ Cross-partner isolation
6. ✅ Booking retrieval with filters
7. ✅ Booking status updates (CONFIRMED/COMPLETED/CANCELLED)
8. ✅ Earnings calculation from real booking data
9. ✅ Analytics with category breakdown
10. ✅ Reviews with reply
11. ✅ Image upload (Cloudinary + local fallback)
12. ✅ Availability management
13. ✅ Pricing management with PARTNER_CLAIMED provenance
14. ✅ Expense tracking
15. ✅ Web3 sync infrastructure on PartnerListing
16. ✅ Escrow/OTP schema on Booking
17. ✅ Payment model with financial breakdown & settlement
18. ✅ VerificationAuditLog immutable trail
19. ✅ Admin verification controller exists

---

## 5. WHAT NEEDS TO BE BUILT / FIXED

### Backend Changes Required:
1. **FIX**: updateListing auto-ACTIVE bypass → enforce state machine
2. **FIX**: createListingDraft pricing provenance should be PARTNER_CLAIMED
3. **EXTEND**: Partner model — add serviceCategories, languages, profileImage, operatingAreas, displayName
4. **EXTEND**: PartnerListing listingType enum — add Transport, Experience, Mobility, SharedRide
5. **EXTEND**: Partner partnerType enum — add TransportOperator, MobilityPartner, DriverPartner, TourOperator
6. **ADD**: GET /api/partner/settlements — real settlement data from Payment.financialBreakdown
7. **ADD**: GET /api/partner/documents — document management (new PartnerDocument model)
8. **ADD**: POST /api/partner/documents — upload verification docs
9. **ADD**: GET /api/partner/action-items — computed action center
10. **ADD**: Platform fee should be configurable, not hardcoded

### Frontend Changes Required:
1. **REMOVE**: Fake demo escrow booking from OverviewTab
2. **ADD**: Verification Center tab (show verification status, timeline, admin feedback)
3. **ADD**: Settlements tab
4. **ADD**: Documents tab
5. **ADD**: Action Center (proactive notifications)
6. **REDESIGN**: OverviewTab to show real operational data
7. **ADD**: Sidebar items for new tabs
8. **IMPROVE**: Mobile responsiveness

---

## 6. DATABASE — NO NEW COLLECTIONS NEEDED (except PartnerDocument)

### New Model: PartnerDocument
- partner: ObjectId (ref:Partner)
- ownerUser: ObjectId (ref:User)
- documentType: enum (identity_proof, business_registration, tourism_registration, vehicle_registration, driving_license, permit, insurance, ownership_proof, gst_document, other)
- fileName: String
- fileUrl: String (private/signed URL)
- publicId: String
- status: enum (PENDING, VERIFIED, REJECTED, EXPIRED)
- expiryDate: Date (optional)
- uploadedAt: Date
- verifiedAt: Date
- rejectedReason: String
- version: Number

### Why new model: 
- Documents are a first-class entity requiring separate lifecycle management
- Expiry tracking, versioning, admin verification workflow
- Cannot fit into Partner model fields without schema pollution
- Future mobility will require driver license, vehicle permit, insurance — all documents

---

## 7. SECURITY CONSTRAINTS (IMMUTABLE)

| Rule | Status |
|------|--------|
| JWT + partnerOnly middleware | ✅ Exists |
| Partner cannot self-verify | ✅ Enforced |
| Partner cannot set ACTIVE | ⚠️ Broken in updateListing |
| Cross-partner isolation | ✅ Enforced |
| No client-side role injection | ✅ Enforced |
| No client-side price authority | ✅ Enforced (PARTNER_CLAIMED) |
| No client-side payment confirmation | ✅ Enforced |
| Payment source of truth = backend | ✅ Enforced |
| Booking state machine immutable | ✅ Enforced |
| Admin-only verification | ✅ Enforced |

---

## 8. FUTURE MODULE 03 READINESS PLAN

The Partner model and PartnerListing model must support future types without rewriting:

| Future Type | How It Maps |
|-------------|-------------|
| Shared Jeep Partner | Partner(type: TransportOperator) + PartnerListing(type: SharedRide) |
| Max Partner | Partner(type: TransportOperator) + PartnerListing(type: SharedRide) |
| Bolero Partner | Partner(type: TransportOperator) + PartnerListing(type: PrivateRide) |
| Taxi Partner | Partner(type: MobilityPartner) + PartnerListing(type: Mobility) |
| Driver Partner | Partner(type: DriverPartner) + separate DriverProfile model (future) |
| Tour Operator | Partner(type: TourOperator) + PartnerListing(type: MultiDayTrip) |

Architecture extension points are needed, not implementations.
