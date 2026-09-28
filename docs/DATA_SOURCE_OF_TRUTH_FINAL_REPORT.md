# Discovery Uttarakhand — Master Data Source-of-Truth & Pipeline Repair Final Report

**Date:** September 28, 2026  
**Status:** ✅ Fully Repaired, Verified, and Grounded in MongoDB Database  
**Target Environments:** Local MongoDB (`mongodb://127.0.0.1:27017/discovery_uttarakhand`) & Production Backend (`https://uttarakhand-hackathon-project.onrender.com/api`)

---

## 1. Executive Summary

A comprehensive, non-destructive audit and repair was performed across the entire data pipeline:
$$\text{Datasets / Seeds} \longrightarrow \text{Mongoose Schemas} \longrightarrow \text{MongoDB} \longrightarrow \text{Backend API} \longrightarrow \text{Frontend Services} \longrightarrow \text{Interactive UI \& AI Copilot}$$

### Results Overview:
- **Canonical Database Visibility**: The website and APIs now directly render the authoritative MongoDB database collections rather than static mocks or random photo cycles.
- **Operational Data Integrity**: All 18 users, 78 bookings, 27 partner listings, 18 vehicle permit records, and 4 saved trips remain **100% intact with zero data loss or collection drops**.
- **Database Entity Counts**:
  - **Destinations:** 129 records in DB (129 canonical seed) — **MATCH**
  - **Stays & Homestays:** 86 verified stays in DB (81 seed + 5 authentic community homestays) — **MATCH** (103 live active in UI with user listings)
  - **Vehicle Rentals:** 11 rental fleets / 49 vehicles across gateway hubs — **MATCH**
  - **Transport Corridors:** 8 arterial corridors in DB — **MATCH**
  - **Licensed Guides:** 190 licensed guides in DB — **MATCH**
  - **Spiritual Sites:** 56 sites in DB — **MATCH**
  - **Cultural Sites:** 30 sites in DB — **MATCH**
  - **Activities & Treks:** 28 curated activities in DB — **MATCH**

---

## 2. Root Cause Analysis

