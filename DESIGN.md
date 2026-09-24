# Design System: Discover Uttarakhand (Devbhoomi)

## 1. Visual Theme & Atmosphere
A majestic, high-altitude editorial interface combining Alpine Pine depth with crisp architectural clarity. The atmosphere evokes the raw serenity of the Garhwal and Kumaon Himalayas — organic slate, deep forest canopies, warm copper monastery accents, and crystalline mountain air. Layouts reject generic SaaS templates in favor of confident asymmetric pacing, editorial typography, and perpetual micro-interactions that make the platform feel like a living mountain operating system.

- **Density Score:** `6/10` (Balanced Explorer Utility — high informational density with generous spatial breathing room)
- **Variance Score:** `8/10` (Offset Asymmetric — split horizons, dynamic editorial grids, distinct card ratios)
- **Motion Score:** `7/10` (Fluid Spring Physics — weighted mountain springs, living status pulses, staggered waterfall reveals)

---

## 2. Color Palette & Roles

### Canvas & Base Surfaces
- **Pine Obsidian** (`#0C1813`) — Primary dark background, hero base, and immersive nocturnal view
- **Forest Abyss** (`#0F2A22`) — Deep mountain trust container, high-elevation security cards
- **Canvas Mist** (`#F8FAFC`) — Primary day-mode background surface with high optical clarity
- **Pure Snow** (`#FFFFFF`) — High-contrast card surfaces and elevated modals
- **Charcoal Ink** (`#0F172A`) — Primary display and body text (Slate-900 depth, never pure `#000000`)
- **Muted Mineral** (`#64748B`) — Secondary descriptions, captions, and structural labels

### Structural Accents & Verification
- **Himalayan Pine** (`#0F3D2E`) — Primary brand green accent for traveler CTAs, verified badges, active tabs
- **Alpine Emerald** (`#10B981`) — Live corridor pass indicators, positive road statuses, OTP confirmation
- **Valley Amber / Copper** (`#B45309`) — Dedicated Partner/Business portal accent, warning corridors, road advisories
- **Terracotta Rose** (`#E11D48`) — Landslide alerts, road closures, urgent high-altitude advisories
- **Whisper Border** (`rgba(15, 61, 46, 0.08)` / dark: `rgba(255, 255, 255, 0.12)`) — 1px tactile borders

*(Constraint: Single accent hierarchy per screen mode. Zero neon purple/cyan glows. Absolute saturation capped below 80%.)*

---

## 3. Typographic Architecture

### Typeface Selection
- **Display & Headlines:** `Outfit` / `Cabinet Grotesk`
  - *Tracking:* Tight (`-0.03em` on display, `-0.02em` on titles)
  - *Scale:* Controlled hierarchy driven by weight (`font-extrabold`, `font-black`) rather than oversized pixel dimensions.
- **Body & Content:** `Plus Jakarta Sans` / `Satoshi`
  - *Leading:* Relaxed (`leading-relaxed`, `1.65` line height)
  - *Width Constraint:* Maximum `65ch` per text paragraph for effortless scanability.
- **Data, Coordinates & Telemetry:** `JetBrains Mono` / `Geist Mono`
  - *Usage:* Altitudinal meters (`3,583m`), GPS coordinates (`30.7346° N, 79.0669° E`), Escrow verification hashes, vehicle registration plates, live road telemetry.

### Typographic Bans
- `Inter` is strictly **BANNED** to avoid generic AI SaaS look.
- Generic serifs (`Times New Roman`, `Georgia`, `Garamond`) are **BANNED**.
- Gradients spanning across long sentences are **BANNED** (solid, legible weights only).

---

## 4. Component Stylings & Interaction Rules

### Buttons & CTAs
- **Primary Traveler Action:** Flat Himalayan Pine (`#0F3D2E`) fill, white text, 14px rounded corners (`rounded-xl`), subtle inner bevel. On click: `-1px` tactile translateY compression with `scale(0.985)`. No neon box shadows.
- **Primary Partner Action:** Deep Valley Copper (`#B45309`) fill, white text, matching tactile click feel.
- **Ghost / Outline Button:** 1.5px subtle mineral border, background transparent, crisp hover tint (`rgba(15, 61, 46, 0.05)`).

