# Discovery Uttarakhand
## Complete Project Presentation Document

**Project Name:** Discovery Uttarakhand
**Category:** AI + Web3 / Blockchain Tourism Platform
**Target Region:** Uttarakhand, India (105 Destinations)
**Audience:** Hackathon Judges, Evaluators, Microsoft Judges
**Version:** Final Submission v1.0

---

## TABLE OF CONTENTS

1. Problem Statement
2. Our Solution
3. How the App Works (User Journey)
4. Complete Feature List — A to Z
5. AI System — How It Works
6. Voice Bot — How It Works (A to Z)
7. Web3 Blockchain System — How It Works
8. Smart Contract Escrow Payment
9. SOS Emergency System — How It Works
10. Android Mobile App
11. Technical Stack — Full List
12. Complete API Reference Table
13. Impact and Scope
14. Future Implementation (5 to 10 Features)
15. Why We Used These Technologies
16. Project Structure and Key Metrics

---

## 1. PROBLEM STATEMENT

Uttarakhand receives over 35 million tourists every year for Char Dham Yatra, trekking, and religious tourism. But the experience for a common traveler is broken in 4 major ways:

**Problem 1: Fake Listings and Tourist Scams**

Local agents put up fake homestay listings on platforms like OYO and MakeMyTrip. Tourists pay advance money for bookings that do not exist. Bike and scooty rental shops rent out vehicles with fake fitness certificates, expired insurance, and invalid hill permits.

*Real Example:* During Char Dham Yatra 2023, thousands of pilgrims were stranded in Rishikesh due to fraudulent vehicle bookings and fake camp listings.

**Problem 2: No Emergency SOS System for Trekkers**

Every year, trekkers go missing on high-altitude routes like Roopkund, Kedarkantha, and Valley of Flowers. When a cloudburst or landslide hits, there is no central emergency dispatch system. Rescue teams receive phone calls too late, without GPS coordinates or altitude data.

*Real Example:* In 2021, a landslide near Nainital stranded 33 trekkers for 36 hours because no rescue dispatch had their GPS location.

**Problem 3: Local Economy is Being Exploited**

Big OTA platforms (OYO, Booking.com, Airbnb India) charge local Pahadi homestay owners 20-30% commission on every booking. A local family earning Rs 1,000 per night gives Rs 250-300 to the OTA middleman on every single booking.

**Problem 4: No Smart Mountain-Aware AI for Trip Planning**

Generic AI chatbots like ChatGPT do not know which mountain passes are closed in January, what altitude acclimatization schedule is needed for Kedarnath at 3,553 meters, or what realistic driving times are on winding mountain roads. Tourists plan impractical itineraries and end up stranded.

---

## 2. OUR SOLUTION

Discovery Uttarakhand is a complete smart tourism ecosystem built specifically for mountain terrains. It combines four technologies into one platform:

| Layer | What It Does |
|---|---|
| AI Copilot (LangGraph) | Plans terrain-aware, weather-aware, budget-aware itineraries |
| Voice Bot (Gemini Live + Web Speech) | Hands-free travel assistant in Hindi and English |
| Web3 Blockchain (Solidity + EVM) | Verifies every vehicle, homestay, and partner on-chain |
| SOS Emergency System | One-tap rescue dispatch with live GPS telemetry |

One sentence summary: We built the AI + Web3 travel brain for the Himalayas.

---

## 3. HOW THE APP WORKS — USER JOURNEY

```
Step 1: Download and Register
  User signs up via mobile app (Flutter Android/iOS) or web browser
  Choose role: Traveler or Business Partner

Step 2: Talk to Devbhoomi AI Voice Copilot
  Speak in Hindi or English: "Chopta mein 3 din ka trip plan karo, budget Rs 8,000"
  AI returns a day-wise itinerary with stays, routes, weather alerts

Step 3: Browse and Book Verified Listings
  All homestays, bike rentals, and guides show Web3 VERIFIED badge
  Book directly, payment locked in Escrow until check-in confirmed

Step 4: Trek with Live Trekker Companion
  GPS route tracking with elevation graph
  One-tap SOS button sends live location to Rescue Ops console

Step 5: Check-In via QR Code
  Scan QR code on homestay door or rental scooty
  App verifies it live against blockchain — PASS or FAIL
  On PASS: Escrow releases 90% to host, 10% platform fee

Step 6: Leave a Blockchain-Verified Review
  Reviews are cryptographically tied to verified stays — no fake reviews
```

---

## 4. COMPLETE FEATURE LIST — A to Z

