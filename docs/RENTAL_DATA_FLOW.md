# Discovery Uttarakhand — Rental Data Flow
**Generated:** 2026-09-28

## 1. Complete Runtime Trace
```text
MongoDB Atlas (Collections: rentals + partnerlistings)
 ↓
Mongoose Models:
  - backend/models/Rental.js
  - backend/models/PartnerListing.js
 ↓
Express Route: GET /api/rentals (backend/routes/rentalRoutes.js:18)
 ↓
Controller: backend/controllers/rentalController.js:7 (getRentals)
   ├── 1. Rental.find({}).lean() (Catalog rentals across hubs)
   └── 2. PartnerListing.find({ listingType: 'Rental', status: 'ACTIVE' }).lean() (Local verified fleets)
   └── 3. Combines both into unified fleet response
 ↓
API Client: Frontend/src/api/rentalApi.js:4 (getRentals)
 ↓
Custom React Hook: Frontend/src/hooks/useRentals.js:4 (useRentals -> fetchRentals)
 ↓
Page: Frontend/src/pages/Rentals.jsx:35
 ↓
Hero & Cards:
  - Frontend/src/components/rentals/RentalHero.jsx
  - Frontend/src/components/RentalCard.jsx:1
 ↓
Image Extraction:
  - Himalayan 450: /assets/himalayan_bike.jpg (or verified local asset)
  - Activa 6G: /assets/scooty.jpg
  - Thar 4x4: /assets/thar.jpg
 ↓
HTML <img> rendered in Browser
```

## 2. Rental Image Provenance
- Direct vehicle photo assets reside in `Frontend/public/assets/` and Cloudinary for host fleets.
- `Frontend/src/utils/imageHelpers.js` provides category fallbacks for `Motorcycle`, `Scooty`, and `4x4 SUV`.
