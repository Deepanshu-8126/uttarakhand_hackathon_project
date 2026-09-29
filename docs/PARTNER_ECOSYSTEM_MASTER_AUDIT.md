# Discovery Uttarakhand — Partner Ecosystem Master Architecture Audit
**Document Version:** 1.0.0 (Production Master Audit)  
**Target:** Unified Partner Ecosystem (Login → Onboarding → Partner Hub [Manage + Operate + Preview] → Marketplace)

---

## 1. Existing Partner Authentication Flow
- **Current Setup:** `Frontend/src/pages/LoginPage.jsx` with segmented switch (`traveler` vs `partner`).
- **Mechanisms:**
  - Standard JWT with `email` / `password` or instant One-Click credentials.
  - Server-side role assignment in `backend/controllers/authController.js` and `backend/controllers/partnerController.js`.
  - Token stored in `localStorage` under key `'token'`, verified via `/api/auth/me`.
- **Gaps Identified:**
  - No dedicated, prestigious `/partner/login` branded landing page.
  - No explicit OTP-ready architecture indicator.
  - Direct redirect upon login was previously defaulting to generic `/partner` without distinguishing between new partner needing onboarding vs active verified partner.

---

## 2. Existing Partner Onboarding Flow
- **Current Setup:** In `LoginPage.jsx` with a basic sub-role selector (`homestay`, `rental`, `guide`).
- **Backend Setup:** `POST /api/partners` creates a `Partner` document with `verificationStatus: 'DRAFT'`, status `'APPROVED'`, and links to the authenticated user.
- **Gaps Identified:**
  - Need a dedicated, clean progressive multi-step Onboarding flow (`/partner/onboarding`):
    - Step 1: Partner Identity
    - Step 2: Business Profile
    - Step 3: Business Type & Capabilities
    - Step 4: Location & Service Areas
    - Step 5: Compliance Documents
    - Step 6: Verification Submission → Partner Hub.

---

## 3. Existing Partner Dashboard Structure
- **Current Setup:** `Frontend/src/pages/partner/PartnerDashboardPage.jsx` with 14 tabs:
  `overview`, `listings`, `add-listing`, `bookings`, `availability`, `pricing`, `earnings`, `settlements`, `expenses`, `analytics`, `reviews`, `verification`, `documents`, `profile`.
- **Design Pattern:** Left sidebar + Top header + Mobile bottom bar.
- **Gaps Identified:**
  - Mental model was partially fragmented into individual database tabs rather than the core:
    - **MANAGE:** Business, Services, Verification, Documents, Analytics, Settings.
    - **OPERATE:** Bookings, Availability, Earnings, Reviews.
    - **PREVIEW:** Public Profile, Customer Preview modal.
  - Needs progressive disclosure with primary items (`Home`, `My Business`, `My Services`, `Bookings`, `Earnings`, `Reviews`) and secondary under "More Tools".
  - Needs dedicated "Customer Preview" mode for every service and public profile preview.

---

## 4. Existing Routes
- **Frontend (`App.jsx`):**
  - `/login`: Universal login
  - `/partner`: Protected route (partnerOnly)
  - `/partner/:tab`: Protected route (partnerOnly)
  - `/partner/*`: Catch-all inside partner namespace
- **New Required Routes to Lock In:**
  - `/partner/login`: Dedicated Partner Gateway
  - `/partner/register`: Forward to Onboarding
  - `/partner/onboarding`: Multi-step business setup wizard
  - `/partner/services`: Canonical alias for listings
  - `/partner/business`: Canonical alias for profile
  - `/partner/services/:id/preview`: Direct customer preview route

---

## 5. Existing APIs & Endpoints
- **Partner Profile & Business:**
  - `GET /api/partners/me` / `PATCH /api/partners/me`
- **Dashboard & Action Items:**
  - `GET /api/partners/dashboard`, `GET /api/partners/action-items`
- **Services (Listings):**
  - `GET /api/partners/listings`, `POST /api/partners/listings`, `GET /api/partners/listings/:id`
  - `PATCH /api/partners/listings/:id`, `DELETE /api/partners/listings/:id`
  - `PATCH /api/partners/listings/:id/pricing`
  - `POST /api/partners/listings/:id/submit`, `POST /api/partners/listings/:id/reopen`
  - `POST /api/partners/listings/:id/images`, `DELETE /api/partners/listings/:id/images/:imageId`
- **Bookings & Availability:**
  - `GET /api/partners/bookings`, `PATCH /api/partners/bookings/:id/status`
  - `GET /api/partners/availability`, `PATCH /api/partners/availability/:id`
