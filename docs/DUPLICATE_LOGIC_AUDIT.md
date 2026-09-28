# Discovery Uttarakhand — Duplicate Logic & Overlapping Systems Audit

**Generated on:** September 28, 2026  
**Type:** Codebase Redundancy & Consolidation Report  
**Policy:** Report only. Preserve existing functionality without unintended breaks.

---

## 1. Identified Overlapping Systems

### 1. Trip Planning Engines: Frontend vs Backend
- **Frontend Engine:** [`Frontend/src/utils/itineraryGenerator.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/utils/itineraryGenerator.js) (`generatePersonalizedTripPlan`)
  - Generates instant 1-14 day day-plans client-side in `TripPlanner.jsx` using OSRM and local datasets.
- **Backend Service:** [`backend/services/aiPlannerService.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/backend/services/aiPlannerService.js) (`generateAiPlan`)
  - Generates AI-backed plans via LLM on `POST /api/ai/plan`.
- **Status & Recommendation:** Keep both. Frontend engine delivers zero-latency instant preview in the multi-step wizard, while backend service powers conversational adjustments in AI Copilot.

---

### 2. Dual Destination Exploration Controllers
- **Legacy Controller:** [`backend/controllers/destinationController.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/backend/controllers/destinationController.js) (535 bytes)
  - Contains basic CRUD methods generated in Phase 1.
- **Phase 7 Explore Controller:** [`backend/controllers/destinationExploreController.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/backend/controllers/destinationExploreController.js) (16.9 KB)
  - Contains high-performance search, district aggregation, category filtering, and GeoJSON centroid attachment.
- **Status:** `backend/routes/destinationRoutes.js` now exclusively imports `destinationExploreController.js`. The older file is dormant.

---

### 3. Image Resolvers Across Utilities
- **Helper 1:** [`Frontend/src/utils/imageHelpers.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/utils/imageHelpers.js) (`getCardImages`, `getAssetUrl`)
- **Helper 2:** [`Frontend/src/utils/images.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/utils/images.js) (`useFreshImage`, `fetchPexelsHimalayanPhoto`)
- **Status:** Consolidated. `imageHelpers.js` handles synchronous card image resolution from MongoDB documents, while `images.js` handles asynchronous Pexels background fetches with `getStableIndex` deterministic hashing.
