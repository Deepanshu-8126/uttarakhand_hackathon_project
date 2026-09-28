# Discovery Uttarakhand — Website Feature Inventory (Canonical Source of Truth)

**Document Version:** 1.0.0  
**Generated:** September 2026  
**Auditor:** Senior Full-Stack & Mobile Systems Architect  
**Project:** Discovery Uttarakhand (Pahadi Tourism & AI Travel Network)

---

## 1. Architectural Foundations of Website

The website is the canonical product source of truth. Every feature, database record, API contract, and business logic listed below represents the production capability running on:
- **Frontend URL:** `http://localhost:5173` (Vite + React + Tailwind CSS + Lucide Icons + Leaflet Maps)
- **Local Backend:** `http://localhost:5000/api` (Node.js Express + MongoDB Atlas + Upstash Redis Cache)
- **Production Backend:** `https://uttarakhand-hackathon-project.onrender.com/api`

---

## 2. Comprehensive Route & Feature Inventory

### Page 1: Home / Explore Overview
* **Route:** `/` and `/explore`
* **Purpose:** Primary landing experience, inspiration, live radar, offbeat destinations discovery, and cultural introduction.
* **Features:**
  1. *Hero Section*: High-definition rotating Himalayan hero carousel, search bar with autocomplete, instant category chips (Spiritual, Lakes, Adventure, Treks, Wildlife).
  2. *Live Corridor Radar*: Real-time active trekkers telemetry count, mountain weather status, passes open status, and escrow secured metrics.
  3. *Explore Grid*: Filterable list of all 13 districts of Uttarakhand with category pills (Treks, Sacred, Nature, Lakes, Heritage), instant keyword search, and pagination.
  4. *Strict Destination Image Identity*: Guaranteed 1:1 image mapping for Kedarnath, Badrinath, Nainital, Auli, Chopta, Khurpatal, etc.
  5. *Live Satellite Radar Place Cards*: Geoapify/satellite verified landmark discovery with direct "View on Map", "Plan Trip", and "Add to Itinerary" actions.
  6. *Hidden Locations Showcase*: Dedicated section for offbeat, pristine locations with live GPS coordinates, distance markers, and elevation tags.
  7. *Problem Statement / Anti-Overtourism*: Educational section contrasting overcrowding at mass hubs with authentic sustainable dispersed village tourism.
  8. *Verified Traveler Reviews*: Star ratings, traveler testimonials, verified booking badges, and submission modal.
* **API Endpoints:**
  - `GET /api/destinations`
  - `GET /api/hidden-locations?withWeather=true`
  - `GET /api/live-data/telemetry`
  - `GET /api/reviews?targetId=general&targetType=site`
* **Database Collections:** `destinations`, `hiddenlocations`, `reviews`
* **Auth Requirement:** Public (Login required only for submitting reviews or bookmarking).
* **User Actions:** Search, filter, view cards, click card to view details, add to trip planner, launch AI copilot, scroll to explore.

---

### Page 2: Destination Details
* **Route:** `/destinations/:slug`
* **Purpose:** Comprehensive deep-dive page for a specific destination (e.g. Kedarnath, Auli, Munsiyari).
* **Features:**
  1. *Hero Gallery*: Verified photo showcase with strict entity identity rules.
  2. *Overview & Metadata*: Altitude in meters, best season to visit, ideal trip duration, difficulty level, district, and historical overview.
  3. *Spiritual & Cultural Heritage*: Associated temples, traditions, rituals, and mythology.
  4. *Available Activities*: Nearby verified activities (e.g., skiing, trekking, river rafting, paragliding) linked to the destination.
  5. *Verified Stays*: Authentic local homestays and heritage lodges in the immediate vicinity with verified prices.
  6. *Local Mountain Guides*: Verified local Pahadi guides specialized in this terrain.
  7. *Vehicle & Bike Rentals*: 4x4 mountain vehicles and motorbikes available from nearby hub points.
  8. *Live Meteorological Advisory*: Live temperature, mountain forecast, precipitation probability via Open-Meteo backend proxy.
  9. *Interactive Leaflet Map*: Centered on the destination coordinates with nearby attractions marked.
  10. *Actions*: "Plan a Trip Here" (prefills Trip Planner), "Bookmark/Favorite", "Share".
* **API Endpoints:**
  - `GET /api/destinations/:slug`
  - `GET /api/destinations/:id/nearby`
  - `GET /api/live-data/weather?lat=...&lng=...`
  - `GET /api/stays?destination=...`
  - `GET /api/guides?destination=...`
  - `GET /api/rentals?location=...`
