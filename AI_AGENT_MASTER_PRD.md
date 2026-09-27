# DISCOVERY UTTARAKHAND — AI AGENT MASTER PRD
## Looping Instruction Document for Antigravity AI Agent
## "Test One Feature, Fix It Completely, Then Move to Next"

---

> **HOW TO USE THIS DOCUMENT:**
> This is a sequential looping instruction guide. The AI agent (Antigravity) must:
> 1. Read ONE task item at a time
> 2. Investigate the relevant files listed
> 3. Fix / implement / verify completely
> 4. Run `npm run build` to confirm zero errors
> 5. Mark task DONE and move to the NEXT task
> 6. NEVER skip a task. NEVER mark done without verifying.

---

## PROJECT CONTEXT (Read Once, Remember Always)

| Key | Value |
|---|---|
| Root Directory | `c:\Users\Deepanshu\Desktop\discover\` |
| Frontend | `Frontend/` — React 18 + Vite + TailwindCSS |
| Backend | `backend/` — Node.js + Express + MongoDB |
| AI Service | `ai/` — Python FastAPI + LangGraph |
| Mobile App | `mobile_app/` — Flutter 3.x (Dart) |
| Production Backend | `https://uttarakhand-hackathon-project.onrender.com/api` |
| Local Backend Port | `5000` |
| Design Colors | Primary: `#0f3d2e` (Emerald) · Accent: `#00FF88` · BG: `#fdfbf7` |

---

## PRIORITY ORDER (Fix in This Exact Sequence)

```
PRIORITY 1 → Voice Agent (Devbhoomi AI Voice — is it actually working?)
PRIORITY 2 → Real Images (All fake/broken images replaced with real ones)
PRIORITY 3 → Rentals Page (Full working UI + backend + booking flow)
PRIORITY 4 → Escrow Service (Payment lock → check-in → release flow)
PRIORITY 5 → All 18 Flutter Screens (UI quality + real data + no placeholders)
```

---

## ═══════════════════════════════════════════════════
## TASK 1: VOICE AGENT — FULL AUDIT & FIX
## ═══════════════════════════════════════════════════

**Status:** [ ] TODO  
**Priority:** CRITICAL  
**Estimated scope:** Large

### What the Voice Agent Should Do (Ground Truth)

The Devbhoomi AI Voice Companion must:

1. **Activate** when user clicks the mic / voice orb button
2. **Capture** mic audio from the browser
3. **Send** audio to backend OR use Web Speech API for transcription
4. **Process** transcript via LangGraph AI agent
5. **Respond** with AI-generated text AND spoken audio reply
6. **Show** visual state changes: idle → listening → processing → speaking

### 3-Tier Voice Architecture (Must All Work)

```
TIER 1 (Primary): Gemini Live WebSocket
  File: Frontend/src/components/copilot/ChatGPTVoiceOverlay.jsx
  Backend: ai/app/voice_demo/ (Python WebSocket bridge)
  WS URL: ws://localhost:8765/ws/voice (local) or wss://[render]/ws/voice (prod)
  Audio: 24kHz raw PCM chunks → AudioContext playback

TIER 2 (Fallback): Web Speech API
  window.SpeechRecognition / webkitSpeechRecognition
  Language: hi-IN for Hindi, en-IN for English
  TTS: window.speechSynthesis.speak()
  Send transcript to: POST /api/agent/chat

TIER 3 (Last Resort): MediaRecorder VAD
  Record WebM/Opus, detect 800ms silence, send base64 blob
  POST /api/voice/audio_query OR /api/voice/ask
```

### Files to Inspect

```
Frontend/src/components/copilot/ChatGPTVoiceOverlay.jsx  ← Main voice UI
Frontend/src/pages/AICopilot.jsx                         ← AI page that hosts voice
ai/app/voice_demo/                                       ← Python voice bridge
ai/app/api/                                              ← FastAPI voice endpoints
backend/routes/                                          ← Check if /api/voice/ask exists
```

### Verification Checklist

