# Discovery Uttarakhand — Stay Data Flow
**Generated:** 2026-09-28

## 1. Complete Runtime Trace
```text
MongoDB Atlas (Collections: stays + partnerlistings)
 ↓
Mongoose Models:
  - backend/models/Stay.js
  - backend/models/PartnerListing.js
 ↓
Express Route: GET /api/stays (backend/routes/stayRoutes.js:18)
 ↓
Controller: backend/controllers/stayController.js:7 (getStays)
   ├── 1. Stay.find({}).lean() (Curated heritage stays)
   └── 2. PartnerListing.find({ listingType: 'Stay', status: 'ACTIVE' }).lean() (Verified host homestays)
   └── 3. Combines and normalizes both into unified schema [...partnerStays, ...staticStays]
 ↓
API Client: Frontend/src/api/stayApi.js:4 (getStays)
 ↓
Custom React Hook: Frontend/src/hooks/useStays.js:4 (useStays -> fetchStays)
 ↓
Page: Frontend/src/pages/Stays.jsx:45
 ↓
Card Component: Frontend/src/components/StayCard.jsx:1
 ↓
Image Extraction & Cloudinary / Unsplash Pipeline:
  - Partner stays: pl.images[0].url (Cloudinary CDN or verified partner uploads)
  - Curated stays: stay.coverImage.url or /assets/himalayan_basecamp_village.jpg
 ↓
HTML <img> with onError fallback to verified Himalayan stay photo
```

## 2. Stay Image Sources
1. **Host Uploads:** Stored on Cloudinary via `backend/routes/uploadRoutes.js` and saved as full URLs in `PartnerListing.images`.
2. **Curated Seed Images:** Unsplash CDN URLs anchored to real Uttarakhand homestays and heritage estates.
3. **Local Fallback:** `Frontend/src/utils/imageHelpers.js` maps stay categories to `/assets/himalayan_basecamp_village.jpg` and `/assets/destinations/almora/gallery-1.jpg`.
