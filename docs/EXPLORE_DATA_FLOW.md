# Discovery Uttarakhand — Explore Data Flow
**Generated:** 2026-09-28

## 1. Complete Runtime Trace
```text
MongoDB Atlas (Collection: destinations)
 ↓
Mongoose Model: backend/models/Destination.js
 ↓
Express Route: GET /api/destinations (backend/routes/destinationRoutes.js:17)
 ↓
Controller: backend/controllers/destinationController.js:6 (destinationController.getAll)
 ↓
Factory Implementation: backend/controllers/factoryController.js:41 (createController -> getAll)
   ├── Check Redis In-Memory Cache (Key: "destinations:all:{}", TTL: 600s)
   └── If Cache Miss: Destination.find(query).skip(skip).limit(limit) -> Cache Set
 ↓
API Client: Frontend/src/api/destinationApi.js:3 (getDestinations)
 ↓
Custom React Hook: Frontend/src/hooks/useDestinations.js:4 (useDestinations -> fetchDestinations)
 ↓
Page / Section: Frontend/src/pages/Home.jsx -> Frontend/src/components/ExploreSection.jsx:192
 ↓
Card Component: Frontend/src/components/DestinationCard.jsx
 ↓
Image Resolver: Frontend/src/utils/imageHelpers.js & Frontend/src/utils/images.js
 ↓
HTML <img> element with fallback & stable deterministic hash
```

## 2. Architectural Audit Q&A

| Question | Answer | Code Proof |
| :--- | :--- | :--- |
| **Is Explore using MongoDB?** | **YES** | `factoryController.js:59` executes `Model.find(query)` against MongoDB Atlas `destinations` collection. |
| **Is it using JSON at runtime?** | **NO** | Seed JSON (`backend/seed/destinations.json`) is only used during seeding (`backend/scripts/seed.js`). Runtime queries MongoDB. |
| **Is it using mock/static data?** | **NO at runtime** | Only if the backend network is completely severed does `Frontend/src/data/destinations.json` exist as offline fallback. |
| **Is there fallback data?** | **YES** | `/assets/fallback.svg` and `getHimalayanFallbackImage()` in `Frontend/src/utils/imageHelpers.js`. |
| **Is there duplicate data?** | **YES** | `Frontend/src/data/destinations.json` (105 items) duplicates `backend/seed/destinations.json` (105 items). |
| **Is data transformed?** | **YES** | `factoryController.js:5` strips provenance metadata, while `TripPlanner.jsx:46` normalizes coordinate schemas. |
| **Is data cached?** | **YES** | Upstash Redis caching layer (`backend/config/redis.js`) caches responses for 600 seconds (10 minutes). |