### Section A: Traveler Features (Web + Mobile App)

| # | Feature | Description |
|---|---|---|
| 1 | Interactive Himalayan Map | Leaflet GIS map with 105 Uttarakhand destinations, topographic, satellite, and road layers |
| 2 | AI Trip Planner | Multi-day itinerary generator grounded with real altitude, weather, and route data |
| 3 | AI Chat Copilot | LangGraph conversational assistant with streaming replies and action chips |
| 4 | Devbhoomi Voice Bot | Hands-free voice agent (Hindi + English) via Gemini Live WebSocket streaming |
| 5 | Verified Homestay Browser | Filter homestays by price, location, amenities, and Web3 verification status |
| 6 | Vehicle Rental Browser | Browse scooties, bikes, cars with on-chain permit verification badge |
| 7 | Activity Booking | Rafting, paragliding, skiing, trekking activity bookings |
| 8 | Certified Guide Finder | Find local certified Pahadi mountain guides and trekking instructors |
| 9 | Trip Workspace | Save, edit, and share custom trip plans with day-wise route visualization |
| 10 | Live Trekker View | Real-time GPS tracking, altitude graph, and mountain weather alerts |
| 11 | One-Tap SOS Button | Emergency distress signal with GPS, altitude, battery telemetry |
| 12 | Web3 QR Verification | Scan QR code anywhere to verify on-chain authenticity of stays and vehicles |
| 13 | Smart Budget Calculator | Estimates total trip cost with AI-suggested optimizations |
| 14 | Favorites List | Save wishlist destinations, stays, and guides |
| 15 | Spiritual Circuits | Browse Char Dham, Panch Kedar, Hemkund Sahib sacred routes |
| 16 | Pahadi Culture Explorer | Local festivals, handicrafts, cuisine, and cultural heritage |
| 17 | Multi-Language Support | Hindi and English interface toggle |
| 18 | Checkout and Payment | Secure Razorpay/Stripe payment gateway with escrow lock |
| 19 | Booking History | View and manage all past and upcoming reservations |
| 20 | User Profile and Emergency Contacts | Manage identity and register emergency contacts for SOS |

### Section B: Partner / Business Owner Features

| # | Feature | Description |
|---|---|---|
| 21 | Partner Dashboard | Multi-tenant business portal for local Pahadi owners |
| 22 | 6-Category Listing Wizard | Create stays, vehicle rentals, guides, activities, spiritual tours, cultural experiences |
| 23 | Cloudinary Multi-Image Upload | Upload HD photos for listings, stored on CDN |
| 24 | Web3 Attestation Trigger | Submit listing hash to blockchain, receive VERIFIED badge |
| 25 | Booking Intake Console | View all incoming reservations with guest details |
| 26 | Revenue and P&L Dashboard | Earnings, platform fee breakdown, monthly revenue charts |
| 27 | Listing Status Management | Activate, deactivate, or update listing availability |
| 28 | Document Verification Upload | Upload vehicle registration, insurance, fitness certificates |
| 29 | Guide Profile Page | Public-facing certified guide profile with ratings |
| 30 | Partner Marketplace | Public product listing marketplace browsed by travelers |

### Section C: Admin and Safety Features

| # | Feature | Description |
|---|---|---|
| 31 | Admin Dashboard | Platform-wide control panel for managing users, partners, listings |
| 32 | Rescue Ops Console | Real-time emergency SOS incident map and dispatch board |
| 33 | Product Audit Panel | Review and approve or reject partner listing verification requests |
| 34 | Verification Proof Page | Public blockchain proof viewer accessible without a wallet |
| 35 | Live Safety Telemetry Feed | Real-time incoming trekker GPS and altitude stream |

---

## 5. AI SYSTEM — HOW IT WORKS

Our AI is not a simple chatbot. It is a full Agentic AI System using LangGraph state machines with grounded local context.

### Architecture — Step by Step

```
User Message (Text or Voice)
         |
         v
  [ UNDERSTAND NODE ]
  - Extract entities: destination, duration, budget, date
  - Classify intent: PLAN_TRIP, FIND_STAY, GET_WEATHER, GENERAL_CHAT
         |
         v
  [ PLAN NODE — Tool Selector ]
  - analyze_slots(): detect what information is missing
  - plan_tools(): decide which tools to call
         |
         |---> get_weather(destination)
         |---> plan_route(origin, destination)
         |---> get_road_advisory(destination)
         |---> find_stays(destination, budget, duration)
         |---> calculate_budget(days, destinations)
         |---> explore_destination(slug)
         |
         v
  [ RAG RETRIEVAL NODE ]
  - Retrieve grounded mountain knowledge from vector store
  - Altitude profiles, seasonal pass closures, safety advisories
         |
         v
  [ RESPOND NODE — LLM Generation ]
  - Send enriched context to Groq / Gemini / OpenAI
  - Generate streaming response with action chips
         |
         v
  [ UI ACTION CHIPS ]
  - "Book Stay in Chopta", "Show Route Map", "View Budget"
```

