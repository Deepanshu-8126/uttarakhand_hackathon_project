# Discovery Uttarakhand — Mobile Application Feature Inventory

**Document Version:** 1.0.0  
**Generated:** September 2026  
**Auditor:** Senior Full-Stack & Mobile Systems Architect  
**Project:** Discovery Uttarakhand Mobile App (`discovery_uttarakhand`)

---

## 1. Architectural Foundations of Mobile App

The mobile application is built in **Flutter (Dart 3.x / Flutter 3.x)** targeting Android, iOS, and Mobile Web:
- **Location:** `c:\Users\Deepanshu\Desktop\discover\mobile_app`
- **Entry Point:** `lib/main.dart`
- **State Management:** `Provider` (`AuthProvider`, `ChangeNotifier`) + Local State
- **Network / API Layer:** `lib/services/api_service.dart` with dual failover:
  - Local Port 5000 (`http://localhost:5000/api` on Web, `http://10.0.2.2:5000/api` on Android Emulator, `http://192.168.1.37:5000/api` on Physical LAN)
  - Production Render (`https://uttarakhand-hackathon-project.onrender.com/api`)
- **Caching:** Multi-tier with in-memory RAM cache (0ms) and disk cache via `SharedPreferences`.
- **UI & Theme:** `AppTheme` adhering to GEMINI.md constitution (Deep Himalayan Emerald `#0F3D2E`, Radiant Emerald Glow `#00FF88`, Clean Alpine Light `#FDFBF7`, Teak `#8B5A2B`).

---

## 2. Comprehensive Screen & Component Inventory

### Screen 1: Home Screen (`home_screen.dart`)
* **Widget:** `HomeScreen`
* **Features:**
  1. *Header Bar*: Location pill with GPS detection, emergency SOS quick trigger, user avatar / auth state.
  2. *Live Telemetry Ticker*: Real-time active trekkers, live weather corridor alert, escrow secured volume.
  3. *Himalayan Hero Card*: Featured hero destination carousel with verified tags and "Plan Expedition" button.
  4. *Quick Category Navigation*: Treks, Sacred, Rentals, Stays, Guides, SOS buttons.
  5. *Live Satellite Radar*: GIS GPS verified landmarks with map & itinerary hooks.
  6. *Explore Destinations Grid*: Filterable list of all 13 districts of Uttarakhand with search and category filters.
  7. *Offbeat Hidden Gems*: Pristine lesser-known locations with live weather and distance.
  8. *Verified Reviews Feed*: Community traveler reviews and star rating.
* **Connected APIs:**
  - `ApiService.getDestinations()` -> `/api/destinations`
  - `ApiService.getHiddenLocations()` -> `/api/hidden-locations?withWeather=true`
  - `ApiService.getLiveTelemetry()` -> `/api/live-data/telemetry`
* **Current Status:** UI MATCHED, real database connected.

---

### Screen 2: Destination Detail (`destination_detail_screen.dart`)
* **Widget:** `DestinationDetailScreen`
* **Features:**
  1. *Hero Image Carousel*: Multi-image gallery with entity-specific imagery.
  2. *Altitude & Weather Bar*: Live elevation in meters, season, duration, difficulty.
  3. *Quick Actions*: "Start Plan" (opens Trip Planner), "Save to Favorites", "Share".
  4. *Associated Stays & Rentals*: Real database cards for homestays and vehicles nearby.
  5. *Heritage Insights*: Cultural background, spiritual importance, guidelines.
* **Connected APIs:**
  - `ApiService.getDestinations()`
  - `ApiService.getStays()`
  - `ApiService.getRentals()`
* **Current Status:** UI MATCHED. Need to ensure "Start Plan" pre-selects the destination in Trip Planner.

---

### Screen 3: Trip Planner (`trip_planner_screen.dart`)
* **Widget:** `TripPlannerScreen`
* **Features:**
  1. *Destination Dropdown / Selector*: Select from real database destinations.
  2. *Duration Stepper*: 1 to 14 days.
  3. *Travelers Stepper*: 1 to 10 persons.
  4. *Interactive Budget Slider / Input*: Custom budget entry with quick `+₹1000` / `+₹5000` pills.
  5. *Deterministic Plan Generation*: Allocates budget across stays, rentals, food, activities, and buffer.
  6. *Day Timeline Preview*: Morning, afternoon, evening breakdown.