- **Earnings & Settlements:**
  - `GET /api/partners/earnings`, `GET /api/partners/settlements`
  - `GET /api/partners/expenses`, `POST /api/partners/expenses`, `DELETE /api/partners/expenses/:id`
- **Documents & Verification:**
  - `GET /api/partners/documents`, `POST /api/partners/documents`, `DELETE /api/partners/documents/:id`
  - `GET /api/partners/reviews`, `POST /api/partners/reviews/:id/reply`

---

## 6. Existing Database Models
1. `backend/models/Partner.js`: Business identity, type, contact, location GeoJSON, verification status, credentials, capabilities.
2. `backend/models/PartnerListing.js`: Discrete lifecycle (`DRAFT`, `PENDING_VERIFICATION`, `VERIFIED`, `ACTIVE`, `REJECTED`), pricing provenance (`PARTNER_CLAIMED`), vehicle specs, room specs, guide specs.
3. `backend/models/PartnerDocument.js`: Isolated document compliance records.
4. `backend/models/Payment.js`: Razorpay transaction records, escrow states, partner settlements.
5. `backend/models/Booking.js`: Customer bookings with partner reference, dates, amounts.
6. `backend/models/Review.js`: Verified reviews with ratings and partner replies.

---

## 7. Existing Security Rules (Strictly Preserved)
1. **Server-Side Authorization:** Role is never accepted from body; always extracted from validated JWT token.
2. **Strict Partner Ownership:** Every listing, document, and booking query filters by `partner._id` or `ownerUser._id`.
3. **No Self-Verification:** Partners can only transition listings to `PENDING_VERIFICATION`. Only Admins can set `VERIFIED` or `ACTIVE`.
4. **Cross-Partner Isolation:** Partners can never read or mutate another partner's records (403 Forbidden).
5. **Pricing Provenance:** Partner pricing is recorded as `PARTNER_CLAIMED` until audited by admin.

---

## 8. Existing Advanced Capabilities (Must Remain Intact)
- Web3 On-Chain Verification hash & Polygon / Amoy contract addresses.
- QR Code Verification view for travelers and authorities.
- Razorpay Native Escrow state machine & partner payout calculation (platform fee deduction).
- Mobility & Transport readiness: `Taxi`, `Jeep`, `Max`, `SharedRide`, `PrivateRide`, `DriverPartner`.
- Real database aggregation (0 mock data, accurate empty states).

---

## 9. Existing Problems & Usability Gaps
1. **No Dedicated Partner Gateway:** Partners entered through traveler login without a clear business portal entrance.
2. **Missing Customer Preview:** Partners had no easy way to verify what their services look like to actual travelers.
3. **Information Overload:** 14 tabs placed in the sidebar at once caused cognitive load.
4. **Onboarding Disconnection:** New partners didn't have a structured 6-step guided onboarding wizard.

---

## 10. Files to Modify & Create
1. **New:** `Frontend/src/pages/partner/PartnerLoginPage.jsx` (Dedicated, prestigious Partner Gateway with OTP readiness, email sign-in, and onboarding links).
2. **New:** `Frontend/src/pages/partner/PartnerOnboardingPage.jsx` (Progressive 6-step business onboarding).
3. **New:** `Frontend/src/components/partner/CustomerPreviewModal.jsx` (Real traveler view modal with service details, verified badge, and disabled booking tag).
4. **Modify:** `Frontend/src/App.jsx` (Register `/partner/login`, `/partner/onboarding`, `/partner/services`, `/partner/business`, `/partner/preview`).
5. **Modify:** `Frontend/src/pages/partner/PartnerDashboardPage.jsx` (Unified Partner Hub shell supporting MANAGE / OPERATE / PREVIEW with Customer Preview integration and modal control).
6. **Modify:** `Frontend/src/components/partner/PartnerHeader.jsx` (Add `[ View Public Profile ]` and `[ + Add Service ]` top-level CTAs).
7. **Modify:** `Frontend/src/components/partner/PartnerSidebar.jsx` (Refined 6 primary items + progressive "More Tools" + identity badge).
8. **Modify:** `Frontend/src/components/partner/tabs/ListingsTab.jsx` (Rename to "My Services", add `[ View as Customer ]` preview trigger on every service card, capability-based filtering).
9. **Modify:** `Frontend/src/components/partner/tabs/OverviewTab.jsx` (Command center with LIVE status, Action Center, Today's operational data, and Preview button).