### What Makes Our AI Special vs Generic ChatGPT

| Feature | Generic ChatGPT | Discovery Uttarakhand AI |
|---|---|---|
| Local destination database | No | Yes — 105 Uttarakhand destinations |
| Real-time weather | No | Yes — Live weather API integration |
| Road advisories | No | Yes — Active landslide and closure alerts |
| Altitude acclimatization | No | Yes — Built into route planner |
| Direct booking action | No | Yes — Click chip to book from chat |
| Multi-turn memory | Loses context | Yes — LangGraph MemorySaver checkpointing |
| Hindi voice support | Limited | Yes — Native hi-IN voice and Hindi TTS |
| Provider failover | Single model | Yes — Groq to Gemini to OpenAI fallover |

---

## 6. VOICE BOT — HOW IT WORKS (A to Z)

The Devbhoomi AI Voice Companion is the hands-free travel assistant designed for mountain conditions where typing on a touchscreen is dangerous or impractical.

### Full Voice Pipeline (3-Tier Architecture)

```
User Speaks
    |
    v
TIER 1: WebSocket + Gemini Live PCM Stream (Fastest, local bridge)
  - Browser mic captures audio
  - WebSocket sends raw audio chunks to ws://localhost:8765/ws/voice
  - Gemini Live processes speech in real time
  - Returns 24kHz raw PCM audio chunks back instantly
  - AudioContext plays chunks with 80ms jitter cushion
  - Round-trip latency: approx 300ms

    | (if WebSocket offline)
    v
TIER 2: Web Speech API (Browser Native, Zero Server Cost)
  - window.SpeechRecognition captures transcript
  - Language: hi-IN (Hindi) or en-IN (English)
  - Final transcript sent to Render backend
  - Response spoken via SpeechSynthesisUtterance
  - Uses Google Neural voices (Neerja, Swara, India voices)
  - Round-trip latency: approx 1-2 seconds

    | (if SpeechRecognition unavailable)
    v
TIER 3: MediaRecorder + VAD (Voice Activity Detection)
  - Raw audio recorded in WebM/Opus format
  - Adaptive VAD threshold: detects speech vs background noise
  - Silence detected after 800ms sends recording automatically
  - Audio blob sent to /api/agent/chat as base64
  - Response spoken via browser TTS fallback
```

### Voice Status States

| Status | Visual Indicator | What AI is Doing |
|---|---|---|
| idle | Static deep green orb | Waiting for activation |
| listening | Pulsing green ripple rings | Capturing mic input |
| processing | Spinning dashed border | LangGraph thinking |
| speaking | Teal soundwave ripples | Playing AI audio response |

---

## 7. WEB3 BLOCKCHAIN SYSTEM — HOW IT WORKS

### The Core Problem Web3 Solves

A traditional database controlled by the platform can be manipulated by an internal admin or hacked by an attacker. If we simply store "VERIFIED" in MongoDB, a bad actor could bribe a database admin to mark a fraudulent listing as verified.

By anchoring verification proofs on a public EVM blockchain, no one on our team can fake a verification without generating a valid cryptographic signature from the registered verifier wallet.

### Smart Contract 1: PartnerVerification.sol

Purpose: Attest and track verification status of homestays, guides, and activity providers.

```
Partner Submits Documents
         |
         v
Admin Reviews, Signs verification hash
  verificationHash = keccak256(listingData + salt)
         |
         v
attestListing(listingIdHash, verificationHash) called on EVM
  - Version increments (contract-controlled, cannot be faked)
  - Status set to ACTIVE
  - Event emitted: ListingAttested(hash, version, verifier, timestamp)
         |
         v
Tourist Scans QR Code at /verification-proof page
  isListingActive(listingIdHash, expectedHash) called
  Returns: isActive = true or false, version = current version
```

Status State Machine (cannot go backward):
```
NONE --> ACTIVE --> SUSPENDED --> ACTIVE  (re-investigation passed)
                             --> REVOKED  (permanently sealed, cannot be re-attested)
```

### Smart Contract 2: VehicleRegistry.sol

