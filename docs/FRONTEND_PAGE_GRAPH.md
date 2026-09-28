# Discovery Uttarakhand — Frontend Page Graph
**Generated:** 2026-09-28
**Total Mapped Pages:** 29
**Architecture:** React 19 + React Router v7 + Vite + Tailwind CSS

### Home / Explore
```text
PAGE: Frontend/src/pages/Home.jsx
 ↓
COMPONENTS: ExploreSection, PersonalizedNearYouSection, HeroSection
 ↓
FUNCTIONS: useDestinations, usePersonalizedHome
 ↓
API CLIENT: destinationApi.getDestinations, personalizedApi.getPersonalizedHome
 ↓
BACKEND ROUTE: GET /api/destinations, GET /api/personalized/home
```

### Destination Details
```text
PAGE: Frontend/src/pages/DestinationDetails.jsx
 ↓
COMPONENTS: DestinationDetails, PhotoGallery, ReviewSection
 ↓
FUNCTIONS: getDestinationBySlug, getDestinationRelated
 ↓
API CLIENT: destinationApi.getDestinationBySlug, destinationApi.getDestinationRelated
 ↓
BACKEND ROUTE: GET /api/destinations/:slug, GET /api/destinations/:slug/related
```

### Stays
```text
PAGE: Frontend/src/pages/Stays.jsx
 ↓
COMPONENTS: StayCard, FilterPills, SearchBar, BookingModal
 ↓
FUNCTIONS: useStays -> fetchStays()
 ↓
API CLIENT: stayApi.getStays()
 ↓
BACKEND ROUTE: GET /api/stays -> stayController.getStays -> Stay.find() + PartnerListing.find()
```

### Rentals
```text
PAGE: Frontend/src/pages/Rentals.jsx
 ↓
COMPONENTS: RentalHero, RentalCard, FilterPills
 ↓
FUNCTIONS: useRentals -> fetchRentals()
 ↓
API CLIENT: rentalApi.getRentals()
 ↓
BACKEND ROUTE: GET /api/rentals -> rentalController.getRentals -> Rental.find() + PartnerListing.find()
```

### Guides
```text
PAGE: Frontend/src/pages/Guides.jsx
 ↓
COMPONENTS: GuideCard, SearchBar, FilterPills
 ↓
FUNCTIONS: useGuides -> fetchGuides()
 ↓
API CLIENT: guideApi.getGuides()
 ↓
BACKEND ROUTE: GET /api/guides -> guideController.getGuides -> Guide.find()
```

### Activities
```text
PAGE: Frontend/src/pages/Activities.jsx
 ↓
COMPONENTS: ActivityCard, FilterPills
 ↓
FUNCTIONS: useActivities -> fetchActivities()
 ↓
API CLIENT: activityApi.getActivities()
 ↓
BACKEND ROUTE: GET /api/activities -> activityController.getActivities -> Activity.find()
```

### Spiritual
```text
PAGE: Frontend/src/pages/Spiritual.jsx
 ↓
COMPONENTS: SpiritualCard, FilterPills
 ↓
FUNCTIONS: useSpiritualPlaces -> fetchPlaces()
 ↓
API CLIENT: spiritualApi.getSpiritualPlaces()
 ↓
BACKEND ROUTE: GET /api/spiritual -> spiritualController.getSpiritualPlaces -> Spiritual.find()
```

### Culture
```text
PAGE: Frontend/src/pages/Culture.jsx
 ↓
COMPONENTS: CultureCard, FilterPills
 ↓
FUNCTIONS: useCulturePlaces -> fetchPlaces()
 ↓
API CLIENT: cultureApi.getCulturePlaces()
 ↓
BACKEND ROUTE: GET /api/culture -> cultureController.getCulturePlaces -> Culture.find()
```

### Map
```text
PAGE: Frontend/src/pages/Map.jsx
 ↓
COMPONENTS: MapStage, MarkerLayer, RouteLayer, LayerControls
 ↓
FUNCTIONS: mapStore actions, getDestinations, getStays
 ↓
API CLIENT: destinationApi.getDestinations, stayApi.getStays
 ↓
BACKEND ROUTE: GET /api/destinations, GET /api/stays
```

