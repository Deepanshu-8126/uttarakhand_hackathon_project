# 🏔️ Discovery Uttarakhand — 20+ Master Judge Test Cases

This document details all test cases prepared for hackathon judging. Every scenario is backed by real local database records, live Geoapify Satellite Places, Grok/Gemini AI fallbacks, and the peer-to-peer Community Rescue Grid.

---

## 📍 SECTION A: Map & Search Scenarios (Google Maps Grade)

### Test Case 1: Verified Destination Query (`Kedarnath`)
- **Query:** `Kedarnath`
- **Expected Outcome:**
  - Green verified pin on live map.
  - Altitude: `3,583m` AMS advisory badge.
  - Live weather widget (temperature, wind, condition).
  - One-click "Add to My Trip" and "Explore Details".

### Test Case 2: Unlisted / Remote Village (`Unknown village - Kichha`)
- **Query:** `Kichha` (or any remote Udham Singh Nagar town)
- **Expected Outcome:**
  - Live Geoapify Satellite Places radar fetches exact coordinates.
  - Pin displayed on map with gray radar indicator (`isLiveRadar: true`).
  - Gemini AI provides localized context: *"Industrial & transit hub in Udham Singh Nagar district..."*
  - Zero "Not Found" error screen.

### Test Case 3: Nearby Hotels at Current Coordinate
- **Query:** `near hotels` (while standing at Kichha or any waypoint)
- **Expected Outcome:**
  - Geoapify queries 5km accommodation radius.
  - Shows real hotels & guest lodges with blue amenity pins.

### Test Case 4: Budget Stays Filter
- **Query:** `budget hotels near Kedarnath`
- **Expected Outcome:**
  - Filters verified homestays & lodges with price tag under ₹1,500/night.
  - Shows GMVN dormitories and local Pahadi homestays.

### Test Case 5: Two-Wheeler / Bike Rentals
- **Query:** `bike rentals near Rishikesh`
- **Expected Outcome:**
  - Rentals tab activates.
  - Displays verified Royal Enfield Himalayan & Scooty fleet from Tapovan / Laxman Jhula partners.
  - Daily rate and pickup checkpoint displayed.

### Test Case 6: Local Dhabas & Catering
- **Query:** `dhabas near me`
- **Expected Outcome:**
  - Geoapify `catering.restaurant` / `catering.fast_food` layer fetches local roadside eateries serving authentic Garhwali & Kumaoni food.

### Test Case 7: Emergency Banking & Cash
- **Query:** `ATM near Badrinath`
- **Expected Outcome:**
  - Displays high-altitude SBI / PNB ATMs along Joshimath-Badrinath highway.
  - Live operational status and cash alert tip.

### Test Case 8: Fuel & EV Stations
- **Query:** `petrol pump near my location`
- **Expected Outcome:**
  - Locates nearest Indian Oil / HPCL pump along mountain highway.

---

## 🏡 SECTION B: Rentals, Homestays & Stays

### Test Case 9: Ultra-Budget Stays
- **Query:** `homestay under 1000`
- **Expected Outcome:**
  - Displays verified village homestays and backpacker dorms with price filter `< ₹1,000`.
  - Escrow security guarantee badge visible.

### Test Case 10: GMVN Government & Eco Lodges
- **Query:** `GMVN near Auli`
- **Expected Outcome:**
  - Shows GMVN Ski Resort Auli & Joshimath tourist rest houses.

### Test Case 11: High-Altitude Camping
- **Query:** `Camps in Chopta`
- **Expected Outcome:**
  - Filters `Accommodation.camp` category with meadow tents and stargazing dome camps near Tungnath base.

---

## 🤖 SECTION C: AI Trip Copilot (Gemini + Grok Intelligence)

### Test Case 12: Hidden / Unlisted Himalayan Spots
- **Query:** `"Kedarnath ka hidden waterfall kaunsa hai?"`
- **Expected Outcome:**
  - Copilot replies using Gemini mountain knowledge: identifies *Vasuki Tal cascade & Chorabari glacial falls*.
  - Clearly tags as: *"✨ Unverified AI Mountain Intelligence — Consult Certified Guide"*.

