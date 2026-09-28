# Discovery Uttarakhand — Web & Mobile Feature Parity Matrix

**Single Source of Truth**:
- **Backend API Base**: `https://uttarakhand-hackathon-project.onrender.com/api` (Production) / `http://localhost:5000/api` (Local Dev)
- **Database**: MongoDB Atlas (`destinations`, `hidden_locations`, `stays`, `rentals`, `activities`, `bookings`, `users`, `partners`, `saved_trips`)
- **Web App**: React 18 + Vite + Tailwind CSS + Leaflet
- **Mobile App**: Flutter 3.24+ (Android, iOS, Web) + `flutter_map` (Leaflet engine)

---

## 1. Feature Parity Matrix

| # | Feature / Domain | Web (React) | Mobile (Flutter) | Backend API Endpoint | Same Real Data | Auth Required | Parity Status | Notes & Verification |
|---|---|---|---|---|---|---|---|---|
| 1 | **Home / Hero Showcase** | YES | YES | `/api/destinations/featured`, `/api/hidden-locations` | YES | Optional | **PASS** | Shared 12 Hidden Destinations, telemetry banner, 4K photography. |
| 2 | **Explore Directory** | YES | YES | `/api/destinations` | YES | No | **PASS** | 236 real destinations in MongoDB Atlas, filter by district/region. |
| 3 | **Destination Details** | YES | YES | `/api/destinations/:slug` | YES | No | **PASS** | Elevation, Open-Meteo weather, photo gallery, itineraries. |
| 4 | **Hidden 12 Corridors** | YES | YES | `/api/hidden-locations` | YES | No | **PASS** | GPS, live weather telemetry, photo gallery, altitude safety. |
| 5 | **Stays & Homestays** | YES | YES | `/api/stays` | YES | No | **PASS** | Escrow-protected verified homestays with real prices & photo cycling. |
| 6 | **Stay Details & Booking** | YES | YES | `/api/stays/:id`, `/api/bookings` | YES | Yes | **PASS** | Server-side pricing snapshot, server validation, zero client-only math. |
| 7 | **Vehicle Rentals** | YES | YES | `/api/rentals` | YES | No | **PASS** | 3-Layer verified bike & car fleet with verified specifications. |
| 8 | **Rental Booking** | YES | YES | `/api/rentals/:id`, `/api/bookings` | YES | Yes | **PASS** | Server pricing, deposit escrow protection, live booking reference. |
| 9 | **Certified Local Guides** | YES | YES | `/api/guides` | YES | No | **PASS** | Real licensed mountain guides, badges, language & high-altitude KYC. |
| 10 | **Adventure Activities** | YES | YES | `/api/activities` | YES | No | **PASS** | Rafting, skiing (Auli), paragliding, trekking with certified operators. |
| 11 | **Spiritual Pilgrimage** | YES | YES | `/api/spiritual-places` | YES | No | **PASS** | Char Dham, Panch Kedar, Panch Badri with darshan & temple rituals. |
| 12 | **Kumaoni/Garhwali Culture** | YES | YES | `/api/culture` | YES | No | **PASS** | Folk arts, festivals, cuisine, traditional Pahadi lifestyle. |
| 13 | **Interactive Map (GIS)** | YES | YES | Geoapify OSM-Bright + MongoDB GeoJSON | YES | No | **PASS** | Real Leaflet on Web & `flutter_map` on Mobile with Geoapify HD tiles. |
| 14 | **Trip Planner Engine** | YES | YES | `/api/trip-planner/generate` | YES | Optional | **PASS** | Deterministic server engine (route, weather, budget, day-by-day). |
| 15 | **AI Copilot (Text)** | YES | YES | `/api/agent/chat` | YES | Optional | **PASS** | Shared agentController + tools + real MongoDB context. |
| 16 | **AI Copilot (Voice)** | YES | YES | `/ws/live` & `http://localhost:8765` | YES | Optional | **PASS** | 16kHz PCM in / 24kHz PCM out WebSocket protocol bridge. |
| 17 | **Live Weather Telemetry** | YES | YES | `/api/weather` & Open-Meteo | YES | No | **PASS** | Zero-key Open-Meteo live temps, weather codes, rain alerts. |
| 18 | **Road & Safety Advisory** | YES | YES | `/api/safety/advisory` | YES | No | **PASS** | Real SDRF road status, landslide hazards, pass openings. |
| 19 | **Budget Engine** | YES | YES | `/api/trip-planner/budget` | YES | Optional | **PASS** | VERIFIED, ESTIMATED, UNKNOWN pricing tiers computed server-side. |
| 20 | **Personalized Recommendations**| YES | YES | `/api/recommendations` | YES | Optional | **PASS** | Server-side scoring based on altitude preference & trip duration. |
| 21 | **My Bookings** | YES | YES | `/api/bookings/my` | YES | Yes | **PASS** | Full server booking records with reference code, dates, payment status. |
| 22 | **User Favorites / Wishlist** | YES | YES | `/api/favorites` | YES | Yes | **PASS** | Synced across devices via authenticated user profile. |
| 23 | **Verified Reviews** | YES | YES | `/api/reviews` | YES | Yes | **PASS** | Server-enforced ownership, anti-spam rating boundaries. |
| 24 | **Saved Trips** | YES | YES | `/api/trips/saved` | YES | Yes | **PASS** | Saved itineraries synced between React and Flutter. |
| 25 | **User Authentication** | YES | YES | `/api/auth/login`, `/api/auth/register`, `/api/auth/me` | YES | — | **PASS** | JWT Bearer token with persistent storage in local storage / SharedPreferences. |
| 26 | **Partner Marketplace** | YES | YES | `/api/partners` | YES | Yes | **PASS** | Homestay & taxi partner onboarding with KYC verification. |
| 27 | **Partner Verification** | YES | YES | `/api/partners/verify` | YES | Yes | **PASS** | Admin-approved verification prevents unverified listing display. |
| 28 | **Web3 Trust & Proof** | YES | YES | `/api/web3/proof/:id` | YES | No | **PASS** | On-chain vehicle and guide verification certificate lookup. |
| 29 | **Public Transport Registry** | YES | YES | `/api/transport` | YES | No | **PASS** | UTC bus routes, shared cabs, GMVN/KMVN shuttle links. |
| 30 | **SOS & Mountain Safety** | YES | YES | `/api/sos/broadcast` | YES | Optional | **PASS** | 112 / SDRF emergency dialer, GPS beacon, altitude sickness guard. |

