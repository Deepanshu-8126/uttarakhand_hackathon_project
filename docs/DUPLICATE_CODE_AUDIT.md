# Discovery Uttarakhand — Duplicate Code Audit
**Generated:** 2026-09-28

## 1. Budget Calculation Duplication
- **Backend Service:** `backend/services/budgetEngine.js` (Calculates per-tier breakdown with VERIFIED/ESTIMATED provenance).
- **Backend AI Agent:** `backend/ai/agents/BudgetAgent.js` (Duplicate heuristic budget formulas).
- **Frontend Page:** `Frontend/src/pages/TripPlanner.jsx:310-345` (Inline `liveBudgetBreakdown` calculation).
- **Frontend Component:** `Frontend/src/components/planner/BudgetBreakdownCard.jsx`.

## 2. Trip Models Aliasing
- `backend/models/Trip.js` (8 lines): Simply re-exports `SavedTrip` as a backward-compatibility alias.
- `backend/models/SavedTrip.js` (89 lines): The actual canonical Mongoose schema.

## 3. Marketplace Listing Duality
- `backend/models/Listing.js`: Unified polymorphic schema created during previous audit.
- `backend/models/PartnerListing.js`: The actual model actively used in `partnerController.js`, `adminVerificationController.js`, `stayController.js`, `rentalController.js`, and `bookingController.js`.

## 4. Image Fallback Logic Duplication
- `Frontend/src/utils/imageHelpers.js` (`DESTINATION_NAMED_IMAGES`)
- `Frontend/src/utils/images.js` (`AUTHENTIC_LOCAL_PHOTOS`)
- `Frontend/src/utils/imageUtils.js` (`getFallbackImage`)
- `Frontend/src/utils/discoveryAdapter.js`