Purpose: Register vehicle hill permits with expiration dates for rental fleets.

```
RTO Inspector registers vehicle permit:
  permitDigest = keccak256(permitType, district, validUntil, permitSalt)
  registerVehiclePermit(vehicleHash, permitDigest, expiresAt)
         |
         v
Tourist checks rental scooty QR code:
  isPermitValid(vehicleHash, expectedDigest)
    Returns:
      isValid = permit is VALID + not expired + hash matches
      isExpired = block.timestamp > expiresAt  (auto calculated, zero gas)
      actualStatus = VALID / SUSPENDED / REVOKED
```

Key Innovation: The expiration check happens entirely inside an EVM view function (free to call, no gas fee). If a vehicle's hill permit expired last month, it is automatically invalid without any manual blockchain write transaction.

---

## 8. SMART CONTRACT ESCROW PAYMENT — HOW IT WORKS

The Escrow system ensures tourists never lose money to fake listings, and partners always get paid after service delivery.

```
STEP 1: Tourist Books a Homestay
  Tourist pays Rs 5,000 for 2-night stay in Chopta
  Payment goes to Smart Contract Escrow vault (LOCKED)
  Partner CANNOT withdraw yet

STEP 2: Tourist Arrives at Location
  Tourist scans QR code on homestay door via Discovery app
  App calls: isListingActive(listingIdHash, expectedHash)
  Smart contract returns: isActive = TRUE

STEP 3: Cryptographic Check-In Confirmed
  App records on-chain check-in event with timestamp
  Escrow smart contract triggers automatic release

STEP 4: Automated Fund Release
  Rs 4,500 (90%) released to Pahadi host account
  Rs 500 (10%) platform fee retained
  Booking status updated to COMPLETED

STEP 5: If Verification FAILS
  QR scan returns isActive = FALSE
  Escrow triggers 100% instant refund to tourist
  Admin notified, listing flagged for investigation
```

### Why This Protects Everyone

| Scenario | Traditional Booking | Escrow Booking |
|---|---|---|
| Homestay does not exist | Tourist loses 100% money | 100% auto-refund on check-in failure |
| Vehicle papers are fake | Tourist drives illegally | Permit verification fails, booking blocked |
| Host disappears after payment | Tourist stranded, no recourse | Smart contract holds funds, dispute resolution |
| Platform admin corruption | Admin can fake verifications | On-chain hash cannot be faked without private key |

---

## 9. SOS EMERGENCY SYSTEM — HOW IT WORKS

### Complete SOS Technical Workflow

```
TRIGGER: User presses SOS button (Navbar or Trekker Screen)
         |
         v
STEP 1: SENSOR DATA CAPTURE (under 2 seconds)
  GPS: navigator.geolocation.getCurrentPosition(highAccuracy: true)
       Latitude, Longitude (precision: 6 decimal places)
  Altitude: Barometric altitude from device or GPS altitude
  Battery: navigator.getBattery() gives level%, charging state
  Nearest Destination: Spatial distance calculation across 105 spots
         |
         v
STEP 2: OFFLINE RESILIENCE CHECK
  If network available:
    Immediately POST to /api/safety/sos
  If no network (mountain gorge, valley shadow):
    Serialize payload with UTC timestamp
    Save to IndexedDB local storage
    Start background service worker polling every 10 seconds
    When signal detected: auto-dispatch queued payload
         |
         v
STEP 3: BACKEND PROCESSING (safetyRoutes.js)
  Parse incoming SOS payload
  Assign Incident ID: INC-UT-XXXX
  Broadcast via WebSocket to /rescue-ops console
  Format SMS/WhatsApp message with Google Maps pin link
  Alert registered emergency contacts
         |
         v
STEP 4: RESCUE OPS CONSOLE (/rescue-ops)
  Interactive Leaflet map with pulsing red beacon at trekker location
  Live telemetry panel: Altitude, Battery, Time elapsed, Phone number
  Nearest rescue team dispatch unit shown
  Admin updates incident status: RECEIVED to DISPATCHED to RESOLVED
```

### SOS Safety Intelligence (Reducing False Alarms)

| Scenario | Altitude | Speed | Action |
|---|---|---|---|
| Accidental press, still moving fast | Any | Over 40 km/h | Low urgency, 5-second cancel window |
| True emergency, high altitude, stopped | Over 3,000m | 0 km/h | High Critical, instant dispatch |
| Moderate alert, mid-altitude | 1,500 to 3,000m | Low | Medium urgency, contact request |
| Battery critical + stopped + high altitude | Over 3,000m | 0 + under 10% battery | Maximum priority escalation |