* **Database Collections:** `destinations`, `stays`, `guides`, `rentals`, `activities`
* **Auth Requirement:** Public.

---

### Page 3: Trip Planner (Interactive AI + Structured Form)
* **Route:** `/trip-planner` and `/planner`
* **Purpose:** Core planning engine combining natural language AI prompts with structured multi-field parameters.
* **Features:**
  1. *Dual Planning Mode*:
     - **Mode A (Natural Language AI Input)**: User enters plain English or Hinglish prompt (e.g. *"Kedarnath 5 din 2 log Rs 15000 budget"*). Quick suggestion pills provided.
     - **Mode B (Structured Form)**: Individual fields for Starting Hub/Origin, Destination, Start Date, Duration (days), Number of Travelers, Total Budget (INR), Vehicle/Transport Type (Car, Bike, Bus, Taxi), Travel Vibe / Interests (Spiritual, Trekking, Adventure, Peaceful, Heritage, Luxury), and Travel Pace (Relaxed, Balanced, Fast).
  2. *Natural Language Entity Extractor*: Instant client-side & server-side regex and LLM entity extraction parsing destination, duration, budget, travelers, and transport.
  3. *Two-Way State Synchronization*: Inputs synchronize with `useMapStore.plannerForm`.
  4. *Deterministic Route & Plan Generation*: Invokes `generatePersonalizedTripPlan()` and backend route services; never invents fake geography.
  5. *Dynamic Map & OSRM Routing*: Fetches real driving distance (km) and driving geometry via OSRM engine.
  6. *Submit Transition*: Transitions user smoothly to `/my-trip/:tripId` or `/my-trip` with active session.
* **API Endpoints:**
  - `GET /api/destinations`
  - `GET /api/stays`
  - `GET /api/activities`
  - `POST /api/ai/planner/generate`
  - `POST /api/trips`
* **Database Collections:** `destinations`, `trips`, `routes`
* **Auth Requirement:** Public to plan; Login required to permanently save trip to profile.

---

### Page 4: My Trip Workspace
* **Route:** `/my-trip` and `/my-trip/:tripId`
* **Purpose:** Comprehensive day-by-day trip itinerary, interactive route visualization, budget breakdown, and booking integration.
* **Features:**
  1. *Trip Header*: Destination, total duration, traveler count, date range, transport mode, and "Save Trip" button with status badge (`SAVING`, `SAVED`, `ERROR`).
  2. *Interactive Route Map (`TripWorkspaceMap`)*: Polyline connecting starting point through daily stops, elevation profile, and clickable waypoint markers.
  3. *Day-by-Day Cards (`DayCard`)*:
     - Morning, Afternoon, Evening breakdown.
     - Slotted activities with estimated duration and entry fees.
     - Recommended homestays with verified pricing.
     - Local transport segments with travel duration and road alerts.
  4. *Budget Breakdown (`BudgetBreakdownCard`)*:
     - Transport, Stays, Food, Activities, Guide, and Emergency Buffer.
     - Known vs Estimated vs Buffer breakdown.
     - Integrated with `calculateBudget` engine.
  5. *Live Mountain Safety & Advisories (`WorkspaceAdvisories`)*:
     - Real-time weather for the travel dates.
     - Landslide/road clearance status on the mountain corridor.
     - High-altitude sickness (AMS) acclimatization guidelines for elevations above 2,500m.
  6. *Modify Trip Modal (`ModifyTripModal`)*: Edit duration, pace, transport, or reorder stops without losing session.
  7. *Direct Booking Triggers*: "Book Stay", "Rent Ride", "Hire Guide" buttons on individual itinerary items opening `BookingModal`.
* **API Endpoints:**
  - `GET /api/trips/:id`
  - `POST /api/trips`
  - `PUT /api/trips/:id`
  - `POST /api/budget/calculate`
  - `POST /api/recommendations`
* **Database Collections:** `trips`, `stays`, `rentals`, `guides`, `activities`, `users`
* **Auth Requirement:** Session memory allows guest preview; saving to database requires authenticated user.

---

### Page 5: Homestays & Stays Marketplace
* **Route:** `/stays`
* **Purpose:** Verified Himalayan homestays, eco-lodges, GMVN cottages, and mountain retreats.
* **Features:**
  1. *Filter Bar*: Filter by District, Price Range (Budget < ₹1,500, Mid ₹1,500–₹3,500, Luxury > ₹3,500), Amenities (Bonfire, Home-cooked Pahadi Food, WiFi, Mountain View, Pet Friendly), and Type (Homestay, Cottage, Campsite).
  2. *Stay Cards*: Image gallery, verified host badge, nightly tariff, location, traveler rating, and "Book Now" trigger.
  3. *Truth Badge*: Verifies whether the listing is audited on-chain or registered with Uttarakhand Tourism Development Board (UTDB).
  4. *Favorites Integration*: One-click heart toggle synced to user account.