- [ ] Clicking the mic button changes state to "listening"
- [ ] Browser requests microphone permission
- [ ] Speech is captured and transcribed
- [ ] Transcript reaches LangGraph `/api/agent/chat`
- [ ] AI response is spoken aloud (not just shown as text)
- [ ] Hindi (`hi-IN`) mode works separately from English (`en-IN`)
- [ ] Visual orb/ring animates during each state
- [ ] Error message shown if microphone permission denied
- [ ] Fallback to Tier 2 if Tier 1 WebSocket is unavailable
- [ ] `npm run build` passes with zero errors after any changes

### Common Bugs to Fix

1. **Mic permission never asked** → `navigator.mediaDevices.getUserMedia()` not called
2. **Audio plays with no sound** → AudioContext suspended (needs user gesture to resume)
3. **WS connects but no response** → Python bridge not running, fallback silently broken
4. **Hindi transcription wrong** → `lang` attribute not set on SpeechRecognition instance
5. **Voice button missing on mobile** → Check `sm:hidden` breakpoint classes

---

## ═══════════════════════════════════════════════════
## TASK 2: REAL IMAGES — NO PLACEHOLDERS ANYWHERE
## ═══════════════════════════════════════════════════

**Status:** [ ] TODO  
**Priority:** HIGH  
**Estimated scope:** Medium

### The Problem

The app shows:
- Generic grey placeholder rectangles where destination images should be
- Unsplash images that are NOT actually of Uttarakhand (mountains in Switzerland, Norway etc.)
- Broken `<img>` tags with 404 errors
- Default avatar icons instead of real guide/stay photos

### Ground Truth Photo System

The backend already has a real photo service:

```
backend/services/photoService.js  ← Primary photo source
  - Has a VERIFIED_LOCATION_PHOTOS directory with real Unsplash URLs
  - Falls back to Pexels API if destination not in directory
  - Redis caches results for 24 hours (TTL: 86400s)

Route that serves photos: GET /api/photos/search?query=<destination>
```

### Files to Inspect and Fix

```
Frontend/src/components/DestinationCard.jsx        ← Destination image rendering
Frontend/src/components/destination/               ← All destination sub-components
Frontend/src/pages/DestinationDetails.jsx          ← Hero image + gallery
Frontend/src/components/StayCard.jsx               ← Homestay card images
Frontend/src/components/RentalCard.jsx             ← Vehicle images
Frontend/src/components/GuideCard.jsx              ← Guide profile photos
mobile_app/lib/screens/home_screen.dart            ← Flutter: destination tiles
mobile_app/lib/screens/destination_detail_screen.dart ← Flutter: hero image
mobile_app/lib/screens/rentals_stays_screen.dart   ← Flutter: stay/rental photos
```

### Fix Rules (Follow Strictly)

1. **Never use `placeholder.com` or `via.placeholder.com`** — delete all references
2. **All destination images** → call `GET /api/photos/search?query=<destinationName>`
3. **For offline/error fallback** → use this real Unsplash mountain image:
   `https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80`
4. **Lazy load all images** with `loading="lazy"` attribute
5. **Always add `onError` handler** that swaps to the fallback URL
6. **Flutter**: Use `CachedNetworkImage` with a real fallback `errorWidget`
7. **Never leave `alt=""` empty** — use destination name as alt text

### Standard Image Component Pattern (React)

```jsx
// Use this pattern everywhere in React components:
<img
  src={destination.heroImage || `https://uttarakhand-hackathon-project.onrender.com/api/photos/search?query=${encodeURIComponent(destination.name)}`}
  alt={destination.name}
  loading="lazy"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
  }}