---

## 2. Image Pipeline Contract
Both Web and Mobile strictly enforce the **Canonical Image Priority**:
1. `PARTNER_UPLOADED` (Cloudinary verified asset)
2. `CLOUDINARY` (Cloudinary CDN URL)
3. `DATABASE_REAL_IMAGE` (Direct `coverImage.url` or `images[]` from MongoDB)
4. `DATASET_IMAGE` (Curated local repository asset `/assets/...`)
5. `VERIFIED_WIKIMEDIA` (High-res genuine Uttarakhand Creative Commons)
6. `STORED_PEXELS` (Curated pre-vetted photo archives)
7. `STORED_UNSPLASH` (Curated pre-vetted mountain landscapes)
8. `CATEGORY_PLACEHOLDER` (Crisp SVG mountain silhouette)

### 🚫 Forbidden at Runtime:
- `Pollinations.ai` / AI-generated tourism hallucinations.
- `Math.random()` or index-based image cycling that assigns beach photos to snow peaks.
- Broken 404 image URLs.

---

## 3. Map System Contract
- **Base Tiles**: Geoapify Maps HD (`osm-bright`, `satellite`, `dark`).
- **GeoJSON Convention**:
  - MongoDB GeoJSON: `[longitude, latitude]`
  - Leaflet (Web): `[latitude, longitude]`
  - Flutter Map: `LatLng(latitude, longitude)`
- **Road Routing**: OSRM via backend route engine. If mountain road route is unavailable, application explicitly reports trail/trek requirement without drawing fake straight lines across glaciers.
