# 🏔️ Discovery Uttarakhand — Hackathon Master Documentation & API Specification

> **Next-Gen Agentic AI (Voice + LangChain/LangGraph) & Web3-Attested Tourism, Homestay, Rental & Emergency Ecosystem for Uttarakhand**

---

## 📑 Executive Summary & Index

1. [🎯 Problem Statement & What We Are Solving](#-1-problem-statement--what-we-are-solving)
2. [🚀 Key Project Modules (User, Partner & Safety Hubs)](#-2-key-project-modules)
3. [⚡ Core Features: AI (Voice + LangGraph) + Web3 Blockchain Integration](#-3-core-features-ai-voice--langgraph--web3-blockchain-integration)
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
4. **Generic AI Itinerary Failure & Hands-Free Need in Mountains:**
   - Generic AI bots (like basic ChatGPT prompts) recommend unfeasible routes in mountain regions—ignoring seasonal pass closures, altitude sickness hazards, road landslides, and local terrain realities.
   - Trekkers and riders driving on mountain roads cannot constantly type text on touchscreens; they need a **hands-free real-time Voice Agent** in Hindi and English.

---

### 💡 Our Solution: Discovery Uttarakhand

**Discovery Uttarakhand** is an all-in-one smart travel ecosystem built specifically for mountain terrains, combining **Web3 Blockchain Attestation**, **Agentic AI Copilot (Voice + LangGraph)**, **Local Partner Hub**, and **Real-Time Rescue Telemetry**:

- **Web3 On-Chain Attestation:** All vehicle rentals (scooties, bikes, cabs) and homestays are registered on Ethereum/EVM smart contracts with public QR-code cryptographic proofs.
- **Agentic Voice & AI Copilot (LangGraph + LangChain):** Dual-mode AI assistant (Hands-free Voice + Interactive Streaming Chat) powered by LangGraph stateful memory workflows and multi-provider models (Gemini Live / Groq / OpenAI).
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
│ (User & Voice)    │  │ (Business Owner)  │              │ (Admin & Safety)    │  │ (Blockchain Layer)  │
└───────────────────┘  └───────────────────┘              └─────────────────────┘  └───────────────────┘
```

### 1. 🧳 Traveler / User Hub (`/`, `/trip-planner`, `/stays`, `/rentals`, `/copilot`)
- **Interactive Map & Trip Planner:** Leaflet-powered visual map with 105 canonical Uttarakhand destinations, satellite overlays, and terrain routes.
- **Hands-Free Devbhoomi AI Voice Companion (`ChatGPTVoiceOverlay.jsx`):** Full-screen voice interface with ambient status glows, dynamic soundwave orb ripples, and real-time audio playback.
- **LangChain Interactive Chat UI:** Conversational copilot with streaming deltas, suggested topic chips, and dynamic budget action cards.
- **Direct Marketplace Booking:** Browse & book verified homestays, scooty/car rentals, trekking guides, and spiritual/cultural tours.
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

## ⚡ 3. Core Features: AI (Voice + LangGraph) + Web3 Blockchain Integration

### 🎙️ 1. Real-Time LangGraph Voice Agent ("Devbhoomi AI Voice Companion")
- **Hands-Free Mountain Companion (`ChatGPTVoiceOverlay.jsx`):** A custom-designed, full-screen glassmorphism voice modal optimized for mobile viewports, featuring reactive ambient lighting and audio ripple rings.
- **Bidirectional WebSocket Streaming (`ws://`):** Ultra-fast live voice streaming using WebSocket bridge connection with 24kHz raw PCM audio chunks for near-zero latency audio feedback.
- **Multi-Tier Audio Architecture:**
  - **Tier 1 (WebSocket + Gemini Live PCM):** Real-time sub-second audio response with streamed voice chunks.
  - **Tier 2 (Browser Web Speech API + Neural TTS):** Native voice recognition and neural voice synthesis fallback (`hi-IN` & `en-IN`).
  - **Tier 3 (Serverless Backend Speech Pipeline):** Fallback audio processing via Render API backend (`/api/agent/chat`).
- **Bilingual Support (Hindi & English):** Seamlessly toggles between Hindi (*"नमस्ते! मैं आपका देवभूमि AI वॉइस साथी हूँ..."*) and English for both tourists and Pahadi locals.

---

### 🦜 2. LangChain & LangGraph Stateful Chat UI Engine
- **LangGraph Control Flow & Checkpointing (`python_fastapi_langgraph`):** Multi-turn session memory with stateful thread checkpointing, ensuring context is preserved across long conversations.
- **Terrain & Altitude Awareness:** Calculates route feasibility considering mountain elevation shifts, acclimatization stops, and mountain passes.
- **Dynamic Contextual Action Chips:** Generates clickable route updates, budget estimates, stay recommendation cards, and booking links directly in the chat stream.
- **Multi-Provider AI Gateway:** Integrates Groq (LLaMA 3), Google Gemini, OpenAI GPT-4o, and OmniRoute with automatic failover.

---

### 🔗 3. Web3 Blockchain Trust Layer
- **Solidity Smart Contracts:**
  - `PartnerVerification.sol`: Manages partner identity, verification badges (`UNVERIFIED` ➔ `VERIFIED` ➔ `SUSPENDED`), and license hash attestations on-chain.
  - `VehicleRegistry.sol`: Registers rental vehicles (VIN, Registration Number, Pollution/Insurance Hash, Owner Wallet) directly on the blockchain.
- **Tamper-Proof Verification Proofs:** Prevents fake vehicle papers or scam homestays. If vehicle details are altered off-chain, the on-chain cryptographic hash mismatches.
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

### 🤖 5. Agentic AI, Voice & LangGraph APIs (`/api/ai`, `/api/agent`, `/ws/voice`, `/api/trips`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `WS` | `/ws/voice` | Ultra-fast WebSocket streaming bridge for bidirectional voice chunks & transcripts |
| `POST` | `/api/voice/audio_query` | Process audio blob query and return transcribed reply with voice audio |
| `POST` | `/api/voice/ask` | Send text query to Voice Agent bridge and retrieve audio response |
| `POST` | `/api/ai/copilot` | Process user query through LangChain AI Gateway and stream response |
| `POST` | `/api/agent/chat` | LangGraph agentic chat endpoint with session memory & state checkpointing |
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
5. **AI & Voice Engines:** LangChain, LangGraph Checkpointer, Gemini Live WS, Web Speech API, Groq, OpenAI GPT-4o.

---

## 🏗️ 6. Technical Architecture & Stack

```
[ Frontend: React + Vite + TailwindCSS + Leaflet + Voice Overlay UI ]
                       │ (REST / SSE / WebSockets)
                       ▼
[ Backend Gateway: Node.js + Express + Python Voice Bridge ]
       ├── Auth & JWT Middleware
       ├── Rate Limiting & Input Validation
       └── Express Service Routing
          │           │            │           │
          ▼           ▼            ▼           ▼
   [ MongoDB Atlas ] [ Redis ] [ Web3 RPC ] [ LangGraph Voice ]
   (Data Models)    (Cache)    (Solidity)   (Stateful Agent)
```

- **Frontend:** React 18, Vite, TailwindCSS, Zustand, Lucide Icons, Leaflet GIS, Speech Recognition API, Web Audio API.
- **Backend:** Node.js, Express.js, Mongoose, JWT, Multer, Helmet Security.
- **Database:** MongoDB Atlas + Upstash Serverless Redis Cache.
- **AI & Voice Engine:** Python LangGraph agent, LangChain stateful memory (`python_fastapi_langgraph`), Gemini Live WebSocket bridge.
- **Smart Contracts:** Solidity, Hardhat, Ethers.js (`PartnerVerification.sol`, `VehicleRegistry.sol`).

---

## 🎤 7. Hackathon Judge Q&A & Pitch Defense Strategy

### ❓ Question 1: "Why do you need Web3 / Blockchain in a travel app? Is it just a buzzword?"
> **Answer:** "In mountain tourism like Uttarakhand, fake rental vehicle papers and scam homestay listings are a huge problem during peak seasons like Char Dham Yatra. Traditional databases can be modified by corrupt admins or hacked servers. By attesting vehicle VINs, fitness certificates, and partner identities on EVM smart contracts, we create an immutable, publicly verifiable record. Anyone can scan a QR code on a scooty or hotel door to instantly verify its authenticity on-chain without needing a crypto wallet!"

---

### ❓ Question 2: "How does your Voice Agent work, and why is it useful in Uttarakhand?"
> **Answer:** "In mountain regions like Uttarakhand, travelers driving on winding roads or trekking on steep trails cannot type text messages. Our **Devbhoomi AI Voice Companion** allows 100% hands-free interaction in Hindi and English. Powered by WebSockets and LangGraph, it streams 24kHz audio chunks for near-instant response times. Tourists can ask about weather, altitude, or homestays while riding or trekking!"

---

### ❓ Question 3: "What is LangChain & LangGraph doing in your project?"
> **Answer:** "LangChain provides our standardized AI prompt templates and multi-model gateway (switching between Groq, Gemini, and OpenAI). LangGraph provides stateful multi-turn memory checkpointing (`python_fastapi_langgraph`), so the AI remembers past preferences, vehicle choices, and trip budgets across the session without losing context!"

---

### ❓ Question 4: "How is your AI Copilot different from just asking ChatGPT?"
> **Answer:** "Generic ChatGPT doesn't know local Himalayan terrain realities. Our AI Copilot is grounded with our live MongoDB database of 105 local Uttarakhand destinations, real-time weather alerts, and mountain telemetry. It suggests altitude-safe itineraries, calculates realistic mountain driving times, and directly outputs clickable action cards to book local stays and vehicles within the application."

---

### ❓ Question 5: "What happens if a trekker loses mobile internet in a remote Himalayan valley during an emergency?"
> **Answer:** "Our safety system features offline telemetry queuing. When an SOS is triggered in a zero-network zone, the app captures GPS coordinates, altitude, and timestamp, and stores them in local browser storage (IndexedDB/LocalStorage). As soon as the device pings even a weak 2G cell tower or satellite connection, the queued SOS signal auto-dispatches to our Rescue Ops console (`/rescue-ops`)."

---

### ❓ Question 6: "How does the Partner Hub empower local Pahadi business owners?"
> **Answer:** "Major travel aggregators charge up to 30% commission and delay payouts. Discovery Uttarakhand offers a direct Partner Hub where local Pahadi homestay hosts, bike rental owners, and trekking guides can register, list their inventory in under 3 minutes, and retain 90% of their earnings with transparent 10% platform fees."

---

### ❓ Question 7: "Is this app production-ready or just a prototype?"
> **Answer:** "It is fully production-grade! Our live backend is deployed on Render (`https://uttarakhand-hackathon-project.onrender.com/api`), backed by MongoDB Atlas, Upstash Redis caching, Cloudinary CDN, and unit test suites passing 100% of cases (`npm run build` cleanly passes)."

---

*Documentation updated for Discovery Uttarakhand — AI (Voice + LangGraph) & Web3 Hackathon Submission.*