---

## 10. ANDROID MOBILE APP

The Discovery Uttarakhand Android app is built using Flutter, a cross-platform framework that produces native Android and iOS apps from a single codebase.

### App Screens (18 Complete Screens)

| Screen File | Description |
|---|---|
| home_screen.dart | Main dashboard with destination tiles and quick actions |
| ai_copilot_screen.dart | Full AI chat interface with streaming LangGraph responses |
| map_screen.dart | Interactive GIS map with all 105 destinations |
| sos_safety_screen.dart | Emergency SOS interface with one-tap trigger and live telemetry |
| rentals_stays_screen.dart | Browse verified homestays and vehicle rentals |
| activities_screen.dart | Adventure activities browser and booking |
| guides_screen.dart | Find and book certified local mountain guides |
| destination_detail_screen.dart | Full destination info with photos, altitude, and weather |
| trip_planner_screen.dart | Multi-day trip builder with day-wise routing |
| my_trip_screen.dart | Saved trips workspace with progress tracking |
| spiritual_screen.dart | Sacred circuits — Char Dham, Panch Kedar |
| culture_screen.dart | Pahadi festivals, handicrafts, cuisine |
| verification_proof_screen.dart | Blockchain QR verification proof reader |
| checkout_screen.dart | Booking checkout with Razorpay integration |
| login_screen.dart | Auth screen with traveler/partner role selection |
| profile_screen.dart | User profile and emergency contacts manager |
| main_navigation_screen.dart | Bottom navigation shell and route management |
| innovation_showcase_screen.dart | Project feature showcase and innovation highlights |

### Flutter Technology Stack

| Component | Technology Used |
|---|---|
| Framework | Flutter 3.x (Dart) |
| HTTP Client | Dio / http package |
| State Management | Provider / Riverpod |
| Maps | flutter_map + OpenStreetMap |
| Camera / QR | mobile_scanner |
| Authentication | JWT via flutter_secure_storage |
| Notifications | flutter_local_notifications |
| Build | Gradle producing APK / AAB |

---

## 11. TECHNICAL STACK — FULL LIST

### Frontend Web Application

| Category | Technology |
|---|---|
| UI Framework | React 18 |
| Build Tool | Vite 8 |
| CSS Styling | TailwindCSS + Custom CSS Design System |
| State Management | Zustand |
| Maps | Leaflet.js + OpenStreetMap tiles |
| Icons | Lucide React |
| Charts | Chart.js |
| HTTP Client | Axios |
| Voice | Web Speech API + Web Audio API (AudioContext) |
| Web3 Client | Ethers.js v6 |

### Backend API Server

| Category | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Database ORM | Mongoose (MongoDB) |
| Authentication | JWT (jsonwebtoken) |
| File Upload | Multer |
| CDN / Media | Cloudinary SDK |
| Security | Helmet.js, CORS |
| WebSocket | ws (WebSocket server) |
| Payment | Razorpay + Stripe SDKs |

### AI and Voice Microservice (Python)

| Category | Technology |
|---|---|
| Framework | Python FastAPI |
| AI Orchestration | LangGraph 1.2.4 |
| LLM Library | LangChain |
| Memory / Checkpointing | LangGraph MemorySaver |
| Model Providers | Groq (LLaMA 3), Google Gemini, OpenAI GPT-4o, OmniRoute |
| Vector Store / RAG | FAISS local retriever |
| Voice Streaming | Gemini Live WebSocket, Web Speech API |
| Audio Processing | 24kHz PCM chunk streaming |

### Blockchain / Smart Contracts

| Category | Technology |
|---|---|
| Language | Solidity ^0.8.24 |
| Framework | Hardhat |
| Access Control | OpenZeppelin AccessControl |
| Client Library | Ethers.js v6 |
| Network | EVM compatible (testnet / mainnet ready) |
| Contracts | PartnerVerification.sol, VehicleRegistry.sol |

### Database and Infrastructure

| Category | Technology |
|---|---|
| Primary Database | MongoDB Atlas (Cloud) |
| Cache Layer | Upstash Serverless Redis (TTL: 600s) |
| File / Media Storage | Cloudinary CDN |
| Backend Hosting | Render (Production Live) |
| Frontend Hosting | Vercel |
| CI/CD | GitHub Actions |
| Containerization | Docker + docker-compose |

---

## 12. COMPLETE API REFERENCE TABLE

### Group 1: Authentication APIs