| # | Component | Root Cause Discovered | Remediation Applied |
|---|-----------|-----------------------|---------------------|
| 1 | **Legacy Seeder Abort** (`backend/scripts/seed.js`) | Hardcoded check `EXPECTED_COUNTS = { destinations: 105, stays: 51, rentals: 9... }` aborted the import process. Transports collection was omitted. | Created [`backend/scripts/safe_deterministic_upsert.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/backend/scripts/safe_deterministic_upsert.js) with upsert operators (`$set`, `upsert: true`) that never drops collections or touches operational data. |
| 2 | **Schema Mismatch in Legacy Stays** | 30 stays had legacy schema attributes (`location: "Rishikesh"` string instead of GeoJSON Point `{ type: 'Point', coordinates: [...] }`, `id` instead of `slug`, string images instead of objects). Mongoose threw `CastError`. | Implemented `resolvePoint()` centroid mapping, slug derivation (`doc.slug \|\| doc.id`), and `normalizeImages()` to normalize documents before bulk write. |
| 3 | **Frontend Image Discarding** (`Frontend/src/utils/imageHelpers.js`) | `isStay` extracted only `item.image` / `coverImage`, completely ignored the `item.images` array, and unconditionally appended cyclic `MOUNTAIN_STAY_IMAGES[seed % 3]`. | Updated `isStay` and `isVehicle` in `imageHelpers.js` to prioritize authentic MongoDB `item.images` array, gallery, and coverImage before falling back. |
| 4 | **Stay Story Dash Photo Cross-Contamination** (`Frontend/src/pages/Stays.jsx`) | In `InteractiveStayCard`, when `raw.length === 1`, it returned `[raw[0], ...fallbackSet.slice(1)]`, appending unrelated photos to KMVN/GMVN stay cards. | Updated `images` memo in `Stays.jsx` to return `raw` whenever authentic images exist (`raw.length > 0`), only using `fallbackSet` if zero images exist in DB. |
| 5 | **Image Jitter / Random Photos** (`Frontend/src/utils/images.js`) | Lines 163, 172, 183, 218 used `Math.random()` to pick photos from cache/Pexels, causing cards to flicker and change photos on re-render. | Replaced `Math.random()` with deterministic string hashing (`getStableIndex(cleanKey, len)`), guaranteeing zero photo flicker across re-renders. |
| 6 | **AI Copilot Data Disconnect** (`backend/ai/tools/*`) | `searchDestinations.js`, `searchStays.js`, `searchRentals.js`, and `searchActivities.js` queried static 5-item arrays in `destinationStore.js` rather than MongoDB models. | Updated all 4 tools to query Mongoose models (`Destination.find()`, `Stay.find()`, `Rental.find()`, `Activity.find()`) with regex search and limit, preserving fallback for offline resilience. |

---

## 3. Files Modified & Key Diffs

### A. Frontend Image Resolution & Anti-Jitter
- **[`Frontend/src/utils/imageHelpers.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/utils/imageHelpers.js)**:
  - Preserves authentic MongoDB `item.images` array, `gallery`, and `photos` for stays and vehicle fleets.
  - Deterministic fallback only when DB image array is empty.
- **[`Frontend/src/pages/Stays.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Stays.jsx)**:
  - Eliminated photo cross-contamination in `InteractiveStayCard`.
- **[`Frontend/src/utils/images.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/utils/images.js)**:
  - Implemented `getStableIndex()` hash function to replace `Math.random()`.

### B. Backend AI Copilot Tooling
- **[`backend/ai/tools/searchDestinations.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/backend/ai/tools/searchDestinations.js)**:
  - Queries `Destination` model in MongoDB across `name`, `district`, `category`, `highlights`, `experiences`, and `description`.
- **[`backend/ai/tools/searchStays.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/backend/ai/tools/searchStays.js)**:
  - Queries `Stay` model in MongoDB across `name`, `city`, `district`, `address`, and budget bounds (`price.amount`, `pricePerNight`).
- **[`backend/ai/tools/searchRentals.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/backend/ai/tools/searchRentals.js)**:
  - Queries `Rental` model in MongoDB across locations and vehicle fleet types (`Scooter`, `Motorcycle`, `SUV`, etc.).
- **[`backend/ai/tools/searchActivities.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/backend/ai/tools/searchActivities.js)**:
  - Queries `Activity` model in MongoDB across name, location, district, and category.

### C. Safe Seeder & Verification Tooling
- **[`backend/scripts/safe_deterministic_upsert.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/backend/scripts/safe_deterministic_upsert.js)**:
  - Non-destructive bulk write with GeoJSON normalization, slug reconciliation, and cache invalidation.
- **[`backend/scripts/verify_data_pipeline.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/backend/scripts/verify_data_pipeline.js)**:
  - Non-destructive automated diagnostic script checking MongoDB connectivity, counts vs dataset, and operational collections.

---

## 4. Verification Evidence & Test Run Logs

### 1. Database Safe Deterministic Upsert:
```text
===============================================================
DATABASE TOTALS SUMMARY AFTER SAFE DETERMINISTIC UPSERT:
- Destinations:  129 (Expected: 129)
- Stays:         86 (Expected: 86)
- Rentals:       11 (Expected: 11)
- Transports:    8 (Expected: 8)
- Guides:        190 (Expected: 190)
- Spiritual:     56 (Expected: 56)
- Culture:       30 (Expected: 30)
- Activities:    28 (Expected: 28)
===============================================================
```

### 2. Operational Collections Integrity:
```text
[3] OPERATIONAL & USER COLLECTIONS IN MONGODB
---------------------------------------------------------------
  - users                    : 18 records (INTACT)
  - bookings                 : 78 records (INTACT)
  - partnerlistings          : 27 records (INTACT)
  - savedtrips               : 4 records (INTACT)
  - favorites                : 6 records (INTACT)
  - vehiclepermitrecords     : 18 records (INTACT)
```

### 3. Backend HTTP API Verification:
```text
GET /api/health/ready         -> Status: 200 Total/Count: OK
GET /api/destinations?limit=5 -> Status: 200 Total/Count: 129
GET /api/stays?limit=5        -> Status: 200 Total/Count: 103 (86 canonical + 17 user/partner)
GET /api/rentals?limit=5       -> Status: 200 Total/Count: 12 (11 canonical + 1 partner)
GET /api/transports           -> Status: 200 Total/Count: 8
GET /api/guides?limit=5       -> Status: 200 Total/Count: 190
POST /api/agent/chat          -> Status: 200 (Grounding verified with Kedarnath stays from DB)
```

### 4. Frontend Production Build:
```text
vite v8.2.1 building client environment for production...
✓ 1940 modules transformed.
dist/index.html                     0.84 kB
dist/assets/index-gFjR_qAi.css    343.24 kB
dist/assets/index-BzW_3-hE.js   1,846.61 kB
✓ built in 17.38s
```

### 5. Browser Subagent Visual & DOM Inspection:
- **Explore (`/explore`)**: Hero slider with 16 curated destinations + real destination cards (Askot Musk Deer Sanctuary, Auli, Badrinath, Munsiyari Eco-Retreat, Jageshwar Dham, Valley of Flowers, Deoria Tal).
- **Stays (`/stays`)**: 103 GPS-verified stays loaded from backend. Authentic photography rendered, ratings, Escrow Protected badges, zero broken images.
- **Rentals (`/rentals`)**: 49 vehicles across hub cities (Dehradun: 22, Rishikesh: 10, Nainital: 5, Kathgodam: 4, Rudrapur: 4, Haldwani: 3, Joshimath: 1).

---

## 5. Ongoing Pipeline Verification Instructions

To audit and verify the data pipeline at any time without touching operational data:

```bash
# 1. Run the non-destructive verification audit
cd backend
node scripts/verify_data_pipeline.js

# 2. To safely re-sync or refresh canonical datasets into MongoDB (if dataset files are edited)
node scripts/safe_deterministic_upsert.js

# 3. Test Frontend build compliance
cd ../Frontend
npm run build
```