### Elevation & Cards
- **Tactile Himalayan Cards:** Generously rounded (`rounded-2xl` or `rounded-3xl` / 1.5rem–2rem). Whisper border (`1px solid rgba(0,0,0,0.06)`). Diffused ambient shadow tinted to background tone (`box-shadow: 0 12px 36px -10px rgba(12, 24, 19, 0.08)`).
- **High-Density Data Cards:** Zero elevation. Flat container with `1px` structural boundary and subtle top accent indicator.

### Input Fields & Forms
- **Structure:** Floating or uppercase sub-label above input, `44px` minimum interactive height, smooth rounded corners (`12px`).
- **Focus State:** 2px ring in Himalayan Pine (`#0F3D2E22`) with matching border focus. No abrupt layout shifts.

### Loaders & Empty States
- **Skeletal Shimmer:** Shimmer matching exact layout geometry (avatar, header, paragraph lines). Generic spinning circles are strictly banned.
- **Empty States:** Composed topographic illustration with clear actionable next step (e.g., "Add your first destination to start building your route corridor").

---

## 5. Layout & Spatial Architecture

### Principles
- **Asymmetric Balance:** Split-screen hero layouts, offset media pairings, and non-uniform card grids.
- **Spatial Zones:** Absolute positioning and overlapping text onto photos are strictly prohibited. Every element lives in a dedicated, high-contrast zone.
- **Container Constraint:** Global viewport constrained to `max-w-7xl` (1280px–1400px) centered with responsive fluid gutters (`px-4 sm:px-6 lg:px-8`).
- **Viewport Height:** Full-screen sections must use `min-h-[100dvh]` to eliminate iOS Safari address-bar layout jumps.

### Grid Rules
- Replace 3 identical horizontal cards with staggered visual weights: 1 primary expansive card paired with 2 companion telemetry cards or asymmetric 2-column zig-zag.

---

## 6. Motion & Interaction Philosophy

### Physics & Easing
- **Spring Parameters:** `stiffness: 120, damping: 20` for all card modals, dropdown drawers, and accordion tabs. Zero linear easing.
- **Hardware Acceleration:** Animations restricted exclusively to `transform` and `opacity` properties (`will-change: transform`). Never animate `width`, `height`, `top`, or `left`.

### Perpetual Micro-Interactions
- **Live Mountain Status:** Living pulse dot (`animate-ping`) on verified corridor checkpoints and weather radar.
- **Waterfall Cascades:** Lists and itinerary day cards reveal via staggered delays (`100ms`, `160ms`, `220ms`).

---

## 7. Anti-Patterns & AI Tells (Strictly Banned)

1. **NO Generic AI Clichés:** Words like *"Elevate your journey"*, *"Seamless next-gen experience"*, *"Unleash the magic"* are strictly forbidden. Use authentic regional language: *"Verified Mountain Trust Protocol"*, *"Direct Handover Escrow"*, *"Real-Time Himalayan Corridor"*.
2. **NO Fake Numbers or Metrics:** Do not fabricate `"99.9% UPTIME"` or `"50,000+ TRIPS COMPLETED"`. Display real database entities or contextual indicators.
3. **NO Neon Outer Glows:** Avoid purple/blue glowing drop-shadows or cyber aesthetics.
4. **NO Pure Black:** Never use `#000000`. Use `#0C1813`, `#0F172A`, or `#1E293B`.
5. **NO Centered Hero Slop:** Do not use centered floating text with bouncing scroll arrows.
6. **NO Generic Placeholders:** Never use `"John Doe"` or `"Acme Corp"`. Use authentic regional names like `"Ramesh Negi"`, `"Kedarnath Route Coordinator"`, `"Nanda Devi Fleet"`.