/>
```

### Standard Image Widget Pattern (Flutter)

```dart
// Use this pattern everywhere in Flutter:
CachedNetworkImage(
  imageUrl: stay.photoUrl ?? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  fit: BoxFit.cover,
  placeholder: (ctx, url) => Container(color: Color(0xFFE7E5E4),
    child: Center(child: CircularProgressIndicator(color: Color(0xFF0F3D2E)))),
  errorWidget: (ctx, url, err) => Image.network(
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
    fit: BoxFit.cover),
)
```

### Verification Checklist

- [ ] Zero `placeholder.com` references anywhere (`grep -r "placeholder.com" Frontend/src`)
- [ ] Zero broken image 404s in browser console on main pages
- [ ] Destination detail page loads a real Himalayan photo
- [ ] Stay cards show real homestay photos (not grey boxes)
- [ ] Rental cards show real vehicle photos
- [ ] Guide cards show real person photos (or a verified Pahadi guide image)
- [ ] Flutter home screen shows real destination photos in tiles
- [ ] All images have `onError` fallback
- [ ] `npm run build` passes after fixes

---

## ═══════════════════════════════════════════════════
## TASK 3: RENTALS PAGE — FULL WORKING UI + BACKEND
## ═══════════════════════════════════════════════════

**Status:** [ ] TODO  
**Priority:** HIGH  
**Estimated scope:** Large

### What Rentals Should Do (Ground Truth)

**Web App (Frontend/src/pages/Rentals.jsx or similar):**

1. Show a list of available vehicles (scooties, bikes, cars, 4x4 jeeps)
2. Each card must show:
   - Real vehicle photo
   - Vehicle model name
   - Price per day (in INR ₹)
   - District / location
   - Web3 Permit Status badge: `✓ VERIFIED` (green) or `✗ UNVERIFIED` (red/grey)
   - Permit expiry date (if available)
   - "Book Now" button
3. Filter bar: Vehicle type, Price range, Location, Web3 Only toggle
4. Clicking "Book Now" → goes to booking/checkout flow
5. Clicking "Verify Permit" → calls `/api/verification/vehicle/:hash` and shows result

**Flutter App (mobile_app/lib/screens/rentals_stays_screen.dart):**

Same as above but in Flutter Material UI.

### Files to Inspect

```
Frontend/src/pages/                          ← Find Rentals page file
Frontend/src/components/RentalCard.jsx       ← Rental card component (17KB, needs review)
Frontend/src/components/rentals/             ← Rental-specific sub-components
backend/routes/                              ← Find /api/rentals route
backend/models/                              ← Find Rental/Vehicle model
mobile_app/lib/screens/rentals_stays_screen.dart ← Flutter rentals screen (66KB)
mobile_app/lib/services/api_service.dart     ← Flutter: getRentals() method
```

### Backend Fix Checklist

- [ ] `GET /api/rentals` endpoint exists and returns data
- [ ] Response includes: `id, vehicleModel, type, pricePerDay, photos, district, permitValid, vehicleHash, isWeb3Attested`
- [ ] `GET /api/rentals?type=scooty` filter works
- [ ] `GET /api/rentals?district=Rudraprayag` filter works
- [ ] `GET /api/rentals?web3Only=true` returns only web3-attested vehicles
- [ ] `GET /api/verification/vehicle/:hash` returns permit status correctly

### Frontend Fix Checklist

- [ ] Page loads vehicle list from `/api/rentals`
- [ ] Loading spinner shown while fetching
- [ ] Error state shown if API fails
- [ ] Empty state shown if no rentals match filter
- [ ] Filter bar works correctly (type, price, location, web3 toggle)
- [ ] Vehicle photo renders (use `onError` fallback — scooty/motorbike Unsplash image)
- [ ] Web3 badge shows correct color based on `isWeb3Attested` field
- [ ] "Book Now" button visible and navigates to checkout
- [ ] Mobile responsive layout (no horizontal scroll at 375px width)

### Vehicle Type Fallback Images

```
Scooty fallback: https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80
Bike fallback:   https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80
Car fallback:    https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80
Jeep fallback:   https://images.unsplash.com/photo-1519396942985-ed2e4e57cf52?auto=format&fit=crop&w=800&q=80
```

---

## ═══════════════════════════════════════════════════
## TASK 4: ESCROW SERVICE — PAYMENT LOCK → RELEASE
## ═══════════════════════════════════════════════════

**Status:** [ ] TODO  
**Priority:** HIGH  
**Estimated scope:** Medium-Large

### What Escrow Should Do (Ground Truth)

The escrow service is the **core trust mechanism** of the platform. It must work as follows:

```
BOOKING FLOW (must all work end-to-end):

Step 1: Tourist clicks "Book Now" on a verified stay or rental
Step 2: Booking is created in MongoDB with status = "pending"
Step 3: Payment order is created (Razorpay or Stripe)
Step 4: Tourist pays → payment confirmed via webhook
Step 5: Booking status changes to "confirmed", payment LOCKED in escrow
Step 6: Tourist arrives, scans QR code
Step 7: App calls /api/verification/verify-proof → returns isActive = true
Step 8: On-chain check-in recorded
Step 9: Escrow releases 90% to host, 10% platform fee
Step 10: Booking status = "completed"

