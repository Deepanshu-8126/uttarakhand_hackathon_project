# Discovery Uttarakhand — Website vs Mobile App Parity Matrix

**Document Version:** 1.0.0  
**Generated:** September 2026  
**Auditor:** Senior Full-Stack & Mobile Systems Architect  
**Objective:** Strict feature-by-feature parity comparison between Website (Canonical Truth) and Mobile App.

---

## 1. Status Definitions
- **MATCHED**: Feature exists in both web & mobile, connects to the same backend API, and executes real business logic with zero data divergence.
- **PARTIAL**: Mobile UI exists and functions partially, but lacks specific parameters, transitions, or pre-filling logic present on website.
- **MISSING**: Feature exists on website but has no mobile implementation.
- **UI ONLY**: Mobile renders visual elements but data is hardcoded/mocked and disconnected from backend.
- **BROKEN**: Implementation exists but causes runtime errors or network crashes.
- **BLOCKED**: Implementation cannot proceed due to external dependency or missing upstream API.

---

## 2. Feature Parity Matrix

| Website Feature | Website Location / Implementation | Mobile UI | Mobile API | Mobile Logic | Status | Gaps & Action Required |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| **1. Home Hero Carousel & Live Metrics** | `HeroSection.jsx` + `ProblemStatement.jsx` | Yes | Yes | Yes | **MATCHED** | Full parity. Real telemetry and hero slider active. |
| **2. Explore Filters & 13 Districts Grid** | `ExploreSection.jsx` (`useDestinations`) | Yes | Yes | Yes | **MATCHED** | Both query `/api/destinations`. Strict image parity maintained. |
| **3. Live Satellite Radar Place Cards** | `ExploreSection.jsx` (`LiveRadarPlaceCard`) | Yes | Yes | Yes | **MATCHED** | GPS coordinates & landmark cards mapped to real map/plan actions. |
| **4. Offbeat Hidden Locations Section** | `HiddenLocationsSection.jsx` | Yes | Yes | Yes | **MATCHED** | Both query `/api/hidden-locations?withWeather=true`. |
| **5. Destination Details Deep Dive** | `DestinationDetails.jsx` | Yes | Yes | Yes | **MATCHED** | Hero gallery, altitude, season, stays, rentals, activities shown. |
| **6. Stays Marketplace & Filtering** | `Stays.jsx` (`/api/stays`) | Yes | Yes | Yes | **MATCHED** | Real MongoDB stays, verified badges, prices, booking hooks. |
| **7. Bike & 4x4 Vehicle Rentals** | `Rentals.jsx` (`/api/rentals`) | Yes | Yes | Yes | **MATCHED** | Real rental fleet, specifications, pricing, booking hooks. |
| **8. Certified Mountain Guides Directory**| `Guides.jsx` (`/api/guides`) | Yes | Yes | Yes | **MATCHED** | Real guides, verification ID, certifications, hire hooks. |
| **9. Mountain Activities Catalog** | `Activities.jsx` (`/api/activities`) | Yes | Yes | Yes | **MATCHED** | Activities catalog, pricing, duration, difficulty. |
| **10. Spiritual Shrines Directory** | `Spiritual.jsx` (`/api/spiritual`) | Yes | Yes | Yes | **MATCHED** | Dham and Panch Kedar directory with guidelines. |
| **11. Culture, Cuisine & Traditions** | `Culture.jsx` (`/api/culture`) | Yes | Yes | Yes | **MATCHED** | Garhwali/Kumaoni heritage, recipes, festivals. |
| **12. Interactive Mountain Map** | `MapPage.jsx` (Leaflet / Geoapify) | Yes | Yes | Yes | **MATCHED** | `FlutterMap` OpenStreetMap tiles, markers, bottom sheet cards. |
| **13. Plan a Trip — Form Inputs** | `TripPlanner.jsx` (`useMapStore`) | Yes | Yes | Partial | **PARTIAL** | Mobile has destination, duration, travelers, budget, but lacks constructor prefill for AI Copilot agentic flow. |
| **14. AI Trip Planner Agentic Prefill** | `ChatWindow.jsx` -> `agentActionExecutor` -> Planner | Partial | Yes | Missing | **PARTIAL** | Copilot extracts destination, days, budget, travelers, but did not route to `TripPlannerScreen` with prefilled values. |
| **15. Trip Plan Generation & Budget Alloc** | `itineraryGenerator.js` + `budgetApi.js` | Yes | Yes | Yes | **MATCHED** | Allocates stays, rentals, food, activities, buffer deterministically. |
| **16. Save Generated Trip to Account** | `MyTripPage.jsx` (`POST /api/trips`) | Missing | Missing | Missing | **UI ONLY** | Mobile `my_trip_screen.dart` had static hardcoded trip! Needs API `POST /api/trips` and `GET /api/trips/my`. |
| **17. Day-by-Day Workspace Itinerary** | `MyTripPage.jsx` (`DayCard`) | Partial | Partial | Partial | **PARTIAL** | Must render the generated plan from Trip Planner dynamically instead of static 3-day Kedarnath mockup. |
| **18. AI Copilot Text & Voice Companion** | `ChatWindow.jsx` + `DevbhoomiVoiceStudio` | Yes | Yes | Yes | **MATCHED** | Multi-turn chat, session persistence, Gemini Live Aoede voice. |
| **19. Booking & Escrow Checkout** | `CheckoutPage.jsx` (`/api/bookings`) | Yes | Yes | Yes | **MATCHED** | Server rate calculation, guest details, check-in OTP, reference code. |
| **20. My Bookings in Profile** | `ProfilePage.jsx` (`/api/bookings/my`) | Partial | Missing | Missing | **PARTIAL** | Mobile `ProfileScreen` rendered sample destinations instead of querying `/api/bookings/my`. |
| **21. Saved Trips in Profile** | `ProfilePage.jsx` (`/api/trips/my`) | Partial | Missing | Missing | **PARTIAL** | Mobile `ProfileScreen` needs real saved trips from `/api/trips/my`. |
| **22. Favorites List & Sync** | `FavoritesContext.jsx` (`/api/favorites`) | Partial | Missing | Missing | **PARTIAL** | Mobile `ProfileScreen` needs real favorites from `/api/favorites`. |
| **23. User Auth (Login & Register)** | `LoginPage.jsx` (`/api/auth`) | Yes | Yes | Yes | **MATCHED** | `AuthProvider` manages token, session, user roles. |
| **24. Blockchain Web3 Verification & QR** | `VerificationProofPage.jsx` (`/api/verify`) | Yes | Partial | Partial | **PARTIAL** | Mobile UI renders certificate, but needs live API query by ID/vehicle number from `/api/verify/...`. |
| **25. Emergency SOS & SDRF Mesh Safety** | `SOSActiveBanner.jsx` (`/api/sos/trigger`) | Yes | Yes | Yes | **MATCHED** | 1-tap distress, type selector, GPS broadcast, incident tracker. |
| **26. Verified Traveler Reviews Submission** | `VerifiedReviewPage.jsx` (`/api/reviews`) | Partial | Partial | Partial | **PARTIAL** | Mobile displays review feed; needs submit review dialog connected to `POST /api/reviews`. |

