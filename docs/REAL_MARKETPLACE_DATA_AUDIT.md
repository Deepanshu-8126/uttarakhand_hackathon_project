# Discovery Uttarakhand — Real Marketplace Data Audit
**Document ID:** `AUDIT-M01-DATA-FOUNDATION`  
**Date:** September 2026  
**Auditor:** Antigravity Autonomous Agent  
**Environment:** MongoDB Atlas + Production Express Backend + React Vite Frontend  

---

## Executive Summary
This audit inspects the existing marketplace data sources, models, APIs, and rendering layers across Discovery Uttarakhand (`/stays`, `/rentals`, `/guides`). While the platform possesses genuine government tourism datasets (116 KMVN rest houses, 11 verified mountain rental businesses, 190 registered Uttarakhand Tourism Development Board guides, and 16 partner listings), several mock fallbacks, hardcoded Unsplash image pools, client-side fake ratings, and duplicate fallback datasets in `Frontend/src/data/` weaken data fidelity.

This document establishes the audit baseline required to elevate Discovery Uttarakhand from a demo/hackathon prototype into an authentic, production-grade tourism marketplace.

---

## 1. Current Source of Stay Data
- **Backend Model:** [`backend/models/Stay.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/models/Stay.js) and [`backend/models/PartnerListing.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/models/PartnerListing.js).
- **Backend Controller:** [`backend/controllers/stayController.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/controllers/stayController.js) executes:
  1. `Stay.find({})`: Loads 116 records from MongoDB Atlas.
  2. `PartnerListing.find({ listingType: { $in: ['Stay', 'stay', 'Homestay', 'Hotel'] }, status: { $in: ['ACTIVE', 'VERIFIED'] } })`: Fetches partner stays.
  3. Merges both into a combined payload cached in Redis key `stays:combined:all` for 600s.
- **Frontend Consumer:** [`Frontend/src/api/stayApi.js`](file:///c:/Users/Deepanshu/Desktop/discover/Frontend/src/api/stayApi.js) calls `GET /api/stays`.
  - **Fidelity Flaw:** If the network fails or returns empty, `stayApi.js` silently falls back to 30 static JSON stays in [`Frontend/src/data/stays.json`](file:///c:/Users/Deepanshu/Desktop/discover/Frontend/src/data/stays.json) with client-side synthesized prices (`price_per_night || 1800`), ratings (`rating || 8.5`), and reviews count (`reviews || 15`).

---

## 2. Current Source of Rental Data
- **Backend Model:** [`backend/models/Rental.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/models/Rental.js) and [`backend/models/PartnerListing.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/models/PartnerListing.js).
- **Backend Controller:** [`backend/controllers/rentalController.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/controllers/rentalController.js) queries:
  1. `Rental.find({})`: Loads 11 real rental operator fleets from MongoDB Atlas (e.g., *Himanshu Bike Rent in Rishikesh*, *Rishikesh Motorbike Rentals*, *Garhwal Tours & Travels*).
  2. `PartnerListing.find({ listingType: { $in: ['Rental', 'Vehicle', 'Bike', 'Car'] }, status: { $in: ['ACTIVE', 'VERIFIED'] } })`.
