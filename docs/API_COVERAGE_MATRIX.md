# Discovery Uttarakhand — API Coverage Matrix
**Generated:** 2026-09-28

| Feature | Frontend API Client | Backend Route | Controller | Service / Engine | Model | MongoDB Collection | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Destinations** | `destinationApi.js` | `GET /api/destinations` | `destinationController.js` | `factoryController.js` | `Destination.js` | `destinations` | **COMPLETE** |
| **Stays** | `stayApi.js` | `GET /api/stays` | `stayController.js` | In-controller combine | `Stay.js`, `PartnerListing.js` | `stays`, `partnerlistings` | **COMPLETE** |
| **Rentals** | `rentalApi.js` | `GET /api/rentals` | `rentalController.js` | In-controller combine | `Rental.js`, `PartnerListing.js` | `rentals`, `partnerlistings` | **COMPLETE** |
| **Guides** | `guideApi.js` | `GET /api/guides` | `guideController.js` | `factoryController.js` | `Guide.js` | `guides` | **COMPLETE** |
| **Activities** | `activityApi.js` | `GET /api/activities` | `activityController.js` | `factoryController.js` | `Activity.js` | `activities` | **COMPLETE** |
| **Spiritual** | `spiritualApi.js` | `GET /api/spiritual` | `spiritualController.js` | `factoryController.js` | `Spiritual.js` | `spiritual` | **COMPLETE** |
| **Culture** | `cultureApi.js` | `GET /api/culture` | `cultureController.js` | `factoryController.js` | `Culture.js` | `cultures` | **COMPLETE** |
| **Personalized** | `personalizedApi.js` | `GET /api/personalized/home`| `personalizedController.js`| `locationService.js` | Multi-model proximity | 5 Collections | **COMPLETE** |
| **Trip Planner** | `tripApi.js` | `POST /api/trips` | `tripController.js` | `itineraryGenerator.js` | `SavedTrip.js` | `savedtrips` | **COMPLETE** |
| **AI Copilot** | `agentApi.js` | `POST /api/agent/chat` | `agentController.js` | `agentService.js` | `Chat.js` (audit log) | In-memory session | **COMPLETE** |
| **Voice Studio** | `agentApi.js` | `POST /api/agent/voice` | `agentController.js` | `agentService.js` | Spoken turn log | In-memory session | **COMPLETE** |
| **Booking** | `bookingApi.js` | `POST /api/bookings` | `bookingController.js` | `escrowService.js` | `Booking.js` | `bookings` | **COMPLETE** |
| **Escrow OTP** | `bookingApi.js` | `POST /api/bookings/:id/verify-otp`| `bookingController.js`| `escrowService.js` | `Booking.js` | `bookings` | **COMPLETE** |
| **Partner Fleet** | `partnerApi.js` | `GET/POST /api/partner/listings`| `partnerController.js` | `cryptoService.js` | `PartnerListing.js` | `partnerlistings` | **COMPLETE** |
| **Web3 Proof** | `partnerApi.js` | `GET /api/verification/listing/:id`| `verificationController.js`| `web3Service.js` | `PartnerListing.js` | Blockchain Contract | **COMPLETE** |
| **Weather Live**| Direct Axios | `GET /api/live/weather` | `liveDataController.js` | `openMeteoAdapter.js` | None (External) | Open-Meteo REST | **COMPLETE** |
| **Road Safety** | Direct Axios | `GET /api/safety/advisories`| `safetyController.js` | `advisoryEngine.js` | `RoadBulletin.js` | `roadbulletins` | **COMPLETE** |
| **SOS Rescue** | `sosApi.js` | `POST /api/sos/trigger` | `sosController.js` | `womenSafetyService.js` | `SosAlert.js` | `sosalerts` | **COMPLETE** |
