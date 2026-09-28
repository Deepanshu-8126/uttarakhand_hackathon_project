# Discovery Uttarakhand — Location Personalization Flow
**Generated:** 2026-09-28

## 1. Implementation Status
**STATUS: IMPLEMENTED & ACTIVE**

## 2. Complete Runtime Trace
```text
User Location Input (Geo Modal / Device GPS / Saved Profile):
  - Frontend/src/components/GlobalLocationModal.jsx:1
  - Frontend/src/components/home/PersonalizedNearYouSection.jsx:1
 ↓
API Client: Frontend/src/api/personalizedApi.js (getPersonalizedHome)
 ↓
Route: GET /api/personalized/home (backend/routes/personalizedRoutes.js:9)
 ↓
Controller: personalizedController.getPersonalizedHome (backend/controllers/personalizedController.js:68)
   ├── 1. Resolve Location Target:
   │      - Query params: lat, lng, city, district (Guest session)
   │      - Profile: req.user.location (Authenticated user)
   ├── 2. Cache Lookup (Key: "pers_home:u_<userId>" or "pers_home:g_<city>_<district>", TTL: 600s)
   ├── 3. Service Query: locationService.findNearbyEntities (backend/services/locationService.js)
   │      - Geospatial 2dsphere near query or Haversine distance ranking
   │      - Queries 5 MongoDB collections: Destinations, Stays, Rentals, Guides, Activities
   └── 4. Cache Set & Return Unified Proximity Discovery Payload
 ↓
Rendered Section: 'Discovered Near [Your City]' Carousel with Live Distance Badges (km)
```
