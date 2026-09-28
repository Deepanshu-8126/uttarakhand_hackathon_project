# Discovery Uttarakhand — Core Function & Service Method Map

**Generated on:** September 28, 2026  
**Type:** Complete Codebase Function Inventory  
**Source of Truth:** Scanned directly from `backend/controllers/`, `backend/services/`, and `Frontend/src/api/`

---

## 1. Controller Functions

| Function Name | Controller File | Line | Called By | Calls | Purpose |
|---|---|:---:|---|---|---|
| `getDestinations` | `backend/controllers/destinationExploreController.js` | 18 | `GET /api/destinations` | `Destination.find()` | Fetch destination catalog with query filtering |
| `getDestinationBySlug` | `backend/controllers/destinationExploreController.js` | 94 | `GET /api/destinations/:slug` | `Destination.findOne({ slug })` | Fetch single destination by slug |
| `getStays` | `backend/controllers/stayController.js` | 24 | `GET /api/stays` | `Stay.find()` | Fetch verified stays & rest houses |
| `getStayById` | `backend/controllers/stayController.js` | 68 | `GET /api/stays/:id` | `Stay.findById()` | Fetch stay details by ID |
| `getRentals` | `backend/controllers/rentalController.js` | 28 | `GET /api/rentals` | `Rental.find()` | Fetch vehicle rental fleet records |
| `getRentalById` | `backend/controllers/rentalController.js` | 72 | `GET /api/rentals/:id` | `Rental.findById()` | Fetch rental listing by ID |
| `getGuides` | `backend/controllers/guideController.js` | 8 | `GET /api/guides` | `Guide.find()` | Fetch licensed guides catalog |
| `getActivities` | `backend/controllers/activityController.js` | 8 | `GET /api/activities` | `Activity.find()` | Fetch adventure activities catalog |
| `getSpiritual` | `backend/controllers/spiritualController.js` | 8 | `GET /api/spiritual` | `Spiritual.find()` | Fetch sacred pilgrimage sites |
| `getCulture` | `backend/controllers/cultureController.js` | 8 | `GET /api/culture` | `Culture.find()` | Fetch cultural & heritage sites |
| `getTransports` | `backend/controllers/transportController.js` | 12 | `GET /api/transports` | `Transport.find()` | Fetch arterial corridors |
| `createBooking` | `backend/controllers/bookingController.js` | 23 | `POST /api/bookings` | `generateCheckInOtp`, `Booking.create` | Create escrow reservation with OTP |
| `getMyBookings` | `backend/controllers/bookingController.js` | 240 | `GET /api/bookings/my` | `Booking.find({ user })` | Fetch user active/historical bookings |
| `verifyCheckIn` | `backend/controllers/bookingController.js` | 412 | `POST /api/bookings/:id/verify-checkin` | `verifyOtpToken`, `releaseEscrowPayout` | Verify customer check-in OTP handshake |
| `getTrips` | `backend/controllers/tripController.js` | 3 | `GET /api/trips` | `SavedTrip.find({ user })` | Fetch user saved itineraries |
| `createTrip` | `backend/controllers/tripController.js` | 34 | `POST /api/trips` | `SavedTrip.create()` | Persist user created trip plan |
| `getTripById` | `backend/controllers/tripController.js` | 15 | `GET /api/trips/:id` | `SavedTrip.findById()` | Fetch specific trip itinerary |
| `agentChat` | `backend/controllers/agentController.js` | 132 | `POST /api/agent/chat` | `runAgent()`, `agentSessionStore` | Handle AI Copilot message and streaming |
| `getPersonalizedHome` | `backend/controllers/personalizedController.js` | 68 | `GET /api/personalized/home` | `resolveLocation`, `findNearbyEntities` | Compute location-tailored recommendations |
| `getPersonalizedNearby` | `backend/controllers/personalizedController.js` | 198 | `GET /api/personalized/nearby` | `findNearbyEntities` | Proximity query for specific entity type |

---

## 2. Core Service & Engine Functions

| Function Name | Service File | Line | Called By | Calls | Purpose |
|---|---|:---:|---|---|---|
| `resolveLocation` | `backend/services/locationService.js` | 165 | `personalizedController.js` | `CANONICAL_COORDINATES`, `Destination.findOne` | Normalizes address or GPS into canonical [lng, lat] |
| `findNearbyEntities` | `backend/services/locationService.js` | 284 | `personalizedController.js` | `$near` 2dsphere on Stays, Rentals, Guides | Queries MongoDB for nearest verified assets |
| `calculateHaversineDistanceKm` | `backend/services/locationService.js` | 115 | `locationService.js` | Math trigonometry | Computes great-circle distance between coordinates |
| `classifyProximity` | `backend/services/locationService.js` | 144 | `locationService.js` | `PROXIMITY_TIERS` | Classifies distance into HIGHLY_NEARBY, NEARBY, REGIONAL |
| `runAgent` | `backend/services/agentService.js` | 62 | `agentController.js` | `executeTool`, `provider.generate()` | Master agent reasoning loop (max 4 iterations) |
| `executeTool` | `backend/services/agentTools.js` | 430 | `agentService.js` | Specific tool handler | Executes grounded AI tools against DB models |
| `resolveDestination` | `backend/services/destinationResolver.js` | 110 | `agentController.js`, `agentTools.js` | In-memory alias dictionary | Normalizes colloquial spellings to canonical destination |
| `generateCheckInOtp` | `backend/services/escrowService.js` | 15 | `bookingController.js` | `crypto.randomInt` | Generates secure 6-digit verification code |
| `verifyOtpToken` | `backend/services/escrowService.js` | 55 | `bookingController.js` | In-memory / DB hash compare | Verifies client OTP before releasing escrow |
| `calculateTripBudget` | `backend/services/budgetEngine.js` | 25 | `agentTools.js`, `budgetController.js` | Category tariff models | Calculates grounded budget breakdown with provenance |
| `getRoadAdvisoryForCorridor` | `backend/services/advisoryEngine.js` | 40 | `agentTools.js`, `liveDataController.js` | `RoadBulletin.find()` | Returns live hazards and bypass routes |