* **Connected APIs:**
  - `ApiService.getDestinations()`
  - `ApiService.getStays()`
  - `ApiService.getRentals()`
  - `ApiService.getActivities()`
* **Identified Gaps:**
  - Does NOT accept constructor parameters (`initialDestination`, `initialDays`, `initialTravelers`, `initialBudget`, `initialOrigin`) for agentic AI prefilling.
  - Plan is displayed inline but has no "Save to Backend" button (`POST /api/trips`) or transition to `MyTripScreen`.

---

### Screen 4: My Expeditions / Saved Trips (`my_trip_screen.dart`)
* **Widget:** `MyTripScreen`
* **Features:**
  1. Static 3-day Kedarnath circuit hardcoded in local state.
  2. Escrow status display.
  3. Day breakdown with mock titles.
* **Identified Gaps:**
  - Currently hardcoded! Does NOT connect to `GET /api/trips/my` or `POST /api/trips`.
  - Does NOT receive or render the generated itinerary from `TripPlannerScreen`.
  - Missing modify trip and save trip workflows.

---

### Screen 5: Homestays & Rentals (`rentals_stays_screen.dart`)
* **Widget:** `RentalsStaysScreen`
* **Features:**
  1. *Segmented Tabs*: Stays (Homestays/Cottages) vs Rentals (Bikes/SUVs).
  2. *Filter System*: District, Price Range, Vehicle Type, Room Type.
  3. *Listing Cards*: Image, price, rating, verified badge, amenities, specifications.
  4. *Booking Trigger*: "Book Now" opens `CheckoutScreen` with selected entity details.
* **Connected APIs:**
  - `ApiService.getStays()` -> `/api/stays`
  - `ApiService.getRentals()` -> `/api/rentals`
* **Current Status:** UI & API MATCHED with real database records.

---

### Screen 6: Mountain Guides (`guides_screen.dart`)
* **Widget:** `GuidesScreen`
* **Features:**
  1. *Guide Directory*: Certified guides with photo, experience, daily fee, language badges.
  2. *Verification Badge*: On-chain cryptographic ID display.
  3. *Hire Action*: "Hire Guide" opens booking checkout with guide details.
* **Connected APIs:**
  - `ApiService.getGuides()` -> `/api/guides`
* **Current Status:** MATCHED.

---

### Screen 7: Mountain Activities (`activities_screen.dart`)
* **Widget:** `ActivitiesScreen`
* **Features:**
  1. *Categories*: Trekking, Rafting, Paragliding, Skiing, Camping.
  2. *Activity Cards*: Duration, difficulty level, inclusions, price.
  3. *Add to Plan Trigger*: Direct button to plan a trip with this activity.
* **Connected APIs:**
  - `ApiService.getActivities()` -> `/api/activities`
* **Current Status:** MATCHED.

---

### Screen 8: Spiritual Pilgrimage Shrines (`spiritual_screen.dart`)
* **Widget:** `SpiritualScreen`
* **Features:**
  1. Sacred temples directory with elevation, mythology, aarti timings, opening dates.
  2. Yatra guidelines & biometric pass notice.
* **Connected APIs:**
  - `ApiService.getSpiritualPlaces()` -> `/api/spiritual`
* **Current Status:** MATCHED.

---

### Screen 9: Culture, Cuisine & Traditions (`culture_screen.dart`)
* **Widget:** `CultureScreen`
* **Features:**
  1. Traditional Pahadi cuisine recipes, nutritional facts, local eateries.
  2. Festivals, folk dances, handicraft traditions.
* **Connected APIs:**
  - `ApiService.getCulturePlaces()` -> `/api/culture`
* **Current Status:** MATCHED.

---

### Screen 10: GIS Mountain Map (`map_screen.dart`)
* **Widget:** `MapScreen`
* **Features:**
  1. *FlutterMap / Leaflet Engine*: Interactive pan/zoom topographical map with OpenStreetMap tiles.
  2. *Marker System*: Destinations, stays, and vehicles plotted with custom icons.
  3. *Bottom Sheet Card*: Tapping marker opens rich details card with altitude, image, and "Navigate / Plan" button.
  4. *Search & Filters*: Filter markers by category.
