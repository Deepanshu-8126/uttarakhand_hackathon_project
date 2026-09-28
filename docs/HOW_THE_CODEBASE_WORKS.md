# Discovery Uttarakhand — How the Codebase Works (Plain Language Architecture)
**Generated:** 2026-09-28

This document explains the runtime flows of Discovery Uttarakhand in simple, clear language.

---

### 1. Explore Flow
When a tourist visits the website (`/` or `/explore`), the `Home.jsx` page mounts the `ExploreSection.jsx` component. This component triggers the `useDestinations()` hook, which calls `getDestinations()` in `destinationApi.js`. This fires a `GET /api/destinations` HTTP request. The backend `server.js` forwards this to `destinationRoutes.js`, which calls the `destinationController.js`. The controller checks the Upstash Redis cache; if cached, it returns instantly. If not, it executes `Destination.find()` against MongoDB Atlas, stores the result in Redis with a 10-minute expiration, and returns the 106 destinations. The frontend receives the JSON, resolves authentic photography through `imageHelpers.js`, and displays the destination cards.

---

### 2. Stays Flow
When a user navigates to `/stays`, the `Stays.jsx` page triggers `useStays()`, calling `stayApi.getStays()`. This sends `GET /api/stays` to `stayRoutes.js` and executes `stayController.getStays()`. The controller performs two parallel database queries: it fetches curated heritage homestays from the `Stay` model and verified local host listings from the `PartnerListing` model (where `status === 'ACTIVE'`). It normalizes both into a unified list and returns them to the browser, ensuring newly approved partner homestays appear alongside official curated stays.

---

### 3. Rentals Flow
When opening `/rentals`, `Rentals.jsx` executes `useRentals()`, calling `rentalApi.getRentals()`. The backend `rentalController.getRentals()` retrieves vehicles from `Rental.find()` and active vehicle fleets from `PartnerListing.find({ listingType: 'Rental', status: 'ACTIVE' })`. The rental cards render specifications (helmets, luggage carrier, daily rates) and feature a direct "Plan Trip with this Vehicle" button that deep-links into the Trip Planner with prefilled vehicle metadata.

---

### 4. Trip Planner Flow
When planning an itinerary at `/trip-planner`, the user goes through a conversational 3-step wizard (Vibes, Constraints, Travelers). When clicking "Build Journey", `handleGenerateItinerary` computes the mountain driving route via `fetchOSRMRoute` and runs `generatePersonalizedTripPlan` in `utils/itineraryGenerator.js`. It calculates day-by-day legs based on 30 km/h mountain ghat speeds, clusters activities, assigns verified stays, and computes a detailed budget breakdown. The generated trip is stored in the user's browser session and can be saved to MongoDB Atlas via `tripApi.createTrip()` (`POST /api/trips`).

---

### 5. AI Copilot & Voice Studio Flow
When a user chats with Devbhoomi AI at `/copilot` or in the voice modal, `agentApi.sendAgentChatStream()` opens an HTTP Server-Sent Events (SSE) stream to `POST /api/agent/chat`. The backend `agentController.js` hands the message to `agentService.js`. The agent builds a grounded system prompt, checks its 14 deterministic tools (weather, road advisories, stays, rentals), and invokes the active AI provider (Groq or Gemini). The LLM streams tokens back in real time. If the user asks the agent to perform an action (like "Show me stays in Nainital"), the agent emits a `ui_action` JSON payload that `agentActionExecutor.js` intercepts to automatically navigate the website or filter cards.

---

### 6. Booking & Escrow Handshake Flow
When a tourist clicks "Book Now" on a stay or vehicle, `bookingApi.createBooking()` sends the reservation to `POST /api/bookings`. The backend `bookingController.js` verifies availability, calculates the server-side price (ignoring any manipulated client prices), adds the mandatory ₹50 Himalayan green cess, generates a unique reference `DU-YYYYMMDD-XXXXXX`, and creates a 4-digit check-in OTP via `escrowService.js`. The funds are held in vault. Upon arrival at the homestay or rental hub, the host enters the tourist's 4-digit OTP; the backend verifies the handshake and releases the escrow payout to the partner.

---

### 7. Location Personalization Flow
When a tourist sets their location (e.g. "Haldwani"), `personalizedApi.getPersonalizedHome()` calls `GET /api/personalized/home`. The backend `personalizedController.js` calls `locationService.js`, which queries MongoDB using 2dsphere geospatial coordinates and Haversine distance ranking. It returns verified destinations, homestays, and rental hubs within driving distance, which `PersonalizedNearYouSection.jsx` renders with live kilometer badges.

---

### 8. Web3 Trust Verification Flow
When an administrator verifies a partner homestay or vehicle fleet in `AdminDashboard.jsx`, the backend `adminVerificationController.js` calls `web3Service.js`. Using ethers.js, it writes a cryptographic hash of the listing to the `PartnerVerification.sol` or `VehicleRegistry.sol` smart contract on the blockchain. Any user or enforcement officer can visit `/verify/listing/:id` to inspect the immutable on-chain block number, transaction hash, and timestamp.