* **API Endpoints:**
  - `GET /api/stays`
  - `GET /api/stays/:id`
* **Database Collections:** `stays`, `partners`
* **Auth Requirement:** Public browsing; login for booking and favorites.

---

### Page 6: Rentals (Bikes & Mountain 4x4)
* **Route:** `/rentals`
* **Purpose:** Two-wheeler and four-wheeler rental vehicle marketplace across key transit gateways (Rishikesh, Dehradun, Kathgodam, Haridwar).
* **Features:**
  1. *Category Tabs*: Motorcycles (Royal Enfield Himalayan 450, Classic 350, Hunter), Scooters (Activa 6G), Mountain SUVs (Mahindra Thar 4x4, Scorpio, Bolero Camper).
  2. *Vehicle Cards*: Day rate (INR), engine displacement (cc), fuel type, transmission, pickup hub location, helmet/gear inclusion status, and security deposit terms.
  3. *Vehicle Verification Link*: Direct link to `/verify/vehicle/:vehicleNumber` displaying on-chain blockchain verification and registration proof.
  4. *Instant Booking*: Direct "Book Ride" opening checkout flow.
* **API Endpoints:**
  - `GET /api/rentals`
  - `GET /api/rentals/:id`
  - `GET /api/verify/vehicle/:vehicleNumber`
* **Database Collections:** `rentals`, `vehicles`, `partners`
* **Auth Requirement:** Public browsing; booking requires auth.

---

### Page 7: Certified Mountain Guides
* **Route:** `/guides` and `/guides/:slug`
* **Purpose:** Verified local Pahadi guides, high-altitude trek leaders, and cultural storytellers.
* **Features:**
  1. *Guide Profiles*: Full biography, languages spoken (Hindi, Garhwali, Kumaoni, English), experience in years, certifications (NIM Uttarkashi, IMF, Red Cross First Aid), and daily fee.
  2. *Verification Status*: UTDB Verified badge with on-chain cryptographic certificate ID.
  3. *Specializations*: High-altitude snow treks, bird watching, spiritual history, mountain rescue.
  4. *Reviews & Rating*: Historical client reviews and completed expedition count.
  5. *Hire Guide Action*: Direct hire and scheduling integration.
* **API Endpoints:**
  - `GET /api/guides`
  - `GET /api/guides/:slug`
* **Database Collections:** `guides`, `users`, `reviews`
* **Auth Requirement:** Public browsing; hire requires auth.

---

### Page 8: Mountain Activities
* **Route:** `/activities`
* **Purpose:** Adventure and cultural activities directory across Uttarakhand.
* **Features:**
  1. *Categories*: Trekking, White Water Rafting, Paragliding, Bungee Jumping, Skiing, Camping, Rock Climbing, Village Cultural Immersion.
  2. *Activity Cards*: Duration (hours/days), difficulty level (Easy, Moderate, Strenuous, Technical), minimum age requirement, safety gear inclusions, and price per participant.
  3. *Trip Planner Integration*: "Add to Trip" button directly injects activity into current active itinerary draft.
* **API Endpoints:**
  - `GET /api/activities`
* **Database Collections:** `activities`
* **Auth Requirement:** Public.

---

### Page 9: Spiritual Shrines & Temples
* **Route:** `/spiritual`
* **Purpose:** Sacred Himalayan Dham, Panch Kedar, Panch Badri, and ancient pilgrimage circuit directory.
* **Features:**
  1. *Shrine Directory*: Kedarnath, Badrinath, Gangotri, Yamunotri, Tungnath, Rudranath, Madhyamaheshwar, Kalpeshwar, Jageshwar Dham, Baijnath, etc.
  2. *Spiritual Insights*: Temple history, opening/closing dates (Kapat opening dates), Aarti timings, temple altitude, and mandatory biometric registration guidelines.
  3. *Etiquette & Rituals*: Dress codes, photography rules, offering traditions, and sacred prasad guidelines.
* **API Endpoints:**
  - `GET /api/spiritual`
* **Database Collections:** `spiritualplaces`
* **Auth Requirement:** Public.

---

