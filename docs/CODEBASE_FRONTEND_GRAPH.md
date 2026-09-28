# Discovery Uttarakhand — Codebase Frontend Architecture Graph

**Generated on:** September 28, 2026  
**Type:** Complete Codebase X-Ray (Frontend Layer)  
**Scope:** `Frontend/src/pages/`, `Frontend/src/components/`, `Frontend/src/api/`, `Frontend/src/store/`, `Frontend/src/hooks/`

---

## 1. Master Frontend Component-to-Backend Flow

```
[ Browser URL Route ]
        │
        ▼
[ Page Component (Frontend/src/pages/) ]
        │
        ├──────────────────────┬──────────────────────┐
        ▼                      ▼                      ▼
[ Child Components ]    [ Custom Hooks ]       [ State Stores ]
(Frontend/src/components)  (Frontend/src/hooks)   (Frontend/src/store)
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
                    [ API Client Service ]
                    (Frontend/src/api/)
                               │
                               ▼
                    [ Axios Base Instance ]
                    (Frontend/src/api/api.js)
                               │
                               ▼
                    [ HTTP API Request ]
                    (e.g., GET /api/destinations)
```

---

## 2. Page-by-Page Detailed Architecture Trace

### 1. Home & Explore Page (`/` & `/explore`)
- **Page File:** [`Frontend/src/pages/Home.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Home.jsx)
- **Rendered Components:**
  - [`Frontend/src/components/Navbar.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/components/Navbar.jsx) — Site header, search modal, currency & auth state
  - [`Frontend/src/components/HeroSection.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/components/HeroSection.jsx) — Dynamic 16-destination Himalayan carousel, quick search bar
  - [`Frontend/src/components/home/PersonalizedNearYouSection.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/components/home/PersonalizedNearYouSection.jsx) — Geolocation-driven proximity recommendations
  - [`Frontend/src/components/ExploreSection.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/components/ExploreSection.jsx) — Destination search grid with live district & category filters
  - [`Frontend/src/components/home/ProblemStatement.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/components/home/ProblemStatement.jsx) — Mission showcase
  - [`Frontend/src/components/ReviewSection.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/components/ReviewSection.jsx) — Verified reviews carousel
  - [`Frontend/src/components/Footer.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/components/Footer.jsx) — Platform footer
- **Hooks & Context:**
  - `useLocation` (`react-router-dom`) — Detects hash anchors (`#explore`)
  - `useDestinations()` in `ExploreSection.jsx`
  - `useAuth()` (`Frontend/src/context/AuthContext.jsx`) — Current user identity
- **API Clients Called:**
  - `getDestinations()` from [`Frontend/src/api/destinationApi.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/api/destinationApi.js) $longrightarrow$ `GET /api/destinations`
  - `getPersonalizedHome()` from [`Frontend/src/api/personalizedApi.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/api/personalizedApi.js) $longrightarrow$ `GET /api/personalized/home`
  - `getReviews()` from [`Frontend/src/api/reviewApi.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/api/reviewApi.js) $longrightarrow$ `GET /api/reviews`

---

### 2. Destination Details Page (`/destinations/:slug`)
- **Page File:** [`Frontend/src/pages/DestinationDetails.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/DestinationDetails.jsx)
- **Child Components:**
  - `Navbar.jsx` & `Footer.jsx`
  - `AltitudeGuardModal.jsx` — High-altitude safety warning (>2500m AMS warnings)
  - `WomenSosModal.jsx` — One-tap emergency contact modal
  - `DestinationMap.jsx` — Interactive Leaflet coordinate map
  - `GooglePlacesRadarWidget.jsx` — Nearby ATM, hospital, fuel station discovery
  - `InteractiveStayCard` & `InteractiveRentalCard` — Direct booking access
- **API Clients Called:**
  - `getDestinationBySlug(slug)` from `destinationApi.js` $longrightarrow$ `GET /api/destinations/:slug`
  - `getStays({ district, limit })` from `stayApi.js` $longrightarrow$ `GET /api/stays`
  - `getRentals({ district })` from `rentalApi.js` $longrightarrow$ `GET /api/rentals`
  - `getGuides({ district })` from `guideApi.js` $longrightarrow$ `GET /api/guides`
  - `getActivities({ district })` from `activityApi.js` $longrightarrow$ `GET /api/activities`
  - `getLiveCorridorStatus()` from `liveDataApi.js` $longrightarrow$ `GET /api/live/corridor`

---

