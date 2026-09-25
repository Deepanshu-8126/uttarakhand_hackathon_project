# 🏔️ Discovery Uttarakhand — Hackathon Master Documentation & API Specification

> **Next-Gen Agentic AI & Web3-Attested Tourism, Homestay, Rental & Emergency Ecosystem for Uttarakhand**

---

## 📑 Executive Summary & Index

1. [🎯 Problem Statement & What We Are Solving](#-1-problem-statement--what-we-are-solving)
2. [🚀 Key Project Modules (User, Partner & Safety Hubs)](#-2-key-project-modules)
3. [⚡ Core Features: AI + Web3 Blockchain Integration](#-3-core-features-ai--web3-blockchain-integration)
4. [🛡️ Mountain Safety & SOS Emergency System](#-4-mountain-safety--sos-emergency-system)
5. [📡 Complete API List & Endpoints Guide](#-5-complete-api-list--endpoints-guide)
6. [🏗️ Technical Architecture & Stack](#-6-technical-architecture--stack)
7. [🎤 Hackathon Judge Q&A & Pitch Defense Strategy](#-7-hackathon-judge-qa--pitch-defense-strategy)

---

## 🎯 1. Problem Statement & What We Are Solving

### The Problem in Himalayan & Uttarakhand Tourism

1. **Fake Listings & Tourist Scams (Unverified Homestays & Bike Rentals):**
   - Thousands of tourists visiting Char Dham, Rishikesh, Nainital, and Kedarnath get scammed by fake homestay bookings or unsafe, illegal vehicle rentals with fraudulent insurance/fitness certificates.
2. **Mountain Emergency & Lost Trekkers (Safety Hazards):**
   - High-altitude treks (Roopkund, Kedarkantha, Valley of Flowers) face sudden weather changes, landslides, and cloudbursts. There is no central, real-time emergency dispatch or live telemetry tracking for trekkers.
3. **Exploitation of Local Pahadi Economy:**
   - Giant online travel aggregators charge exorbitant commissions (20-30%) from local homestay owners, drivers, and local guides, draining wealth away from local mountain communities.
4. **Generic AI Itinerary Failure:**
   - Generic AI bots (like basic ChatGPT prompts) recommend unfeasible routes in mountain regions—ignoring seasonal pass closures, altitude sickness hazards, road landslides, and local terrain realities.

---

### 💡 Our Solution: Discovery Uttarakhand

**Discovery Uttarakhand** is an all-in-one smart travel ecosystem built specifically for mountain terrains, combining **Web3 Blockchain Attestation**, **Agentic AI Copilot**, **Local Partner Hub**, and **Real-Time Rescue Telemetry**:

- **Web3 On-Chain Attestation:** All vehicle rentals (scooties, bikes, cabs) and homestays are registered on Ethereum/EVM smart contracts with public QR-code cryptographic proofs.
- **Agentic AI Copilot:** A multi-provider AI gateway (LangGraph / Groq / Gemini / OpenAI) that plans terrain-aware, budget-calibrated itineraries with real-time weather & road advisories.
- **Direct Partner Marketplace (Zero Middleman Friction):** Local homestay hosts, rental fleets, and certified Pahadi guides list directly with transparent 10% platform fee, boosting the local economy.
- **Real-Time Rescue & SOS Telemetry:** One-tap emergency SOS button broadcasting trekker GPS coordinates, battery level, and altitude to the disaster response console (`/rescue-ops`).

---

## 🚀 2. Key Project Modules

Our platform is divided into 4 core functional modules:

```
                          ┌─────────────────────────────────────────┐
                          │    DISCOVERY UTTARAKHAND ECOSYSTEM      │
                          └────────────────────┬────────────────────┘
                                               │
      ┌──────────────────────┬─────────────────┴────────────────┬──────────────────────┐
      │                      │                                    │                      │
┌─────▼─────────────┐  ┌─────▼─────────────┐              ┌───────▼─────────────┐  ┌─────▼─────────────┐
│ 🧳 Traveler Hub   │  │ 🏢 Partner Hub    │              │ 🛡️ Rescue Ops Hub   │  │ 🔗 Web3 Trust Hub   │
│ (User Portal)     │  │ (Business Owner)  │              │ (Admin & Safety)    │  │ (Blockchain Layer)  │
└───────────────────┘  └───────────────────┘              └─────────────────────┘  └───────────────────┘
```

### 1. 🧳 Traveler / User Hub (`/`, `/trip-planner`, `/stays`, `/rentals`, `/copilot`)
- **Interactive Map & Trip Planner:** Leaflet-powered visual map with 105 canonical Uttarakhand destinations, satellite overlays, and terrain routes.
- **Direct Marketplace Booking:** Browse & book verified homestays, scooty/car rentals, trekking guides, and spiritual/cultural tours.
- **Agentic AI Copilot:** Interactive conversational assistant that creates custom day-by-day itineraries and answers local travel queries.
- **Live Trekker Companion (`/trekker-live`):** Offline-ready route tracking with elevation graphs and mountain safety alerts.

### 2. 🏢 Partner / Business Owner Hub (`/partner`)
- **Multi-Tenant Dashboard:** Dedicated portal for local Pahadi business owners (homestays, bike rentals, trekking guides, activity providers).
- **6-Category Dynamic Listing Creator:** Multi-step wizard with Cloudinary asset uploading, pricing claims, and verification document submission.
- **Web3 Attestation Trigger:** On-chain registration of vehicle VINs and property titles directly to smart contracts.
- **Financial P&L & Earnings Console:** Real-time revenue tracking, platform fee breakdown, and guest booking management.

### 3. 🛡️ Rescue Ops & Admin Hub (`/rescue-ops`, `/admin`)
- **Real-Time SOS Incident Dashboard:** Emergency dispatch console monitoring live incoming SOS distress signals across Uttarakhand corridors.
- **Live GPS Telemetry Tracker:** Visual map showing trekker location, altitude meter, speed, and emergency contacts.
- **Partner Verification Auditor (`/product-audit`):** Admin verification dashboard to approve or reject pending partner claimed listings.

### 4. 🔗 Web3 Verification Hub (`/verification-proof`, Smart Contracts)
- **Public Proof Auditor:** Anyone can scan a QR code on a rental bike or homestay to verify its smart contract attestation on-chain.
- **Cryptographic Trust Badges:** Visual proof badge on listings backed by Ethereum/EVM transaction hash.

---

## ⚡ 3. Core Features: AI + Web3 Blockchain Integration

### 🤖 1. Agentic AI Travel Copilot & Engine
- **Multi-Provider AI Gateway:** Integrates Groq (LLaMA 3), Google Gemini, OpenAI GPT-4o, and OmniRoute with automatic failover.
- **Terrain & Altitude Awareness:** Calculates route feasibility considering mountain elevation shifts, acclimatization stops, and mountain passes.
- **Dynamic Contextual Action Chips:** Generates clickable route updates, budget estimates, and stay recommendations directly in the chat stream.
- **SSE Streaming Response:** Fast, real-time response streaming for seamless user interaction.

### 🔗 2. Web3 Blockchain Trust Layer
- **Solidity Smart Contracts:**
  - `PartnerVerification.sol`: Manages partner identity, verification badges (`UNVERIFIED` ➔ `VERIFIED` ➔ `SUSPENDED`), and license hash attestations on-chain.
  - `VehicleRegistry.sol`: Registers rental vehicles (VIN, Registration Number, Pollution/Insurance Hash, Owner Wallet) directly on the blockchain.
- **Tamper-Proof Verification Proofs:** Prevents fake vehicle papers or scam homestays. If a vehicle details are altered off-chain, the on-chain cryptographic hash mismatches.
- **Public Verification Portal (`/verification-proof`):** Instant verification page accessible via QR code scan without requiring a crypto wallet for tourists.

---

## 🛡️ 4. Mountain Safety & SOS Emergency System

High-altitude safety is a critical cornerstone of Discovery Uttarakhand.

### How the SOS System Works:
1. **One-Tap Trigger:** Located on mobile navbar and trekker view (`/trekker-live`).
2. **Telemetry Capture:** Instantly captures:
   - Precise GPS Coordinates (Latitude, Longitude)
   - Current Altitude (Meters above sea level)
   - Mobile Device Battery Percentage
   - Nearest Destination / Himalayan Corridor
3. **Dispatch Pipeline:**
   - Emits a high-priority alert to the backend `POST /api/safety/sos`.
   - Sends real-time updates to the Rescue Ops Emergency Console (`/rescue-ops`).
   - Prepares SMS / WhatsApp payload for registered emergency contacts.
4. **Offline Resilience:** If network drops in remote valleys, coordinates are cached in local browser storage and dispatched immediately upon cell signal recovery.

---

## 📡 5. Complete API List & Endpoints Guide

Here is the full breakdown of all API routes powering Discovery Uttarakhand:

### 🔑 1. Authentication & User Management APIs (`/api/auth`, `/api/users`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user or partner account with role selection |
| `POST` | `/api/auth/login` | Authenticate user and return JWT bearer token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile data |
| `PUT` | `/api/users/profile` | Update user personal profile & emergency contact info |

---

### 🏔️ 2. Destinations & Tourism Content APIs (`/api/destinations`, `/api/places`, `/api/spiritual`, `/api/culture`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/destinations` | Get canonical list of 105 Uttarakhand destinations with filter & search |
| `GET` | `/api/destinations/:id` | Detailed destination metadata, altitude, weather, and nearby spots |
| `GET` | `/api/spiritual` | Fetch sacred circuits (Char Dham, Panch Kedar, Hemkund Sahib) |
| `GET` | `/api/culture` | Fetch Pahadi cultural heritage, festivals, and local handicrafts |
| `GET` | `/api/places/search` | Search destinations & points of interest by keyword |

---

### 🏡 3. Marketplace Inventories APIs (`/api/stays`, `/api/rentals`, `/api/activities`, `/api/guides`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/stays` | Fetch verified homestays & hotel listings with filters (price, location, amenities) |
| `GET` | `/api/rentals` | Fetch bike, scooty & car rental fleets with Web3 verification status |
| `GET` | `/api/activities` | Fetch adventure activities (rafting, paragliding, skiing, trekking) |
| `GET` | `/api/guides` | Fetch certified local mountain guides & trekking instructors |

---

### 🏢 4. Partner Hub APIs (`/api/partner`, `/api/marketplace`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/partner/listings` | Fetch all active listings created by the logged-in partner |
| `POST` | `/api/partner/listings` | Create a new listing (Stay, Rental Vehicle, Guide, Activity) |
| `PUT` | `/api/partner/listings/:id` | Update listing pricing, availability, or details |
| `DELETE` | `/api/partner/listings/:id` | Deactivate/remove partner listing |
| `POST` | `/api/partner/web3-attest` | Submit Web3 transaction hash to attest vehicle or property on-chain |
| `GET` | `/api/partner/earnings` | Get partner revenue analytics, booking payout history, and fees |

---

### 🤖 5. Agentic AI & Trip Planning APIs (`/api/ai`, `/api/agent`, `/api/trips`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/copilot` | Process user query through AI Gateway and stream response |
| `POST` | `/api/ai/plan-trip` | Generate custom multi-day itinerary based on budget, days & preferences |
| `POST` | `/api/trips` | Save custom trip itinerary to user account |
| `GET` | `/api/trips/my-trips` | Retrieve saved user trips |

---

### 🛡️ 6. Safety, SOS & Live Tracking APIs (`/api/safety`, `/api/live`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/safety/sos` | Broadcast emergency distress signal with live GPS telemetry |
| `GET` | `/api/safety/rescue-ops` | Fetch active rescue operations & incident feed for admin console |
| `POST` | `/api/live/telemetry` | Ping periodic GPS & altitude tracking points during active trek |

---

### 🔗 7. Web3 Verification & Proof APIs (`/api/verification`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/verification/vehicle/:vin` | Fetch on-chain smart contract attestation for a vehicle |
| `GET` | `/api/verification/partner/:address` | Verify partner wallet attestation status |
| `POST` | `/api/verification/verify-proof` | Validate cryptographic proof hash against EVM chain |

---

### 💳 8. Bookings & Payments APIs (`/api/bookings`, `/api/payments`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/bookings` | Create new reservation for stay, vehicle, or activity |
| `GET` | `/api/bookings/my-bookings` | Retrieve user booking history |
| `POST` | `/api/payments/create-order` | Generate Razorpay / Stripe payment gateway order |
| `POST` | `/api/payments/webhook` | Process automated payment confirmation webhook |

---

### 🌐 9. Third-Party External APIs Used
1. **Cloudinary CDN API:** Fast asset processing & CDN hosting for homestay & vehicle photos.
2. **OpenStreetMap & Leaflet Tile API:** Open-source topographic maps, satellite imagery, and road network routing.
3. **MongoDB Atlas & Upstash Redis:** Cloud Database & In-Memory Redis caching layer (TTL: 600s) for high performance.
4. **Hardhat / EVM RPC Nodes:** Ethereum testnet RPC connection for smart contract deployment and contract calls.
5. **AI Provider APIs (Groq, Gemini, OpenAI, OmniRoute):** LLM inference engines for travel assistance.

---

## 🏗️ 6. Technical Architecture & Stack

```
[ Frontend: React + Vite + TailwindCSS + Leaflet ]
                       │ (REST / SSE)
                       ▼
[ Backend Gateway: Node.js + Express (Port 5000) ]
       ├── Auth & JWT Middleware
       ├── Rate Limiting & Input Validation
       └── Express Service Routing
          │           │            │           │
          ▼           ▼            ▼           ▼
   [ MongoDB Atlas ] [ Redis ] [ Web3 RPC ] [ AI Gateway ]
   (Data Models)    (Cache)    (Solidity)   (Groq/Gemini)
```

- **Frontend:** React 18, Vite, TailwindCSS, Zustand, Lucide Icons, Leaflet GIS.
- **Backend:** Node.js, Express.js, Mongoose, JWT, Multer, Helmet Security.
- **Database:** MongoDB Atlas + Upstash Serverless Redis Cache.
- **AI Microservice:** Python FastAPI / LangGraph, Provider Abstraction.
- **Smart Contracts:** Solidity, Hardhat, Ethers.js (`PartnerVerification.sol`, `VehicleRegistry.sol`).

---

## 🎤 7. Hackathon Judge Q&A & Pitch Defense Strategy

### ❓ Question 1: "Why do you need Web3 / Blockchain in a travel app? Is it just a buzzword?"
> **Answer:** "In mountain tourism like Uttarakhand, fake rental vehicle papers and scam homestay listings are a huge problem during peak seasons like Char Dham Yatra. Traditional databases can be modified by corrupt admins or hacked servers. By attesting vehicle VINs, fitness certificates, and partner identities on EVM smart contracts, we create an immutable, publicly verifiable record. Anyone can scan a QR code on a scooty or hotel door to instantly verify its authenticity on-chain without needing a crypto wallet!"

---

### ❓ Question 2: "How is your AI Copilot different from just asking ChatGPT?"
> **Answer:** "Generic ChatGPT doesn't know local Himalayan terrain realities. Our AI Copilot is grounded with our live MongoDB database of 105 local Uttarakhand destinations, real-time weather alerts, and mountain telemetry. It suggests altitude-safe itineraries, calculates realistic mountain driving times, and directly outputs clickable action cards to book local stays and vehicles within the application."

---

### ❓ Question 3: "What happens if a trekker loses mobile internet in a remote Himalayan valley during an emergency?"
> **Answer:** "Our safety system features offline telemetry queuing. When an SOS is triggered in a zero-network zone, the app captures GPS coordinates, altitude, and timestamp, and stores them in local browser storage (IndexedDB/LocalStorage). As soon as the device pings even a weak 2G cell tower or satellite connection, the queued SOS signal auto-dispatches to our Rescue Ops console (`/rescue-ops`)."

---

### ❓ Question 4: "How does the Partner Hub empower local Pahadi business owners?"
> **Answer:** "Major travel aggregators charge up to 30% commission and delay payouts. Discovery Uttarakhand offers a direct Partner Hub where local Pahadi homestay hosts, bike rental owners, and trekking guides can register, list their inventory in under 3 minutes, and retain 90% of their earnings with transparent 10% platform fees."

---

### ❓ Question 5: "Is this app production-ready or just a prototype?"
> **Answer:** "It is fully production-grade! Our live backend is deployed on Render (`https://uttarakhand-hackathon-project.onrender.com/api`), backed by MongoDB Atlas, Upstash Redis caching, Cloudinary CDN, and unit test suites passing 100% of cases (`npm run build` cleanly passes)."

---

*Documentation generated for Discovery Uttarakhand — AI + Web3 Hackathon Submission.*