* **Connected APIs:**
  - `ApiService.getDestinations()`
* **Current Status:** MATCHED.

---

### Screen 11: AI Travel Copilot & Voice Studio (`ai_copilot_screen.dart`)
* **Widget:** `AiCopilotScreen`
* **Features:**
  1. *Multi-turn Chat Timeline*: Message history, Markdown parsing, confidence indicators, suggested chips.
  2. *Real-Time Voice Assistant*: Integrated with `VoicePlayerService` and `VoiceService` to speak back with Gemini Live Aoede neural voice.
  3. *Session Management*: Multi-chat sessions saved to `SharedPreferences`.
  4. *Quick Scenarios*: Backpacker Kedarkantha ₹5,000 budget, altitude safety, Haldwani hidden gems.
* **Connected APIs:**
  - `ApiService.sendVoiceMessage()` -> `/api/voice/ask`
  - `ApiService.sendCopilotMessage()` -> `/api/chat`
* **Identified Gaps:**
  - Lacks agentic routing to prefill and launch `TripPlannerScreen` when user asks to plan a trip.
  - Lacks dynamic pronoun resolution against user's active trip.

---

### Screen 12: Checkout & Escrow Booking (`checkout_screen.dart`)
* **Widget:** `CheckoutScreen`
* **Features:**
  1. *Summary Card*: Title, dates, duration, travelers.
  2. *Server-Side Rate Recalculation*: Price authority breakdown.
  3. *Traveler Form*: Full name, phone, email, notes.
  4. *Escrow Mountain Trust Protocol*: Explains safety deposit release logic.
  5. *Instant Confirmation*: Displays booking reference and check-in OTP.
* **Connected APIs:**
  - `ApiService.createBooking()` -> `/api/bookings`
* **Current Status:** MATCHED.

---

### Screen 13: User Profile & Vault (`profile_screen.dart`)
* **Widget:** `ProfileScreen`
* **Features:**
  1. User card with avatar, role, email.
  2. Edit profile bottom sheet modal.
  3. Tabs: Saved Destinations, Stays, Bookings, Wallet.
  4. Logout button.
* **Identified Gaps:**
  - Currently loads sample vault data from all destinations instead of querying user's real bookings (`/api/bookings/my`), saved trips (`/api/trips/my`), and favorites (`/api/favorites`).

---

### Screen 14: Authentication (`login_screen.dart`)
* **Widget:** `LoginScreen`
* **Features:**
  1. Login and Register tabs.
  2. Role selector (Traveler, Verified Partner, Guide).
  3. Password visibility toggle.
  4. Authenticates against backend and updates `AuthProvider`.
* **Connected APIs:**
  - `AuthProvider.login()` -> `/api/auth/login`
  - `AuthProvider.register()` -> `/api/auth/register`
* **Current Status:** MATCHED.

---

### Screen 15: Blockchain Web3 Verification (`verification_proof_screen.dart`)
* **Widget:** `VerificationProofScreen`
* **Features:**
  1. Cryptographic certificate display with smart contract address, Polygon TX hash, issuance date, and validity date.
  2. On-chain immutable seal with QR code.
* **Identified Gaps:**
  - Currently uses static fallback values if no arguments provided; needs dynamic backend lookup by listing ID or vehicle number (`/api/verify/...`).

---

### Screen 16: Emergency SOS & Mesh Safety (`sos_safety_screen.dart`)
* **Widget:** `SosSafetyScreen`
* **Features:**
  1. 1-tap SOS distress button with animated pulse.
  2. Emergency type picker: Medical, Landslide Trap, Lost, AMS Sickness, Vehicle Breakdown.
  3. GPS location capture and broadcast to SDRF mesh network.
  4. Incident status tracking with assigned rescue unit and response ETA.
* **Connected APIs:**
  - `ApiService.triggerSOS()` -> `/api/sos/trigger`
* **Current Status:** MATCHED.

---

### Screen 17: Innovation Showcase (`innovation_showcase_screen.dart`)
* **Widget:** `InnovationShowcaseScreen`
* **Features:** Detailed interactive cards demonstrating the 4 core pillars: AI Agentic Copilot, Blockchain Web3 Trust, Dual Deterministic Routing, and SDRF Mesh Safety.
* **Current Status:** MATCHED.