### Trip Planner
```text
PAGE: Frontend/src/pages/TripPlanner.jsx
 ↓
COMPONENTS: TripPlanner, BudgetBreakdownCard, AddToTripModal
 ↓
FUNCTIONS: handleGenerateItinerary, generatePersonalizedTripPlan, fetchOSRMRoute
 ↓
API CLIENT: destinationApi, stayApi, activityApi, spiritualApi
 ↓
BACKEND ROUTE: GET /api/destinations, /api/stays, /api/activities, /api/spiritual
```

### My Trip
```text
PAGE: Frontend/src/pages/MyTripPage.jsx
 ↓
COMPONENTS: MyTripPage, DayCard, RouteSelector
 ↓
FUNCTIONS: getTripById, createTrip, updateTrip
 ↓
API CLIENT: tripApi.getTripById, tripApi.createTrip
 ↓
BACKEND ROUTE: GET/POST/PATCH /api/trips -> tripController -> SavedTrip
```

### Copilot
```text
PAGE: Frontend/src/pages/CopilotPage.jsx
 ↓
COMPONENTS: AICopilotDrawer, ChatArea, VoiceControls
 ↓
FUNCTIONS: sendMessage, sendVoiceMessage, executeAgentAction
 ↓
API CLIENT: agentApi.sendAgentChatStream, agentApi.sendVoiceChat
 ↓
BACKEND ROUTE: POST /api/agent/chat (SSE Stream) -> agentController -> agentService
```

### Profile
```text
PAGE: Frontend/src/pages/ProfilePage.jsx
 ↓
COMPONENTS: ProfilePage, MyBookings, FavoriteButton
 ↓
FUNCTIONS: getProfile, getTrips, getFavorites, getMyBookings
 ↓
API CLIENT: userApi.getProfile, tripApi.getTrips, bookingApi.getMyBookings
 ↓
BACKEND ROUTE: GET /api/users/profile, /api/trips, /api/bookings/my-bookings
```

### Checkout / Booking
```text
PAGE: Frontend/src/pages/CheckoutPage.jsx
 ↓
COMPONENTS: CheckoutPage, EscrowOtpModal
 ↓
FUNCTIONS: createBooking, verifyBookingOtp
 ↓
API CLIENT: bookingApi.createBooking, bookingApi.verifyCheckInOtp
 ↓
BACKEND ROUTE: POST /api/bookings, POST /api/bookings/:id/verify-otp
```

### Partner Dashboard
```text
PAGE: Frontend/src/pages/partner/PartnerDashboardPage.jsx
 ↓
COMPONENTS: PartnerListingsManager, ListingsTab, EarningsTab, BookingsTab
 ↓
FUNCTIONS: getPartnerListings, createListing, updateListing
 ↓
API CLIENT: partnerApi.getListings, partnerApi.createListing
 ↓
BACKEND ROUTE: GET/POST /api/partner/listings -> partnerController -> PartnerListing
```

### Admin Dashboard
```text
PAGE: Frontend/src/pages/AdminDashboard.jsx
 ↓
COMPONENTS: PartnerVerificationQueue, StatsWidget
 ↓
FUNCTIONS: getPendingVerifications, approveListing, rejectListing
 ↓
API CLIENT: adminApi.getPendingListings, adminApi.approveListing
 ↓
BACKEND ROUTE: GET/POST /api/admin/verification -> adminVerificationController
```

### Verification Proof (Web3)
```text
PAGE: Frontend/src/pages/VerificationProofPage.jsx
 ↓
COMPONENTS: VerificationBadge, VerificationProofPage
 ↓
FUNCTIONS: getListingVerification, getVehicleVerification
 ↓
API CLIENT: partnerApi.getListingVerification, partnerApi.getVehicleVerification
 ↓
BACKEND ROUTE: GET /api/verification/listing/:id, /api/verification/vehicle/:vehicleNumber
```