REFUND FLOW (if verification fails):
Step 7b: /api/verification/verify-proof → returns isActive = false
Step 8b: Escrow triggers 100% refund to tourist
Step 9b: Booking status = "refunded", listing flagged
```

### Files to Inspect

```
backend/routes/bookings.js OR bookingRoutes.js        ← Booking creation
backend/routes/payments.js OR paymentRoutes.js        ← Payment + webhook
backend/models/Booking.js                             ← Booking schema
backend/routes/verification.js OR verificationRoutes.js ← QR verification
Frontend/src/pages/Checkout.jsx OR similar            ← Checkout page
Frontend/src/components/booking/                      ← Booking components
mobile_app/lib/screens/checkout_screen.dart           ← Flutter checkout
```

### Backend Verification Checklist

- [ ] `POST /api/bookings` creates a booking with fields: `userId, listingId, listingType, checkIn, checkOut, totalAmount, platformFee, status: "pending", escrowLocked: false`
- [ ] `POST /api/payments/create-order` returns a valid Razorpay/Stripe order ID
- [ ] `POST /api/payments/webhook` or `POST /api/payments/webhook/razorpay` updates booking status to `"confirmed"` and sets `escrowLocked: true`
- [ ] `GET /api/bookings/my-bookings` returns the tourist's booking history
- [ ] `POST /api/verification/verify-proof` accepts `{listingHash, expectedHash}` and returns `{isActive: bool, status: string}`
- [ ] When verification passes: booking status → `"completed"`, escrow flag → `false`
- [ ] When verification fails: booking status → `"refunded"`, refund triggered

### Frontend Verification Checklist

- [ ] Checkout page shows: item name, dates, price breakdown, platform fee, total
- [ ] "Escrow Protection" notice visible: "Your payment is held safely until check-in"
- [ ] Razorpay payment modal opens correctly
- [ ] After payment: success screen shows booking ID and confirmation
- [ ] Booking appears in "My Bookings" page after payment
- [ ] Web3 QR verification screen accessible from booking detail
- [ ] If verification passes: shows green "Check-In Confirmed" screen
- [ ] If verification fails: shows red "Listing Not Verified" with refund notice

### Escrow Status Display in UI

```jsx
// Booking card must show correct escrow status badge:
{booking.escrowLocked && (
  <span className="badge-amber">💰 Payment Secured in Escrow</span>
)}
{booking.status === 'completed' && (
  <span className="badge-green">✓ Check-In Confirmed — Host Paid</span>
)}
{booking.status === 'refunded' && (
  <span className="badge-red">⟳ Refund Processed — Verification Failed</span>
)}
```

---

## ═══════════════════════════════════════════════════
## TASK 5: FLUTTER APP — ALL 18 SCREENS QUALITY CHECK
## ═══════════════════════════════════════════════════

**Status:** [ ] TODO  
**Priority:** MEDIUM  
**Estimated scope:** Very Large

### For Each Screen — Run This Sub-Loop

For EVERY screen listed below, do these checks in order:

```
SUB-LOOP (run for each of the 18 screens):
  A. Open the .dart file
  B. Check: Does it make real API calls? (not hardcoded mock data)
  C. Check: Are all images using CachedNetworkImage with real fallbacks?
  D. Check: Are all buttons connected to real actions?
  E. Check: Does it handle loading state (shimmer/spinner)?
  F. Check: Does it handle error state (user-friendly message)?
  G. Check: Is the UI responsive on 375px width (no overflow)?
  H. Fix any issues found
  I. Confirm flutter analyze passes
