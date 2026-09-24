# 🏔️ Discovery Uttarakhand — Features & Architecture Specification

> **Platform Overview:** An intelligent, decentralized, and community-first mountain travel ecosystem engineered for the Himalayan terrain.

---

## 🌟 1. Core Platform Architecture & Design System

- **Design Philosophy:** Anti-generic, Apple/Figma-grade travel aesthetic with soft warm cream background (`#fdfbf7`), deep forest green accents (`#0f3d2e`), and subtle elevation shadows.
- **Glassmorphic Navigation Dock:**
  - Route-aware auto-hiding on authentication (`/login`) and admin/partner dashboards.
  - Curated mega-dropdown for *Spiritual Yatras*, *Culture & Heritage*, *Treks & Adventure*, and *Certified Guides*.
  - Instant expand-on-click search bar with auto-focus.
  - Interactive Wishlist counter and user profile management.
- **Production Build Integrity:** Fully optimized Vite production bundle with zero compile errors.

---

## ⚡ 2. The 7 Pioneering Himalayan Innovations

### 1. 📡 Live Mountain Safety Dashboard & GIS Crowd Heatmap
- **Real-Time Telemetry:** Live indicators for crowd density levels, mountain weather temperatures, ghat road statuses, and crystalline AQI.
- **Regional Corridor Tracking:** Itinerary-style corridor cards (Kedarnath Circuit, Badrinath-Mana, Valley of Flowers, Chopta-Tungnath, Munsiyari) with visual progress bars.

### 2. 🤖 AI Mountain Travel Assistant & Safety Tools
- **Altitude Safety Sentinel:** Monitors rate of ascent and enforces intermediate acclimatization rest days (e.g., Guptkashi at 1,319m).
- **Ghat Route Optimizer:** Real-time multi\-modal routing across motorable roads, shared jeeps, and trekking paths.
- **Local Dialect Translator:** Garhwali & Kumaoni conversational translations with phonetic guides.
- **Emergency Valley SOS Beacon:** Offline mesh broadcast to local mountain rescue teams.

### 3. 🫀 Altitude Acclimatization & AMS Guard
- **Visual Elevation Profile:** Dynamic gradient chart illustrating ascent curves from Rishikesh (370m) to Kedarnath summit (3,583m).
- **Interactive AMS Self-Screening:** 1-click symptom checker providing instant medical descent advisories.

### 4. 🔒 Zero-Signal Offline Escrow & QR Handshake
- **Offline Cryptographic Voucher:** Generates encrypted digital tokens stored on the traveler's phone.
- **Tamper-Proof Handover:** Local partner scans offline QR code; payment is released only upon entering the traveler's 6-digit OTP.

### 5. 🔄 Real-Time Inventory & Booking Synchronization
- **Ultra-Low Latency State Sync:** Instant state synchronization between traveler bookings and remote mountain homestay room locks.
- **Zero Double-Booking:** Automatic room lock preventions for remote village hosts.

### 6. 📻 Community Safety Grid & SOS Network
- **5 km Responder Mesh:** Instant direct calling and GPS coordinates broadcast to verified local homestay hosts, 4x4 rescue drivers, and SDRF guides.

### 7. 🪙 Pahadi Coins Circular Eco-Wallet
- **Himalayan Cleanliness Rewards:** Travelers earn digital tokens for zero-plastic trail disposal.
- **Local Village Economy:** Direct redemption for herbal teas, guide tips, organic meals, and riding gear at 120+ verified local partners.

---

## 🗺️ 3. Complete Travel & Booking Features

| Feature | Path | Description |
| :--- | :--- | :--- |
| **Explore & Destinations** | `/` | Curated showcase of Uttarakhand circuits with filterable categories. |
| **Boutique Stays** | `/stays` | Verified KMVN & eco-homestays with instant date & guest booking. |
| **Vehicle Rentals** | `/rentals` | Scooters & Royal Enfields with escrow-protected handover. |
| **Spiritual Yatras** | `/spiritual` | Char Dham & Panch Kedar pilgrimage guides with temple timings. |
| **Culture & Heritage** | `/culture` | Pahadi architecture, traditional festivals, and authentic culinary trails. |
| **Treks & Adventure** | `/activities` | High-altitude treks, white-water rafting, and mountain camping. |
| **Certified Guides** | `/guides` | Government-verified local trekking and spiritual guides. |
| **Interactive Live Map** | `/map` | GIS map with regional pins, road connectivity, and elevation markers. |
| **Smart Trip Planner** | `/trip-planner` | Multi-day AI itinerary generator with custom day cards. |
| **AI Copilot** | `/copilot` | Dedicated conversational travel assistant for real-time mountain queries. |
| **Partner Portal** | `/partner` | Business dashboard for homestay hosts and vehicle operators. |
| **Admin Console** | `/admin` | Centralized platform management for listings and user KYC. |

---

## 🛠️ 4. Technical Stack & Deployment Configuration

- **Frontend:** React 19, Vite 8, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet, Zustand, Axios.
- **Backend:** Node.js, Express 5, MongoDB / Mongoose, Cloudinary, Razorpay, Helmet, CORS.
- **AI Gateway:** Multi-provider fallback supporting OmniRoute, Groq, Gemini Flash, and OpenAI.
- **Deployment Ready:**
  - `vercel.json` rewrite rules configured for SPA routing.
  - `public/_redirects` enabled for Netlify / Cloudflare Pages.
