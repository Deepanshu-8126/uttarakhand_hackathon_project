# Discovery Uttarakhand — Backend Route Map
**Generated:** 2026-09-28
**Total Express Routes:** 225
**Base Server Port:** 5000 (Mounted via `backend/server.js`)

### `GET` /api/activities/
- **Method:** `GET`
- **Path:** `/api/activities/` or `/activities/`
- **Route File:** `backend/routes/activityRoutes.js:16`
- **Middleware:** `None (Public)`
- **Controller:** `getActivities`
- **Service:** `backend/services/activityService.js` (or direct controller query)
- **Model:** `Activity`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for / in backend/routes/activityRoutes.js

### `POST` /api/activities/
- **Method:** `POST`
- **Path:** `/api/activities/` or `/activities/`
- **Route File:** `backend/routes/activityRoutes.js:17`
- **Middleware:** `protect, adminOnly`
- **Controller:** `createActivity`
- **Service:** `backend/services/activityService.js` (or direct controller query)
- **Model:** `Activity`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for / in backend/routes/activityRoutes.js

### `GET` /api/activities/:slug/related
- **Method:** `GET`
- **Path:** `/api/activities/:slug/related` or `/activities/:slug/related`
- **Route File:** `backend/routes/activityRoutes.js:18`
- **Middleware:** `getRelatedBySlug(Activity`
- **Controller:** `'Activity')`
- **Service:** `backend/services/activityService.js` (or direct controller query)
- **Model:** `Activity`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug/related in backend/routes/activityRoutes.js

### `GET` /api/activities/:slug
- **Method:** `GET`
- **Path:** `/api/activities/:slug` or `/activities/:slug`
- **Route File:** `backend/routes/activityRoutes.js:19`
- **Middleware:** `None (Public)`
- **Controller:** `getActivityBySlug`
- **Service:** `backend/services/activityService.js` (or direct controller query)
- **Model:** `Activity`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug in backend/routes/activityRoutes.js

### `PATCH` /api/activities/:id
- **Method:** `PATCH`
- **Path:** `/api/activities/:id` or `/activities/:id`
- **Route File:** `backend/routes/activityRoutes.js:20`
- **Middleware:** `protect, adminOnly`
- **Controller:** `updateActivity`
- **Service:** `backend/services/activityService.js` (or direct controller query)
- **Model:** `Activity`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle PATCH operations for /:id in backend/routes/activityRoutes.js

### `DELETE` /api/activities/:id
- **Method:** `DELETE`
- **Path:** `/api/activities/:id` or `/activities/:id`
- **Route File:** `backend/routes/activityRoutes.js:21`
- **Middleware:** `protect, adminOnly`
- **Controller:** `deleteActivity`
- **Service:** `backend/services/activityService.js` (or direct controller query)
- **Model:** `Activity`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle DELETE operations for /:id in backend/routes/activityRoutes.js

### `GET` /api/admin/stats
- **Method:** `GET`
- **Path:** `/api/admin/stats`
- **Route File:** `backend/routes/adminRoutes.js:19`
- **Middleware:** `protect, adminOnly`
- **Controller:** `getAdminStats`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle GET operations for /stats in backend/routes/adminRoutes.js

### `GET` /api/admin/bookings
- **Method:** `GET`
- **Path:** `/api/admin/bookings`
- **Route File:** `backend/routes/adminRoutes.js:20`
- **Middleware:** `protect, adminOnly`
- **Controller:** `getAllBookings`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle GET operations for /bookings in backend/routes/adminRoutes.js

### `PATCH` /api/admin/bookings/:id/status
- **Method:** `PATCH`
- **Path:** `/api/admin/bookings/:id/status`
- **Route File:** `backend/routes/adminRoutes.js:21`
- **Middleware:** `protect, adminOnly`
- **Controller:** `updateBookingStatus`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle PATCH operations for /bookings/:id/status in backend/routes/adminRoutes.js

### `GET` /api/admin/reviews
- **Method:** `GET`
- **Path:** `/api/admin/reviews`
- **Route File:** `backend/routes/adminRoutes.js:24`
- **Middleware:** `protect, adminOnly`
- **Controller:** `getAllReviewsAdmin`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle GET operations for /reviews in backend/routes/adminRoutes.js

### `PATCH` /api/admin/reviews/:id/status
- **Method:** `PATCH`
- **Path:** `/api/admin/reviews/:id/status`
- **Route File:** `backend/routes/adminRoutes.js:25`
- **Middleware:** `protect, adminOnly`
- **Controller:** `updateReviewStatusAdmin`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle PATCH operations for /reviews/:id/status in backend/routes/adminRoutes.js

### `DELETE` /api/admin/reviews/:id
- **Method:** `DELETE`
- **Path:** `/api/admin/reviews/:id`
- **Route File:** `backend/routes/adminRoutes.js:26`
- **Middleware:** `protect, adminOnly`
- **Controller:** `deleteReviewAdmin`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle DELETE operations for /reviews/:id in backend/routes/adminRoutes.js

### `GET` /api/admin/partners
- **Method:** `GET`
- **Path:** `/api/admin/partners`
- **Route File:** `backend/routes/adminRoutes.js:29`
- **Middleware:** `protect, adminOnly`
- **Controller:** `getAllPartners`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle GET operations for /partners in backend/routes/adminRoutes.js

### `GET` /api/admin/listings/pending
- **Method:** `GET`
- **Path:** `/api/admin/listings/pending`
- **Route File:** `backend/routes/adminRoutes.js:30`
- **Middleware:** `protect, adminOnly`
- **Controller:** `getPendingListings`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle GET operations for /listings/pending in backend/routes/adminRoutes.js

### `GET` /api/admin/listings/:id
- **Method:** `GET`
- **Path:** `/api/admin/listings/:id`
- **Route File:** `backend/routes/adminRoutes.js:31`
- **Middleware:** `protect, adminOnly`
- **Controller:** `getListingForAdmin`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle GET operations for /listings/:id in backend/routes/adminRoutes.js

### `POST` /api/admin/listings/:id/verify
- **Method:** `POST`
- **Path:** `/api/admin/listings/:id/verify`
- **Route File:** `backend/routes/adminRoutes.js:32`
- **Middleware:** `protect, adminOnly`
- **Controller:** `verifyListing`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for /listings/:id/verify in backend/routes/adminRoutes.js

### `POST` /api/admin/listings/:id/reject
- **Method:** `POST`
- **Path:** `/api/admin/listings/:id/reject`
- **Route File:** `backend/routes/adminRoutes.js:33`
- **Middleware:** `protect, adminOnly`
- **Controller:** `rejectListing`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for /listings/:id/reject in backend/routes/adminRoutes.js

### `POST` /api/admin/listings/:id/suspend
- **Method:** `POST`
- **Path:** `/api/admin/listings/:id/suspend`
- **Route File:** `backend/routes/adminRoutes.js:34`
- **Middleware:** `protect, adminOnly`
- **Controller:** `suspendListing`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for /listings/:id/suspend in backend/routes/adminRoutes.js

### `POST` /api/admin/listings/:id/revoke
- **Method:** `POST`
- **Path:** `/api/admin/listings/:id/revoke`
- **Route File:** `backend/routes/adminRoutes.js:35`
- **Middleware:** `protect, adminOnly`
- **Controller:** `revokeListing`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for /listings/:id/revoke in backend/routes/adminRoutes.js

### `GET` /api/admin/verification-logs
- **Method:** `GET`
- **Path:** `/api/admin/verification-logs`
- **Route File:** `backend/routes/adminRoutes.js:36`
- **Middleware:** `protect, adminOnly`
- **Controller:** `getVerificationLogs`
- **Service:** `backend/services/adminService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle GET operations for /verification-logs in backend/routes/adminRoutes.js

### `POST` /api/agent/chat
- **Method:** `POST`
- **Path:** `/api/agent/chat` or `/agent/chat`
- **Route File:** `backend/routes/agentRoutes.js:36`
- **Middleware:** `agentRateLimiter, messageLengthGuard`
- **Controller:** `agentChat`
- **Service:** `backend/services/agentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /chat in backend/routes/agentRoutes.js

### `GET` /api/ai/health
- **Method:** `GET`
- **Path:** `/api/ai/health`
- **Route File:** `backend/routes/aiRoutes.js:39`
- **Middleware:** `None (Public)`
- **Controller:** `getAiHealth`
- **Service:** `backend/services/aiService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /health in backend/routes/aiRoutes.js

### `POST` /api/ai/plan
- **Method:** `POST`
- **Path:** `/api/ai/plan`
- **Route File:** `backend/routes/aiRoutes.js:42`
- **Middleware:** `aiRateLimiter, optionalAuth`
- **Controller:** `generatePlan`
- **Service:** `backend/services/aiService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /plan in backend/routes/aiRoutes.js

### `POST` /api/auth/register
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Route File:** `backend/routes/authRoutes.js:20`
- **Middleware:** `authLimiter`
- **Controller:** `registerUser`
- **Service:** `backend/services/authService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle POST operations for /register in backend/routes/authRoutes.js

### `POST` /api/auth/register-partner
- **Method:** `POST`
- **Path:** `/api/auth/register-partner`
- **Route File:** `backend/routes/authRoutes.js:21`
- **Middleware:** `authLimiter`
- **Controller:** `registerPartner`
- **Service:** `backend/services/authService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle POST operations for /register-partner in backend/routes/authRoutes.js

### `POST` /api/auth/login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Route File:** `backend/routes/authRoutes.js:22`
- **Middleware:** `authLimiter`
- **Controller:** `loginUser`
- **Service:** `backend/services/authService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle POST operations for /login in backend/routes/authRoutes.js

### `GET` /api/auth/me
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Route File:** `backend/routes/authRoutes.js:23`
- **Middleware:** `protect`
- **Controller:** `getMe`
- **Service:** `backend/services/authService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle GET operations for /me in backend/routes/authRoutes.js