### Page 10: Culture, Cuisine & Traditions
* **Route:** `/culture`
* **Purpose:** Garhwali and Kumaoni heritage, folk arts, festivals, indigenous architecture, and traditional culinary guide.
* **Features:**
  1. *Heritage Traditions*: Aipan art, Pahadi Kathkuni architecture, Pandav Nritya, Harela, Phool Dei, and Nanda Devi Raj Jat yatra.
  2. *Pahadi Cuisine*: Bhatt ki Churkani, Kafuli, Chainsoo, Mandua ki Roti, Bal Mithai, Singodi, Jhangore ki Kheer with nutritional benefits and authentic village tasting spots.
  3. *Artisan Craft*: Ringal basketry, copperware of Almora, sheep wool shawls.
* **API Endpoints:**
  - `GET /api/culture`
* **Database Collections:** `cultureplaces`
* **Auth Requirement:** Public.

---

### Page 11: Interactive GIS Mountain Map
* **Route:** `/map`
* **Purpose:** Full-screen interactive GIS terrain and landmark exploration map of Uttarakhand.
* **Features:**
  1. *Interactive Layers*: Destinations, Homestays, Vehicle Hubs, Verified Guides, Medical Centers, and Mountain Corridors.
  2. *Geoapify / Leaflet Engine*: Custom high-altitude topographical tiles with smooth pan/zoom.
  3. *Search & Filter*: Search by name or filter markers by entity type.
  4. *Destination Fly-To*: Clicking a result smoothly flies the map camera to the target coordinates and opens an info popover card with image, rating, altitude, and "Plan Trip" button.
  5. *Live Location GPS*: Explicit user permission prompt to center map on user's current coordinates.
* **API Endpoints:**
  - `GET /api/destinations`
  - `GET /api/places/radar`
* **Database Collections:** `destinations`
* **Auth Requirement:** Public.

---

### Page 12: Devbhoomi AI Travel Copilot & Voice Studio
* **Route:** Floating Drawer (`AICopilotDrawer.jsx`) on all main routes + `/copilot` standalone workspace.
* **Purpose:** Conversational multi-turn AI Himalayan travel assistant with real-time audio voice interaction.
* **Features:**
  1. *Dual Mode*:
     - **Text Chat Timeline**: Chat history, Markdown rendering, copy button, suggestions pills.
     - **Interactive Voice Companion**: Full immersion view with glowing animated audio orb, real-time volume reactivity, Hindi & English speech synthesis (`speakText`), and speech recognition (`SpeechRecognition`).
  2. *Grounding & Truthfulness*: Grounded exclusively in verified Uttarakhand database and knowledge base; zero hallucinations.
  3. *Agentic Capabilities*:
     - Can prefill Trip Planner forms via context emission.
     - Can trigger application navigation (`du_navigate` events).
     - Can inspect route weather, road advisories, and elevation safety rules.
  4. *Multi-dialect Support*: Understands English, Hindi, Garhwali, and Kumaoni phrases.
  5. *Persistence*: Maintains conversation state and user context across drawer toggles.
* **API Endpoints:**
  - `POST /api/chat`
  - `POST /api/voice/ask`
  - `POST /api/voice/audio_query`
* **Database Collections:** `chatsessions`, `knowledgebase`
* **Auth Requirement:** Public.

---

### Page 13: Checkout & Reservation Flow
* **Route:** `/checkout` and `/checkout/:type/:id`
* **Purpose:** End-to-end verified booking with server-side price validation and escrow smart-contract protection.
* **Features:**
  1. *Booking Details Review*: Item title, dates, guest/traveler count, pickup location.
  2. *Server Price Authority*: Client price is never trusted; server recalculates exact rate, taxes, and deposit breakdown.
  3. *Guest Contact Details*: Name, verified mobile phone, email, emergency contact.
  4. *Escrow Security*: Explains the Mountain Trust Protocol (funds held safely in escrow until check-in confirmation OTP is validated by host/traveler).
  5. *Reservation State Machine*: Creates booking with `PENDING` status, generates reference code (`DU-XXXXXXXX`), and links to user profile.
* **API Endpoints:**
  - `POST /api/bookings`
  - `GET /api/bookings/:id`
  - `POST /api/payment/create-order`
  - `POST /api/payment/verify`
* **Database Collections:** `bookings`, `payments`, `users`
* **Auth Requirement:** Authenticated user.

---