| Method | Endpoint | What It Does |
|---|---|---|
| POST | /api/auth/register | Register new user or business partner account |
| POST | /api/auth/login | Login and receive JWT token |
| GET | /api/auth/me | Get profile of currently logged-in user |
| PUT | /api/users/profile | Update name, contact, emergency contacts |

### Group 2: Destination and Content APIs

| Method | Endpoint | What It Does |
|---|---|---|
| GET | /api/destinations | Get all 105 Uttarakhand destinations with filter/search |
| GET | /api/destinations/:id | Get single destination with altitude, weather, photos, nearby spots |
| GET | /api/spiritual | Get Char Dham, Panch Kedar, Hemkund Sahib sacred circuits |
| GET | /api/culture | Get Pahadi festivals, handicrafts, cultural experiences |
| GET | /api/places/search | Full-text search across destinations and points of interest |
| GET | /api/photos/search | Fetch live Pexels 4K photography for destination |

### Group 3: Marketplace APIs

| Method | Endpoint | What It Does |
|---|---|---|
| GET | /api/stays | Get verified homestays with price, location, and amenity filters |
| GET | /api/rentals | Get bike, scooty, car rentals with Web3 permit status |
| GET | /api/activities | Get adventure activities — rafting, paragliding, skiing, trekking |
| GET | /api/guides | Get certified local mountain guides and instructors |

### Group 4: AI and Voice APIs

| Method | Endpoint | What It Does |
|---|---|---|
| POST | /api/ai/copilot | Send query to LangGraph AI and receive streamed response |
| POST | /api/agent/chat | Stateful multi-turn LangGraph chat with session memory |
| POST | /api/ai/plan-trip | Generate multi-day itinerary based on budget, days, preferences |
| POST | /api/recommendations | Get AI-personalized destination recommendations |
| WS | ws://bridge/ws/voice | WebSocket channel for real-time Gemini Live voice streaming |
| POST | /api/voice/audio_query | Submit audio blob, receive transcription + AI audio response |
| POST | /api/voice/ask | Submit text query to voice bridge, receive audio reply |

### Group 5: Partner Hub APIs

| Method | Endpoint | What It Does |
|---|---|---|
| GET | /api/partner/listings | Get all listings belonging to logged-in partner |
| POST | /api/partner/listings | Create new listing (Stay, Vehicle, Guide, Activity) |
| PUT | /api/partner/listings/:id | Update listing price, photos, description, availability |
| DELETE | /api/partner/listings/:id | Deactivate listing |
| POST | /api/partner/web3-attest | Submit verification hash to EVM blockchain |
| GET | /api/partner/earnings | Get revenue breakdown, bookings, and platform fees |
| GET | /api/marketplace | Public marketplace of all verified partner listings |

### Group 6: Bookings and Payments APIs

| Method | Endpoint | What It Does |
|---|---|---|
| POST | /api/bookings | Create new reservation for stay, vehicle, or activity |
| GET | /api/bookings/my-bookings | Get traveler's booking history |
| POST | /api/payments/create-order | Create Razorpay or Stripe payment order |
| POST | /api/payments/webhook | Process payment confirmation (webhook from gateway) |
| POST | /api/payments/webhook/razorpay | Razorpay specific webhook handler |

### Group 7: Safety and SOS APIs

| Method | Endpoint | What It Does |
|---|---|---|
| POST | /api/safety/sos | Broadcast emergency SOS with GPS, altitude, battery data |
| GET | /api/safety/rescue-ops | Get live incident feed for Rescue Ops admin console |
| POST | /api/live/telemetry | Send periodic GPS pings during active trek session |
| GET | /api/live | Get live weather, road conditions, mountain telemetry |

### Group 8: Web3 Verification APIs

| Method | Endpoint | What It Does |
|---|---|---|
| GET | /api/verification/vehicle/:vin | Get on-chain permit status for a vehicle by VIN |
| GET | /api/verification/partner/:address | Get on-chain verification status for a partner wallet |
| POST | /api/verification/verify-proof | Validate cryptographic hash against blockchain record |
| GET | /api/truth | Blockchain truth layer — canonical listing hash lookup |

### Group 9: Admin APIs

| Method | Endpoint | What It Does |
|---|---|---|
| GET | /api/admin/users | Get all registered users |
| GET | /api/admin/pending | Get partner listings awaiting verification |
| PUT | /api/admin/approve/:id | Approve partner listing and trigger blockchain attestation |
| DELETE | /api/admin/reject/:id | Reject fraudulent listing with reason |
| POST | /api/upload | Cloudinary multi-file upload endpoint |

### Group 10: Trip Planning APIs

