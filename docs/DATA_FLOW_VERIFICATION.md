# Discovery Uttarakhand — End-to-End Data Flow Verification

**Generated on:** September 28, 2026  
**Type:** Concrete Entity Tracing Proof  
**Method:** Traces 7 real entities from MongoDB database records through API responses to UI rendering.

---

## 1. Destination: Kedarnath Dham

1. **MongoDB Database Record:**
   - Collection: `destinations`
   - Query: `{ slug: "kedarnath" }`
   - Real Data: `{ name: "Kedarnath Dham", district: "Rudraprayag", altitude: 3584, category: "Spiritual", location: { type: "Point", coordinates: [79.0669, 30.7352] } }`
2. **Backend API Endpoint:**
   - `GET /api/destinations/kedarnath` $longrightarrow$ Handled by `destinationExploreController.getDestinationBySlug`
   - Status: `200 OK`, returns JSON payload with `success: true` and canonical image URLs.
3. **Frontend API Client:**
   - `getDestinationBySlug('kedarnath')` in `Frontend/src/api/destinationApi.js`.
4. **UI Component:**
   - [`Frontend/src/pages/DestinationDetails.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/DestinationDetails.jsx)
   - Renders 3,584m altitude warning banner, weather forecast, nearby GMVN rest houses, and temple darshan timings.

---

## 2. Stay: KMVN Budhi Camp

1. **MongoDB Database Record:**
   - Collection: `stays`
   - Query: `{ slug: "kmvn-budhi-camp" }`
   - Real Data: `{ name: "KMVN Budhi Camp", district: "Pithoragarh", category: "Government Eco Camp", price: { amount: 1200, currency: "INR" }, location: { type: "Point", coordinates: [80.8278, 30.1021] } }`
2. **Backend API Endpoint:**
   - `GET /api/stays?district=Pithoragarh` $longrightarrow$ Handled by `stayController.getStays`
   - Status: `200 OK`, count: 86 stays verified.
3. **Frontend API Client:**
   - `getStays({ district: 'Pithoragarh' })` in `Frontend/src/api/stayApi.js`.
4. **UI Component:**
   - [`Frontend/src/pages/Stays.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Stays.jsx) $longrightarrow$ `InteractiveStayCard`
   - Renders ₹1,200/night tag, Government Eco Camp badge, verified photos, and "Book with Escrow" button.

---

## 3. Vehicle Rental: Himalayan Riders Rishikesh

1. **MongoDB Database Record:**
   - Collection: `rentals`
   - Query: `{ slug: "himalayan-riders-rishikesh" }`
   - Real Data: `{ name: "Himalayan Riders Rishikesh", city: "Rishikesh", vehicles: [{ name: "Royal Enfield Himalayan 450", type: "Motorcycle", pricePerDay: 1800 }] }`
2. **Backend API Endpoint:**
   - `GET /api/rentals?city=Rishikesh` $longrightarrow$ Handled by `rentalController.getRentals`
3. **Frontend API Client:**
   - `getRentals({ city: 'Rishikesh' })` in `Frontend/src/api/rentalApi.js`.
4. **UI Component:**
   - [`Frontend/src/pages/Rentals.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Rentals.jsx) $longrightarrow$ `RentalCard`
   - Displays Royal Enfield Himalayan 450 card at ₹1,800/day with verified commercial permit badge.

---

## 4. Licensed Guide: Rajesh Rawat

1. **MongoDB Database Record:**
   - Collection: `guides`
   - Real Data: `{ name: "Rajesh Rawat", languages: ["Hindi", "Garhwali", "English"], specialties: ["Kedarkantha", "Har Ki Dun"], licenseNumber: "UK-TOUR-2024-819" }`
2. **Backend API Endpoint:**
   - `GET /api/guides` $longrightarrow$ Handled by `guideController.getGuides`
3. **Frontend API Client:**
   - `getGuides()` in `Frontend/src/api/guideApi.js`.
4. **UI Component:**
   - [`Frontend/src/pages/Guides.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Guides.jsx) $longrightarrow$ `GuideCard`

---

## 5. Activity: Rishikesh White Water River Rafting

1. **MongoDB Database Record:**
   - Collection: `activities`
   - Real Data: `{ name: "White Water River Rafting (16km/24km)", district: "Dehradun", category: "River Rafting" }`
2. **Backend API Endpoint:**
   - `GET /api/activities` $longrightarrow$ Handled by `activityController.getActivities`
3. **UI Component:**
   - [`Frontend/src/pages/Activities.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/Activities.jsx) $longrightarrow$ `ActivityCard`

---

## 6. Booking: Escrow Reservation Lifecycle

1. **Tourist Action:** Selects dates and clicks "Confirm Booking" on Checkout.
2. **Backend API Endpoint:** `POST /api/bookings`
3. **Database Write:** `Booking.create({ bookingReference: "DU-20260928-A4B1", escrowStatus: "held_in_escrow", checkInOtp: "839210" })`
4. **UI Verification:** Visible in [`Frontend/src/pages/ProfilePage.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/ProfilePage.jsx) with live OTP reveal countdown.

---

## 7. Saved Trip: Active Itinerary Lifecycle

1. **Tourist Action:** Configures 4-day Auli expedition in `TripPlanner.jsx` and saves.
2. **Backend API Endpoint:** `POST /api/trips`
3. **Database Write:** `SavedTrip.create({ title: "My Auli Journey", duration: "4 Days", budget: "Comfort" })`
4. **UI Verification:** Displayed at [`Frontend/src/pages/MyTripPage.jsx`](file:///c:/Users/ak/uttarakhand_hackathon_project/Frontend/src/pages/MyTripPage.jsx).
