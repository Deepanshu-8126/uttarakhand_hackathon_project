# Discovery Uttarakhand — Mobile App
## Complete PRD, Architecture & Build Guide (A to Z)

**App Name:** Discovery Uttarakhand
**Package:** `discovery_uttarakhand`
**Version:** 1.1.0+10
**Framework:** Flutter 3.x (Dart)
**Platforms:** Android (Primary), iOS (Ready)
**Description:** Pahadi Tourism & AI Travel Companion App for Uttarakhand

---

## TABLE OF CONTENTS

1. [App Overview & Purpose](#1-app-overview--purpose)
2. [Complete Screen List & Navigation Architecture](#2-complete-screen-list--navigation-architecture)
3. [Flutter Tech Stack & All Dependencies](#3-flutter-tech-stack--all-dependencies)
4. [Backend API Connection](#4-backend-api-connection)
5. [State Management Architecture](#5-state-management-architecture)
6. [Screen-by-Screen Feature Breakdown (A to Z)](#6-screen-by-screen-feature-breakdown-a-to-z)
7. [Services Layer Architecture](#7-services-layer-architecture)
8. [Data Models](#8-data-models)
9. [Theme System & Design Tokens](#9-theme-system--design-tokens)
10. [Build & APK Generation Guide](#10-build--apk-generation-guide)
11. [App Error Handling & Resilience](#11-app-error-handling--resilience)
12. [Security Architecture](#12-security-architecture)
13. [Future Features for App](#13-future-features-for-app)
14. [Module 01: Real Marketplace Data Architecture (Zero Mock Data)](#14-module-01-real-marketplace-data-architecture-zero-mock-data)
15. [Module 02: Real Razorpay Payment & Escrow State Machine](#15-module-02-real-razorpay-payment--escrow-state-machine)
16. [Module 03: Mobility Marketplace & Partner Business Operating System](#16-module-03-mobility-marketplace--partner-business-operating-system)

---

## 1. App Overview & Purpose

The Discovery Uttarakhand Flutter app is the **mobile companion** to the full Discovery Uttarakhand platform. It is built for real travelers, local guides, and Pahadi business owners who need a fast, native mobile experience on Android and iOS devices.

### Why a Native Mobile App (not just the website)?

| Reason | Details |
|---|---|
| GPS Hardware Access | Native GPS via `geolocator` for SOS emergency telemetry — far more accurate than browser GPS |
| Offline SOS Queue | App can cache distress signals and auto-send when connectivity returns |
| Camera & QR Scanner | `mobile_scanner` for instant Web3 blockchain verification of vehicle/homestay QR codes |
| Push Notifications | Receive booking confirmations, emergency alerts, and weather advisories |
| Background Service | Background telemetry pinging during active treks even with screen off |
| Native Performance | Flutter compiles to native ARM code — smoother animations than web on low-end Android |
| App Store Distribution | Easier distribution to 35 million+ Uttarakhand-visiting tourists via Play Store |

---

## 2. Complete Screen List & Navigation Architecture

### Navigation Shell

The app uses a **Bottom Navigation Bar** managed by `MainNavigationScreen` with 5 primary tabs:

```
MainNavigationScreen (Shell)
├── Tab 0: HomeScreen          (Home icon)
├── Tab 1: MapScreen           (Map icon)
├── Tab 2: AICopilotScreen     (AI Sparkle icon)
├── Tab 3: SOSSafetyScreen     (Emergency Shield icon)
└── Tab 4: ProfileScreen       (Person icon)
```

### Full Screen Hierarchy (18 Screens)

```
App Root
│
├── MainNavigationScreen         ← Bottom nav shell, manages tab state
│   ├── HomeScreen               ← Landing dashboard, destination discovery
│   ├── MapScreen                ← Full-screen interactive destination map
│   ├── AICopilotScreen          ← LangGraph AI streaming chat interface
│   ├── SOSSafetyScreen          ← Emergency SOS + live telemetry
│   └── ProfileScreen            ← User account, bookings, settings
│
├── LoginScreen                  ← Auth gate (shown if not logged in)
│
├── DestinationDetailScreen      ← Deep dive into a single destination
├── RentalsStaysScreen           ← Browse homestays + vehicle rentals
├── ActivitiesScreen             ← Adventure activity listings
├── GuidesScreen                 ← Certified mountain guide browser
├── SpiritualScreen              ← Char Dham, Panch Kedar sacred routes
├── CultureScreen                ← Pahadi heritage, festivals, crafts
├── TripPlannerScreen            ← Multi-day trip builder
├── MyTripScreen                 ← Saved trips workspace
├── CheckoutScreen               ← Production Razorpay payment + Escrow confirmation
├── VerificationProofScreen      ← Web3 QR code blockchain verifier
├── InnovationShowcaseScreen     ← Project feature showcase page
│
├── PartnerDashboardScreen       ← Partner Control Center (5-question view, bookings, earnings)
├── ListingCreationWizardScreen  ← 6-Step guided listing & fleet creation flow
├── DocumentsManagerScreen       ← Grouped compliance documents & permit manager
└── PayoutsHistoryScreen         ← Real settlement ledger and bank payout status
```

---

## 3. Flutter Tech Stack & All Dependencies

### pubspec.yaml — Current Dependencies

```yaml
name: discovery_uttarakhand
description: "Pahadi Tourism & AI Travel Companion App for Uttarakhand"
version: 1.2.0+11

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.0                    # REST API calls to Node.js backend
  web_socket_channel: ^3.0.1      # WebSocket for AI voice streaming
  provider: ^6.1.1                # State management (AuthProvider)
  cached_network_image: ^3.3.1    # Efficient network image loading with cache
  shared_preferences: ^2.2.2      # Local JWT token and settings storage
  razorpay_flutter: ^1.3.7        # Real Razorpay native checkout for Android/iOS
  url_launcher: ^6.3.0            # Direct telephone calling (tel:), WhatsApp, and maps
  geolocator: ^11.0.0             # Real-time native GPS coordinates
  mobile_scanner: ^5.1.0          # Web3 QR code scanning for listings and vehicles
  url_launcher: ^6.2.5            # Open external links (maps, WhatsApp SOS)
  intl: ^0.19.0                   # Date/time formatting for Hindi locale

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0           # Static analysis rules
```

### Recommended Additional Dependencies (To Add for Full Features)

```yaml
# GPS & Location (for SOS telemetry accuracy)
  geolocator: ^11.0.0

# QR Code Scanner (for Web3 verification)
  mobile_scanner: ^5.0.0

# Maps (for interactive Himalayan map)
  flutter_map: ^6.0.0
  latlong2: ^0.9.0

# Secure JWT storage
  flutter_secure_storage: ^9.0.0

# Local push notifications
  flutter_local_notifications: ^17.0.0

# Lottie animations (for SOS orb, AI pulse)
  lottie: ^3.0.0

# Permission handler
  permission_handler: ^11.0.0

# Battery info for SOS telemetry
  battery_plus: ^6.0.0

# Share trip itinerary
  share_plus: ^9.0.0

# Image picker for profile
  image_picker: ^1.0.0
```

---

## 4. Backend API Connection

All API calls in the app are made via `ApiService` (`lib/services/api_service.dart`).

### Base URL Configuration

```dart
// Production (Render Cloud — always live)
static const String baseUrl = 'https://uttarakhand-hackathon-project.onrender.com/api';

// Local development
// static const String baseUrl = 'http://10.0.2.2:5000/api';  // Android emulator
// static const String baseUrl = 'http://localhost:5000/api';  // iOS simulator
```

### Authentication Header Pattern

Every authenticated request sends the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

The token is stored in `SharedPreferences` after login and attached automatically by `ApiService`.

### WebSocket Connection (AI Voice)

```dart
// AI Voice WebSocket for streaming LangGraph responses
final channel = WebSocketChannel.connect(
  Uri.parse('wss://uttarakhand-hackathon-project.onrender.com/ws/voice'),
);
```

Managed by `WebSocketChatService` (`lib/services/websocket_chat_service.dart`).

---

## 5. State Management Architecture

The app uses **Provider** pattern for global state, with local `StatefulWidget` state for screen-level UI.

### Global Providers

```
MultiProvider (in main.dart)
└── ChangeNotifierProvider<AuthProvider>
      ├── isLoggedIn: bool
      ├── currentUser: UserModel?
      ├── token: String?
      ├── login(email, password) → Future<bool>
      ├── register(name, email, password, role) → Future<bool>
      └── logout() → void
```

### Screen-Level State Pattern

Each screen manages its own state with `StatefulWidget`:

```dart
class _HomeScreenState extends State<HomeScreen> {
  bool _isLoading = true;
  List<Destination> _destinations = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadDestinations();  // fetch from API on mount
  }
}
```

---

## 6. Screen-by-Screen Feature Breakdown (A to Z)

---

### Screen 1: HomeScreen (`home_screen.dart` — 50KB)

**Purpose:** Main landing dashboard. First thing user sees after login.

**What it contains:**
- Welcome header with user name and current weather
- Search bar for quick destination lookup
- "Explore Uttarakhand" horizontal destination tiles (105 destinations)
- Category quick-links: Stays, Rentals, Activities, Guides, Spiritual, Culture
- "Trending Treks" vertical card list with altitude badges
- Emergency SOS floating quick-access button
- Promotional banner for Web3 verified listings

**API Calls:**
- `GET /api/destinations?limit=12` — featured destinations
- `GET /api/live` — live weather snippet
- `GET /api/recommendations` — personalized suggestions

---

### Screen 2: MapScreen (`map_screen.dart` — 62KB)

**Purpose:** Full-screen interactive GIS map of all 105 Uttarakhand destinations.

**What it contains:**
- Leaflet-style tile map using `flutter_map` with OpenStreetMap tiles
- Destination markers with custom icons (categorized by trek, spiritual, adventure)
- Tap a marker → shows bottom sheet with destination name, altitude, and quick-action buttons
- Layer toggle: Road / Satellite / Topographic view
- Search overlay to jump to any of 105 destinations
- Distance calculator between two selected points
- Current user location marker (when GPS permission granted)
- Himalayan Corridor highlight overlays

**API Calls:**
- `GET /api/destinations?fields=name,coordinates,altitude,slug` — all map markers
- `GET /api/live/telemetry` — active trekker positions (admin view)

---

### Screen 3: AICopilotScreen (`ai_copilot_screen.dart` — 91KB)

**Purpose:** Full-featured AI travel assistant with streaming LangGraph responses.

**What it contains:**
- Chat interface with message bubbles (user + AI)
- Real-time streaming SSE/WebSocket response rendering
- Suggested topic chips: "Plan Kedarnath trip", "Best stays in Chopta", "Weather at Roopkund"
- Action cards generated by AI: "Book This Stay", "View Route Map", "Calculate Budget"
- Budget summary card with day-wise cost breakdown
- Voice input button (microphone) → sends audio to voice pipeline
- Hindi/English language toggle
- Trip save button → saves AI-generated itinerary to `/api/trips`
- Conversation history preserved across session (LangGraph MemorySaver)

**API Calls:**
- `POST /api/agent/chat` — stateful LangGraph chat
- `POST /api/ai/plan-trip` — itinerary generation
- `WS /ws/voice` — real-time voice streaming

---

### Screen 4: SOSSafetyScreen (`sos_safety_screen.dart` — 19KB)

**Purpose:** Emergency SOS interface + live trekker telemetry monitor.

**What it contains:**
- Large red SOS button with 5-second press-and-hold confirmation (prevents accidental triggers)
- Live GPS display: Latitude, Longitude, Altitude in meters
- Battery percentage indicator
- Nearest destination auto-detected from 105 canonical spots
- Network status indicator (Online / Offline — offline queues SOS)
- Emergency contact display (pull from profile)
- Active incident status tracker (RECEIVED → DISPATCHED → RESOLVED)
- Offline queue counter: shows how many SOS payloads are waiting to sync

**What happens on SOS trigger:**
1. Captures GPS + Altitude + Battery
2. If online → `POST /api/safety/sos` immediately
3. If offline → save to `SharedPreferences` queue
4. Background timer checks every 10s for network and auto-dispatches
5. Opens WhatsApp/SMS with pre-formatted emergency message + Google Maps link

---

### Screen 5: ProfileScreen (`profile_screen.dart` — 9.9KB)

**Purpose:** User account management and settings.

**What it contains:**
- User photo, name, email display
- Edit profile button → update name, contact, emergency contacts
- Emergency Contact Manager (add up to 3 contacts for SOS alerts)
- My Bookings quick link
- My Trips quick link
- Language preference (Hindi / English)
- Logout button
- App version display
- Web3 wallet address (if connected)

---

### Screen 6: LoginScreen (`login_screen.dart` — 14.8KB)

**Purpose:** Authentication gate shown when user is not logged in.

**What it contains:**
- Discovery Uttarakhand logo + branding
- Email / Password login form
- Register tab with name, email, password, role selector (Traveler / Partner)
- Form validation with inline error messages
- Login button → `POST /api/auth/login` → stores JWT
- Register button → `POST /api/auth/register`
- Forgot password placeholder

---

### Screen 7: DestinationDetailScreen (`destination_detail_screen.dart` — 23.6KB)

**Purpose:** Deep-dive information page for a single destination.

**What it contains:**
- Full-width hero image (from Pexels API or Cloudinary)
- Destination name, district, altitude badge
- Weather widget (real-time temperature and condition)
- "About" description text
- Altitude profile chart
- Best time to visit calendar
- Nearby destinations horizontal scroller
- Available activities at this destination
- Book Stay button → navigates to RentalsStaysScreen filtered by destination
- Add to Trip button → adds to current trip plan
- Add to Favorites button → `POST /api/favorites`
- Road advisory alert banner (if active)

**API Calls:**
- `GET /api/destinations/:slug` — full destination data
- `GET /api/live?destination=slug` — weather + road advisory
- `GET /api/photos/search?query=<destination>` — Pexels photos

---

### Screen 8: RentalsStaysScreen (`rentals_stays_screen.dart` — 66.4KB)

**Purpose:** Browse and filter verified homestays and vehicle rentals.

**What it contains:**

**Stays tab:**
- Filter bar: Price range, Location, Amenities, Web3 Verified only toggle
- Homestay cards with: Photo, Name, Location, Price/night, Web3 badge, Rating
- Sort by: Price (low to high), Rating, Distance
- Tap a card → shows full detail modal with photo gallery, description, amenities list
- Book Now button → goes to CheckoutScreen

**Rentals tab:**
- Vehicle cards: Scooty, Bike, Car, 4x4 Jeep listings
- Filter: Vehicle type, Price/day, Availability date, Web3 Permit Valid toggle
- Each vehicle card shows: Photo, Model, Price/day, Permit expiry date, Permit status badge
- Verify Permit button → opens VerificationProofScreen with vehicle hash
- Book Now → goes to CheckoutScreen

**API Calls:**
- `GET /api/stays` — homestay listings
- `GET /api/rentals` — vehicle rental fleet
- `GET /api/verification/vehicle/:vin` — permit status check

---

### Screen 9: ActivitiesScreen (`activities_screen.dart` — 15.9KB)

**Purpose:** Browse and book adventure activities across Uttarakhand.

**What it contains:**
- Activity category chips: Trekking, Rafting, Paragliding, Skiing, Camping, Yoga
- Activity cards with: Name, Location, Duration, Difficulty level badge, Price
- Availability calendar picker
- Group size selector
- Book Activity button → CheckoutScreen

**API Calls:**
- `GET /api/activities` — activity listings

---

### Screen 10: GuidesScreen (`guides_screen.dart` — 16.4KB)

**Purpose:** Find and book certified local Pahadi mountain guides.

**What it contains:**
- Guide profile cards: Photo, Name, Languages spoken, Speciality treks, Rating, Years of experience
- Filter: Trek type, Language, Availability, Certification type
- Guide detail modal: Bio, certifications, past trek reviews
- Book Guide button → CheckoutScreen with guide details

**API Calls:**
- `GET /api/guides` — guide listings

---

### Screen 11: SpiritualScreen (`spiritual_screen.dart` — 14.4KB)

**Purpose:** Sacred circuits and pilgrimage routes of Uttarakhand.

**What it contains:**
- Char Dham circuit: Badrinath, Kedarnath, Gangotri, Yamunotri route map
- Panch Kedar: Kedarnath, Tungnath, Rudranath, Madhyamaheshwar, Kalpeshwar
- Hemkund Sahib Sikh pilgrimage route
- Temple detail cards with: Photo, Altitude, Best visit months, Nearest helipad
- Weather and road advisory for each pilgrimage route
- Book Yatra Package button

**API Calls:**
- `GET /api/spiritual` — sacred circuit data

---

### Screen 12: CultureScreen (`culture_screen.dart` — 12.2KB)

**Purpose:** Pahadi cultural heritage, festivals, and local experiences.

**What it contains:**
- Festival calendar (Kumaoni Holi, Nanda Devi Raj Jat, Phool Dei)
- Local handicraft showcase (Ringal bamboo, Aipan art, Thulma weaving)
- Pahadi cuisine spotlight (Aloo ke Gutke, Kafuli, Jhangora Kheer)
- Cultural experience bookings (local cooking class, folk dance workshop)

**API Calls:**
- `GET /api/culture` — cultural content

---

### Screen 13: TripPlannerScreen (`trip_planner_screen.dart` — 12.9KB)

**Purpose:** Multi-day trip builder with AI assistance.

**What it contains:**
- Origin selector
- Destination multi-select (from 105 canonical spots)
- Duration picker (1 to 30 days)
- Budget slider (Rs 2,000 to Rs 1,00,000)
- Preferences chips: Adventure, Spiritual, Relaxation, Photography, Family
- Generate with AI button → calls LangGraph plan-trip API
- Day-wise itinerary display with edit capability
- Save Trip button → `POST /api/trips`
- Share button → generates shareable link

**API Calls:**
- `POST /api/ai/plan-trip` — AI itinerary generation
- `POST /api/trips` — save trip
- `GET /api/budget` — budget estimate

---

### Screen 14: MyTripScreen (`my_trip_screen.dart` — 9KB)

**Purpose:** Saved trips workspace and progress tracker.

**What it contains:**
- List of all saved trips with: Name, Start date, Number of destinations, Status
- Trip progress tracker (planning / ongoing / completed)
- Open trip → shows full day-wise itinerary with map preview
- Delete trip option
- Resume from last viewed day

**API Calls:**
- `GET /api/trips/my-trips` — user's saved trips
- `DELETE /api/trips/:id` — delete trip

---

### Screen 15: CheckoutScreen (`checkout_screen.dart` — 12.4KB)

**Purpose:** Booking confirmation and payment processing.

**What it contains:**
- Booking summary: Item name, dates, number of guests, price breakdown
- Platform fee display (10%)
- Total amount
- Payment method selector: UPI (Razorpay), Card (Stripe), Net Banking
- Apply coupon code field
- Pay Now button → initiates payment order
- On success: Shows booking confirmation with ID
- On failure: Shows error with retry option
- Booking Escrow notice: "Your payment is secured until check-in"

**API Calls:**
- `POST /api/bookings` — create booking
- `POST /api/payments/create-order` — get payment order ID
- Razorpay Flutter SDK for payment UI

---

### Screen 16: VerificationProofScreen (`verification_proof_screen.dart` — 13.3KB)

**Purpose:** Web3 blockchain QR verification reader. Scan any QR code on a homestay or scooty to verify its on-chain authenticity.

**What it contains:**
- Camera viewfinder with QR scan overlay
- Scan a listing/vehicle QR code → sends hash to blockchain verification API
- Result screen:
  - VERIFIED (green): Shows listing name, verifier wallet, block timestamp, version number
  - FAILED (red): "This listing is NOT verified. Do not proceed with booking."
  - EXPIRED: "Vehicle permit has expired. This vehicle cannot be rented legally."
- Manual entry fallback (type hash code instead of scanning)
- Share verification result as screenshot

**API Calls:**
- `GET /api/verification/vehicle/:vin` — vehicle permit check
- `GET /api/verification/partner/:address` — partner listing check
- `POST /api/verification/verify-proof` — hash validation

---

### Screen 17: MainNavigationScreen (`main_navigation_screen.dart` — 9.8KB)

**Purpose:** Bottom navigation shell that wraps all 5 primary tabs.

**What it contains:**
- `IndexedStack` preserving scroll position of each tab when switching
- Bottom nav bar with 5 items: Home, Map, AI Copilot, SOS, Profile
- SOS tab has a red accent indicator — always visible for emergency access
- Login gate: if not logged in, shows LoginScreen overlay instead of content

---

### Screen 18: InnovationShowcaseScreen (`innovation_showcase_screen.dart` — 19.6KB)

**Purpose:** Full showcase of project features and innovations — great for demo/judging.

**What it contains:**
- Technology stack visual cards
- AI feature demonstrations with screenshots
- Web3 blockchain explanation with animated flow diagram
- SOS workflow visual explainer
- Partner Hub feature highlight
- Project metrics (105 destinations, 35M tourists, 90% revenue to partners)
- Team credits

---

## 7. Services Layer Architecture

### ApiService (`lib/services/api_service.dart` — 59KB)

The central HTTP client managing all backend communication.

```dart
class ApiService {
  static const String baseUrl = 'https://uttarakhand-hackathon-project.onrender.com/api';

  // Auth
  static Future<Map<String,dynamic>> login(String email, String password)
  static Future<Map<String,dynamic>> register(String name, String email, String password, String role)

  // Destinations
  static Future<List<Destination>> getDestinations({String? query, int limit})
  static Future<Destination> getDestinationBySlug(String slug)

  // Stays & Rentals
  static Future<List<Stay>> getStays({String? location, double? maxPrice})
  static Future<List<Rental>> getRentals({String? type, bool? web3Only})

  // AI & Voice
  static Future<String> askCopilot(String message, String? sessionId)
  static Future<Map> planTrip(String origin, List<String> destinations, int days, double budget)

  // SOS Safety
  static Future<void> sendSOS({required double lat, required double lng, required double altitude, required double battery})

  // Trips
  static Future<List<Trip>> getMyTrips()
  static Future<Trip> saveTrip(Map<String,dynamic> tripData)

  // Bookings & Payments
  static Future<Map> createBooking(Map<String,dynamic> bookingData)
  static Future<Map> createPaymentOrder(double amount, String currency)

  // Web3 Verification
  static Future<Map> verifyPartner(String walletAddress)
  static Future<Map> verifyVehicle(String vehicleHash)
}
```

### AuthProvider (`lib/services/auth_provider.dart` — 4.7KB)

ChangeNotifier for global auth state:

```dart
class AuthProvider extends ChangeNotifier {
  bool isLoggedIn = false;
  UserModel? currentUser;
  String? token;

  Future<bool> login(String email, String password)
  Future<bool> register(String name, String email, String password, String role)
  void logout()
  Future<void> loadFromStorage()   // called at app startup to restore session
}
```

### WebSocketChatService (`lib/services/websocket_chat_service.dart` — 3.7KB)

Manages WebSocket connection for streaming AI chat:

```dart
class WebSocketChatService {
  WebSocketChannel? _channel;

  void connect(String sessionId)
  void sendMessage(String message)
  Stream<String> get messageStream   // stream of AI response deltas
  void disconnect()
}
```

---

## 8. Data Models (`lib/models/`)

### UserModel
```dart
class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;             // 'traveler' | 'partner' | 'admin'
  final String? avatarUrl;
  final List<String> emergencyContacts;
  final String? walletAddress;
}
```

### Destination
```dart
class Destination {
  final String id;
  final String name;
  final String slug;
  final String district;
  final double altitude;         // meters above sea level
  final double lat;
  final double lng;
  final String description;
  final String heroImageUrl;
  final String category;         // trek | spiritual | adventure | nature
  final List<String> bestMonths;
  final String difficulty;       // easy | moderate | difficult
}
```

### Stay
```dart
class Stay {
  final String id;
  final String name;
  final String location;
  final double pricePerNight;
  final List<String> photos;
  final double rating;
  final List<String> amenities;
  final bool isWeb3Verified;
  final String? verificationHash;
  final String? ownerName;
}
```

### Rental
```dart
class Rental {
  final String id;
  final String vehicleModel;
  final String type;             // scooty | bike | car | 4x4
  final double pricePerDay;
  final String photo;
  final bool permitValid;
  final String? permitExpiry;
  final String vehicleHash;      // for blockchain verification
  final bool isWeb3Attested;
}
```

### Booking
```dart
class Booking {
  final String id;
  final String itemId;
  final String itemType;         // stay | rental | activity | guide
  final DateTime checkIn;
  final DateTime checkOut;
  final double totalAmount;
  final double platformFee;
  final String status;           // pending | confirmed | completed | cancelled
  final bool escrowLocked;
}
```

### SOSPayload
```dart
class SOSPayload {
  final double latitude;
  final double longitude;
  final double altitude;
  final double batteryLevel;
  final bool isCharging;
  final String nearestDestination;
  final DateTime timestamp;
  final String? userId;
}
```

---

## 9. Theme System & Design Tokens (`lib/theme/app_theme.dart`)

The app uses a clean Alpine Light theme matching the web platform:

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Primary Brand | `Color(0xFF0F3D2E)` | Buttons, headers, accents |
| Secondary Accent | `Color(0xFF059669)` | Badges, success states |
| Background | `Color(0xFFFDFBF7)` | Main screen backgrounds |
| Surface / Card | `Color(0xFFFFFFFF)` | Cards, modals, sheets |
| Text Primary | `Color(0xFF0F172A)` | Headlines, body text |
| Text Secondary | `Color(0xFF64748B)` | Subtitles, captions |
| SOS Red | `Color(0xFFDC2626)` | Emergency button, danger states |
| Border | `Color(0xFFE7E5E4)` | Card borders, dividers |

### Typography Scale

```dart
static const TextStyle heading1 = TextStyle(
  fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)
);
static const TextStyle heading2 = TextStyle(
  fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)
);
static const TextStyle body = TextStyle(
  fontSize: 14, fontWeight: FontWeight.w400, color: Color(0xFF1C1917)
);
static const TextStyle caption = TextStyle(
  fontSize: 12, fontWeight: FontWeight.w400, color: Color(0xFF64748B)
);
static const TextStyle badge = TextStyle(
  fontSize: 10, fontWeight: FontWeight.w700
);
```

### Standard Component Styles

```dart
// Primary button
ElevatedButton.styleFrom(
  backgroundColor: Color(0xFF0F3D2E),
  foregroundColor: Colors.white,
  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
  padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
)

// Card style
Container(
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: Color(0xFFE7E5E4)),
    boxShadow: [BoxShadow(blurRadius: 8, color: Colors.black.withOpacity(0.04))]
  )
)

// Web3 Verified Badge
Container(
  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 3),
  decoration: BoxDecoration(
    color: Color(0xFFECFDF5),
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: Color(0xFFBBF7D0))
  ),
  child: Text('✓ VERIFIED', style: TextStyle(color: Color(0xFF059669), fontSize: 10, fontWeight: FontWeight.w700))
)
```

---

## 10. Build & APK Generation Guide

### Prerequisites

```
Flutter SDK: 3.x or higher
Dart SDK: >=3.0.0 <4.0.0
Java: JDK 17
Android SDK: API 21+ (target: API 34)
Gradle: 8.x
```

### Build Commands

```bash
# 1. Get all dependencies
flutter pub get

# 2. Check for issues
flutter analyze

# 3. Build debug APK (for testing)
flutter build apk --debug

# 4. Build release APK (for distribution)
flutter build apk --release

# 5. Build App Bundle (for Play Store)
flutter build appbundle --release

# 6. Run on connected Android device
flutter run --release

# Output APK location:
# build/app/outputs/flutter-apk/app-release.apk
```

### BUILD_APK.bat (Windows One-Click Build)

The project includes `BUILD_APK.bat` in `mobile_app/` for one-click Windows APK generation.

### Android Manifest Permissions Required

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Internet access for API calls -->
<uses-permission android:name="android.permission.INTERNET"/>

<!-- GPS for SOS telemetry -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>

<!-- Camera for QR scanning -->
<uses-permission android:name="android.permission.CAMERA"/>

<!-- Microphone for voice bot -->
<uses-permission android:name="android.permission.RECORD_AUDIO"/>

<!-- Vibration for SOS confirmation -->
<uses-permission android:name="android.permission.VIBRATE"/>

<!-- Background location for trekker telemetry -->
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>

<!-- Wake lock for background trek tracking -->
<uses-permission android:name="android.permission.WAKE_LOCK"/>
```

### Minimum SDK Version

```gradle
android {
  defaultConfig {
    minSdk = 21        // Android 5.0 Lollipop — covers 99.5% of Android devices
    targetSdk = 34     // Android 14
    compileSdk = 34
  }
}
```

---

## 11. App Error Handling & Resilience

### Global Error Widget

`main.dart` defines a custom `ErrorWidget.builder` that shows a clean branded error screen instead of the red Flutter error screen:

```dart
ErrorWidget.builder = (FlutterErrorDetails details) {
  return Material(
    color: Color(0xFFFDFBF7),
    child: Center(
      child: Column(children: [
        Icon(Icons.terrain, size: 54, color: Color(0xFF1A4331)),
        Text('Discover Uttarakhand'),
        Text('Loading mountain records...'),
      ])
    )
  );
};
```

### Network Error Handling Pattern

Every API call wraps in try/catch with user-facing error feedback:

```dart
try {
  final destinations = await ApiService.getDestinations();
  setState(() => _destinations = destinations);
} on SocketException {
  setState(() => _error = 'No internet connection. Check your signal.');
} on TimeoutException {
  setState(() => _error = 'Server is taking too long. Try again.');
} catch (e) {
  setState(() => _error = 'Something went wrong. Please retry.');
}
```

### SOS Offline Resilience

```dart
// If network is unavailable:
await SharedPreferences.getInstance()
  .then((prefs) {
    final queue = prefs.getStringList('sos_queue') ?? [];
    queue.add(jsonEncode(sosPayload.toJson()));
    prefs.setStringList('sos_queue', queue);
  });

// Background retry timer (every 10 seconds):
Timer.periodic(Duration(seconds: 10), (timer) async {
  if (await hasConnectivity()) {
    await _flushSOSQueue();
    timer.cancel();
  }
});
```

---

## 12. Security Architecture

| Security Measure | Implementation |
|---|---|
| JWT Token Storage | `SharedPreferences` (upgrade to `flutter_secure_storage` for production) |
| HTTPS Only | All API calls use `https://` — no plain HTTP |
| Token Expiry Handling | 401 response clears token and redirects to LoginScreen |
| Input Validation | All form fields validated before API submission |
| QR Hash Integrity | Web3 hash verified against on-chain record — cannot be spoofed |
| No Hardcoded Keys | API keys stored in environment config, not source code |
| Crash Reporting | `runZonedGuarded` catches all uncaught exceptions and logs them |

---

## 13. Future Features for App

| # | Feature | Implementation Plan |
|---|---|---|
| 1 | Push Notifications | Firebase Cloud Messaging (FCM) for booking alerts and SOS updates |
| 2 | Offline Maps | Cache map tiles with `flutter_map_tile_caching` for zero-network trekking |
| 3 | Augmented Reality Trails | ARCore (Android) overlay altitude and weather on camera view |
| 4 | Health Monitoring | `health` package connects to Google Fit / Samsung Health for SpO2 and heart rate at altitude |
| 5 | In-App Camera | Capture and upload homestay photos directly to Cloudinary from app |
| 6 | NFT Trekking Badges | Claim on-chain completion badge after finishing a verified trek route |
| 7 | Garhwali & Kumaoni Voice | Add regional Pahadi language support to Voice Bot |
| 8 | Offline AI Responses | Cache frequent trek FAQ responses for offline use |
| 9 | Satellite SOS | Integrate with Garmin inReach or Spot X satellite messenger API |
| 10 | Live Trekker Group | Create and join trekking groups, share live GPS with group members |

## 14. Module 01: Real Marketplace Data Architecture (Zero Mock Data)

The Discovery Uttarakhand mobile app must strictly operate on **real production data** from MongoDB. No hardcoded arrays, demo objects, or placeholder destinations are allowed in production.

### Data Collection Sources
| Marketplace Entity | Backend Endpoint | Source Collection | Production Standard |
|---|---|---|---|
| Destinations | `GET /api/destinations` | `destinations` | 105 official Uttarakhand spots with real coordinates & district mappings |
| Homestays & Stays | `GET /api/stays` | `stays` + verified `partnerlistings` | KMVN/GMVN state properties and verified local homestays |
| Vehicle Fleet | `GET /api/rentals` | `rentals` + verified `partnerlistings` | Real commercial bikes, scooties, SUVs, and mountain taxis |
| Mountain Guides | `GET /api/guides` | `guides` | Licensed, local certified mountaineering & trek guides |
| Adventure Activities | `GET /api/activities` | `activities` | Government-permitted rafting, paragliding, and camping operators |

### Image & Asset Resolution Rules
- **Cloudinary URLs:** Direct HTTPS URLs (`https://res.cloudinary.com/...`) loaded via `CachedNetworkImage` with memory/disk caching.
- **Local Fallback Assets:** If an entity has no cloud URL, use categorical SVG brand badges:
  - Stay: `/assets/kmvn-stay.svg`
  - Vehicle: `/assets/rental-bike.svg`
  - Guide: `/assets/guide-badge.svg`
- **Zero Broken Links:** Never render a broken image URL. Always provide an `errorWidget` with mountain-themed placeholder.

---

## 15. Module 02: Real Razorpay Payment & Escrow State Machine

Mobile checkout integrates native Razorpay checkout with strict backend server-authoritative price verification and HMAC-SHA256 signature checking.

### Payment Flow Diagram
```
Mobile App (Flutter)                    Node.js Backend                    Razorpay Gateway
       │                                       │                                  │
       ├── 1. POST /api/payments/create-order ─►                                  │
       │      (Sends bookingId)                ├── 2. Calculates real fare        │
       │                                       ├── 3. Creates Order (Paise) ──────►
       │                                       │◄── 4. Returns orderId ───────────┤
       │◄── 5. Returns orderId, amount, keyId ─┤                                  │
       │                                                                          │
       ├── 6. Opens Razorpay Native SDK Sheet ────────────────────────────────────►
       │      (User completes UPI/Card/NetBanking payment)                        │
       │◄── 7. Returns paymentId, signature ──────────────────────────────────────┤
       │                                                                          │
       ├── 8. POST /api/payments/verify-signature ──►                             │
       │      (orderId, paymentId, signature)  ├── 9. Verifies HMAC-SHA256        │
       │                                       ├── 10. Marks CAPTURED & Escrow    │
       │◄── 11. Confirmation & Escrow Status ──┤                                  │
```

### Flutter Native Razorpay Integration (`razorpay_flutter`)
```dart
import 'package:razorpay_flutter/razorpay_flutter.dart';

class PaymentController {
  late Razorpay _razorpay;

  void initialize() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  void launchCheckout({
    required String orderId,
    required int amountInPaise,
    required String contact,
    required String email,
  }) {
    var options = {
      'key': const String.fromEnvironment('RAZORPAY_KEY_ID', defaultValue: 'rzp_test_...'),
      'amount': amountInPaise,
      'name': 'Discovery Uttarakhand',
      'description': 'Booking Reservation Escrow',
      'order_id': orderId,
      'prefill': {'contact': contact, 'email': email},
      'theme': {'color': '#0f3d2e'}
    };
    _razorpay.open(options);
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    // Call backend verify signature
    final verified = await ApiService.verifyPaymentSignature(
      orderId: response.orderId!,
      paymentId: response.paymentId!,
      signature: response.signature!,
    );
    if (verified) {
      // Navigate to BookingConfirmationScreen
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    // Show user-friendly retry snackbar
  }
}
```

### Escrow State Machine
- **`CREATED`**: Initial order generated on server; payment pending.
- **`CAPTURED`**: Signature authentic; funds locked in platform escrow (`HELD_IN_ESCROW`).
- **`RELEASED_TO_PARTNER`**: Booking completed / tourist checked in; payout available to host.
- **`REFUNDED_TO_TRAVELER`**: Booking cancelled within policy; funds returned via Razorpay refund API.

---

## 16. Module 03: Mobility Marketplace & Partner Business Operating System

The mobile app must support a dedicated **Partner Mode** for local homestay owners, taxi operators, guides, and future mobility drivers.

### 1. Capability-Based Partner Control Center (`PartnerDashboardScreen`)
Instead of an enterprise admin panel, the mobile screen strictly answers the **5 Essential Business Questions**:
1. **Is my business active?**
   - Live badge: `"Live & Active ✓"` or `"Under Review ⏳"`.
2. **Do I have anything that needs attention?**
   - High-priority action cards: `"Upload vehicle permit"`, `"Confirm guest check-in"`, `"Fix rejected listing"`.
3. **Do I have upcoming bookings?**
   - Next booking card with customer name, dates, guests count, amount, and direct `"Call Guest"` action.
4. **How much have I earned?**
   - Realized earnings this month in ₹, completed bookings counter, and average customer rating.
5. **What should I do next?**
   - Quick action buttons: `[ + Add Service ]`, `[ View Bookings ]`, `[ My Business ]`.

### 2. 6-Step Guided Service Creation Wizard (`ListingCreationWizardScreen`)
Local partners must never face a 40-field scrolling form. The app guides them step-by-step:
- **Step 1: Category** — Homestay/Hotel, Car/Taxi, Bike/Scooty, Local Guide, Activity.
- **Step 2: Basic Info** — Property/Vehicle name, District, Town, Landmark, Description.
- **Step 3: Photos** — Mobile camera/gallery multi-photo upload to Cloudinary.
- **Step 4: Pricing** — Tariff per night/day/person, refundable deposit.
- **Step 5: Availability** — Fleet count / room count, guest capacity.
- **Step 6: Review & Submit** — Live preview card with `Save Draft` or `Submit for Verification`.

### 3. Customer Reservations with Direct Calling
- Uses `url_launcher` package to initiate one-tap phone calls (`tel:${booking.customerPhone}`) between host and tourist.
- Filter tabs: **Upcoming**, **Today**, **Completed**, **Cancelled**.
- Collapsible modal for technical payment IDs and ledger entries (progressive disclosure).

### 4. 3-Bucket Income Clarity & Payouts (`PayoutsHistoryScreen`)
- **Available to you:** Ready for next scheduled bank payout.
- **Processing:** Booking active; clears upon completion.
- **Already paid out:** Transferred to registered bank account.
- **Payout History:** Ledger showing date, amount, reference, and bank clearance status.

### 5. Categorized Compliance Hub (`DocumentsManagerScreen`)
- **Business Credentials:** MSME, Uttarakhand Tourism Registration, GST.
- **Vehicle Permits:** RC, Commercial Driving License, Hill Route Permit, Insurance.
- **Identity Proofs:** Aadhaar, Passport, Operating Address Lease.
- Status indicators: `Verified ✓`, `Expires Soon ⚠`, `Under Review ●`, `Required`.

### 6. Future Mobility Marketplace Readiness
The Flutter models and navigation support future transport extensions without rewrite:
- `partnerType`: `TransportOperator`, `MobilityPartner`, `DriverPartner`, `SharedRideOperator`.
- `listingType`: `Transport`, `Mobility`, `SharedRide`, `PrivateRide`, `MultiDayTrip`.
- Route Corridors: Fixed high-altitude hill corridors (Rishikesh ➔ Joshimath, Kathgodam ➔ Munsiyari).

---

## Key App Metrics

| Metric | Current Value |
|---|---|
| Total Screens | 22 (18 Traveler + 4 Partner Control Center) |
| Total Services | 4 (ApiService, AuthProvider, PaymentService, WebSocketChatService) |
| Data Models | 9 (User, Destination, Stay, Rental, Guide, Activity, Booking, Payment, PartnerDocument) |
| API Endpoint Methods | 35+ in ApiService |
| App Version | 1.2.0 build 11 |
| Min Android SDK | API 21 (Android 5.0) |
| Target Android SDK | API 34 (Android 14) |
| Flutter SDK | 3.x (Dart >= 3.0.0) |
| Dependencies | 11 production dependencies |
| APK Build Command | `flutter build apk --release` |
| Build Script | `BUILD_APK.bat` (Windows one-click) |

---

*Discovery Uttarakhand Mobile App — Complete PRD & Architecture Document*
*Version 1.2.0 — Flutter Android/iOS App*

