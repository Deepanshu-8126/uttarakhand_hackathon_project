# DISCOVERY UTTARAKHAND — DATA SOURCE OF TRUTH AUDIT
**Document:** `docs/DATA_SOURCE_OF_TRUTH_AUDIT.md`  
**Date:** September 28, 2026  
**Status:** COMPLETE AUDIT  
**Lead Auditor:** Senior Full-Stack Data Architecture & Systems Integration Engineer  

---

## 1. Executive Summary

This audit establishes the **authoritative Single Source of Truth (SSOT)** for every entity across the Discovery Uttarakhand platform.

### Master Entity Source-of-Truth Mapping

| Entity | Canonical Source of Truth | Secondary / Seed Source | Runtime Fallback Policy |
|---|---|---|---|
| **Destinations** | **MongoDB (`destinations`)** | `backend/seed/destinations.json` (129 records) | **No Mock Fallback**. Show error/retry state on network failure. |
| **Stays** | **MongoDB (`stays`)** | `backend/seed/stays.json` (81) + `seed_famous_treks_and_budget_stays.js` (5) = 86 | **No Mock Fallback**. Show error/retry state. Missing image -> Stay placeholder SVG. |
| **Rentals** | **MongoDB (`rentals`)** | `backend/seed/rentals.json` (11 records) | **No Mock Fallback**. Show error/retry state. Missing image -> Vehicle placeholder. |
| **Guides** | **MongoDB (`guides`)** | `backend/seed/guides.json` (190 records) | **No Mock Fallback**. Show error/retry state. |
| **Activities** | **MongoDB (`activities`)** | `backend/seed/activities.json` (28) + `famousTreks` (10) | **No Mock Fallback**. Show error/retry state. |
| **Spiritual** | **MongoDB (`spirituals`)** | `backend/seed/spiritual.json` (56 records) | **No Mock Fallback**. Show error/retry state. |
| **Culture** | **MongoDB (`cultures`)** | `backend/seed/culture.json` (30 records) | **No Mock Fallback**. Show error/retry state. |
| **Transport** | **MongoDB (`transports`)** | `backend/seed/transports.json` (8 records) | Seed-only mirror in `verifiedTransports.js` preserved for zero-downtime offline transit stepper. |
| **Bookings** | **MongoDB (`bookings`)** | Dynamic Operational Collection (78 existing) | Strictly MongoDB. Server validates and calculates prices. |
| **Users** | **MongoDB (`users`)** | Dynamic Operational Collection (18 existing) | Strictly MongoDB. |
| **Partner Listings** | **MongoDB (`partnerlistings`)** | Dynamic Marketplace Collection (27 existing) | Strictly MongoDB. |
| **Saved Trips** | **MongoDB (`savedtrips`)** | Dynamic Operational Collection (4 existing) | Strictly MongoDB. |
| **Reviews** | **MongoDB (`reviews`)** | Dynamic Moderated Collection | Strictly MongoDB. |

---

## 2. Inventory of Real Data Files

### A. Backend Seed Datasets (`backend/seed/`)
- `destinations.json`: **129 records** (905,725 bytes) — Authoritative Uttarakhand curated destinations.
- `stays.json`: **81 records** (292,249 bytes) — Official KMVN, GMVN, and eco-homestays with prices & facilities.
- `rentals.json`: **11 records** (81,905 bytes) — Verified fleets across Dehradun, Rishikesh, Nainital, Kathgodam, Rudrapur, Haldwani.
- `guides.json`: **190 records** (228,319 bytes) — Licensed Uttarakhand tourism guides with verification IDs.
- `transports.json`: **8 records** (16,385 bytes) — Arterial transit corridors (Kathgodam Shatabdi, Jan Shatabdi, UTC buses, Pithoragarh 4x4).
- `spiritual.json`: **56 records** (483,122 bytes) — Temples, shrines, and sacred dham sites.
- `culture.json`: **30 records** (237,473 bytes) — Heritage, art, festivals, and folklore.
- `activities.json`: **28 records** (214,762 bytes) — Adventure, river rafting, skiing, and trekking experiences.
- `image-manifest.json`: **1,323 records** (816,773 bytes) — License-cleared Wikimedia and regional imagery metadata.

### B. Legacy / Remnant Frontend Data Files (`Frontend/src/data/`)
- `destinations.json` (15 records, 14.7 KB) — **UNUSED**. Not imported anywhere in Frontend. Safe to archive.
- `stays.json` (6 records, 2.6 KB) — **UNUSED**. Not imported anywhere in Frontend. Safe to archive.
- `activities.json` (6 records, 3.0 KB) — **UNUSED**. Not imported anywhere in Frontend. Safe to archive.
- `spiritual.json` (3 records, 4.3 KB) — **REDUNDANT IMPORT**. Unused in `Sidebar.jsx`. Safe to remove import.
- `routes.json` (4 records, 4.6 KB) — Geographical polyline waypoints for Map RouteLayer.
- `verifiedTransports.js` (8 records, 9.7 KB) — Offline client mirror for ItineraryGenerator.

---

## 3. Pipeline Architecture & Data Flow

```
                      [CANONICAL SEED DATASETS]
                 (backend/seed/*.json: 129/86/11/8/190/56/30/28)
                                    ↓
                       [SAFE DETERMINISTIC UPSERT]
                 (scripts/safe_deterministic_upsert.js)
                                    ↓
                       [MONGODB ATLAS / LOCAL 27017]
                       (DB: discovery_uttarakhand)
                                    ↓
                       [MONGOOSE SCHEMAS & MODELS]
                 (Destination, Stay, Rental, Guide, Transport)
                                    ↓
                     [BACKEND CONTROLLERS & ROUTES]
              (factoryController.js, queryHelper.js, /api/*)
                                    ↓
                    [UPSTASH REDIS / IN-MEMORY CACHE]
                     (TTL 600s + Write Invalidation)
                                    ↓
                        [FRONTEND API CLIENT]
              (Frontend/src/api/api.js -> Axios /api/*)
                                    ↓
                       [REACT HOOKS & SERVICES]
            (useDestinations, useStays, useRentals, useGuides)
                                    ↓
                        [COMPONENTS & PAGES]
              (ExploreSection, Stays, Rentals, Guides, Map)
                                    ↓
                            [USER INTERFACE]
```

---

## 4. Policy Against Silent / Fake Data Fallbacks

1. **No Silent Mock Fallback**: When MongoDB / API is unreachable, the UI displays:
   `"Unable to load data. Please retry."` with a direct retry button.
2. **Deterministic Placeholders**: If an entity has no photo in MongoDB, it uses category-specific SVG placeholders (`/assets/kmvn-stay.svg`, vehicle SVG, or `/assets/fallback.svg`), never random photos or another entity's images.
3. **No Mock Login Data**: Real JWT auth and database-backed users are the single source of truth.