---

## 3. High-Priority Action List for Complete Parity

1. **Trip Planner Prefill & Constructor (`trip_planner_screen.dart`)**:
   - Update `TripPlannerScreen` to accept `initialDestination`, `initialDays`, `initialTravelers`, `initialBudget`, `initialOrigin`.
   - When opened with these parameters, auto-populate all fields and immediately focus the plan.
2. **AI Copilot Agentic Routing (`ai_copilot_screen.dart`)**:
   - Add prompt detection for trip intents ("Mujhe Badrinath jana hai", etc.).
   - Extract parameters (origin, destination, date, travelers, duration, budget).
   - Display actionable "Open Plan in Trip Planner" button and navigate to `TripPlannerScreen` with the extracted parameters.
   - Support contextual follow-ups ("wahan trekking bhi add karo").
3. **Dynamic Generated Trip & Save Workflow (`my_trip_screen.dart`)**:
   - Update `MyTripScreen` to accept a dynamic `tripPlan` (from Trip Planner) OR load a saved trip via `tripId` / fetch user's trips from `GET /api/trips/my`.
   - Add a "Save Trip to Account" button calling `ApiService.saveTrip(...)` (`POST /api/trips`).
   - In `TripPlannerScreen`, add a "View Full Expedition Workspace" button that pushes the plan to `MyTripScreen`.
4. **Backend API Service Extensions (`api_service.dart`)**:
   - Implement `saveTrip(Map<String, dynamic> tripData)` -> `POST /api/trips`
   - Implement `getMyTrips()` -> `GET /api/trips/my`
   - Implement `getMyBookings()` -> `GET /api/bookings/my`
   - Implement `getFavorites()` and `toggleFavorite(...)` -> `/api/favorites`
   - Implement `submitReview(...)` -> `POST /api/reviews`
   - Implement `getVerificationProof(String idOrVehicle)` -> `GET /api/verify/listing/:id` / `GET /api/verify/vehicle/:vehicleNumber`
5. **Real Profile Vault Integration (`profile_screen.dart`)**:
   - Connect "My Bookings" tab to `ApiService.getMyBookings()`.
   - Connect "Saved Trips" tab to `ApiService.getMyTrips()`.
   - Connect "Favorites" tab to `ApiService.getFavorites()`.
6. **Dynamic Web3 Verification (`verification_proof_screen.dart`)**:
   - Connect to `ApiService.getVerificationProof(...)` to display real on-chain data for any listing or vehicle number.