- **Frontend Consumer:** [`Frontend/src/api/rentalApi.js`](file:///c:/Users/Deepanshu/Desktop/discover/Frontend/src/api/rentalApi.js) flattens businesses into individual vehicles.
  - **Fidelity Flaw 1:** Synthesizes non-MongoDB IDs: `id: (biz._id || biz.id) + '_' + index`. Clicking "View Details" breaks `GET /api/rentals/:id` because the database ID does not contain `_0`.
  - **Fidelity Flaw 2:** Injects hardcoded fallback images (`getVehicleImage`) using arbitrary Unsplash URLs.
  - **Fidelity Flaw 3:** Hardcodes default ratings: `rating: biz.rating || 4.8`.

---

## 3. Current Source of Guide Data
- **Backend Model:** [`backend/models/Guide.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/models/Guide.js).
- **Backend Controller:** [`backend/controllers/guideController.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/controllers/guideController.js) uses generic factory `getAll` on `Guide`.
  - Loads 190 authentic Uttarakhand Tourism Development Board registered guides with verified phone numbers, languages, and UTDB portal URLs.
  - **Fidelity Flaw:** Does **not** include verified `PartnerListing` entries of type `'Guide'`. Only static Guide documents are returned.

---

## 4. MongoDB Operational Collections Status
Atlas database connection verified active:
- `stays`: 116 records (81 KMVN government rest houses/eco camps + 35 heritage stays).
- `rentals`: 11 records (authentic verified fleets in Rishikesh, Dehradun, Haridwar, Haldwani).
- `guides`: 190 records (official Uttarakhand Tourism Development Board guides).
- `partnerlistings`: 16 records (11 VERIFIED, 2 DRAFT, 2 ACTIVE, 1 REVOKED).
- `partners`: 4 records.
- `verificationauditlogs`: 13 records.
- `bookings`: 37 records.
- `payments`: 3 records.
- `paymentwebhookevents`: 3 records.
- `users`: 22 records.

---

## 5. Static / Frontend Datasets Inspected
- `Frontend/src/data/stays.json`: 30 static JSON records.
- `Frontend/src/data/destinations.json`: 24 static destinations.
- `Frontend/src/data/activities.json`: 15 static activities.
- `Frontend/src/data/spiritual.json`: 12 static spiritual records.
- `Frontend/src/data/routes.json`: 10 static road corridor records.
- `backend/seed/stays.json`: 81 KMVN government rest houses.
- `backend/seed/rentals.json`: 11 rental businesses with fleet details and Wikimedia Commons vehicle images.
- `backend/seed/guides.json`: 190 official UTDB registered guides.

---

## 6. Duplicate Data Sources & Split Brains
1. **Stays Split-Brain:**
   - Source A: MongoDB `stays` collection (116 documents).
   - Source B: MongoDB `partnerlistings` collection (16 documents).
   - Source C: `Frontend/src/data/stays.json` (30 hardcoded fallback items).
2. **Rentals Split-Brain:**
   - Source A: MongoDB `rentals` collection (11 documents, each containing an array of 5–8 vehicles).
   - Source B: `rentalApi.js` client-side flattener creating fake composite IDs (`<mongoId>_0`).
3. **Guides Split-Brain:**
   - Source A: MongoDB `guides` collection (190 UTDB documents).
   - Missing integration: `partnerlistings` with `listingType: 'Guide'` are omitted from public guide queries.

---

## 7. Mock / Fake / Demo Data Locations Identified
1. [`backend/controllers/stayController.js#L38-L47`](file:///c:/Users/Deepanshu/Desktop/discover/backend/controllers/stayController.js#L38-L47):
   - `price: { amount: pl.pricing?.amount || 1500, currency: 'INR' }` (hardcoded 1500).
   - `images: ... Unsplash stay photo fallback`.
   - `amenities: pl.amenities || ['Wifi', 'Mountain View', 'Hot Water', 'Home Cooked Meals']`.
   - `rating: 4.9, reviewsCount: 14`.
2. [`backend/controllers/rentalController.js#L37-L50`](file:///c:/Users/Deepanshu/Desktop/discover/backend/controllers/rentalController.js#L37-L50):
   - `pricePerDay: pl.pricing?.amount || 1200` (hardcoded 1200).
   - `images: [{ url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc...' }]`.
   - `rating: 4.9, reviewsCount: 18`.
3. [`Frontend/src/api/stayApi.js#L20-L46`](file:///c:/Users/Deepanshu/Desktop/discover/Frontend/src/api/stayApi.js#L20-L46):
   - Injects default price 1800 if missing.
   - Injects rating 8.5 and reviews count 15 if missing.
   - Silently returns `staysBackup` if API returns an error.
4. [`Frontend/src/pages/Stays.jsx#L43-L59`](file:///c:/Users/Deepanshu/Desktop/discover/Frontend/src/pages/Stays.jsx#L43-L59):
   - `REAL_STAY_PHOTO_BANKS` cycling through static `/assets/stay-1.jpg` to `stay-6.jpg`.
5. [`Frontend/src/pages/CheckoutPage.jsx#L166-L193`](file:///c:/Users/Deepanshu/Desktop/discover/Frontend/src/pages/CheckoutPage.jsx#L166-L193):
   - Hardcoded mock fallback object: "Royal Enfield Himalayan 450 (GPS Ready)" and "Himalayan Eco Glamping & Orchard Retreat" if item ID is not resolved.

---

## 8. Image Sources & Provenance Audit
- **Genuine Source:** Seed files and MongoDB records contain licensed Wikimedia Commons photography with explicit `license`, `attribution`, `sourcePage`, and `alt` fields.
- **Problematic Fallbacks:**
  - `rentalApi.js` `getVehicleImage` returns arbitrary Unsplash images.
  - `stayApi.js` defaults to `/assets/stay-1.jpg`.
  - Frontend Serper Google image scraping attempts in `getStayImages` inject unpredictable search images at runtime.

---

## 9. Pricing Sources Audit
- **PartnerListings:** Have structured schema `pricing: { amount, unit, currency, provenance: ['PARTNER_CLAIMED', 'VERIFIED', 'UNKNOWN'], lastVerifiedAt }`.
- **KMVN Stays:** Stored in `price: { amount: 1200, currency: 'INR' }` or `pricePerNight: 1200`.
- **Rentals:** Stored inside `vehicles[i].pricePerDay` (e.g., 600, 1200, 1500).
- **Guides:** Stored in `pricePerDay` (if verified by partner) or `null` for UTDB directory guides where guide pricing is negotiated directly or unverified.
- **Rule Enforcement:** If `price` is null or provenance is not verified, UI must display `"Price not verified"`, NOT a dummy ₹1,500/night.

---

## 10. Partner Listing & Verification Flow
- **Current Partner Registration:** `POST /api/partners` creates a Partner document linked to authenticated `User`.
- **Listing Creation:** `POST /api/partners/me/listings` creates a `PartnerListing` in `DRAFT` status with `pricing.provenance = 'PARTNER_CLAIMED'`.
- **Submission:** `POST /api/partners/me/listings/:id/submit` transitions listing from `DRAFT` -> `PENDING_VERIFICATION`.
- **Admin Review:** [`backend/controllers/adminVerificationController.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/controllers/adminVerificationController.js):
  - `POST /api/admin/listings/:id/verify`: transitions `PENDING_VERIFICATION` -> `VERIFIED` (and `ACTIVE`).
  - `POST /api/admin/listings/:id/reject`: transitions `PENDING_VERIFICATION` -> `REJECTED` with required reason.
  - `POST /api/admin/listings/:id/suspend`: transitions to `SUSPENDED`.
  - Every transition creates an immutable record in `VerificationAuditLog`.

---

## 11. Public Listing Flow & Visibility Gates
- **Requirement:** Only `status === 'ACTIVE'` (or admin-approved `VERIFIED` + `ACTIVE`) listings should be exposed via public `/stays`, `/rentals`, `/guides`.
- **Current State:** `stayController.js` and `rentalController.js` query `{ status: { $in: ['ACTIVE', 'VERIFIED'] } }`, but `guideController.js` does not filter or include partner listings.
- **Gap:** Inactive or draft partner listings are not completely segregated at the repository layer, relying on ad-hoc controller queries.

---

## 12. Booking Dependency
- [`backend/controllers/bookingController.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/controllers/bookingController.js) validates:
  - `listing.status === 'ACTIVE'`.
  - `listing.pricing.provenance === 'VERIFIED'`.
  - Calculates server-side subtotal and total based on days and unit.
  - Creates immutable snapshot in `pricingSnapshot` and `listingSnapshot`.
  - Sets booking status to `PENDING_PAYMENT`.

---

## 13. Identified Problems & Vulnerabilities
| ID | Area | Severity | Root Cause |
|---|---|---|---|
| P-01 | Stay Data | HIGH | Controller injects fake 1500 price, 4.9 rating, and Unsplash images on partner stays. |
| P-02 | Rental Data | HIGH | Controller injects fake 1200 price, 4.9 rating; `rentalApi.js` generates composite IDs (`_0`) breaking detail page lookup. |
| P-03 | Guide Data | MEDIUM | `guideController.js` ignores `PartnerListing` where `listingType === 'Guide'`. |
| P-04 | Frontend Fallbacks | HIGH | `stayApi.js` falls back to `Frontend/src/data/stays.json` instead of showing honest empty/error states. |
| P-05 | Checkout Fallbacks | HIGH | `CheckoutPage.jsx` creates dummy mock listings if ID is not resolved. |
| P-06 | Image Bleed | MEDIUM | Hardcoded Unsplash arrays and Serper searches risk cross-category image confusion. |

---

## 14. Recommended Canonical Architecture
1. **Single Source of Truth:** MongoDB Atlas is the exclusive operational store.
2. **Unified Marketplace Aggregation Service:** Backend service `getPublicMarketplaceListings(category)` that:
   - Queries MongoDB `stays`, `rentals`, `guides`, and `partnerlistings`.
   - Filters strictly for `status: 'ACTIVE'` and verified data.
   - Applies deterministic image resolver with category-specific SVG placeholders.
   - Never injects fake prices or ratings.
3. **Eliminate Client Fallbacks:** Remove static JSON fallbacks in `stayApi.js` and `CheckoutPage.jsx`. Show honest empty states: *"No verified listings available in this area yet."*
4. **Stable Database IDs:** Every public listing must expose its true MongoDB `_id` so `/stays/:id`, `/rentals/:id`, and `/guides/:id` resolve accurately.
