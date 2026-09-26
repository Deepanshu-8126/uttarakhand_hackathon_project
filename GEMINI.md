# Discovery Uttarakhand — Permanent Project Laws & Aesthetic Memory

This file is automatically injected into Antigravity's memory on EVERY single turn.
Follow these rules strictly without exception to prevent user frustration.

---

## 1. Master UI & Design Laws (NEVER VIOLATE)

### 🎨 A. Signature 2-Color Palette & Glassmorphism
- **Primary Brand Accent**: Deep Himalayan Emerald (`#0f3d2e`, `emerald-900`/`emerald-950`).
- **Secondary Accent & Glow**: Radiant Himalayan Emerald/Teal (`#00FF88`, `emerald-400`, `emerald-500`, `teal-400`).
- **Surfaces**: Deep Dark Slate/Stone (`stone-950`, `stone-900`) or Clean Alpine Light (`#fdfbf7`, `stone-50`).
- **Cards & Modals**: Premium Glassmorphism (`backdrop-blur-xl`, `border border-white/10` or `border-stone-200/80`, `shadow-xl`).
- **Forbidden Colors**: Never use raw default red, plain blue, or dull uncalibrated gray.

### 📐 B. Fluid & Spacious Layout (Anti-Squish System)
- **Breathing Room**: Every container MUST have generous padding (`p-4 sm:p-6 lg:p-8`, `gap-4 sm:gap-6 lg:gap-8`). Never crowd elements together.
- **Card Spacing**: Cards must use `rounded-2xl` or `rounded-3xl` with crisp borders and clean internal hierarchy.
- **Text Protection**: All action items, buttons, badges, and tabs MUST use `whitespace-nowrap` so text NEVER breaks mid-word or squishes.
- **Logo Safety**: Logos and brand marks MUST use `shrink-0` so they never distort or flatten.

### 📱 C. Strict Mobile-First Responsiveness (320px to 1920px)
- **Mobile (< 768px)**: Single column layouts, stacked flex, full-screen overlays (no cut-off dropdowns). Minimum 44x44px tap targets.
- **Tablet (768px - 1024px)**: 2-column grid, max 3 inline items in bar controls.
- **Desktop (> 1024px)**: Full multi-column grid centered inside `max-w-7xl mx-auto`.
- **Zero Horizontal Scroll**: No element should EVER cause horizontal overflow or clipping at ANY screen width.

### ✨ D. Micro-Animations & Dynamic Visuals
- **Hover Micro-Feedback**: Use `transition-all duration-300`, `hover:-translate-y-1`, `active:scale-95`.
- **Live Status Rings**: Pulse indicators with glow (`animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.4)]`).
- **Smooth Gradients**: Use ambient radial glows and rich background gradients (`bg-gradient-to-br from-emerald-950 via-[#0f3d2e] to-stone-950`).

### 🚫 E. Clean Architecture & Code Hygiene
- **No Duplicate UI**: Check existing navbar, floating pills, and drawers before adding any new widget.
- **No Inline Styles**: Use pure Tailwind CSS classes. No `style={{}}` or `!important`.
- **No Hardcoded Pixel Heights**: Use Tailwind responsive scale (`h-16 lg:h-20`, `min-h-screen`, `h-[100dvh]`).

---

## 2. Brahmastra Runtime Verification (Self-Perception)
- **Never report success blindly:**
  - After modifying any code, automatically execute `cmd /c "npm run build"` in the Frontend directory.
  - If any error, missing import, or broken JSX occurs, auto-heal immediately by inspecting the exact File:Line.
  - Do NOT make the user send screenshots of broken pages or runtime errors.

---

## 3. High-Context Memory of This Workspace
- **Backend Port:** 5000 (`http://localhost:5000/api`)
- **Live Production Backend:** `https://uttarakhand-hackathon-project.onrender.com/api` (Render, kept awake via UptimeRobot)
- **Database:** MongoDB Atlas + Upstash Serverless Redis In-Memory Cache (TTL: 600s).
- **Frontend Framework:** React + Vite + Tailwind CSS + Lucide Icons + Leaflet (Map).
- **Mobile App**: Flutter Android / iOS App (`mobile_app/`).
- **Core Domain:** Discovery Uttarakhand (AI + Web3 Hackathon Project).
  - Features: Explore Destinations, Homestays & Stays, Bike/Car Rentals, Himalayan Corridors, Web3 Blockchain Partner & Vehicle Verification, AI Trip Copilot.
