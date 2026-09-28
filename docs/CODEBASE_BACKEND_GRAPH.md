# Discovery Uttarakhand — Codebase Backend Architecture Graph

**Generated on:** September 28, 2026  
**Type:** Complete Codebase X-Ray (Backend Layer)  
**Scope:** `backend/server.js`, `backend/routes/`, `backend/controllers/`, `backend/services/`, `backend/models/`

---

## 1. Master Backend Architecture Flow

```
[ Incoming HTTP Request ]
          │
          ▼
[ Express Server (backend/server.js) ]
          │  ├── helmet (CORP cross-origin headers)
          │  ├── cors (http://localhost:5173 / production domains)
          │  ├── express.json() & express.urlencoded()
          │  └── rateLimiters / authGuards
          │
          ▼
[ Route Modules (backend/routes/*.js) ]
          │
          ▼
[ Controller Layer (backend/controllers/*.js) ]
          │  ├── Request validation & sanitization
          │  ├── User / Role authentication checks (protect, adminOnly)
          │  └── Response serialization
          │
          ▼
[ Domain Services & Engines (backend/services/*.js) ]
          │  ├── locationService.js (GeoJSON & proximity)
          │  ├── recommendationService.js (Personalization engine)
          │  ├── agentService.js & agentTools.js (AI orchestration)
          │  ├── escrowService.js (OTP handshakes & payment escrow)
          │  ├── budgetEngine.js & advisoryEngine.js
          │  └── destinationResolver.js (Canonical entity normalization)
          │
          ▼
[ Mongoose Models (backend/models/*.js) ]
          │
          ▼
[ MongoDB Database (discovery_uttarakhand) ]
```

---

## 2. Core Subsystem Backend Graphs

### A. Destinations Subsystem
```
GET /api/destinations
  └── destinationRoutes.js (Line 7)
        └── destinationExploreController.js -> getDestinations() (Line 18)
              └── Destination.js (Mongoose Model)
                    └── MongoDB: 'destinations' collection (129 documents)
```
- **Single Item:** `GET /api/destinations/:slug` $longrightarrow$ `destinationExploreController.js -> getDestinationBySlug()` $longrightarrow$ `Destination.findOne({ slug })`

---

### B. Stays & Accommodations Subsystem
```
GET /api/stays
  └── stayRoutes.js (Line 12)
        └── stayController.js -> getStays() (Line 24)
              ├── Query Filters: district, category, price, facilities, verified
              └── Stay.js (Mongoose Model)
                    └── MongoDB: 'stays' collection (86 canonical + user listings)
```
- **Details:** `GET /api/stays/:id` $longrightarrow$ `stayController.js -> getStayById()` $longrightarrow$ `Stay.findById()`

---

### C. Vehicle Rentals Subsystem
```
GET /api/rentals
  └── rentalRoutes.js (Line 12)
        └── rentalController.js -> getRentals() (Line 28)
              ├── Query Filters: city, district, vehicleType, commercialPermit
              └── Rental.js (Mongoose Model)
                    └── MongoDB: 'rentals' collection (11 fleets / 49 vehicles)
```

---

### D. Guides, Activities, Spiritual & Cultural Subsystems
```
GET /api/guides       -> guideRoutes.js       -> guideController.getGuides()       -> Guide.js       -> 'guides' collection (190 docs)
GET /api/activities   -> activityRoutes.js    -> activityController.getActivities() -> Activity.js    -> 'activities' collection (28 docs)
GET /api/spiritual    -> spiritualRoutes.js   -> spiritualController.getSpiritual() -> Spiritual.js   -> 'spirituals' collection (56 docs)
GET /api/culture      -> cultureRoutes.js     -> cultureController.getCulture()     -> Culture.js     -> 'cultures' collection (30 docs)
GET /api/transports   -> transportRoutes.js   -> transportController.getTransports()-> Transport.js   -> 'transports' collection (8 corridors)
```

---

### E. Bookings & Escrow Handshake Subsystem
```
POST /api/bookings
  └── bookingRoutes.js (Line 19)
        └── bookingController.js -> createBooking() (Line 23)
              ├── Verification: Stay / Rental / Guide / PartnerListing
              ├── Pricing Engine: Server-side tariff calculation (anti-tamper)
              ├── escrowService.js -> generateCheckInOtp()
              └── Booking.js (Mongoose Model)
                    └── MongoDB: 'bookings' collection (78 documents)
```
- **Handshake Verification:**
```
POST /api/bookings/:id/verify-checkin
  └── bookingRoutes.js (Line 35)
        └── bookingController.js -> verifyCheckIn() (Line 412)
              ├── escrowService.js -> verifyOtpToken()
              ├── Status update: 'confirmed' -> 'completed'
              └── escrowService.js -> releaseEscrowPayout()
```

---

### F. Trip Management Subsystem
```
POST /api/trips
  └── tripRoutes.js (Line 9)
        └── tripController.js -> createTrip() (Line 34)
              └── SavedTrip.js (Mongoose Model)
                    └── MongoDB: 'savedtrips' collection
```
- **Load Trips:** `GET /api/trips` $longrightarrow$ `tripController.js -> getTrips()` $longrightarrow$ `SavedTrip.find({ user: req.user._id })`

---

### G. AI Copilot Conversational Subsystem
```
POST /api/agent/chat
  └── agentRoutes.js (Line 36)
        └── agentController.js -> agentChat() (Line 132)
              ├── agentSessionStore.js (getOrCreateSession, conversation memory)
              ├── agentService.js -> runAgent()
              │     ├── agentTools.js (15 grounded tool definitions)
              │     ├── Tools query MongoDB models directly (Destination, Stay, Rental, Activity, etc.)
              │     └── Provider Chain (OmniRoute -> Gemini -> Groq -> OpenAI -> DeterministicFallback)
              └── Response formatting with citations, evidenceRefs, and suggested actions
```

---

### H. Personalized Geolocation Discovery Subsystem
```
GET /api/personalized/home
  └── personalizedRoutes.js (Line 12)
        └── personalizedController.js -> getPersonalizedHome() (Line 68)
              ├── locationService.js -> resolveLocation(input)
              ├── Cache isolation: cacheGet('pers_home:u_<id>')
              ├── locationService.js -> findNearbyEntities(coords, radiusKm)
              │     └── MongoDB $near 2dsphere proximity queries
              └── Cache write: cacheSet(key, payload, 600s)
```