### Test Case 13: Live Geo-Location Weather
- **Query:** `"Meri location ka weather kya hai?"`
- **Expected Outcome:**
  - Integrates OpenWeather live temperature, humidity, rainfall probability, and terrain advisory.

### Test Case 14: Live Snow & Ski Conditions
- **Query:** `"Auli me abhi snow hai kya?"`
- **Expected Outcome:**
  - Copilot provides live seasonal snow report for Auli slopes (elevation 2,800m - 3,050m) and chairlift status.

### Test Case 15: Multimodal Routing Between Towns
- **Query:** `"Kichha se Kedarnath kaise jau?"`
- **Expected Outcome:**
  - Step-by-step corridor: Kichha ➔ Haldwani ➔ Srinagar Garhwal ➔ Rudraprayag ➔ Gaurikund ➔ 16km trek.
  - Interactive "View Corridor on Map" button.

### Test Case 16: Dietary & Pure Veg Guide
- **Query:** `"Vegetarian food near Valley of Flowers?"`
- **Expected Outcome:**
  - Recommends Ghangaria langar and certified pure veg dhabas along Bhyundar valley.

---

## 🚨 SECTION D: Community Rescue Grid & Live SOS (USP)

### Test Case 17: Trekker Real-Time GPS Simulation
- **Action:** Open `/trekker` ➔ Click `[START MY TREK]`.
- **Expected Outcome:**
  - Real-time GPS movement simulated along Kedarnath trail every 3 seconds.
  - Live coordinates, elevation (3,583m), and battery (27% Low) written to `localStorage`.

### Test Case 18: Instant Cross-Tab Distress Broadcast
- **Action:** In `/trekker` click `[🚨 BROADCAST SOS TO GRID]`. Open `/rescue-ops` in Tab 2.
- **Expected Outcome:**
  - Tab 2 instantly lights up in red: `TRK-82341 MISSING - Need Immediate Help`.
  - 0ms latency cross-tab synchronization with zero cloud dependency.

### Test Case 19: Certified Guide Radar Reception
- **Action:** Open `/guide` (Guide Ramesh Rawat) in Tab 3.
- **Expected Outcome:**
  - Red Alert Card pops up: *"🚨 Aryan Negi — 1.2km away — SOS active"*.
  - Guide clicks `[⚡ I AM GOING TO RESCUE]` ➔ All tabs show: *"Guide Ramesh Rawat dispatched (ETA 18 mins)"*.

### Test Case 20: Offline Mesh Simulation
- **Action:** Turn off Wi-Fi or click `[Simulate Offline]`.
- **Expected Outcome:**
  - Platform transitions to "Offline Mesh Mode".
  - SOS beacon queues in local memory and triggers P2P packet relay.

---

## 🌟 SECTION E: Judge Edge Cases & Polish

### Test Case 21: Empty Search Input
- **Query:** ` ` (Empty click on search bar)
- **Expected Outcome:**
  - Displays curated "Trending Himalayan Destinations" (Kedarnath, Auli, Rishikesh, Valley of Flowers, Nainital, Mussoorie) instead of a blank screen.

### Test Case 22: Random / Gibberish Input
- **Query:** `asdfghjkl`
- **Expected Outcome:**
  - AI Assistant message: *"I couldn't find an exact match for 'asdfghjkl', but here are Uttarakhand's most popular exploration hubs:"* followed by top verified cards. Never a dead 404.

### Test Case 23: Devanagari Hindi Search
- **Query:** `केदारनाथ के पास सस्ता होटल`
- **Expected Outcome:**
  - Automatically transliterates and matches Kedarnath budget stays with Hindi interface greeting.

### Test Case 24: Proximity Voice Command
- **Query:** `"show me cheap stays near me in 500m"`
- **Expected Outcome:**
  - Parses proximity intent (`500m`) and price intent (`cheap`) to rank nearest low-cost homestays.
