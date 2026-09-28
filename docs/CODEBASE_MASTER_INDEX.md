# Discovery Uttarakhand — Codebase Master Index

**Generated on:** September 28, 2026  
**Type:** Complete Developer Master Reference Table  
**Purpose:** Answers every architectural question directly from the actual codebase.

---

## 1. Developer Q&A Quick Navigation

- **"Ye button kis function ko call karta hai?"** $longrightarrow$ See Table Below under Component & Function columns.
- **"Ye function kis API ko call karta hai?"** $longrightarrow$ See API Client column.
- **"Ye API kis controller mein hai?"** $longrightarrow$ See Controller column.
- **"Controller kis service ko call karta hai?"** $longrightarrow$ See Service column.
- **"Service kis MongoDB model ko use karti hai?"** $longrightarrow$ See Model & Collection columns.
- **"MongoDB ka data frontend mein kis component mein aa raha hai?"** $longrightarrow$ See Component & UI Output columns.
- **"AI ka actual function kaha hai?"** $longrightarrow$ `backend/services/agentService.js -> runAgent()` (Line 62).
- **"Trip Planner ka budget kaha calculate ho raha hai?"** $longrightarrow$ `Frontend/src/utils/itineraryGenerator.js` and `backend/services/budgetEngine.js -> calculateTripBudget()` (Line 25).
- **"Booking ka price kaha calculate ho raha hai?"** $longrightarrow$ Server-side in `backend/controllers/bookingController.js -> createBooking()` (Lines 60-120).
- **"User ke location ke basis par nearby data kaha aa raha hai?"** $longrightarrow$ `backend/services/locationService.js -> findNearbyEntities()` (Line 284) via `GET /api/personalized/home`.
- **"Image kaha se aa rahi hai?"** $longrightarrow$ Authentic `item.images` from MongoDB $longrightarrow$ `Frontend/src/utils/imageHelpers.js` $longrightarrow$ deterministic index in `Frontend/src/utils/images.js`.

---

## 2. Complete End-to-End Master Trace Table

| Feature | Frontend Page | Component | Function | API Client | HTTP API | Route File | Controller | Service | Model | MongoDB Collection | UI Output |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Explore Destinations** | `Home.jsx` (`/explore`) | `ExploreSection.jsx` | `loadDestinations` | `destinationApi.getDestinations()` | `GET /api/destinations` | `destinationRoutes.js` | `destinationExploreController.getDestinations` | `destinationResolver.js` | `Destination` | `destinations` | 129 Destination Cards with elevation, photos, and filters |
| **Personalized Discovery**| `Home.jsx` (`/`) | `PersonalizedNearYouSection.jsx` | `fetchPersonalizedHome` | `personalizedApi.getPersonalizedHome()` | `GET /api/personalized/home` | `personalizedRoutes.js` | `personalizedController.getPersonalizedHome` | `locationService.findNearbyEntities` | `Stay, Rental, Guide` | `stays, rentals, guides` | "Near You" carousel with exact km distance badges |
| **Stays Catalog** | `Stays.jsx` (`/stays`) | `InteractiveStayCard` | `useStays` | `stayApi.getStays()` | `GET /api/stays` | `stayRoutes.js` | `stayController.getStays` | `locationService.js` | `Stay` | `stays` | 86+ Mountain Stays with story dash photos & escrow tag |
| **Vehicle Rentals** | `Rentals.jsx` (`/rentals`) | `RentalCard.jsx` | `useRentals` | `rentalApi.getRentals()` | `GET /api/rentals` | `rentalRoutes.js` | `rentalController.getRentals` | `partnerMarketplace` | `Rental` | `rentals` | 49 Vehicles across 7 hubs with Himalayan permit badges |
| **Licensed Guides** | `Guides.jsx` (`/guides`) | `GuideCard.jsx` | `useGuides` | `guideApi.getGuides()` | `GET /api/guides` | `guideRoutes.js` | `guideController.getGuides` | `locationService.js` | `Guide` | `guides` | 190 Mountain Guides with language & peak badges |
| **Stage 1 Trip Intake** | `TripPlanner.jsx` (`/trip-planner`) | `TripPlanner.jsx` | `handlePlanTrip` | `itineraryGenerator.generatePersonalizedTripPlan` | Local State / OSRM | N/A | N/A | `routeHelpers.fetchOSRMRoute` | N/A | Local Session | Multi-step form $longrightarrow$ Generated Itinerary preview |
| **Stage 2 Trip Workspace**| `MyTripPage.jsx` (`/my-trip/:id`) | `TripWorkspaceMap.jsx` | `saveTripToCloud` | `tripApi.createTrip()` | `POST /api/trips` | `tripRoutes.js` | `tripController.createTrip` | `tripMutationService.js` | `SavedTrip` | `savedtrips` | Interactive polyline route, daily timeline & budget sheet |
| **Instant Checkout** | `CheckoutPage.jsx` | `PriceSummaryCard` | `handleSubmitBooking` | `bookingApi.createBooking()` | `POST /api/bookings` | `bookingRoutes.js` | `bookingController.createBooking` | `escrowService.generateCheckInOtp` | `Booking` | `bookings` | Booking Confirmation with 6-digit Check-In OTP |
| **Check-In Handshake** | `ProfilePage.jsx` | `BookingDetailsModal` | `verifyHandshake` | `bookingApi.verifyCheckIn()` | `POST /api/bookings/:id/verify-checkin` | `bookingRoutes.js` | `bookingController.verifyCheckIn` | `escrowService.releaseEscrowPayout` | `Booking` | `bookings` | Escrow Release Confirmation & Travel Voucher |
| **Conversational AI** | `CopilotPage.jsx` (`/copilot`) | `ChatArea.jsx` | `sendMessage` | `agentApi.sendAgentMessageStream()` | `POST /api/agent/chat` | `agentRoutes.js` | `agentController.agentChat` | `agentService.runAgent & agentTools` | `Destination, Stay, Rental` | All Collections | Grounded AI answer with citations, weather & action pills |
| **Road Hazards & Live** | `DestinationDetails.jsx` | `CorridorBanner` | `loadCorridorStatus` | `liveDataApi.getLiveCorridorStatus()` | `GET /api/live/corridor` | `liveDataRoutes.js` | `liveDataController.getCorridor` | `advisoryEngine.getRoadAdvisoryForCorridor` | `RoadBulletin` | In-Memory / RoadBulletin | Live landslide alert and bypass navigation route |
| **One-Tap Emergency SOS**| Floating Button / Modal | `WomenSosModal.jsx` | `triggerSosAlert` | `sosApi.createSosAlert()` | `POST /api/sos` | `sosRoutes.js` | `sosController.createAlert` | `womenSafetyService.js` | `SosAlert` | `sosalerts` | Real-time GPS emergency broadcast & Police helplines |
