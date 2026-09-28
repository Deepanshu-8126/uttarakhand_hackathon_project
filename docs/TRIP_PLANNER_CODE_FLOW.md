# Discovery Uttarakhand — Trip Planner Code Flow
**Generated:** 2026-09-28

## 1. Complete Runtime Flow
```text
TripPlanner Page: Frontend/src/pages/TripPlanner.jsx:95
 ↓
3-Step Conversational Wizard:
  - Step 1: Vibe Selection (Adventure, Spiritual, Peaceful, Trekking, Culture)
  - Step 2: Constraints (Days, Budget, Starting Location, Primary Destination)
  - Step 3: Travelers & Transport (Solo, Couple, Family, Group / Car, Bike, Taxi, Bus)
 ↓
Action Trigger: handleGenerateItinerary() (TripPlanner.jsx:353)
 ↓
OSRM Mountain Routing: fetchOSRMRoute(waypoints) (Frontend/src/utils/routeHelpers.js)
 ↓
Itinerary Engine: generatePersonalizedTripPlan() (Frontend/src/utils/itineraryGenerator.js)
   ├── Resolves daily legs & travel hours based on mountain road speeds (30 km/h)
   ├── Clusters nearby verified activities and sacred shrines
   └── Allocates verified stays from allStays dataset
 ↓
Live Budget Engine: liveBudgetBreakdown calculation (TripPlanner.jsx:310)
 ↓
Session Persistence:
   ├── Zustand: setActiveTripSession(tripSession) (Frontend/src/store/mapStore.js)
   └── Storage: localStorage.setItem('discovery_active_trip', JSON.stringify(tripSession))
 ↓
MongoDB Cloud Save (Authenticated):
   ├── Action: createTrip(payload) (Frontend/src/api/tripApi.js:13)
   ├── Route: POST /api/trips (backend/routes/tripRoutes.js:9)
   ├── Controller: tripController.createTrip (backend/controllers/tripController.js:34)
   └── Model: backend/models/SavedTrip.js -> MongoDB Atlas
 ↓
Saved Trip Workspace: Frontend/src/pages/MyTripPage.jsx:1
```