### Page 14: User Profile & Personal Hub
* **Route:** `/profile`
* **Purpose:** Centralized traveler hub managing personal profile, saved trips, booking history, and favorites.
* **Features:**
  1. *User Info*: Display name, email, phone, role badge (Traveler, Verified Partner, Admin).
  2. *My Bookings Tab*: Complete list of past and upcoming bookings with status chips (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`), check-in OTP display, and booking reference.
  3. *Saved Trips Tab*: List of custom multi-day itineraries saved by user with creation date, destination, and "Open Workspace" button.
  4. *Saved Favorites Tab*: Grid of bookmarked homestays, destinations, and vehicles.
  5. *Pahadi Impact Wallet*: Eco-points and community tourism contribution summary.
  6. *Session Management*: Logout button clearing tokens and state.
* **API Endpoints:**
  - `GET /api/auth/me`
  - `GET /api/bookings/my`
  - `GET /api/trips/my`
  - `GET /api/favorites`
  - `POST /api/auth/logout`
* **Database Collections:** `users`, `bookings`, `trips`, `favorites`
* **Auth Requirement:** Protected route (redirects to `/login`).

---

### Page 15: Authentication & Onboarding
* **Route:** `/login`
* **Purpose:** Single-page authentication supporting Sign In and Registration.
* **Features:**
  1. *Tabs*: Login vs Register.
  2. *Fields*: Email, Password, Name (registration), Phone (registration), Role selection (Traveler, Partner/Host, Guide).
  3. *Token Storage*: Secure storage in `localStorage` + session hydration in `AuthContext`.
  4. *Redirect Support*: Redirects user back to previous page or intended booking checkout upon successful auth.
* **API Endpoints:**
  - `POST /api/auth/login`
  - `POST /api/auth/register`
* **Database Collections:** `users`
* **Auth Requirement:** Public.

---

### Page 16: Blockchain Web3 Verification & QR Proof
* **Route:** `/verify/listing/:id` and `/verify/vehicle/:vehicleNumber`
* **Purpose:** Publicly accessible on-chain cryptographic proof verifying authentic host licenses, vehicle registration, and safety permits.
* **Features:**
  1. *On-Chain Status*: Displays Smart Contract Address (Polygon/Sepolia), Transaction Hash, Block Timestamp, and Issuer Authority (UTDB / Mountain Trust Protocol).
  2. *Interactive QR Code*: Generates cryptographic scannable QR payload containing verification URL and hash.
  3. *Vehicle / Property Inspection Record*: Vehicle fitness expiry, pollution certificate, insurance validity, permit type, and driver verification status.
  4. *Public Tamper-Proof Guarantee*: Anyone with a smartphone can scan the physical vehicle QR sticker or stay badge and verify against the ledger.
* **API Endpoints:**
  - `GET /api/verify/listing/:id`
  - `GET /api/verify/vehicle/:vehicleNumber`
* **Database Collections:** `verifications`, `vehicles`, `partners`
* **Auth Requirement:** Public.

---

### Page 17: Emergency SOS & Mountain Corridor Safety
* **Route:** Triggerable via `SOSActiveBanner.jsx`, `SOSFloatingButton.jsx`, and `/rescue-ops` / `/trekker`
* **Purpose:** Real-time emergency distress protocol for high-altitude trekkers and travelers.
* **Features:**
  1. *Instant SOS Trigger*: 1-tap emergency dispatch button sending GPS coordinates and distress type (Medical, Landslide Trap, Lost, AMS Sickness, Vehicle Breakdown).
  2. *Offline SDRF Mesh Protocol*: Broadcasts distress packet over local mesh network / SMS backup if cellular data is unavailable.
  3. *Active Incident Tracker*: Displays Incident Reference ID, dispatch status, assigned SDRF/NDRF search-and-rescue team, and estimated response time.
  4. *Emergency Contact Numbers*: 112 (National Disaster), 1070 (State Emergency), SDRF Uttarakhand, Medical Control Room.
* **API Endpoints:**
  - `POST /api/sos/trigger`
  - `GET /api/sos/status/:id`
* **Database Collections:** `sosincidents`
* **Auth Requirement:** Public (Zero login barriers during emergencies).

---

### Page 18: Innovation Showcase & System Health
* **Route:** `/innovations` and `/audit`
* **Purpose:** Technical showcase of the hackathon project's unique innovations (AI Copilot, Blockchain Web3 Trust, Dual Deterministic Routing, Offline Mesh Protocol).
* **Features:** Interactive feature cards, architecture diagrams, live system health status checks, and Redis cache telemetry.

---

## 3. Summary of Website Capabilities
* **Total Primary Pages/Workspaces:** 18
* **Total Backend API Routes Interfaced:** 27 modules
* **Shared State Stores:** `mapStore.js`, `chatStore.js`, `AuthContext.jsx`, `FavoritesContext.jsx`
* **Special Hardware/Browser APIs:** Web Speech API, Geolocation API, Leaflet Maps, Web Audio Context.