```

### Screen-by-Screen Specific Instructions

---

#### SCREEN 1: HomeScreen (`home_screen.dart` — 50KB)

**Must have:**
- Real destination data from `GET /api/destinations`
- No hardcoded "Sample Destination" strings
- Search bar actually filters the displayed list
- Destination tiles use real Himalayan images (see Task 2)
- SOS floating button visible and tappable

**Common bugs:**
- `_destinations` list is static/hardcoded — replace with `ApiService.getDestinations()`
- Image URLs are `assets/images/placeholder.jpg` — replace with network images

---

#### SCREEN 2: MapScreen (`map_screen.dart` — 62KB)

**Must have:**
- `flutter_map` package with OSM tiles rendering correctly
- All 105 destination markers plotted correctly
- Tapping a marker shows a bottom sheet with: name, altitude, "View Details" button
- "View Details" navigates to `DestinationDetailScreen`
- User location marker if GPS permission granted

**Common bugs:**
- Map tiles not loading (check internet permission in AndroidManifest)
- Markers not tappable (check `onTap` on `MarkerLayer`)

---

#### SCREEN 3: AICopilotScreen (`ai_copilot_screen.dart` — 91KB)

**Must have:**
- Real API call to `POST /api/agent/chat` with user message
- Streaming OR full response displayed in chat bubble
- Suggested topic chips visible and functional (tap fills input)
- Voice input button present and triggers mic capture
- Loading indicator while AI is processing
- Hindi / English toggle visible

**Common bugs:**
- `WebSocketChatService` connecting to `localhost` in production — must use prod URL
- No streaming support → at minimum show typing indicator then full response
- Messages not persisted within session

---

#### SCREEN 4: SOSSafetyScreen (`sos_safety_screen.dart` — 19KB)

**CRITICAL — Must work perfectly:**
- GPS location shows in real time
- Altitude shows (or shows "Calculating...")
- Battery level shows correctly
- SOS button has hold-to-confirm (5 second press) to prevent accidents
- On confirm: calls `POST /api/safety/sos` with all telemetry
- If offline: saves to SharedPreferences queue
- Emergency contacts visible (from profile)

**Common bugs:**
- GPS permission not requested → add `permission_handler` and request on screen init
- `navigator.getBattery()` not available in Flutter → use `battery_plus` package

---

#### SCREEN 5: RentalsStaysScreen (`rentals_stays_screen.dart` — 66KB)

**Must have:**
- Two tabs: Stays and Rentals
- Stays tab: real data from `GET /api/stays`
- Rentals tab: real data from `GET /api/rentals`
- Web3 badge on each card: green for verified, grey for unverified
- "Book Now" button navigates to `CheckoutScreen`
- Real photos (not grey boxes) — use fallback system from Task 2

---

#### SCREEN 6: VerificationProofScreen (`verification_proof_screen.dart` — 13KB)

**Must have:**
- Camera/QR scanner using `mobile_scanner` package
- Scanned hash sent to `POST /api/verification/verify-proof`
- Result screen: green VERIFIED or red FAILED
- Manual hash entry text field as fallback
- Clear explanation of what the result means

---

#### SCREEN 7: CheckoutScreen (`checkout_screen.dart` — 12KB)

**Must have:**
- Booking summary with item name, dates, guests
- Price breakdown: base price, platform fee (10%), total
- "Escrow Protection" notice
- Razorpay payment integration
- After payment: confirmation screen with booking ID

---

#### SCREENS 8-18 (All Others)

For each of these screens, run the standard sub-loop above:

```
8.  LoginScreen              → auth must work, JWT saved to SharedPreferences
9.  DestinationDetailScreen  → real data, real images, weather widget
10. ActivitiesScreen         → real data from /api/activities
11. GuidesScreen             → real data from /api/guides
12. SpiritualScreen          → real data from /api/spiritual
13. CultureScreen            → real data from /api/culture
14. TripPlannerScreen        → AI plan-trip API call works
15. MyTripScreen             → saved trips from /api/trips/my-trips
16. ProfileScreen            → user data loads, emergency contacts editable
17. MainNavigationScreen     → bottom nav works, all tabs switch correctly
18. InnovationShowcaseScreen → no API calls needed, just static quality UI
```

---

## ═══════════════════════════════════════════════════
## TASK 6: GENERAL CODE QUALITY — APPLY EVERYWHERE
## ═══════════════════════════════════════════════════

**Status:** [ ] TODO  
**Priority:** MEDIUM  
**Apply to:** All files touched in Tasks 1-5

### Design System Rules (Non-Negotiable)

```
Colors:
  Primary: #0f3d2e (Deep Himalayan Emerald)
  Accent:  #059669 or #00FF88 (Bright Emerald)
  BG:      #fdfbf7 (Alpine Cream)
  Cards:   #ffffff with border #e7e5e4
  Text:    #0f172a (primary), #64748b (secondary)
  SOS:     #dc2626 (Emergency Red)