### 3. Stays & Homestays Page (`/stays`)
- **Page File:** [`Frontend/src/pages/Stays.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Stays.jsx)
- **Child Components:**
  - `InteractiveStayCard` — Story-style photo carousel, escrow protection badge, price per night, book now trigger
  - `StayCard.jsx` — Secondary grid view
  - `FilterPills.jsx` — Category filters: *KMVN Tourist Rest House*, *GMVN*, *Eco Camp*, *Heritage Homestay*
  - `AltitudeGuardModal.jsx` — AMS altitude advice
- **Hooks & Stores:**
  - `useStays()` (`Frontend/src/hooks/useStays.js`) — Stays fetching with query memoization
  - `useFavorites()` (`Frontend/src/context/FavoritesContext.jsx`) — Wishlist persistence
  - `useMapStore()` (`Frontend/src/store/mapStore.js`) — Trip drafting integration
- **API Clients Called:**
  - `getStays(filters)` from `stayApi.js` $longrightarrow$ `GET /api/stays`
  - `toggleFavorite({ targetId, targetType: 'stay' })` $longrightarrow$ `POST /api/favorites/toggle`

---

### 4. Vehicle Rentals Page (`/rentals`)
- **Page File:** [`Frontend/src/pages/Rentals.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Rentals.jsx)
- **Child Components:**
  - `RentalCard.jsx` — Vehicle specifications, Himalayan grade badge, verified commercial permit tag
  - Hub Filter Tabs — *Dehradun*, *Rishikesh*, *Kathgodam*, *Nainital*, *Haldwani*, *Rudrapur*, *Joshimath*
  - Vehicle Type Filter — *Scooter*, *Royal Enfield Himalayan*, *4x4 SUV*, *Sedan*
- **Hooks & Stores:**
  - `useRentals()` (`Frontend/src/hooks/useRentals.js`)
  - `useFavorites()`
- **API Clients Called:**
  - `getRentals(filters)` from `rentalApi.js` $longrightarrow$ `GET /api/rentals`
  - `checkVehiclePermit(number)` from `partnerApi.js` $longrightarrow$ `GET /api/verification/vehicle/:vehicleNumber`

---

### 5. Local Guides Page (`/guides` & `/guides/:slug`)
- **Page Files:** [`Frontend/src/pages/Guides.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Guides.jsx), [`Frontend/src/pages/GuideProfilePage.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/GuideProfilePage.jsx)
- **Child Components:**
  - `GuideCard.jsx` — Government license badge, spoken languages (Garhwali/Kumaoni/Hindi/English), peak expertise
- **Hooks:**
  - `useGuides()` (`Frontend/src/hooks/useGuides.js`)
- **API Clients Called:**
  - `getGuides(params)` from `guideApi.js` $longrightarrow$ `GET /api/guides`
  - `getGuideBySlug(slug)` from `guideApi.js` $longrightarrow$ `GET /api/guides/:slug`

---

### 6. Activities & Treks Page (`/activities`)
- **Page File:** [`Frontend/src/pages/Activities.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Activities.jsx)
- **Child Components:**
  - `ActivityCard.jsx` — Difficulty tier (Easy, Moderate, Challenging), duration, altitude gain, gear checklist
- **Hooks:**
  - `useActivities()` (`Frontend/src/hooks/useActivities.js`)
- **API Clients Called:**
  - `getActivities(params)` from `activityApi.js` $longrightarrow$ `GET /api/activities`

---

### 7. Spiritual & Cultural Sites Pages (`/spiritual` & `/culture`)
- **Page Files:** [`Frontend/src/pages/Spiritual.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Spiritual.jsx), [`Frontend/src/pages/Culture.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Culture.jsx)
- **Child Components:**
  - `SpiritualCard.jsx` — Temple darshan timings, Pooja protocol, dress code
  - `CultureCard.jsx` — Kumaoni/Garhwali heritage, folk crafts, seasonal fairs
- **Hooks:**
  - `useSpiritual()` (`Frontend/src/hooks/useSpiritual.js`)
  - `useCulture()` (`Frontend/src/hooks/useCulture.js`)
- **API Clients Called:**
  - `getSpiritualPlaces()` from `spiritualApi.js` $longrightarrow$ `GET /api/spiritual`
  - `getCulturalPlaces()` from `cultureApi.js` $longrightarrow$ `GET /api/culture`

---

### 8. Interactive Map Page (`/map`)
- **Page File:** [`Frontend/src/pages/Map.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Map.jsx)
- **Child Components:**
  - Leaflet Map Container (`react-leaflet`) with custom SVG Mountain Markers
  - Layer Control Toggle — *Destinations*, *Stays*, *Rentals*, *Corridors*, *Weather Radar*
  - Detail Drawer Widget — Side overlay showing selected entity with "Add to Trip" CTA
- **Hooks & Stores:**
  - `useMapStore()` (`Frontend/src/store/mapStore.js`) — Selected entity, map center, active layers