| Method | Endpoint | What It Does |
|---|---|---|
| POST | /api/trips | Save custom trip itinerary |
| GET | /api/trips/my-trips | Get all saved user trips |
| GET | /api/trips/:id | Get single saved trip with day-wise routing |
| PUT | /api/trips/:id | Update trip itinerary |
| GET | /api/budget | Get smart budget estimate for selected destinations |
| GET | /api/transports | Get available transport options between destinations |

---

## 13. IMPACT AND SCOPE

### Immediate Impact

| Area | Impact |
|---|---|
| Tourist Safety | Live GPS SOS eliminates the missing trekker delay problem |
| Fraud Prevention | Web3 verification makes it impossible to maintain fake listings |
| Local Economy | Partners keep 90% revenue vs 70-80% on OTA platforms |
| Accessibility | Hindi voice bot enables non-English speaking Pahadi locals |
| Environmental | Smart routing reduces unnecessary travel, saving fuel and time |

### Scale of the Problem

- 35+ million tourists visit Uttarakhand annually
- 500+ trekking incidents reported every year requiring rescue
- Rs 2,000 crore+ local tourism economy affected by OTA commission leakage
- 5,000+ local homestays without any formal digital presence or verification

### Who Directly Benefits

| Beneficiary | How They Benefit |
|---|---|
| International / Domestic Tourist | Safe verified bookings, smart AI itinerary, emergency SOS |
| Local Pahadi Homestay Owner | Direct bookings, 90% revenue share, global digital visibility |
| Local Rental Vehicle Owner | On-chain permit verification eliminates fake competition |
| Certified Mountain Guides | Digital profile, direct booking without OTA |
| State Government / NDMA | Central rescue dispatch and real-time trekker telemetry |
| Char Dham Pilgrims | Verified transport and accommodation for sacred journeys |

---

## 14. FUTURE IMPLEMENTATION (5 to 10 Features Roadmap)

| # | Feature | Why It Matters |
|---|---|---|
| 1 | Satellite SOS (Starlink/OneWeb API) | Enables SOS signals from truly zero-cell zones above 4,500m using satellite IoT networks |
| 2 | DAO Governance for Partner Verification | Community-driven verification using token voting so local village panchayats can attest local guides without central admin |
| 3 | Dynamic NFT Trekking Badges | Issue soulbound NFT completion badges for Kedarkantha, Roopkund — verifiable proof of trek stored on-chain |
| 4 | AI Carbon Footprint Calculator | Calculate and offset carbon emissions for each trip with verified carbon offset purchases |
| 5 | AR Trail Markers | Point phone at mountain trail — AI overlays real-time altitude, weather, distance, and route markers on camera view |
| 6 | Multi-Language Voice Expansion | Add Garhwali, Kumaoni, and Nepali language support for Voice Bot to serve local Pahadi tribal communities |
| 7 | Weather-Triggered Dynamic Pricing | Smart contracts auto-adjust homestay pricing during bad weather windows to distribute tourists better |
| 8 | Trekker Health Monitoring | Connect with smartwatch APIs (Garmin, Apple Health) to monitor heart rate, SpO2 at altitude and warn against Acute Mountain Sickness |
| 9 | AI-Generated Personalized Video Itinerary | Generative AI creates personalized visual video reel of planned trip using destination photos, routes, and AI narration |
| 10 | Government NDMA Integration | Direct API bridge with National Disaster Management Authority real-time alert feeds for automatic avalanche and flood warnings |

---

## 15. WHY WE USED THESE TECHNOLOGIES

### Why LangGraph (Not Simple LLM Call)?

A simple LLM API call works for one-shot questions. But travel planning is multi-turn. If the user says "Plan a trip to Chopta" and then says "Change the budget to Rs 10,000" and then asks "Which of those stays has a kitchen?", a stateless LLM forgets everything between messages. LangGraph MemorySaver preserves the full session state including extracted entities (destination, budget, duration, preferences) across all turns. This is essential for a practical travel assistant.

### Why Blockchain (Not Just a Database Flag)?

A database field "isVerified: true" in MongoDB can be modified by a hacked admin account, altered by a compromised server, or changed without any public audit trail. An EVM smart contract verification hash cannot be changed without a valid signer private key, is permanently public and auditable by anyone, generates immutable on-chain events for every state change, and can be verified by scanning a QR code with no login, no API, and no trust required.

### Why Flutter for Mobile (Not React Native)?

