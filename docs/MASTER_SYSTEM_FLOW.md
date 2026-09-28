# Discovery Uttarakhand — Master System Flow
**Generated:** 2026-09-28
**Scope:** Complete End-to-End System Pipeline

```mermaid
flowchart TD
    %% User Interaction
    USER[Tourist / Host / Admin]
    
    subgraph FRONTEND ["Frontend Layer (React 19 + Vite + Tailwind CSS)"]
        PAGE[Active Page: Home / Stays / Rentals / TripPlanner / Copilot]
        COMP[UI Components: DestinationCard / StayCard / RentalCard / ChatArea]
        HOOK[Custom Hooks: useDestinations / useStays / useRentals / useSOS]
        STORE[Zustand Stores / Context: mapStore / chatStore / AuthContext / CartContext]
        API_CLIENT[API Clients: destinationApi / stayApi / agentApi / bookingApi]
    end

    subgraph TRANSPORT ["Network & Security Layer"]
        HTTP[HTTP REST / SSE Stream (Axios with Bearer Token & 30s Timeout)]
        FAILOVER[Seamless Production Failover: Localhost -> Render Production API]
    end

    subgraph BACKEND ["Backend Layer (Express 4 on Node.js)"]
        ROUTER[Express Routers: destinationRoutes / stayRoutes / agentRoutes / bookingRoutes]
        MW[Middleware: Helmet / Universal Permissive CORS / JWT authMiddleware]
        CONTROLLER[Controllers: factoryController / stayController / agentController / bookingController]
        REDIS_CACHE[(Upstash Redis Cache - TTL 600s)]
        SERVICE[Services: agentService / locationService / escrowService / web3Service]
        ADAPTERS[Adapters: openMeteoAdapter / roadAdvisoryAdapter / transitLiveAdapter]
    end

    subgraph MODELS ["Data & Model Layer (Mongoose ODM)"]
        MODEL_DEST[Destination Model]
        MODEL_STAY[Stay Model]
        MODEL_RENTAL[Rental Model]
        MODEL_PARTNER[PartnerListing Model]
        MODEL_BOOKING[Booking Model]
        MODEL_TRIP[SavedTrip Model]
        MODEL_USER[User Model]
    end

    subgraph DATABASES ["Persistent Storage"]
        MONGODB[(MongoDB Atlas Cluster)]
    end

    subgraph EXTERNAL ["External Protocols & APIs"]
        METEO[Open-Meteo Weather API]
        OSRM[OSRM Route Engine]
        AI_LLM[LLM Providers: Groq / Gemini / OmniRoute / OpenAI]
        ETH[Ethereum / Polygon Hardhat Smart Contracts via ethers.js]
    end

    %% Wiring
    USER --> PAGE
    PAGE --> COMP
    COMP --> HOOK
    COMP --> STORE
    HOOK --> API_CLIENT
    STORE --> API_CLIENT
    API_CLIENT --> HTTP
    HTTP --> FAILOVER
    FAILOVER --> MW
    MW --> ROUTER
    ROUTER --> CONTROLLER

    CONTROLLER <--> REDIS_CACHE
    CONTROLLER --> SERVICE
    SERVICE --> ADAPTERS
    ADAPTERS --> METEO
    ADAPTERS --> OSRM
    SERVICE --> AI_LLM
    SERVICE --> ETH

    CONTROLLER --> MODEL_DEST
    CONTROLLER --> MODEL_STAY
    CONTROLLER --> MODEL_RENTAL
    CONTROLLER --> MODEL_PARTNER
    CONTROLLER --> MODEL_BOOKING
    CONTROLLER --> MODEL_TRIP
    CONTROLLER --> MODEL_USER

    MODEL_DEST <--> MONGODB
    MODEL_STAY <--> MONGODB
    MODEL_RENTAL <--> MONGODB
    MODEL_PARTNER <--> MONGODB
    MODEL_BOOKING <--> MONGODB
    MODEL_TRIP <--> MONGODB
    MODEL_USER <--> MONGODB

    CONTROLLER --> HTTP
    HTTP --> STORE
    STORE --> COMP
    COMP --> USER
```