### `POST` /api/auth/logout
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Route File:** `backend/routes/authRoutes.js:24`
- **Middleware:** `None (Public)`
- **Controller:** `logoutUser`
- **Service:** `backend/services/authService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /logout in backend/routes/authRoutes.js

### `POST` /api/budget/calculate
- **Method:** `POST`
- **Path:** `/api/budget/calculate`
- **Route File:** `backend/routes/budgetRoutes.js:11`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/budgetService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /calculate in backend/routes/budgetRoutes.js

### `GET` /api/chats/stream
- **Method:** `GET`
- **Path:** `/api/chats/stream` or `/api/chat/stream` or `/chat/stream` or `/chats/stream`
- **Route File:** `backend/routes/chatRoutes.js:17`
- **Middleware:** `None (Public)`
- **Controller:** `streamChat`
- **Service:** `backend/services/chatService.js` (or direct controller query)
- **Model:** `Chat`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /stream in backend/routes/chatRoutes.js

### `POST` /api/chats/stream
- **Method:** `POST`
- **Path:** `/api/chats/stream` or `/api/chat/stream` or `/chat/stream` or `/chats/stream`
- **Route File:** `backend/routes/chatRoutes.js:18`
- **Middleware:** `None (Public)`
- **Controller:** `streamChat`
- **Service:** `backend/services/chatService.js` (or direct controller query)
- **Model:** `Chat`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /stream in backend/routes/chatRoutes.js

### `POST` /api/chats/query
- **Method:** `POST`
- **Path:** `/api/chats/query` or `/api/chat/query` or `/chat/query` or `/chats/query`
- **Route File:** `backend/routes/chatRoutes.js:21`
- **Middleware:** `None (Public)`
- **Controller:** `handleDirectChat`
- **Service:** `backend/services/chatService.js` (or direct controller query)
- **Model:** `Chat`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /query in backend/routes/chatRoutes.js

### `POST` /api/chats/ask
- **Method:** `POST`
- **Path:** `/api/chats/ask` or `/api/chat/ask` or `/chat/ask` or `/chats/ask`
- **Route File:** `backend/routes/chatRoutes.js:22`
- **Middleware:** `None (Public)`
- **Controller:** `handleDirectChat`
- **Service:** `backend/services/chatService.js` (or direct controller query)
- **Model:** `Chat`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /ask in backend/routes/chatRoutes.js

### `POST` /api/chats/
- **Method:** `POST`
- **Path:** `/api/chats/` or `/api/chat/` or `/chat/` or `/chats/`
- **Route File:** `backend/routes/chatRoutes.js:25`
- **Middleware:** `(req, res`
- **Controller:** `next`
- **Service:** `backend/services/chatService.js` (or direct controller query)
- **Model:** `Chat`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for / in backend/routes/chatRoutes.js

### `GET` /api/chats/
- **Method:** `GET`
- **Path:** `/api/chats/` or `/api/chat/` or `/chat/` or `/chats/`
- **Route File:** `backend/routes/chatRoutes.js:34`
- **Middleware:** `protect`
- **Controller:** `getChats`
- **Service:** `backend/services/chatService.js` (or direct controller query)
- **Model:** `Chat`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle GET operations for / in backend/routes/chatRoutes.js

### `POST` /api/chats/:id/messages
- **Method:** `POST`
- **Path:** `/api/chats/:id/messages` or `/api/chat/:id/messages` or `/chat/:id/messages` or `/chats/:id/messages`
- **Route File:** `backend/routes/chatRoutes.js:41`
- **Middleware:** `protect`
- **Controller:** `sendMessage`
- **Service:** `backend/services/chatService.js` (or direct controller query)
- **Model:** `Chat`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle POST operations for /:id/messages in backend/routes/chatRoutes.js

### `GET` /api/culture/
- **Method:** `GET`
- **Path:** `/api/culture/` or `/culture/`
- **Route File:** `backend/routes/cultureRoutes.js:16`
- **Middleware:** `None (Public)`
- **Controller:** `getCulturePlaces`
- **Service:** `backend/services/cultureService.js` (or direct controller query)
- **Model:** `Culture`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for / in backend/routes/cultureRoutes.js

### `POST` /api/culture/
- **Method:** `POST`
- **Path:** `/api/culture/` or `/culture/`
- **Route File:** `backend/routes/cultureRoutes.js:17`
- **Middleware:** `protect, adminOnly`
- **Controller:** `createCulture`
- **Service:** `backend/services/cultureService.js` (or direct controller query)
- **Model:** `Culture`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for / in backend/routes/cultureRoutes.js

### `GET` /api/culture/:slug/related
- **Method:** `GET`
- **Path:** `/api/culture/:slug/related` or `/culture/:slug/related`
- **Route File:** `backend/routes/cultureRoutes.js:18`
- **Middleware:** `getRelatedBySlug(Culture`
- **Controller:** `'Culture')`
- **Service:** `backend/services/cultureService.js` (or direct controller query)
- **Model:** `Culture`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug/related in backend/routes/cultureRoutes.js

### `GET` /api/culture/:slug
- **Method:** `GET`
- **Path:** `/api/culture/:slug` or `/culture/:slug`
- **Route File:** `backend/routes/cultureRoutes.js:19`
- **Middleware:** `None (Public)`
- **Controller:** `getCultureBySlug`
- **Service:** `backend/services/cultureService.js` (or direct controller query)
- **Model:** `Culture`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug in backend/routes/cultureRoutes.js

### `PATCH` /api/culture/:id
- **Method:** `PATCH`
- **Path:** `/api/culture/:id` or `/culture/:id`
- **Route File:** `backend/routes/cultureRoutes.js:20`
- **Middleware:** `protect, adminOnly`
- **Controller:** `updateCulture`
- **Service:** `backend/services/cultureService.js` (or direct controller query)
- **Model:** `Culture`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle PATCH operations for /:id in backend/routes/cultureRoutes.js

### `DELETE` /api/culture/:id
- **Method:** `DELETE`
- **Path:** `/api/culture/:id` or `/culture/:id`
- **Route File:** `backend/routes/cultureRoutes.js:21`
- **Middleware:** `protect, adminOnly`
- **Controller:** `deleteCulture`
- **Service:** `backend/services/cultureService.js` (or direct controller query)
- **Model:** `Culture`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle DELETE operations for /:id in backend/routes/cultureRoutes.js

### `GET` /api/destinations/
- **Method:** `GET`
- **Path:** `/api/destinations/` or `/destinations/`
- **Route File:** `backend/routes/destinationRoutes.js:17`
- **Middleware:** `None (Public)`
- **Controller:** `getDestinations`
- **Service:** `backend/services/destinationService.js` (or direct controller query)
- **Model:** `Destination`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for / in backend/routes/destinationRoutes.js

### `POST` /api/destinations/
- **Method:** `POST`
- **Path:** `/api/destinations/` or `/destinations/`
- **Route File:** `backend/routes/destinationRoutes.js:18`
- **Middleware:** `protect, adminOnly`
- **Controller:** `createDestination`
- **Service:** `backend/services/destinationService.js` (or direct controller query)
- **Model:** `Destination`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for / in backend/routes/destinationRoutes.js

### `GET` /api/destinations/:slug/explore
- **Method:** `GET`
- **Path:** `/api/destinations/:slug/explore` or `/destinations/:slug/explore`
- **Route File:** `backend/routes/destinationRoutes.js:19`
- **Middleware:** `None (Public)`
- **Controller:** `getDestinationExplore`
- **Service:** `backend/services/destinationService.js` (or direct controller query)
- **Model:** `Destination`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug/explore in backend/routes/destinationRoutes.js

### `GET` /api/destinations/:slug/related
- **Method:** `GET`
- **Path:** `/api/destinations/:slug/related` or `/destinations/:slug/related`
- **Route File:** `backend/routes/destinationRoutes.js:20`
- **Middleware:** `getRelatedBySlug(Destination`
- **Controller:** `'Destination')`
- **Service:** `backend/services/destinationService.js` (or direct controller query)
- **Model:** `Destination`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug/related in backend/routes/destinationRoutes.js

### `GET` /api/destinations/:slug
- **Method:** `GET`
- **Path:** `/api/destinations/:slug` or `/destinations/:slug`
- **Route File:** `backend/routes/destinationRoutes.js:21`
- **Middleware:** `None (Public)`
- **Controller:** `getDestinationBySlug`
- **Service:** `backend/services/destinationService.js` (or direct controller query)
- **Model:** `Destination`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug in backend/routes/destinationRoutes.js

### `PATCH` /api/destinations/:id
- **Method:** `PATCH`
- **Path:** `/api/destinations/:id` or `/destinations/:id`
- **Route File:** `backend/routes/destinationRoutes.js:22`
- **Middleware:** `protect, adminOnly`
- **Controller:** `updateDestination`
- **Service:** `backend/services/destinationService.js` (or direct controller query)
- **Model:** `Destination`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle PATCH operations for /:id in backend/routes/destinationRoutes.js

### `DELETE` /api/destinations/:id
- **Method:** `DELETE`
- **Path:** `/api/destinations/:id` or `/destinations/:id`
- **Route File:** `backend/routes/destinationRoutes.js:23`
- **Middleware:** `protect, adminOnly`
- **Controller:** `deleteDestination`
- **Service:** `backend/services/destinationService.js` (or direct controller query)
- **Model:** `Destination`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle DELETE operations for /:id in backend/routes/destinationRoutes.js

### `GET` /api/favorites/
- **Method:** `GET`
- **Path:** `/api/favorites/`
- **Route File:** `backend/routes/favoriteRoutes.js:9`
- **Middleware:** `None (Public)`
- **Controller:** `getFavorites`
- **Service:** `backend/services/favoriteService.js` (or direct controller query)
- **Model:** `Favorite`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for / in backend/routes/favoriteRoutes.js

### `POST` /api/favorites/
- **Method:** `POST`
- **Path:** `/api/favorites/`
- **Route File:** `backend/routes/favoriteRoutes.js:10`
- **Middleware:** `None (Public)`
- **Controller:** `addFavorite`
- **Service:** `backend/services/favoriteService.js` (or direct controller query)
- **Model:** `Favorite`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for / in backend/routes/favoriteRoutes.js

### `POST` /api/favorites/:itemType/:item/toggle
- **Method:** `POST`
- **Path:** `/api/favorites/:itemType/:item/toggle`
- **Route File:** `backend/routes/favoriteRoutes.js:11`
- **Middleware:** `None (Public)`
- **Controller:** `toggleFavorite`
- **Service:** `backend/services/favoriteService.js` (or direct controller query)
- **Model:** `Favorite`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /:itemType/:item/toggle in backend/routes/favoriteRoutes.js

### `DELETE` /api/favorites/:itemType/:item
- **Method:** `DELETE`
- **Path:** `/api/favorites/:itemType/:item`
- **Route File:** `backend/routes/favoriteRoutes.js:12`
- **Middleware:** `None (Public)`
- **Controller:** `removeFavorite`
- **Service:** `backend/services/favoriteService.js` (or direct controller query)
- **Model:** `Favorite`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle DELETE operations for /:itemType/:item in backend/routes/favoriteRoutes.js

### `DELETE` /api/favorites/:id
- **Method:** `DELETE`
- **Path:** `/api/favorites/:id`
- **Route File:** `backend/routes/favoriteRoutes.js:13`
- **Middleware:** `None (Public)`
- **Controller:** `removeFavorite`
- **Service:** `backend/services/favoriteService.js` (or direct controller query)
- **Model:** `Favorite`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle DELETE operations for /:id in backend/routes/favoriteRoutes.js

### `GET` /api/guides/
- **Method:** `GET`
- **Path:** `/api/guides/` or `/guides/`
- **Route File:** `backend/routes/guideRoutes.js:13`
- **Middleware:** `None (Public)`
- **Controller:** `getGuides`
- **Service:** `backend/services/guideService.js` (or direct controller query)
- **Model:** `Guide`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for / in backend/routes/guideRoutes.js

### `POST` /api/guides/
- **Method:** `POST`
- **Path:** `/api/guides/` or `/guides/`
- **Route File:** `backend/routes/guideRoutes.js:14`
- **Middleware:** `protect, adminOnly`
- **Controller:** `createGuide`
- **Service:** `backend/services/guideService.js` (or direct controller query)
- **Model:** `Guide`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for / in backend/routes/guideRoutes.js

### `GET` /api/guides/:slug
- **Method:** `GET`
- **Path:** `/api/guides/:slug` or `/guides/:slug`
- **Route File:** `backend/routes/guideRoutes.js:15`
- **Middleware:** `None (Public)`
- **Controller:** `getGuideBySlug`
- **Service:** `backend/services/guideService.js` (or direct controller query)
- **Model:** `Guide`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug in backend/routes/guideRoutes.js

### `PATCH` /api/guides/:id
- **Method:** `PATCH`
- **Path:** `/api/guides/:id` or `/guides/:id`
- **Route File:** `backend/routes/guideRoutes.js:16`
- **Middleware:** `protect, adminOnly`
- **Controller:** `updateGuide`
- **Service:** `backend/services/guideService.js` (or direct controller query)
- **Model:** `Guide`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle PATCH operations for /:id in backend/routes/guideRoutes.js

### `DELETE` /api/guides/:id
- **Method:** `DELETE`
- **Path:** `/api/guides/:id` or `/guides/:id`
- **Route File:** `backend/routes/guideRoutes.js:17`
- **Middleware:** `protect, adminOnly`
- **Controller:** `deleteGuide`
- **Service:** `backend/services/guideService.js` (or direct controller query)
- **Model:** `Guide`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle DELETE operations for /:id in backend/routes/guideRoutes.js

### `GET` /internal/agent/health
- **Method:** `GET`
- **Path:** `/internal/agent/health`
- **Route File:** `backend/routes/internalAgentRoutes.js:36`
- **Middleware:** `(req`
- **Controller:** `res`
- **Service:** `backend/services/internalAgentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /health in backend/routes/internalAgentRoutes.js

### `GET` /internal/agent/destinations
- **Method:** `GET`
- **Path:** `/internal/agent/destinations`
- **Route File:** `backend/routes/internalAgentRoutes.js:45`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/internalAgentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /destinations in backend/routes/internalAgentRoutes.js

### `GET` /internal/agent/stays
- **Method:** `GET`
- **Path:** `/internal/agent/stays`
- **Route File:** `backend/routes/internalAgentRoutes.js:69`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/internalAgentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /stays in backend/routes/internalAgentRoutes.js

### `GET` /internal/agent/partner-listings
- **Method:** `GET`
- **Path:** `/internal/agent/partner-listings`
- **Route File:** `backend/routes/internalAgentRoutes.js:114`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/internalAgentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /partner-listings in backend/routes/internalAgentRoutes.js

### `GET` /internal/agent/activities
- **Method:** `GET`
- **Path:** `/internal/agent/activities`
- **Route File:** `backend/routes/internalAgentRoutes.js:139`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/internalAgentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /activities in backend/routes/internalAgentRoutes.js

### `GET` /internal/agent/guides
- **Method:** `GET`
- **Path:** `/internal/agent/guides`
- **Route File:** `backend/routes/internalAgentRoutes.js:161`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/internalAgentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /guides in backend/routes/internalAgentRoutes.js

### `POST` /internal/agent/budget
- **Method:** `POST`
- **Path:** `/internal/agent/budget`
- **Route File:** `backend/routes/internalAgentRoutes.js:179`
- **Middleware:** `(req`
- **Controller:** `res`
- **Service:** `backend/services/internalAgentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /budget in backend/routes/internalAgentRoutes.js

### `POST` /internal/agent/route
- **Method:** `POST`
- **Path:** `/internal/agent/route`
- **Route File:** `backend/routes/internalAgentRoutes.js:191`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/internalAgentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /route in backend/routes/internalAgentRoutes.js

### `GET` /internal/agent/weather
- **Method:** `GET`
- **Path:** `/internal/agent/weather`
- **Route File:** `backend/routes/internalAgentRoutes.js:202`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/internalAgentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /weather in backend/routes/internalAgentRoutes.js

### `GET` /internal/agent/road-advisory
- **Method:** `GET`
- **Path:** `/internal/agent/road-advisory`
- **Route File:** `backend/routes/internalAgentRoutes.js:213`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/internalAgentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /road-advisory in backend/routes/internalAgentRoutes.js

### `POST` /internal/agent/trip-mutation
- **Method:** `POST`
- **Path:** `/internal/agent/trip-mutation`
- **Route File:** `backend/routes/internalAgentRoutes.js:224`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/internalAgentService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /trip-mutation in backend/routes/internalAgentRoutes.js

### `GET` /api/live/telemetry
- **Method:** `GET`
- **Path:** `/api/live/telemetry` or `/api/live-data/telemetry` or `/live-data/telemetry`
- **Route File:** `backend/routes/liveDataRoutes.js:19`
- **Middleware:** `None (Public)`
- **Controller:** `getLiveTelemetry`
- **Service:** `backend/services/liveDataService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /telemetry in backend/routes/liveDataRoutes.js

### `GET` /api/live/weather
- **Method:** `GET`
- **Path:** `/api/live/weather` or `/api/live-data/weather` or `/live-data/weather`
- **Route File:** `backend/routes/liveDataRoutes.js:20`
- **Middleware:** `None (Public)`
- **Controller:** `getWeather`
- **Service:** `backend/services/liveDataService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /weather in backend/routes/liveDataRoutes.js

### `GET` /api/live/elevation
- **Method:** `GET`
- **Path:** `/api/live/elevation` or `/api/live-data/elevation` or `/live-data/elevation`
- **Route File:** `backend/routes/liveDataRoutes.js:21`
- **Middleware:** `None (Public)`
- **Controller:** `getElevation`
- **Service:** `backend/services/liveDataService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /elevation in backend/routes/liveDataRoutes.js

### `GET` /api/live/road-advisories
- **Method:** `GET`
- **Path:** `/api/live/road-advisories` or `/api/live-data/road-advisories` or `/live-data/road-advisories`
- **Route File:** `backend/routes/liveDataRoutes.js:22`
- **Middleware:** `None (Public)`
- **Controller:** `getRoadAdvisories`
- **Service:** `backend/services/liveDataService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /road-advisories in backend/routes/liveDataRoutes.js

### `GET` /api/live/bulletins
- **Method:** `GET`
- **Path:** `/api/live/bulletins` or `/api/live-data/bulletins` or `/live-data/bulletins`
- **Route File:** `backend/routes/liveDataRoutes.js:23`
- **Middleware:** `None (Public)`
- **Controller:** `listRoadBulletins`
- **Service:** `backend/services/liveDataService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /bulletins in backend/routes/liveDataRoutes.js

### `GET` /api/live/transit
- **Method:** `GET`
- **Path:** `/api/live/transit` or `/api/live-data/transit` or `/live-data/transit`
- **Route File:** `backend/routes/liveDataRoutes.js:24`
- **Middleware:** `None (Public)`
- **Controller:** `getTransitStatus`
- **Service:** `backend/services/liveDataService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /transit in backend/routes/liveDataRoutes.js

### `POST` /api/live/advisories/evaluate
- **Method:** `POST`
- **Path:** `/api/live/advisories/evaluate` or `/api/live-data/advisories/evaluate` or `/live-data/advisories/evaluate`
- **Route File:** `backend/routes/liveDataRoutes.js:25`
- **Middleware:** `None (Public)`
- **Controller:** `evaluateTripAdvisories`
- **Service:** `backend/services/liveDataService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /advisories/evaluate in backend/routes/liveDataRoutes.js

### `GET` /api/live/community-grid
- **Method:** `GET`
- **Path:** `/api/live/community-grid` or `/api/live-data/community-grid` or `/live-data/community-grid`
- **Route File:** `backend/routes/liveDataRoutes.js:28`
- **Middleware:** `None (Public)`
- **Controller:** `getCommunityAdvisories`
- **Service:** `backend/services/liveDataService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /community-grid in backend/routes/liveDataRoutes.js

### `POST` /api/live/community-grid/report
- **Method:** `POST`
- **Path:** `/api/live/community-grid/report` or `/api/live-data/community-grid/report` or `/live-data/community-grid/report`
- **Route File:** `backend/routes/liveDataRoutes.js:29`
- **Middleware:** `None (Public)`
- **Controller:** `submitCommunityReport`
- **Service:** `backend/services/liveDataService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /community-grid/report in backend/routes/liveDataRoutes.js

### `POST` /api/live/admin/bulletins
- **Method:** `POST`
- **Path:** `/api/live/admin/bulletins` or `/api/live-data/admin/bulletins` or `/live-data/admin/bulletins`
- **Route File:** `backend/routes/liveDataRoutes.js:32`
- **Middleware:** `protect, adminOnly`
- **Controller:** `createRoadBulletin`
- **Service:** `backend/services/liveDataService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for /admin/bulletins in backend/routes/liveDataRoutes.js

### `GET` /api/marketplace/listings
- **Method:** `GET`
- **Path:** `/api/marketplace/listings`
- **Route File:** `backend/routes/marketplaceRoutes.js:11`
- **Middleware:** `None (Public)`
- **Controller:** `getPublicListings`
- **Service:** `backend/services/marketplaceService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /listings in backend/routes/marketplaceRoutes.js

### `GET` /api/marketplace/listings/:slug
- **Method:** `GET`
- **Path:** `/api/marketplace/listings/:slug`
- **Route File:** `backend/routes/marketplaceRoutes.js:12`
- **Middleware:** `None (Public)`
- **Controller:** `getPublicListingBySlug`
- **Service:** `backend/services/marketplaceService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /listings/:slug in backend/routes/marketplaceRoutes.js

### `POST` /api/partners/
- **Method:** `POST`
- **Path:** `/api/partners/` or `/api/partner/`
- **Route File:** `backend/routes/partnerRoutes.js:41`
- **Middleware:** `protect`
- **Controller:** `registerPartner`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle POST operations for / in backend/routes/partnerRoutes.js

### `GET` /api/partners/me
- **Method:** `GET`
- **Path:** `/api/partners/me` or `/api/partner/me`
- **Route File:** `backend/routes/partnerRoutes.js:42`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getMyPartnerProfile`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /me in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/me
- **Method:** `PATCH`
- **Path:** `/api/partners/me` or `/api/partner/me`
- **Route File:** `backend/routes/partnerRoutes.js:43`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updateMyPartnerProfile`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /me in backend/routes/partnerRoutes.js

### `GET` /api/partners/profile
- **Method:** `GET`
- **Path:** `/api/partners/profile` or `/api/partner/profile`
- **Route File:** `backend/routes/partnerRoutes.js:44`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getMyPartnerProfile`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /profile in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/profile
- **Method:** `PATCH`
- **Path:** `/api/partners/profile` or `/api/partner/profile`
- **Route File:** `backend/routes/partnerRoutes.js:45`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updateMyPartnerProfile`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /profile in backend/routes/partnerRoutes.js

### `GET` /api/partners/dashboard
- **Method:** `GET`
- **Path:** `/api/partners/dashboard` or `/api/partner/dashboard`
- **Route File:** `backend/routes/partnerRoutes.js:48`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerDashboard`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /dashboard in backend/routes/partnerRoutes.js

### `GET` /api/partners/me/dashboard
- **Method:** `GET`
- **Path:** `/api/partners/me/dashboard` or `/api/partner/me/dashboard`
- **Route File:** `backend/routes/partnerRoutes.js:49`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerDashboard`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /me/dashboard in backend/routes/partnerRoutes.js

### `POST` /api/partners/me/listings
- **Method:** `POST`
- **Path:** `/api/partners/me/listings` or `/api/partner/me/listings`
- **Route File:** `backend/routes/partnerRoutes.js:52`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `createListingDraft`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /me/listings in backend/routes/partnerRoutes.js

### `POST` /api/partners/listings
- **Method:** `POST`
- **Path:** `/api/partners/listings` or `/api/partner/listings`
- **Route File:** `backend/routes/partnerRoutes.js:53`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `createListingDraft`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /listings in backend/routes/partnerRoutes.js

### `GET` /api/partners/me/listings
- **Method:** `GET`
- **Path:** `/api/partners/me/listings` or `/api/partner/me/listings`
- **Route File:** `backend/routes/partnerRoutes.js:54`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getMyListings`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /me/listings in backend/routes/partnerRoutes.js

### `GET` /api/partners/listings
- **Method:** `GET`
- **Path:** `/api/partners/listings` or `/api/partner/listings`
- **Route File:** `backend/routes/partnerRoutes.js:55`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getMyListings`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /listings in backend/routes/partnerRoutes.js

### `GET` /api/partners/me/listings/:id
- **Method:** `GET`
- **Path:** `/api/partners/me/listings/:id` or `/api/partner/me/listings/:id`
- **Route File:** `backend/routes/partnerRoutes.js:56`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getMyListingById`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /me/listings/:id in backend/routes/partnerRoutes.js

### `GET` /api/partners/listings/:id
- **Method:** `GET`
- **Path:** `/api/partners/listings/:id` or `/api/partner/listings/:id`
- **Route File:** `backend/routes/partnerRoutes.js:57`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getMyListingById`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /listings/:id in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/me/listings/:id
- **Method:** `PATCH`
- **Path:** `/api/partners/me/listings/:id` or `/api/partner/me/listings/:id`
- **Route File:** `backend/routes/partnerRoutes.js:58`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updateListing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /me/listings/:id in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/listings/:id
- **Method:** `PATCH`
- **Path:** `/api/partners/listings/:id` or `/api/partner/listings/:id`
- **Route File:** `backend/routes/partnerRoutes.js:59`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updateListing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /listings/:id in backend/routes/partnerRoutes.js

### `PUT` /api/partners/me/listings/:id
- **Method:** `PUT`
- **Path:** `/api/partners/me/listings/:id` or `/api/partner/me/listings/:id`
- **Route File:** `backend/routes/partnerRoutes.js:60`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updateListing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PUT operations for /me/listings/:id in backend/routes/partnerRoutes.js

### `PUT` /api/partners/listings/:id
- **Method:** `PUT`
- **Path:** `/api/partners/listings/:id` or `/api/partner/listings/:id`
- **Route File:** `backend/routes/partnerRoutes.js:61`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updateListing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PUT operations for /listings/:id in backend/routes/partnerRoutes.js

### `DELETE` /api/partners/me/listings/:id
- **Method:** `DELETE`
- **Path:** `/api/partners/me/listings/:id` or `/api/partner/me/listings/:id`
- **Route File:** `backend/routes/partnerRoutes.js:62`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `deleteListing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle DELETE operations for /me/listings/:id in backend/routes/partnerRoutes.js

### `DELETE` /api/partners/listings/:id
- **Method:** `DELETE`
- **Path:** `/api/partners/listings/:id` or `/api/partner/listings/:id`
- **Route File:** `backend/routes/partnerRoutes.js:63`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `deleteListing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle DELETE operations for /listings/:id in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/me/listings/:id/pricing
- **Method:** `PATCH`
- **Path:** `/api/partners/me/listings/:id/pricing` or `/api/partner/me/listings/:id/pricing`
- **Route File:** `backend/routes/partnerRoutes.js:66`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updateListingPricing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /me/listings/:id/pricing in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/listings/:id/pricing
- **Method:** `PATCH`
- **Path:** `/api/partners/listings/:id/pricing` or `/api/partner/listings/:id/pricing`
- **Route File:** `backend/routes/partnerRoutes.js:67`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updateListingPricing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /listings/:id/pricing in backend/routes/partnerRoutes.js

### `PUT` /api/partners/me/listings/:id/pricing
- **Method:** `PUT`
- **Path:** `/api/partners/me/listings/:id/pricing` or `/api/partner/me/listings/:id/pricing`
- **Route File:** `backend/routes/partnerRoutes.js:68`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updateListingPricing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PUT operations for /me/listings/:id/pricing in backend/routes/partnerRoutes.js

### `PUT` /api/partners/listings/:id/pricing
- **Method:** `PUT`
- **Path:** `/api/partners/listings/:id/pricing` or `/api/partner/listings/:id/pricing`
- **Route File:** `backend/routes/partnerRoutes.js:69`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updateListingPricing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PUT operations for /listings/:id/pricing in backend/routes/partnerRoutes.js

### `POST` /api/partners/me/listings/:id/submit
- **Method:** `POST`
- **Path:** `/api/partners/me/listings/:id/submit` or `/api/partner/me/listings/:id/submit`
- **Route File:** `backend/routes/partnerRoutes.js:72`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `submitListingForVerification`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /me/listings/:id/submit in backend/routes/partnerRoutes.js

### `POST` /api/partners/listings/:id/submit
- **Method:** `POST`
- **Path:** `/api/partners/listings/:id/submit` or `/api/partner/listings/:id/submit`
- **Route File:** `backend/routes/partnerRoutes.js:73`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `submitListingForVerification`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /listings/:id/submit in backend/routes/partnerRoutes.js

### `POST` /api/partners/me/listings/:id/reopen
- **Method:** `POST`
- **Path:** `/api/partners/me/listings/:id/reopen` or `/api/partner/me/listings/:id/reopen`
- **Route File:** `backend/routes/partnerRoutes.js:74`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `reopenRejectedListing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /me/listings/:id/reopen in backend/routes/partnerRoutes.js

### `POST` /api/partners/listings/:id/reopen
- **Method:** `POST`
- **Path:** `/api/partners/listings/:id/reopen` or `/api/partner/listings/:id/reopen`
- **Route File:** `backend/routes/partnerRoutes.js:75`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `reopenRejectedListing`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /listings/:id/reopen in backend/routes/partnerRoutes.js

### `POST` /api/partners/me/listings/:id/images
- **Method:** `POST`
- **Path:** `/api/partners/me/listings/:id/images` or `/api/partner/me/listings/:id/images`
- **Route File:** `backend/routes/partnerRoutes.js:78`
- **Middleware:** `protect, partnerOnly, upload.array('images', 10)`
- **Controller:** `uploadListingImages`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /me/listings/:id/images in backend/routes/partnerRoutes.js

### `POST` /api/partners/listings/:id/images
- **Method:** `POST`
- **Path:** `/api/partners/listings/:id/images` or `/api/partner/listings/:id/images`
- **Route File:** `backend/routes/partnerRoutes.js:79`
- **Middleware:** `protect, partnerOnly, upload.array('images', 10)`
- **Controller:** `uploadListingImages`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /listings/:id/images in backend/routes/partnerRoutes.js

### `DELETE` /api/partners/me/listings/:id/images/:imageId
- **Method:** `DELETE`
- **Path:** `/api/partners/me/listings/:id/images/:imageId` or `/api/partner/me/listings/:id/images/:imageId`
- **Route File:** `backend/routes/partnerRoutes.js:80`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `deleteListingImage`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle DELETE operations for /me/listings/:id/images/:imageId in backend/routes/partnerRoutes.js

### `DELETE` /api/partners/listings/:id/images/:imageId
- **Method:** `DELETE`
- **Path:** `/api/partners/listings/:id/images/:imageId` or `/api/partner/listings/:id/images/:imageId`
- **Route File:** `backend/routes/partnerRoutes.js:81`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `deleteListingImage`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle DELETE operations for /listings/:id/images/:imageId in backend/routes/partnerRoutes.js

### `GET` /api/partners/me/bookings
- **Method:** `GET`
- **Path:** `/api/partners/me/bookings` or `/api/partner/me/bookings`
- **Route File:** `backend/routes/partnerRoutes.js:84`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerBookings`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /me/bookings in backend/routes/partnerRoutes.js

### `GET` /api/partners/bookings
- **Method:** `GET`
- **Path:** `/api/partners/bookings` or `/api/partner/bookings`
- **Route File:** `backend/routes/partnerRoutes.js:85`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerBookings`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /bookings in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/me/bookings/:id/status
- **Method:** `PATCH`
- **Path:** `/api/partners/me/bookings/:id/status` or `/api/partner/me/bookings/:id/status`
- **Route File:** `backend/routes/partnerRoutes.js:86`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerBookingStatus`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /me/bookings/:id/status in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/bookings/:id/status
- **Method:** `PATCH`
- **Path:** `/api/partners/bookings/:id/status` or `/api/partner/bookings/:id/status`
- **Route File:** `backend/routes/partnerRoutes.js:87`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerBookingStatus`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /bookings/:id/status in backend/routes/partnerRoutes.js

### `PUT` /api/partners/me/bookings/:id/status
- **Method:** `PUT`
- **Path:** `/api/partners/me/bookings/:id/status` or `/api/partner/me/bookings/:id/status`
- **Route File:** `backend/routes/partnerRoutes.js:88`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerBookingStatus`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PUT operations for /me/bookings/:id/status in backend/routes/partnerRoutes.js

### `PUT` /api/partners/bookings/:id/status
- **Method:** `PUT`
- **Path:** `/api/partners/bookings/:id/status` or `/api/partner/bookings/:id/status`
- **Route File:** `backend/routes/partnerRoutes.js:89`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerBookingStatus`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PUT operations for /bookings/:id/status in backend/routes/partnerRoutes.js

### `GET` /api/partners/me/availability
- **Method:** `GET`
- **Path:** `/api/partners/me/availability` or `/api/partner/me/availability`
- **Route File:** `backend/routes/partnerRoutes.js:92`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerAvailability`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /me/availability in backend/routes/partnerRoutes.js

### `GET` /api/partners/availability
- **Method:** `GET`
- **Path:** `/api/partners/availability` or `/api/partner/availability`
- **Route File:** `backend/routes/partnerRoutes.js:93`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerAvailability`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /availability in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/me/availability/:id
- **Method:** `PATCH`
- **Path:** `/api/partners/me/availability/:id` or `/api/partner/me/availability/:id`
- **Route File:** `backend/routes/partnerRoutes.js:94`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerAvailability`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /me/availability/:id in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/availability/:id
- **Method:** `PATCH`
- **Path:** `/api/partners/availability/:id` or `/api/partner/availability/:id`
- **Route File:** `backend/routes/partnerRoutes.js:95`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerAvailability`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /availability/:id in backend/routes/partnerRoutes.js

### `PUT` /api/partners/me/availability/:id
- **Method:** `PUT`
- **Path:** `/api/partners/me/availability/:id` or `/api/partner/me/availability/:id`
- **Route File:** `backend/routes/partnerRoutes.js:96`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerAvailability`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PUT operations for /me/availability/:id in backend/routes/partnerRoutes.js

### `PUT` /api/partners/availability/:id
- **Method:** `PUT`
- **Path:** `/api/partners/availability/:id` or `/api/partner/availability/:id`
- **Route File:** `backend/routes/partnerRoutes.js:97`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerAvailability`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PUT operations for /availability/:id in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/me/listings/:id/availability
- **Method:** `PATCH`
- **Path:** `/api/partners/me/listings/:id/availability` or `/api/partner/me/listings/:id/availability`
- **Route File:** `backend/routes/partnerRoutes.js:98`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerAvailability`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /me/listings/:id/availability in backend/routes/partnerRoutes.js

### `PATCH` /api/partners/listings/:id/availability
- **Method:** `PATCH`
- **Path:** `/api/partners/listings/:id/availability` or `/api/partner/listings/:id/availability`
- **Route File:** `backend/routes/partnerRoutes.js:99`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerAvailability`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PATCH operations for /listings/:id/availability in backend/routes/partnerRoutes.js

### `PUT` /api/partners/me/listings/:id/availability
- **Method:** `PUT`
- **Path:** `/api/partners/me/listings/:id/availability` or `/api/partner/me/listings/:id/availability`
- **Route File:** `backend/routes/partnerRoutes.js:100`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerAvailability`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PUT operations for /me/listings/:id/availability in backend/routes/partnerRoutes.js

### `PUT` /api/partners/listings/:id/availability
- **Method:** `PUT`
- **Path:** `/api/partners/listings/:id/availability` or `/api/partner/listings/:id/availability`
- **Route File:** `backend/routes/partnerRoutes.js:101`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `updatePartnerAvailability`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle PUT operations for /listings/:id/availability in backend/routes/partnerRoutes.js

### `GET` /api/partners/me/earnings
- **Method:** `GET`
- **Path:** `/api/partners/me/earnings` or `/api/partner/me/earnings`
- **Route File:** `backend/routes/partnerRoutes.js:104`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerEarnings`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /me/earnings in backend/routes/partnerRoutes.js

### `GET` /api/partners/earnings
- **Method:** `GET`
- **Path:** `/api/partners/earnings` or `/api/partner/earnings`
- **Route File:** `backend/routes/partnerRoutes.js:105`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerEarnings`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /earnings in backend/routes/partnerRoutes.js

### `GET` /api/partners/me/expenses
- **Method:** `GET`
- **Path:** `/api/partners/me/expenses` or `/api/partner/me/expenses`
- **Route File:** `backend/routes/partnerRoutes.js:107`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerExpenses`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /me/expenses in backend/routes/partnerRoutes.js

### `GET` /api/partners/expenses
- **Method:** `GET`
- **Path:** `/api/partners/expenses` or `/api/partner/expenses`
- **Route File:** `backend/routes/partnerRoutes.js:108`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerExpenses`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /expenses in backend/routes/partnerRoutes.js

### `POST` /api/partners/me/expenses
- **Method:** `POST`
- **Path:** `/api/partners/me/expenses` or `/api/partner/me/expenses`
- **Route File:** `backend/routes/partnerRoutes.js:109`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `createPartnerExpense`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /me/expenses in backend/routes/partnerRoutes.js

### `POST` /api/partners/expenses
- **Method:** `POST`
- **Path:** `/api/partners/expenses` or `/api/partner/expenses`
- **Route File:** `backend/routes/partnerRoutes.js:110`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `createPartnerExpense`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /expenses in backend/routes/partnerRoutes.js

### `DELETE` /api/partners/me/expenses/:id
- **Method:** `DELETE`
- **Path:** `/api/partners/me/expenses/:id` or `/api/partner/me/expenses/:id`
- **Route File:** `backend/routes/partnerRoutes.js:111`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `deletePartnerExpense`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle DELETE operations for /me/expenses/:id in backend/routes/partnerRoutes.js

### `DELETE` /api/partners/expenses/:id
- **Method:** `DELETE`
- **Path:** `/api/partners/expenses/:id` or `/api/partner/expenses/:id`
- **Route File:** `backend/routes/partnerRoutes.js:112`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `deletePartnerExpense`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle DELETE operations for /expenses/:id in backend/routes/partnerRoutes.js

### `GET` /api/partners/me/analytics
- **Method:** `GET`
- **Path:** `/api/partners/me/analytics` or `/api/partner/me/analytics`
- **Route File:** `backend/routes/partnerRoutes.js:115`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerAnalytics`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /me/analytics in backend/routes/partnerRoutes.js

### `GET` /api/partners/analytics
- **Method:** `GET`
- **Path:** `/api/partners/analytics` or `/api/partner/analytics`
- **Route File:** `backend/routes/partnerRoutes.js:116`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerAnalytics`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /analytics in backend/routes/partnerRoutes.js

### `GET` /api/partners/me/reviews
- **Method:** `GET`
- **Path:** `/api/partners/me/reviews` or `/api/partner/me/reviews`
- **Route File:** `backend/routes/partnerRoutes.js:118`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerReviews`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /me/reviews in backend/routes/partnerRoutes.js

### `GET` /api/partners/reviews
- **Method:** `GET`
- **Path:** `/api/partners/reviews` or `/api/partner/reviews`
- **Route File:** `backend/routes/partnerRoutes.js:119`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `getPartnerReviews`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle GET operations for /reviews in backend/routes/partnerRoutes.js

### `POST` /api/partners/me/reviews/:id/reply
- **Method:** `POST`
- **Path:** `/api/partners/me/reviews/:id/reply` or `/api/partner/me/reviews/:id/reply`
- **Route File:** `backend/routes/partnerRoutes.js:120`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `replyToReview`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /me/reviews/:id/reply in backend/routes/partnerRoutes.js

### `POST` /api/partners/reviews/:id/reply
- **Method:** `POST`
- **Path:** `/api/partners/reviews/:id/reply` or `/api/partner/reviews/:id/reply`
- **Route File:** `backend/routes/partnerRoutes.js:121`
- **Middleware:** `protect, partnerOnly`
- **Controller:** `replyToReview`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /reviews/:id/reply in backend/routes/partnerRoutes.js

### `POST` /api/partners/me/upload
- **Method:** `POST`
- **Path:** `/api/partners/me/upload` or `/api/partner/me/upload`
- **Route File:** `backend/routes/partnerRoutes.js:124`
- **Middleware:** `protect, partnerOnly, upload.array('images', 10), (req`
- **Controller:** `res`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /me/upload in backend/routes/partnerRoutes.js

### `POST` /api/partners/upload
- **Method:** `POST`
- **Path:** `/api/partners/upload` or `/api/partner/upload`
- **Route File:** `backend/routes/partnerRoutes.js:145`
- **Middleware:** `protect, partnerOnly, upload.array('images', 10), (req`
- **Controller:** `res`
- **Service:** `backend/services/partnerService.js` (or direct controller query)
- **Model:** `Partner`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Partner / Host
- **Purpose:** Handle POST operations for /upload in backend/routes/partnerRoutes.js

### `POST` /api/payments/webhook/razorpay
- **Method:** `POST`
- **Path:** `/api/payments/webhook/razorpay`
- **Route File:** `backend/routes/paymentRoutes.js:11`
- **Middleware:** `express.raw({ type: 'application/json' })`
- **Controller:** `handleWebhook`
- **Service:** `backend/services/paymentService.js` (or direct controller query)
- **Model:** `Payment`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /webhook/razorpay in backend/routes/paymentRoutes.js

### `POST` /api/payments/create-order
- **Method:** `POST`
- **Path:** `/api/payments/create-order`
- **Route File:** `backend/routes/paymentRoutes.js:13`
- **Middleware:** `protect`
- **Controller:** `handleCreateOrder`
- **Service:** `backend/services/paymentService.js` (or direct controller query)
- **Model:** `Payment`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle POST operations for /create-order in backend/routes/paymentRoutes.js

### `POST` /api/payments/verify
- **Method:** `POST`
- **Path:** `/api/payments/verify`
- **Route File:** `backend/routes/paymentRoutes.js:14`
- **Middleware:** `protect`
- **Controller:** `handleVerifyPayment`
- **Service:** `backend/services/paymentService.js` (or direct controller query)
- **Model:** `Payment`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle POST operations for /verify in backend/routes/paymentRoutes.js

### `GET` /api/payments/:paymentId/status
- **Method:** `GET`
- **Path:** `/api/payments/:paymentId/status`
- **Route File:** `backend/routes/paymentRoutes.js:15`
- **Middleware:** `protect`
- **Controller:** `handleGetPaymentStatus`
- **Service:** `backend/services/paymentService.js` (or direct controller query)
- **Model:** `Payment`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle GET operations for /:paymentId/status in backend/routes/paymentRoutes.js

### `GET` /api/personalized/home
- **Method:** `GET`
- **Path:** `/api/personalized/home` or `/personalized/home`
- **Route File:** `backend/routes/personalizedRoutes.js:12`
- **Middleware:** `None (Public)`
- **Controller:** `getPersonalizedHome`
- **Service:** `backend/services/personalizedService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /home in backend/routes/personalizedRoutes.js

### `GET` /api/personalized/nearby
- **Method:** `GET`
- **Path:** `/api/personalized/nearby` or `/personalized/nearby`
- **Route File:** `backend/routes/personalizedRoutes.js:13`
- **Middleware:** `None (Public)`
- **Controller:** `getPersonalizedNearby`
- **Service:** `backend/services/personalizedService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /nearby in backend/routes/personalizedRoutes.js

### `GET` /api/photos/search
- **Method:** `GET`
- **Path:** `/api/photos/search` or `/photos/search`
- **Route File:** `backend/routes/photoRoutes.js:12`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/photoService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /search in backend/routes/photoRoutes.js

### `GET` /api/places/status
- **Method:** `GET`
- **Path:** `/api/places/status` or `/api/search/status`
- **Route File:** `backend/routes/placesRoutes.js:14`
- **Middleware:** `None (Public)`
- **Controller:** `getPlacesStatus`
- **Service:** `backend/services/placesService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /status in backend/routes/placesRoutes.js

### `GET` /api/places/live-photo
- **Method:** `GET`
- **Path:** `/api/places/live-photo` or `/api/search/live-photo`
- **Route File:** `backend/routes/placesRoutes.js:15`
- **Middleware:** `None (Public)`
- **Controller:** `getLivePhoto`
- **Service:** `backend/services/placesService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /live-photo in backend/routes/placesRoutes.js

### `GET` /api/places/search
- **Method:** `GET`
- **Path:** `/api/places/search` or `/api/search/search`
- **Route File:** `backend/routes/placesRoutes.js:16`
- **Middleware:** `None (Public)`
- **Controller:** `searchPlaces`
- **Service:** `backend/services/placesService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /search in backend/routes/placesRoutes.js

### `GET` /api/places/places
- **Method:** `GET`
- **Path:** `/api/places/places` or `/api/search/places`
- **Route File:** `backend/routes/placesRoutes.js:17`
- **Middleware:** `None (Public)`
- **Controller:** `searchPlaces`
- **Service:** `backend/services/placesService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /places in backend/routes/placesRoutes.js

### `GET` /api/places/
- **Method:** `GET`
- **Path:** `/api/places/` or `/api/search/`
- **Route File:** `backend/routes/placesRoutes.js:18`
- **Middleware:** `None (Public)`
- **Controller:** `searchPlaces`
- **Service:** `backend/services/placesService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for / in backend/routes/placesRoutes.js

### `GET` /api/places/nearby
- **Method:** `GET`
- **Path:** `/api/places/nearby` or `/api/search/nearby`
- **Route File:** `backend/routes/placesRoutes.js:19`
- **Middleware:** `None (Public)`
- **Controller:** `getNearbyPlaces`
- **Service:** `backend/services/placesService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /nearby in backend/routes/placesRoutes.js

### `GET` /api/places/details
- **Method:** `GET`
- **Path:** `/api/places/details` or `/api/search/details`
- **Route File:** `backend/routes/placesRoutes.js:20`
- **Middleware:** `None (Public)`
- **Controller:** `getPlaceDetails`
- **Service:** `backend/services/placesService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /details in backend/routes/placesRoutes.js

### `GET` /api/places/route
- **Method:** `GET`
- **Path:** `/api/places/route` or `/api/search/route`
- **Route File:** `backend/routes/placesRoutes.js:21`
- **Middleware:** `None (Public)`
- **Controller:** `getRouteDirections`
- **Service:** `backend/services/placesService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /route in backend/routes/placesRoutes.js

### `POST` /api/recommendations/
- **Method:** `POST`
- **Path:** `/api/recommendations/`
- **Route File:** `backend/routes/recommendationRoutes.js:11`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/recommendationService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for / in backend/routes/recommendationRoutes.js

### `GET` /api/rentals/
- **Method:** `GET`
- **Path:** `/api/rentals/` or `/rentals/`
- **Route File:** `backend/routes/rentalRoutes.js:16`
- **Middleware:** `None (Public)`
- **Controller:** `getRentals`
- **Service:** `backend/services/rentalService.js` (or direct controller query)
- **Model:** `Rental`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for / in backend/routes/rentalRoutes.js

### `POST` /api/rentals/
- **Method:** `POST`
- **Path:** `/api/rentals/` or `/rentals/`
- **Route File:** `backend/routes/rentalRoutes.js:17`
- **Middleware:** `protect, adminOnly`
- **Controller:** `createRental`
- **Service:** `backend/services/rentalService.js` (or direct controller query)
- **Model:** `Rental`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for / in backend/routes/rentalRoutes.js

### `GET` /api/rentals/:slug/related
- **Method:** `GET`
- **Path:** `/api/rentals/:slug/related` or `/rentals/:slug/related`
- **Route File:** `backend/routes/rentalRoutes.js:18`
- **Middleware:** `getRelatedBySlug(Rental`
- **Controller:** `'Rental')`
- **Service:** `backend/services/rentalService.js` (or direct controller query)
- **Model:** `Rental`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug/related in backend/routes/rentalRoutes.js

### `GET` /api/rentals/:slug
- **Method:** `GET`
- **Path:** `/api/rentals/:slug` or `/rentals/:slug`
- **Route File:** `backend/routes/rentalRoutes.js:19`
- **Middleware:** `None (Public)`
- **Controller:** `getRentalBySlug`
- **Service:** `backend/services/rentalService.js` (or direct controller query)
- **Model:** `Rental`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug in backend/routes/rentalRoutes.js

### `PATCH` /api/rentals/:id
- **Method:** `PATCH`
- **Path:** `/api/rentals/:id` or `/rentals/:id`
- **Route File:** `backend/routes/rentalRoutes.js:20`
- **Middleware:** `protect, adminOnly`
- **Controller:** `updateRental`
- **Service:** `backend/services/rentalService.js` (or direct controller query)
- **Model:** `Rental`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle PATCH operations for /:id in backend/routes/rentalRoutes.js

### `DELETE` /api/rentals/:id
- **Method:** `DELETE`
- **Path:** `/api/rentals/:id` or `/rentals/:id`
- **Route File:** `backend/routes/rentalRoutes.js:21`
- **Middleware:** `protect, adminOnly`
- **Controller:** `deleteRental`
- **Service:** `backend/services/rentalService.js` (or direct controller query)
- **Model:** `Rental`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle DELETE operations for /:id in backend/routes/rentalRoutes.js

### `GET` /api/reviews/:targetType/:targetId
- **Method:** `GET`
- **Path:** `/api/reviews/:targetType/:targetId`
- **Route File:** `backend/routes/reviewRoutes.js:11`
- **Middleware:** `None (Public)`
- **Controller:** `getReviews`
- **Service:** `backend/services/reviewService.js` (or direct controller query)
- **Model:** `Review`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:targetType/:targetId in backend/routes/reviewRoutes.js

### `POST` /api/reviews/
- **Method:** `POST`
- **Path:** `/api/reviews/`
- **Route File:** `backend/routes/reviewRoutes.js:12`
- **Middleware:** `protect`
- **Controller:** `createReview`
- **Service:** `backend/services/reviewService.js` (or direct controller query)
- **Model:** `Review`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle POST operations for / in backend/routes/reviewRoutes.js

### `GET` /api/reviews/my-reviews
- **Method:** `GET`
- **Path:** `/api/reviews/my-reviews`
- **Route File:** `backend/routes/reviewRoutes.js:13`
- **Middleware:** `protect`
- **Controller:** `getOwnReviews`
- **Service:** `backend/services/reviewService.js` (or direct controller query)
- **Model:** `Review`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle GET operations for /my-reviews in backend/routes/reviewRoutes.js

### `POST` /api/safety/trigger
- **Method:** `POST`
- **Path:** `/api/safety/trigger`
- **Route File:** `backend/routes/safetyRoutes.js:14`
- **Middleware:** `None (Public)`
- **Controller:** `triggerGeneralSos`
- **Service:** `backend/services/safetyService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /trigger in backend/routes/safetyRoutes.js

### `POST` /api/safety/altitude-check
- **Method:** `POST`
- **Path:** `/api/safety/altitude-check`
- **Route File:** `backend/routes/safetyRoutes.js:17`
- **Middleware:** `None (Public)`
- **Controller:** `evaluateAltitudeSafety`
- **Service:** `backend/services/safetyService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /altitude-check in backend/routes/safetyRoutes.js

### `POST` /api/safety/reroute-check
- **Method:** `POST`
- **Path:** `/api/safety/reroute-check`
- **Route File:** `backend/routes/safetyRoutes.js:20`
- **Middleware:** `None (Public)`
- **Controller:** `checkRoadSafetyAndReroute`
- **Service:** `backend/services/safetyService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /reroute-check in backend/routes/safetyRoutes.js

### `GET` /api/safety/incidents
- **Method:** `GET`
- **Path:** `/api/safety/incidents`
- **Route File:** `backend/routes/safetyRoutes.js:21`
- **Middleware:** `None (Public)`
- **Controller:** `getActiveIncidents`
- **Service:** `backend/services/safetyService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /incidents in backend/routes/safetyRoutes.js

### `GET` /api/safety/women-stays
- **Method:** `GET`
- **Path:** `/api/safety/women-stays`
- **Route File:** `backend/routes/safetyRoutes.js:24`
- **Middleware:** `None (Public)`
- **Controller:** `getWomenVerifiedStays`
- **Service:** `backend/services/safetyService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /women-stays in backend/routes/safetyRoutes.js

### `POST` /api/safety/women-sos
- **Method:** `POST`
- **Path:** `/api/safety/women-sos`
- **Route File:** `backend/routes/safetyRoutes.js:25`
- **Middleware:** `None (Public)`
- **Controller:** `triggerWomenSos`
- **Service:** `backend/services/safetyService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /women-sos in backend/routes/safetyRoutes.js

### `POST` /api/sos/trigger
- **Method:** `POST`
- **Path:** `/api/sos/trigger` or `/sos/trigger`
- **Route File:** `backend/routes/sosRoutes.js:27`
- **Middleware:** `sosLimiter`
- **Controller:** `triggerSos`
- **Service:** `backend/services/sosService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /trigger in backend/routes/sosRoutes.js

### `GET` /api/sos/active
- **Method:** `GET`
- **Path:** `/api/sos/active` or `/sos/active`
- **Route File:** `backend/routes/sosRoutes.js:30`
- **Middleware:** `None (Public)`
- **Controller:** `getActiveAlerts`
- **Service:** `backend/services/sosService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /active in backend/routes/sosRoutes.js

### `GET` /api/sos/nearby-rescue-posts
- **Method:** `GET`
- **Path:** `/api/sos/nearby-rescue-posts` or `/sos/nearby-rescue-posts`
- **Route File:** `backend/routes/sosRoutes.js:33`
- **Middleware:** `None (Public)`
- **Controller:** `getNearbyRescuePosts`
- **Service:** `backend/services/sosService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /nearby-rescue-posts in backend/routes/sosRoutes.js

### `POST` /api/sos/cancel
- **Method:** `POST`
- **Path:** `/api/sos/cancel` or `/sos/cancel`
- **Route File:** `backend/routes/sosRoutes.js:36`
- **Middleware:** `None (Public)`
- **Controller:** `cancelSos`
- **Service:** `backend/services/sosService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /cancel in backend/routes/sosRoutes.js

### `GET` /api/sos/:id
- **Method:** `GET`
- **Path:** `/api/sos/:id` or `/sos/:id`
- **Route File:** `backend/routes/sosRoutes.js:39`
- **Middleware:** `None (Public)`
- **Controller:** `getAlertById`
- **Service:** `backend/services/sosService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:id in backend/routes/sosRoutes.js

### `PUT` /api/sos/:id/status
- **Method:** `PUT`
- **Path:** `/api/sos/:id/status` or `/sos/:id/status`
- **Route File:** `backend/routes/sosRoutes.js:42`
- **Middleware:** `None (Public)`
- **Controller:** `updateAlertStatus`
- **Service:** `backend/services/sosService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle PUT operations for /:id/status in backend/routes/sosRoutes.js

### `GET` /api/spiritual/
- **Method:** `GET`
- **Path:** `/api/spiritual/` or `/spiritual/`
- **Route File:** `backend/routes/spiritualRoutes.js:16`
- **Middleware:** `None (Public)`
- **Controller:** `getSpiritualPlaces`
- **Service:** `backend/services/spiritualService.js` (or direct controller query)
- **Model:** `Spiritual`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for / in backend/routes/spiritualRoutes.js

### `POST` /api/spiritual/
- **Method:** `POST`
- **Path:** `/api/spiritual/` or `/spiritual/`
- **Route File:** `backend/routes/spiritualRoutes.js:17`
- **Middleware:** `protect, adminOnly`
- **Controller:** `createSpiritual`
- **Service:** `backend/services/spiritualService.js` (or direct controller query)
- **Model:** `Spiritual`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for / in backend/routes/spiritualRoutes.js

### `GET` /api/spiritual/:slug/related
- **Method:** `GET`
- **Path:** `/api/spiritual/:slug/related` or `/spiritual/:slug/related`
- **Route File:** `backend/routes/spiritualRoutes.js:18`
- **Middleware:** `getRelatedBySlug(Spiritual`
- **Controller:** `'Spiritual')`
- **Service:** `backend/services/spiritualService.js` (or direct controller query)
- **Model:** `Spiritual`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug/related in backend/routes/spiritualRoutes.js

### `GET` /api/spiritual/:slug
- **Method:** `GET`
- **Path:** `/api/spiritual/:slug` or `/spiritual/:slug`
- **Route File:** `backend/routes/spiritualRoutes.js:19`
- **Middleware:** `None (Public)`
- **Controller:** `getSpiritualBySlug`
- **Service:** `backend/services/spiritualService.js` (or direct controller query)
- **Model:** `Spiritual`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug in backend/routes/spiritualRoutes.js

### `PATCH` /api/spiritual/:id
- **Method:** `PATCH`
- **Path:** `/api/spiritual/:id` or `/spiritual/:id`
- **Route File:** `backend/routes/spiritualRoutes.js:20`
- **Middleware:** `protect, adminOnly`
- **Controller:** `updateSpiritual`
- **Service:** `backend/services/spiritualService.js` (or direct controller query)
- **Model:** `Spiritual`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle PATCH operations for /:id in backend/routes/spiritualRoutes.js

### `DELETE` /api/spiritual/:id
- **Method:** `DELETE`
- **Path:** `/api/spiritual/:id` or `/spiritual/:id`
- **Route File:** `backend/routes/spiritualRoutes.js:21`
- **Middleware:** `protect, adminOnly`
- **Controller:** `deleteSpiritual`
- **Service:** `backend/services/spiritualService.js` (or direct controller query)
- **Model:** `Spiritual`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle DELETE operations for /:id in backend/routes/spiritualRoutes.js

### `GET` /api/stays/
- **Method:** `GET`
- **Path:** `/api/stays/` or `/stays/`
- **Route File:** `backend/routes/stayRoutes.js:16`
- **Middleware:** `None (Public)`
- **Controller:** `getStays`
- **Service:** `backend/services/stayService.js` (or direct controller query)
- **Model:** `Stay`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for / in backend/routes/stayRoutes.js

### `POST` /api/stays/
- **Method:** `POST`
- **Path:** `/api/stays/` or `/stays/`
- **Route File:** `backend/routes/stayRoutes.js:17`
- **Middleware:** `protect, adminOnly`
- **Controller:** `createStay`
- **Service:** `backend/services/stayService.js` (or direct controller query)
- **Model:** `Stay`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle POST operations for / in backend/routes/stayRoutes.js

### `GET` /api/stays/:slug/related
- **Method:** `GET`
- **Path:** `/api/stays/:slug/related` or `/stays/:slug/related`
- **Route File:** `backend/routes/stayRoutes.js:18`
- **Middleware:** `getRelatedBySlug(Stay`
- **Controller:** `'Stay')`
- **Service:** `backend/services/stayService.js` (or direct controller query)
- **Model:** `Stay`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug/related in backend/routes/stayRoutes.js

### `GET` /api/stays/:slug
- **Method:** `GET`
- **Path:** `/api/stays/:slug` or `/stays/:slug`
- **Route File:** `backend/routes/stayRoutes.js:19`
- **Middleware:** `None (Public)`
- **Controller:** `getStayBySlug`
- **Service:** `backend/services/stayService.js` (or direct controller query)
- **Model:** `Stay`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /:slug in backend/routes/stayRoutes.js

### `PATCH` /api/stays/:id
- **Method:** `PATCH`
- **Path:** `/api/stays/:id` or `/stays/:id`
- **Route File:** `backend/routes/stayRoutes.js:20`
- **Middleware:** `protect, adminOnly`
- **Controller:** `updateStay`
- **Service:** `backend/services/stayService.js` (or direct controller query)
- **Model:** `Stay`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle PATCH operations for /:id in backend/routes/stayRoutes.js

### `DELETE` /api/stays/:id
- **Method:** `DELETE`
- **Path:** `/api/stays/:id` or `/stays/:id`
- **Route File:** `backend/routes/stayRoutes.js:21`
- **Middleware:** `protect, adminOnly`
- **Controller:** `deleteStay`
- **Service:** `backend/services/stayService.js` (or direct controller query)
- **Model:** `Stay`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Admin Only
- **Purpose:** Handle DELETE operations for /:id in backend/routes/stayRoutes.js

### `GET` /api/transports/
- **Method:** `GET`
- **Path:** `/api/transports/`
- **Route File:** `backend/routes/transportRoutes.js:6`
- **Middleware:** `None (Public)`
- **Controller:** `getTransports`
- **Service:** `backend/services/transportService.js` (or direct controller query)
- **Model:** `Transport`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for / in backend/routes/transportRoutes.js

### `GET` /api/transports/corridor
- **Method:** `GET`
- **Path:** `/api/transports/corridor`
- **Route File:** `backend/routes/transportRoutes.js:7`
- **Middleware:** `None (Public)`
- **Controller:** `getCorridorTransports`
- **Service:** `backend/services/transportService.js` (or direct controller query)
- **Model:** `Transport`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /corridor in backend/routes/transportRoutes.js

### `GET` /api/trips/
- **Method:** `GET`
- **Path:** `/api/trips/`
- **Route File:** `backend/routes/tripRoutes.js:7`
- **Middleware:** `protect`
- **Controller:** `getTrips`
- **Service:** `backend/services/tripService.js` (or direct controller query)
- **Model:** `Trip`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle GET operations for / in backend/routes/tripRoutes.js

### `GET` /api/trips/:id
- **Method:** `GET`
- **Path:** `/api/trips/:id`
- **Route File:** `backend/routes/tripRoutes.js:8`
- **Middleware:** `protect`
- **Controller:** `getTripById`
- **Service:** `backend/services/tripService.js` (or direct controller query)
- **Model:** `Trip`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle GET operations for /:id in backend/routes/tripRoutes.js

### `POST` /api/trips/
- **Method:** `POST`
- **Path:** `/api/trips/`
- **Route File:** `backend/routes/tripRoutes.js:9`
- **Middleware:** `protect`
- **Controller:** `createTrip`
- **Service:** `backend/services/tripService.js` (or direct controller query)
- **Model:** `Trip`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle POST operations for / in backend/routes/tripRoutes.js

### `PATCH` /api/trips/:id
- **Method:** `PATCH`
- **Path:** `/api/trips/:id`
- **Route File:** `backend/routes/tripRoutes.js:10`
- **Middleware:** `protect`
- **Controller:** `updateTrip`
- **Service:** `backend/services/tripService.js` (or direct controller query)
- **Model:** `Trip`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle PATCH operations for /:id in backend/routes/tripRoutes.js

### `DELETE` /api/trips/:id
- **Method:** `DELETE`
- **Path:** `/api/trips/:id`
- **Route File:** `backend/routes/tripRoutes.js:11`
- **Middleware:** `protect`
- **Controller:** `deleteTrip`
- **Service:** `backend/services/tripService.js` (or direct controller query)
- **Model:** `Trip`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle DELETE operations for /:id in backend/routes/tripRoutes.js

### `GET` /api/truth/inspect/:id
- **Method:** `GET`
- **Path:** `/api/truth/inspect/:id`
- **Route File:** `backend/routes/truthRoutes.js:7`
- **Middleware:** `None (Public)`
- **Controller:** `inspectListingTruth`
- **Service:** `backend/services/truthService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /inspect/:id in backend/routes/truthRoutes.js

### `POST` /api/truth/evaluate
- **Method:** `POST`
- **Path:** `/api/truth/evaluate`
- **Route File:** `backend/routes/truthRoutes.js:10`
- **Middleware:** `None (Public)`
- **Controller:** `submitTruthVerification`
- **Service:** `backend/services/truthService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /evaluate in backend/routes/truthRoutes.js

### `POST` /api/upload/
- **Method:** `POST`
- **Path:** `/api/upload/`
- **Route File:** `backend/routes/uploadRoutes.js:15`
- **Middleware:** `protect, upload.single('image'), async (req`
- **Controller:** `res`
- **Service:** `backend/services/uploadService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle POST operations for / in backend/routes/uploadRoutes.js

### `DELETE` /api/upload/*publicId
- **Method:** `DELETE`
- **Path:** `/api/upload/*publicId`
- **Route File:** `backend/routes/uploadRoutes.js:72`
- **Middleware:** `protect, async (req`
- **Controller:** `res`
- **Service:** `backend/services/uploadService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** YES (JWT Bearer Token)
- **Role:** Authenticated User
- **Purpose:** Handle DELETE operations for /*publicId in backend/routes/uploadRoutes.js

### `GET` /api/users/me
- **Method:** `GET`
- **Path:** `/api/users/me`
- **Route File:** `backend/routes/userRoutes.js:17`
- **Middleware:** `None (Public)`
- **Controller:** `getUserProfile`
- **Service:** `backend/services/userService.js` (or direct controller query)
- **Model:** `User`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /me in backend/routes/userRoutes.js

### `GET` /api/users/profile
- **Method:** `GET`
- **Path:** `/api/users/profile`
- **Route File:** `backend/routes/userRoutes.js:18`
- **Middleware:** `None (Public)`
- **Controller:** `getUserProfile`
- **Service:** `backend/services/userService.js` (or direct controller query)
- **Model:** `User`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /profile in backend/routes/userRoutes.js

### `PUT` /api/users/profile
- **Method:** `PUT`
- **Path:** `/api/users/profile`
- **Route File:** `backend/routes/userRoutes.js:19`
- **Middleware:** `None (Public)`
- **Controller:** `updateUserProfile`
- **Service:** `backend/services/userService.js` (or direct controller query)
- **Model:** `User`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle PUT operations for /profile in backend/routes/userRoutes.js

### `PATCH` /api/users/profile
- **Method:** `PATCH`
- **Path:** `/api/users/profile`
- **Route File:** `backend/routes/userRoutes.js:20`
- **Middleware:** `None (Public)`
- **Controller:** `updateUserProfile`
- **Service:** `backend/services/userService.js` (or direct controller query)
- **Model:** `User`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle PATCH operations for /profile in backend/routes/userRoutes.js

### `PATCH` /api/users/me/location
- **Method:** `PATCH`
- **Path:** `/api/users/me/location`
- **Route File:** `backend/routes/userRoutes.js:21`
- **Middleware:** `None (Public)`
- **Controller:** `updateUserLocation`
- **Service:** `backend/services/userService.js` (or direct controller query)
- **Model:** `User`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle PATCH operations for /me/location in backend/routes/userRoutes.js

### `PATCH` /api/users/profile/location
- **Method:** `PATCH`
- **Path:** `/api/users/profile/location`
- **Route File:** `backend/routes/userRoutes.js:22`
- **Middleware:** `None (Public)`
- **Controller:** `updateUserLocation`
- **Service:** `backend/services/userService.js` (or direct controller query)
- **Model:** `User`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle PATCH operations for /profile/location in backend/routes/userRoutes.js

### `GET` /api/users/bookings
- **Method:** `GET`
- **Path:** `/api/users/bookings`
- **Route File:** `backend/routes/userRoutes.js:23`
- **Middleware:** `None (Public)`
- **Controller:** `getUserBookings`
- **Service:** `backend/services/userService.js` (or direct controller query)
- **Model:** `User`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /bookings in backend/routes/userRoutes.js

### `POST` /api/users/bookings
- **Method:** `POST`
- **Path:** `/api/users/bookings`
- **Route File:** `backend/routes/userRoutes.js:24`
- **Middleware:** `None (Public)`
- **Controller:** `createBooking`
- **Service:** `backend/services/userService.js` (or direct controller query)
- **Model:** `User`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /bookings in backend/routes/userRoutes.js

### `GET` /api/users/reviews
- **Method:** `GET`
- **Path:** `/api/users/reviews`
- **Route File:** `backend/routes/userRoutes.js:25`
- **Middleware:** `None (Public)`
- **Controller:** `getUserReviews`
- **Service:** `backend/services/userService.js` (or direct controller query)
- **Model:** `User`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /reviews in backend/routes/userRoutes.js

### `GET` /api/users/trips
- **Method:** `GET`
- **Path:** `/api/users/trips`
- **Route File:** `backend/routes/userRoutes.js:26`
- **Middleware:** `None (Public)`
- **Controller:** `getUserTrips`
- **Service:** `backend/services/userService.js` (or direct controller query)
- **Model:** `User`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /trips in backend/routes/userRoutes.js

### `GET` /api/verification/inspect/listing/:id
- **Method:** `GET`
- **Path:** `/api/verification/inspect/listing/:id`
- **Route File:** `backend/routes/verificationRoutes.js:16`
- **Middleware:** `None (Public)`
- **Controller:** `inspectListing`
- **Service:** `backend/services/verificationService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /inspect/listing/:id in backend/routes/verificationRoutes.js

### `GET` /api/verification/inspect/vehicle/:vehicleNumber
- **Method:** `GET`
- **Path:** `/api/verification/inspect/vehicle/:vehicleNumber`
- **Route File:** `backend/routes/verificationRoutes.js:17`
- **Middleware:** `None (Public)`
- **Controller:** `inspectVehicle`
- **Service:** `backend/services/verificationService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /inspect/vehicle/:vehicleNumber in backend/routes/verificationRoutes.js

### `GET` /api/verification/qr/listing/:id
- **Method:** `GET`
- **Path:** `/api/verification/qr/listing/:id`
- **Route File:** `backend/routes/verificationRoutes.js:20`
- **Middleware:** `None (Public)`
- **Controller:** `getListingQr`
- **Service:** `backend/services/verificationService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /qr/listing/:id in backend/routes/verificationRoutes.js

### `GET` /api/voice/greeting
- **Method:** `GET`
- **Path:** `/api/voice/greeting` or `/voice/greeting`
- **Route File:** `backend/routes/voiceRoutes.js:122`
- **Middleware:** `(req`
- **Controller:** `res`
- **Service:** `backend/services/voiceService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /greeting in backend/routes/voiceRoutes.js

### `GET` /api/voice/health
- **Method:** `GET`
- **Path:** `/api/voice/health` or `/voice/health`
- **Route File:** `backend/routes/voiceRoutes.js:136`
- **Middleware:** `(req`
- **Controller:** `res`
- **Service:** `backend/services/voiceService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /health in backend/routes/voiceRoutes.js

### `POST` /api/voice/transcribe
- **Method:** `POST`
- **Path:** `/api/voice/transcribe` or `/voice/transcribe`
- **Route File:** `backend/routes/voiceRoutes.js:150`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/voiceService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /transcribe in backend/routes/voiceRoutes.js

### `POST` /api/voice/elevenlabs/tts
- **Method:** `POST`
- **Path:** `/api/voice/elevenlabs/tts` or `/voice/elevenlabs/tts`
- **Route File:** `backend/routes/voiceRoutes.js:173`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/voiceService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /elevenlabs/tts in backend/routes/voiceRoutes.js

### `GET` /api/voice/elevenlabs/voices
- **Method:** `GET`
- **Path:** `/api/voice/elevenlabs/voices` or `/voice/elevenlabs/voices`
- **Route File:** `backend/routes/voiceRoutes.js:190`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/voiceService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle GET operations for /elevenlabs/voices in backend/routes/voiceRoutes.js

### `POST` /api/voice/ask
- **Method:** `POST`
- **Path:** `/api/voice/ask` or `/voice/ask`
- **Route File:** `backend/routes/voiceRoutes.js:202`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/voiceService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /ask in backend/routes/voiceRoutes.js

### `POST` /api/voice/audio_query
- **Method:** `POST`
- **Path:** `/api/voice/audio_query` or `/voice/audio_query`
- **Route File:** `backend/routes/voiceRoutes.js:306`
- **Middleware:** `async (req`
- **Controller:** `res`
- **Service:** `backend/services/voiceService.js` (or direct controller query)
- **Model:** `Determined by Controller`
- **Auth Required:** NO (Public)
- **Role:** Any Visitor
- **Purpose:** Handle POST operations for /audio_query in backend/routes/voiceRoutes.js