NO plain blue (#0000ff), NO plain red (#ff0000), NO generic grey (#808080)

Typography:
  Use Inter or system-ui font stack
  Headings: font-weight 800-900
  Body: font-weight 400-500

Spacing:
  Cards: rounded-2xl, p-4 to p-6
  Gap between elements: gap-4 to gap-6
  Section padding: px-4 sm:px-6 lg:px-8
```

### React Code Quality Checklist

- [ ] No `console.error` suppression (`console.error = () => {}`)
- [ ] All `useEffect` have proper cleanup functions
- [ ] All API calls inside `try/catch` with error state
- [ ] No inline `style={{}}` — use Tailwind classes only
- [ ] All images have `alt` text
- [ ] All interactive elements have `id` attributes for testing
- [ ] No hardcoded localhost URLs — use environment variable or config

### Flutter Code Quality Checklist

- [ ] No `print()` statements left in production code (use `debugPrint`)
- [ ] All `async` functions have `try/catch`
- [ ] `dispose()` method present in all StatefulWidgets that use controllers
- [ ] No `setState` called after widget disposed
- [ ] `const` constructors used wherever possible

---

## ═══════════════════════════════════════════════════
## TASK 7: BUILD VERIFICATION (Run After Every Task)
## ═══════════════════════════════════════════════════

### After Every Task Above — Run These Checks

```bash
# Web Frontend verification:
cd c:\Users\Deepanshu\Desktop\discover\Frontend
npm run build
# Expected: "Build complete" with ZERO errors
# Warnings are OK, errors are NOT

# Flutter App verification:
cd c:\Users\Deepanshu\Desktop\discover\mobile_app
flutter analyze
# Expected: "No issues found!"
flutter build apk --debug
# Expected: "Built build/app/outputs/flutter-apk/app-debug.apk"
```

### If Build Fails

```
1. Read the EXACT error message — do not guess
2. Find the file:line mentioned in the error
3. Fix only that specific issue
4. Re-run build
5. Repeat until clean
6. NEVER report "task complete" if build has errors
```

---

## ═══════════════════════════════════════════════════
## TASK COMPLETION TRACKER
## ═══════════════════════════════════════════════════

Update this table as each task is completed:

| Task | Status | Build Pass? | Notes |
|---|---|---|---|
| Task 1: Voice Agent | [ ] TODO | [ ] | |
| Task 2: Real Images | [ ] TODO | [ ] | |
| Task 3: Rentals Page | [ ] TODO | [ ] | |
| Task 4: Escrow Service | [ ] TODO | [ ] | |
| Task 5: Flutter Screens | [ ] TODO | [ ] | |
| Task 6: Code Quality | [ ] TODO | [ ] | |
| Task 7: Build Verification | [ ] TODO | [ ] | |

---

## ═══════════════════════════════════════════════════
## KNOWN BUG REGISTRY (Document All Found Bugs Here)
## ═══════════════════════════════════════════════════

Add every bug found during investigation here before fixing:

| # | Bug Description | File | Line | Severity | Fixed? |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |

---

## FINAL INSTRUCTION TO AI AGENT

```
You are Antigravity AI working on Discovery Uttarakhand.

RULES:
1. Work through tasks in EXACT order: Task 1 → 2 → 3 → 4 → 5 → 6 → 7
2. Start each task by READING the relevant files first (use view_file + grep_search)
3. Fix issues using surgical replace_file_content (never rewrite entire files)
4. After every fix, verify with: npm run build (Frontend) or flutter analyze (App)
5. If a fix breaks something else, fix that too before moving on
6. Update the Task Completion Tracker table after each task
7. Write a 3-line summary of what you changed after each task

NEVER:
- Skip a task
- Declare done without build verification
- Use placeholder images
- Hardcode localhost URLs in production-bound code
- Leave console.error or print() statements

START NOW with TASK 1: Voice Agent.
Read: Frontend/src/components/copilot/ChatGPTVoiceOverlay.jsx
```

---

*Discovery Uttarakhand — AI Agent Master PRD*
*Generated for Antigravity IDE sequential task execution*
*Version: 1.0 — Use this document as the loop prompt*