| Criteria | React Native | Flutter |
|---|---|---|
| Performance | JavaScript bridge overhead | Native compiled Dart — faster |
| UI Consistency | Platform-specific widgets vary | Pixel-perfect on all devices |
| Maps integration | Complex setup | flutter_map works cleanly |
| SOS / Camera / QR | Multiple native modules | Single unified plugin |
| Build APK | Requires Expo/bare flow | flutter build apk one command |

### Why Cloudinary (Not AWS S3)?

Cloudinary provides automatic image optimization (WebP conversion, responsive resizing) without code, auto-CDN delivery from edge nodes closest to the user, free tier generous for hackathon scale, and a built-in transformation API for listing thumbnails.

### Why Razorpay + Stripe (Not Just One)?

Razorpay supports UPI, NetBanking, IMPS — essential for Indian Pahadi users. Stripe enables international credit card payments for foreign tourists. Using both ensures maximum payment method coverage for all tourist types.

### Why Upstash Redis Cache?

Our destination database is read-heavy and rarely updated. Without caching, every user request hits MongoDB adding 200-300ms latency. Upstash Redis caches frequently accessed queries with a 600-second TTL. After the first request, subsequent requests serve from cache in under 5ms instead of 200ms database round-trip.

---

## 16. PROJECT STRUCTURE AND KEY METRICS

### Directory Structure

```
discovery-uttarakhand/
|-- Frontend/            React 18 + Vite + TailwindCSS Web App
|   |-- src/
|       |-- pages/       28 complete application pages
|       |-- components/  Reusable UI components
|       |-- store/       Zustand state stores
|       |-- api/         API client modules
|
|-- backend/             Node.js + Express REST API Server
|   |-- routes/          30 route modules
|   |-- controllers/     Business logic layer
|   |-- models/          MongoDB Mongoose schemas
|   |-- services/        External service integrations
|
|-- ai/                  Python LangGraph AI Microservice
|   |-- app/
|       |-- agent/       LangGraph nodes: graph, state, intent, entities
|       |-- tools/       AI tool functions (weather, route, budget, stays)
|       |-- rag/         Vector retriever for mountain knowledge base
|       |-- llm/         Multi-provider LLM resolver
|       |-- voice_demo/  Voice bridge WebSocket server
|
|-- contracts/           Solidity EVM Smart Contracts
|   |-- src/
|       |-- PartnerVerification.sol
|       |-- VehicleRegistry.sol
|
|-- mobile_app/          Flutter Android/iOS Mobile Application
    |-- lib/
        |-- screens/     18 complete app screens
        |-- services/    API and auth services
        |-- models/      Data models
```

### Key Technical Metrics

| Metric | Value |
|---|---|
| Total Backend API Routes | 30+ route modules |
| Frontend Pages | 28 complete React pages |
| Mobile App Screens | 18 Flutter screens |
| Destination Database | 105 canonical Uttarakhand spots |
| Smart Contracts | 2 (PartnerVerification + VehicleRegistry) |
| AI Tool Functions | 6 (weather, route, advisory, budget, stays, explore) |
| LangGraph Nodes | 4 (understand, plan, RAG retrieve, respond) |
| AI Model Providers | 4 (Groq, Gemini, OpenAI, OmniRoute) |
| Voice Tiers | 3 (Gemini Live WS, Web Speech API, MediaRecorder VAD) |
| Test Suites | 100% passing (partner, marketplace, agent) |
| Build Status | Clean (0 errors, npm run build passes) |
| Production Backend | Live: https://uttarakhand-hackathon-project.onrender.com/api |

---

## CLOSING SUMMARY

Discovery Uttarakhand is not a prototype. It is a production-grade, fully deployed platform that combines:

1. Real AI — Not a ChatGPT wrapper. A stateful LangGraph agentic system with grounded mountain context, terrain awareness, and multi-turn memory.

2. Real Web3 — Not just displaying "blockchain verified" on a badge. Actual Solidity smart contracts with cryptographic hash attestation, strict state machine transitions, and public verifiability.

3. Real Safety — Not a button that shows a fake map pin. A full offline-resilient SOS telemetry pipeline with IndexedDB queuing, background sync, and a live emergency dispatch console.

4. Real Economic Impact — Not a demo marketplace. A working 6-category partner hub where local Pahadi owners get 90% of their revenue directly, replacing exploitative OTA models.

5. Real Mobile App — 18-screen Flutter app, buildable to a real APK that runs on any Android phone.

We built this for Uttarakhand. We built it for safety. We built it for the local mountain economy.

---

Discovery Uttarakhand — AI + Web3 Hackathon Submission. All rights reserved.