- **API Clients Called:**
  - `getDestinations()`, `getStays()`, `getRentals()`, `getTransports()` $longrightarrow$ Parallel bundle fetch

---

### 9. Trip Planner (Stage 1: `/trip-planner`)
- **Page File:** [`Frontend/src/pages/TripPlanner.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/TripPlanner.jsx)
- **Child Components:**
  - Step 1: Destination Selection & Geolocation Hub Selector
  - Step 2: Duration, Traveler Count, Vehicle Preference (Car, Bike, Bus, Trek)
  - Step 3: Budget Tier & Vibe Selection (Spiritual, Trekking, Wildlife, Leisure)
  - Step 4: Deterministic Plan Preview with OSRM Mountain Route Graph
- **Engines & Utilities:**
  - `generatePersonalizedTripPlan()` (`Frontend/src/utils/itineraryGenerator.js`)
  - `fetchOSRMRoute()` (`Frontend/src/utils/routeHelpers.js`)
  - `detectBrowserLocation()` (`Frontend/src/utils/geoHelpers.js`)
- **Stores:**
  - `mapStore.js` — Sets `activeTripSession`, saves draft in `localStorage`
- **Navigation Flow:**
  - On "Plan My Trip" click $longrightarrow$ sets session $longrightarrow$ redirects to Stage 2: `/my-trip/:tripId`

---

### 10. My Trip Workspace (Stage 2: `/my-trip/:tripId`)
- **Page File:** [`Frontend/src/pages/MyTripPage.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/MyTripPage.jsx)
- **Child Components:**
  - `TripWorkspaceMap.jsx` — Interactive route segments with day-by-day polyline coloring
  - Timeline Day Tabs — Detailed daily schedule (Morning, Afternoon, Evening, Night)
  - Live Budget Breakdown Widget — Stays + Transport + Food + Permits
  - Save & Share Bar — Authenticated trip persistence
- **API Clients Called:**
  - `createTrip(tripPayload)` from `tripApi.js` $longrightarrow$ `POST /api/trips`
  - `getTripById(tripId)` from `tripApi.js` $longrightarrow$ `GET /api/trips/:id`
  - `updateTrip(tripId, updates)` $longrightarrow$ `PATCH /api/trips/:id`

---

### 11. AI Copilot Page (`/copilot`)
- **Page File:** [`Frontend/src/pages/CopilotPage.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/CopilotPage.jsx)
- **Child Components:**
  - `Frontend/src/components/copilot/ChatArea.jsx` — Message stream with citations and action pills
  - `Frontend/src/components/copilot/CopilotMessage.jsx` — Markdown message renderer
  - `Frontend/src/components/copilot/ToolExecutionCard.jsx` — Visual proof of tool execution (Weather, Route, Stays)
- **Hooks & Stores:**
  - `useChatStore()` (`Frontend/src/store/chatStore.js`) — Manages chat threads, SSE connection, tool call states
- **API Clients Called:**
  - `sendAgentMessageStream()` from [`Frontend/src/api/agentApi.js`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/api/agentApi.js) $longrightarrow$ `POST /api/agent/chat` (SSE or JSON)

---

### 12. Checkout & Booking System (`/checkout` & `/checkout/:type/:id`)
- **Page File:** [`Frontend/src/pages/CheckoutPage.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/CheckoutPage.jsx)
- **Child Components:**
  - Price Calculator & Escrow Guarantee Breakdown (100% Refundable until Handshake)
  - Guest & Contact Information Form
  - Date Range Picker (Check-in / Check-out)
  - Instant Check-in OTP Preview
- **API Clients Called:**
  - `createBooking(payload)` from `bookingApi.js` $longrightarrow$ `POST /api/bookings`
  - `createPaymentOrder(payload)` from `paymentApi.js` $longrightarrow$ `POST /api/payments/create-order`

---

### 13. Profile & Bookings Management (`/profile`)
- **Page File:** [`Frontend/src/pages/ProfilePage.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/ProfilePage.jsx)
- **Child Components:**
  - User Identity Header (Name, Email, Role, Saved Home Location)
  - Bookings List with Escrow Status Tabs (Active, Completed, Cancelled)
  - Check-in OTP Reveal Card with Countdown Timer
  - Saved Trips & Wishlist Grid
- **API Clients Called:**
  - `getMyBookings()` from `bookingApi.js` $longrightarrow$ `GET /api/bookings/my`
  - `getCheckInOtp(bookingId)` from `bookingApi.js` $longrightarrow$ `GET /api/bookings/:id/checkin-otp`
  - `getTrips()` from `tripApi.js` $longrightarrow$ `GET /api/trips`
  - `getFavorites()` from `favoriteApi.js` $longrightarrow$ `GET /api/favorites`
