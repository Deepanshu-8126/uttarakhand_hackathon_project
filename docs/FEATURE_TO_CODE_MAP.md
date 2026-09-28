# Discovery Uttarakhand — Feature to Code Map
**Generated:** 2026-09-28

| Feature | Page | Component | Function | API Client | Route | Controller | Service | Model | Collection | External API | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Explore** | `Home.jsx` | `ExploreSection.jsx` | `useDestinations()` | `destinationApi.js` | `GET /api/destinations` | `destinationController.js` | `factoryController.js` | `Destination.js` | `destinations` | None | COMPLETE |
| **Stays** | `Stays.jsx` | `StayCard.jsx` | `useStays()` | `stayApi.js` | `GET /api/stays` | `stayController.js` | In-controller combine | `Stay.js` | `stays` | None | COMPLETE |
| **Rentals** | `Rentals.jsx` | `RentalCard.jsx` | `useRentals()` | `rentalApi.js` | `GET /api/rentals` | `rentalController.js` | In-controller combine | `Rental.js` | `rentals` | None | COMPLETE |
| **Guides** | `Guides.jsx` | `GuideCard.jsx` | `useGuides()` | `guideApi.js` | `GET /api/guides` | `guideController.js` | `factoryController.js` | `Guide.js` | `guides` | None | COMPLETE |
| **Planner** | `TripPlanner.jsx` | `TripPlanner.jsx` | `handleGenerateItinerary` | `tripApi.js` | `POST /api/trips` | `tripController.js` | `itineraryGenerator.js` | `SavedTrip.js` | `savedtrips` | OSRM | COMPLETE |
| **AI Copilot** | `CopilotPage.jsx` | `AICopilotDrawer.jsx` | `sendAgentChatStream` | `agentApi.js` | `POST /api/agent/chat` | `agentController.js` | `agentService.js` | In-memory session | None | Groq/Gemini | COMPLETE |
| **Booking** | `CheckoutPage.jsx`| `BookingModal.jsx` | `createBooking()` | `bookingApi.js` | `POST /api/bookings` | `bookingController.js` | `escrowService.js` | `Booking.js` | `bookings` | None | COMPLETE |
| **Web3 Proof**| `VerificationProofPage.jsx`| `VerificationBadge.jsx`| `getListingVerification`| `partnerApi.js` | `GET /api/verification/listing/:id`| `verificationController.js`| `web3Service.js`| `PartnerListing.js`| Hardhat Node | Ethers.js | COMPLETE |
| **Nearby You**| `Home.jsx` | `PersonalizedNearYouSection.jsx`| `getPersonalizedHome`| `personalizedApi.js`| `GET /api/personalized/home`| `personalizedController.js`| `locationService.js`| 5 Models | 5 Collections| OpenStreetMap| COMPLETE |
| **SOS Rescue**| Global Modal | `SOSFloatingButton.jsx` | `triggerSOS` | `sosApi.js` | `POST /api/sos/trigger` | `sosController.js` | `womenSafetyService.js` | `SosAlert.js` | `sosalerts` | None | COMPLETE |
