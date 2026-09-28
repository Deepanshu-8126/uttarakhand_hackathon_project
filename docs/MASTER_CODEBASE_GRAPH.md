# Discovery Uttarakhand — Master Codebase Graph

**Generated on:** September 28, 2026  
**Type:** Complete Full-Stack Codebase Flow

```
                                  TOURIST / USER
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │          REACT 18 + VITE UI           │
                     └───────────────────┬───────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  PAGES (28)                     COMPONENTS (45)                  STATE STORES (2)
  - Home.jsx                     - Navbar.jsx                     - mapStore.js
  - Stays.jsx                    - InteractiveStayCard            - chatStore.js
  - Rentals.jsx                  - RentalCard.jsx                 - AuthContext.jsx
  - TripPlanner.jsx              - TripWorkspaceMap.jsx           - CartContext.jsx
  - MyTripPage.jsx               - PersonalizedNearYou            - FavoritesContext
  - CopilotPage.jsx              - GooglePlacesRadar              - LanguageContext
  - DestinationDetails.jsx       - SOSFloatingButton
        │                                │                                │
        └────────────────────────────────┼────────────────────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │           FRONTEND API LAYER          │
                     │          (Frontend/src/api/)          │
                     └───────────────────┬───────────────────┘
                                         │
               ├── destinationApi.js ───► GET /api/destinations
               ├── stayApi.js ──────────► GET /api/stays
               ├── rentalApi.js ────────► GET /api/rentals
               ├── tripApi.js ──────────► POST/GET /api/trips
               ├── bookingApi.js ───────► POST/GET /api/bookings
               ├── personalizedApi.js ──► GET /api/personalized/home
               └── agentApi.js ─────────► POST /api/agent/chat
                                         │
                                         ▼  HTTP (Port 5000)
                     ┌───────────────────────────────────────┐
                     │         EXPRESS SERVER & ROUTER       │
                     │          (backend/server.js)          │
                     └───────────────────┬───────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  destinationRoutes.js           stayRoutes.js                    agentRoutes.js
  (Line 120 in server.js)        (Line 125 in server.js)          (Line 146 in server.js)
        │                                │                                │
        ▼                                ▼                                ▼
  destinationExploreController   stayController.js                agentController.js
  -> getDestinations()           -> getStays()                    -> agentChat()
        │                                │                                │
        ▼                                ▼                                ▼
  destinationResolver.js         locationService.js               agentService.js
                                 -> findNearbyEntities()          -> runAgent() & agentTools
        │                                │                                │
        └────────────────────────────────┼────────────────────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │            MONGOOSE MODELS            │
                     │           (backend/models/)           │
                     └───────────────────┬───────────────────┘
                                         │
        ┌─────────────┬─────────────┬────┴────────┬─────────────┬─────────────┐
        ▼             ▼             ▼             ▼             ▼             ▼
  Destination.js   Stay.js       Rental.js     Guide.js      Booking.js    SavedTrip.js
        │             │             │             │             │             │
        └─────────────┴─────────────┴────┬────────┴─────────────┴─────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │           MONGODB DATABASE            │
                     │       (discovery_uttarakhand)         │
                     └───────────────────┬───────────────────┘
                                         │
                 ├── destinations : 129 documents
                 ├── stays        : 86 documents
                 ├── rentals      : 11 documents
                 ├── guides       : 190 documents
                 ├── activities   : 28 documents
                 ├── spirituals   : 56 documents
                 ├── cultures     : 30 documents
                 ├── transports   : 8 documents
                 ├── bookings     : 78 documents
                 ├── users        : 18 documents
                 └── savedtrips   : 4 documents
```
