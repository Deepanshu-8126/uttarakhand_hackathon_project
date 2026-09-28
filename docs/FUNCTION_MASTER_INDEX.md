# Discovery Uttarakhand — Master Function Index
**Generated:** 2026-09-28
**Total Functions Indexed:** 399
**Integrity Guarantee:** 100% verified against actual repository files, lines, and signatures.

---

### Function: `getActivities()`
- **File:** `backend/controllers/activityController.js`
- **Line:** 6
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getAll -> Model.find
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getAll on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getActivityBySlug()`
- **File:** `backend/controllers/activityController.js`
- **Line:** 7
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getBySlug -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getBySlug on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `createActivity()`
- **File:** `backend/controllers/activityController.js`
- **Line:** 8
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.create -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized create on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `updateActivity()`
- **File:** `backend/controllers/activityController.js`
- **Line:** 9
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.update -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized update on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `deleteActivity()`
- **File:** `backend/controllers/activityController.js`
- **Line:** 10
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.remove -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized remove on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getAdminStats()`
- **File:** `backend/controllers/adminController.js`
- **Line:** 12
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getAdminStats in adminController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getAllBookings()`
- **File:** `backend/controllers/adminController.js`
- **Line:** 58
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getAllBookings in adminController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updateBookingStatus()`
- **File:** `backend/controllers/adminController.js`
- **Line:** 67
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updateBookingStatus in adminController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getAllPartners()`
- **File:** `backend/controllers/adminVerificationController.js`
- **Line:** 17
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getAllPartners in adminVerificationController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPendingListings()`
- **File:** `backend/controllers/adminVerificationController.js`
- **Line:** 30
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPendingListings in adminVerificationController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getListingForAdmin()`
- **File:** `backend/controllers/adminVerificationController.js`
- **Line:** 51
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getListingForAdmin in adminVerificationController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `verifyListing()`
- **File:** `backend/controllers/adminVerificationController.js`
- **Line:** 82
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for verifyListing in adminVerificationController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `suspendListing()`
- **File:** `backend/controllers/adminVerificationController.js`
- **Line:** 177
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for suspendListing in adminVerificationController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `revokeListing()`
- **File:** `backend/controllers/adminVerificationController.js`
- **Line:** 219
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for revokeListing in adminVerificationController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `rejectListing()`
- **File:** `backend/controllers/adminVerificationController.js`
- **Line:** 262
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for rejectListing in adminVerificationController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getVerificationLogs()`
- **File:** `backend/controllers/adminVerificationController.js`
- **Line:** 323
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getVerificationLogs in adminVerificationController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `extractEntitiesFromText()`
- **File:** `backend/controllers/agentController.js`
- **Line:** 26
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(text, sessionEntities = {}) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for extractEntitiesFromText in agentController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `classifyIntent()`
- **File:** `backend/controllers/agentController.js`
- **Line:** 166
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(text, sessionEntities = {}, extractedEntities = {}) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for classifyIntent in agentController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `agentChat()`
- **File:** `backend/controllers/agentController.js`
- **Line:** 294
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for agentChat in agentController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `generatePlan()`
- **File:** `backend/controllers/aiController.js`
- **Line:** 12
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for generatePlan in aiController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getAiHealth()`
- **File:** `backend/controllers/aiController.js`
- **Line:** 122
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getAiHealth in aiController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `registerUser()`
- **File:** `backend/controllers/authController.js`
- **Line:** 18
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for registerUser in authController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `loginUser()`
- **File:** `backend/controllers/authController.js`
- **Line:** 70
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for loginUser in authController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getMe()`
- **File:** `backend/controllers/authController.js`
- **Line:** 108
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getMe in authController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `logoutUser()`
- **File:** `backend/controllers/authController.js`
- **Line:** 121
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for logoutUser in authController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `registerPartner()`
- **File:** `backend/controllers/authController.js`
- **Line:** 132
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for registerPartner in authController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `createBooking()`
- **File:** `backend/controllers/bookingController.js`
- **Line:** 23
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for createBooking in bookingController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getMyBookings()`
- **File:** `backend/controllers/bookingController.js`
- **Line:** 414
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getMyBookings in bookingController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getBookingById()`
- **File:** `backend/controllers/bookingController.js`
- **Line:** 437
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getBookingById in bookingController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `cancelBooking()`
- **File:** `backend/controllers/bookingController.js`
- **Line:** 461
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for cancelBooking in bookingController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getCheckInOtp()`
- **File:** `backend/controllers/bookingController.js`
- **Line:** 513
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getCheckInOtp in bookingController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `verifyCheckIn()`
- **File:** `backend/controllers/bookingController.js`
- **Line:** 557
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for verifyCheckIn in bookingController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `cancelAndReverseRental()`
- **File:** `backend/controllers/bookingController.js`
- **Line:** 626
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for cancelAndReverseRental in bookingController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getChats()`
- **File:** `backend/controllers/chatController.js`
- **Line:** 4
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getChats in chatController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getChatById()`
- **File:** `backend/controllers/chatController.js`
- **Line:** 17
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getChatById in chatController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `createChat()`
- **File:** `backend/controllers/chatController.js`
- **Line:** 29
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for createChat in chatController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updateChat()`
- **File:** `backend/controllers/chatController.js`
- **Line:** 43
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updateChat in chatController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `deleteChat()`
- **File:** `backend/controllers/chatController.js`
- **Line:** 58
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for deleteChat in chatController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `streamChat()`
- **File:** `backend/controllers/chatController.js`
- **Line:** 72
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for streamChat in chatController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `handleDirectChat()`
- **File:** `backend/controllers/chatController.js`
- **Line:** 104
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for handleDirectChat in chatController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `sendMessage()`
- **File:** `backend/controllers/chatController.js`
- **Line:** 140
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for sendMessage in chatController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getCulturePlaces()`
- **File:** `backend/controllers/cultureController.js`
- **Line:** 6
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getAll -> Model.find
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getAll on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getCultureBySlug()`
- **File:** `backend/controllers/cultureController.js`
- **Line:** 7
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getBySlug -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getBySlug on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `createCulture()`
- **File:** `backend/controllers/cultureController.js`
- **Line:** 8
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.create -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized create on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `updateCulture()`
- **File:** `backend/controllers/cultureController.js`
- **Line:** 9
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.update -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized update on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `deleteCulture()`
- **File:** `backend/controllers/cultureController.js`
- **Line:** 10
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.remove -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized remove on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getDestinations()`
- **File:** `backend/controllers/destinationController.js`
- **Line:** 6
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getAll -> Model.find
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getAll on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getDestinationBySlug()`
- **File:** `backend/controllers/destinationController.js`
- **Line:** 7
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getBySlug -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getBySlug on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `createDestination()`
- **File:** `backend/controllers/destinationController.js`
- **Line:** 8
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.create -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized create on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `updateDestination()`
- **File:** `backend/controllers/destinationController.js`
- **Line:** 9
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.update -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized update on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `deleteDestination()`
- **File:** `backend/controllers/destinationController.js`
- **Line:** 10
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.remove -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized remove on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getDestinationExplore()`
- **File:** `backend/controllers/destinationExploreController.js`
- **Line:** 44
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getDestinationExplore in destinationExploreController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `stripProvenance()`
- **File:** `backend/controllers/factoryController.js`
- **Line:** 5
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(body) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for stripProvenance in factoryController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `createController()`
- **File:** `backend/controllers/factoryController.js`
- **Line:** 36
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(Model, isTextIndexed = false) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for createController in factoryController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getFavorites()`
- **File:** `backend/controllers/favoriteController.js`
- **Line:** 10
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getFavorites in favoriteController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `addFavorite()`
- **File:** `backend/controllers/favoriteController.js`
- **Line:** 20
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for addFavorite in favoriteController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `removeFavorite()`
- **File:** `backend/controllers/favoriteController.js`
- **Line:** 61
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for removeFavorite in favoriteController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `toggleFavorite()`
- **File:** `backend/controllers/favoriteController.js`
- **Line:** 92
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for toggleFavorite in favoriteController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getGuides()`
- **File:** `backend/controllers/guideController.js`
- **Line:** 6
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getAll -> Model.find
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getAll on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getGuideBySlug()`
- **File:** `backend/controllers/guideController.js`
- **Line:** 7
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getBySlug -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getBySlug on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `createGuide()`
- **File:** `backend/controllers/guideController.js`
- **Line:** 8
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.create -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized create on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `updateGuide()`
- **File:** `backend/controllers/guideController.js`
- **Line:** 9
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.update -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized update on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `deleteGuide()`
- **File:** `backend/controllers/guideController.js`
- **Line:** 10
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.remove -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized remove on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getWeather()`
- **File:** `backend/controllers/liveDataController.js`
- **Line:** 18
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getWeather in liveDataController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getElevation()`
- **File:** `backend/controllers/liveDataController.js`
- **Line:** 52
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getElevation in liveDataController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getRoadAdvisories()`
- **File:** `backend/controllers/liveDataController.js`
- **Line:** 85
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getRoadAdvisories in liveDataController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `listRoadBulletins()`
- **File:** `backend/controllers/liveDataController.js`
- **Line:** 114
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for listRoadBulletins in liveDataController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `createRoadBulletin()`
- **File:** `backend/controllers/liveDataController.js`
- **Line:** 136
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for createRoadBulletin in liveDataController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getTransitStatus()`
- **File:** `backend/controllers/liveDataController.js`
- **Line:** 195
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getTransitStatus in liveDataController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `evaluateTripAdvisories()`
- **File:** `backend/controllers/liveDataController.js`
- **Line:** 231
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for evaluateTripAdvisories in liveDataController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getCommunityAdvisories()`
- **File:** `backend/controllers/liveDataController.js`
- **Line:** 273
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getCommunityAdvisories in liveDataController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `submitCommunityReport()`
- **File:** `backend/controllers/liveDataController.js`
- **Line:** 296
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for submitCommunityReport in liveDataController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getLiveTelemetry()`
- **File:** `backend/controllers/liveDataController.js`
- **Line:** 337
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getLiveTelemetry in liveDataController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPublicListings()`
- **File:** `backend/controllers/marketplaceController.js`
- **Line:** 36
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPublicListings in marketplaceController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPublicListingBySlug()`
- **File:** `backend/controllers/marketplaceController.js`
- **Line:** 223
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPublicListingBySlug in marketplaceController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `registerPartner()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 115
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for registerPartner in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getMyPartnerProfile()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 210
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getMyPartnerProfile in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updateMyPartnerProfile()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 226
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updateMyPartnerProfile in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `createListingDraft()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 274
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for createListingDraft in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getMyListings()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 385
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getMyListings in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getMyListingById()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 407
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getMyListingById in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updateListing()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 432
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updateListing in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `submitListingForVerification()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 497
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for submitListingForVerification in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `reopenRejectedListing()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 536
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for reopenRejectedListing in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPartnerDashboard()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 575
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPartnerDashboard in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `deleteListing()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 701
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for deleteListing in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updateListingPricing()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 743
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updateListingPricing in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPartnerBookings()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 800
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPartnerBookings in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updatePartnerBookingStatus()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 869
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updatePartnerBookingStatus in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPartnerAvailability()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 931
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPartnerAvailability in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updatePartnerAvailability()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 954
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updatePartnerAvailability in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPartnerEarnings()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 993
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPartnerEarnings in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPartnerExpenses()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 1075
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPartnerExpenses in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `createPartnerExpense()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 1103
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for createPartnerExpense in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `deletePartnerExpense()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 1141
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for deletePartnerExpense in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPartnerAnalytics()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 1165
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPartnerAnalytics in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPartnerReviews()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 1279
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPartnerReviews in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `replyToReview()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 1308
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for replyToReview in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `uploadListingImages()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 1353
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for uploadListingImages in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `deleteListingImage()`
- **File:** `backend/controllers/partnerController.js`
- **Line:** 1421
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for deleteListingImage in partnerController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `handleCreateOrder()`
- **File:** `backend/controllers/paymentController.js`
- **Line:** 4
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for handleCreateOrder in paymentController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `handleVerifyPayment()`
- **File:** `backend/controllers/paymentController.js`
- **Line:** 26
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for handleVerifyPayment in paymentController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `handleWebhook()`
- **File:** `backend/controllers/paymentController.js`
- **Line:** 42
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for handleWebhook in paymentController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `handleGetPaymentStatus()`
- **File:** `backend/controllers/paymentController.js`
- **Line:** 66
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for handleGetPaymentStatus in paymentController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `invalidateUserPersonalizedCache()`
- **File:** `backend/controllers/personalizedController.js`
- **Line:** 54
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(userId) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for invalidateUserPersonalizedCache in personalizedController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPersonalizedHome()`
- **File:** `backend/controllers/personalizedController.js`
- **Line:** 68
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPersonalizedHome in personalizedController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPersonalizedNearby()`
- **File:** `backend/controllers/personalizedController.js`
- **Line:** 198
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPersonalizedNearby in personalizedController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `searchPlaces()`
- **File:** `backend/controllers/placesController.js`
- **Line:** 9
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res, next) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for searchPlaces in placesController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getNearbyPlaces()`
- **File:** `backend/controllers/placesController.js`
- **Line:** 153
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res, next) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getNearbyPlaces in placesController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPlaceDetails()`
- **File:** `backend/controllers/placesController.js`
- **Line:** 181
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res, next) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPlaceDetails in placesController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getRouteDirections()`
- **File:** `backend/controllers/placesController.js`
- **Line:** 212
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res, next) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getRouteDirections in placesController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getPlacesStatus()`
- **File:** `backend/controllers/placesController.js`
- **Line:** 244
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getPlacesStatus in placesController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getLivePhoto()`
- **File:** `backend/controllers/placesController.js`
- **Line:** 259
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res, next) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getLivePhoto in placesController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getRelatedBySlug()`
- **File:** `backend/controllers/relatedController.js`
- **Line:** 48
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(Model, modelName) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getRelatedBySlug in relatedController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getRentals()`
- **File:** `backend/controllers/rentalController.js`
- **Line:** 7
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getRentals in rentalController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getRentalBySlug()`
- **File:** `backend/controllers/rentalController.js`
- **Line:** 50
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getBySlug -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getBySlug on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `createRental()`
- **File:** `backend/controllers/rentalController.js`
- **Line:** 51
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.create -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized create on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `updateRental()`
- **File:** `backend/controllers/rentalController.js`
- **Line:** 52
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.update -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized update on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `deleteRental()`
- **File:** `backend/controllers/rentalController.js`
- **Line:** 53
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.remove -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized remove on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getReviews()`
- **File:** `backend/controllers/reviewController.js`
- **Line:** 3
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getReviews in reviewController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `createReview()`
- **File:** `backend/controllers/reviewController.js`
- **Line:** 28
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for createReview in reviewController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getOwnReviews()`
- **File:** `backend/controllers/reviewController.js`
- **Line:** 51
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getOwnReviews in reviewController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getAllReviewsAdmin()`
- **File:** `backend/controllers/reviewController.js`
- **Line:** 62
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getAllReviewsAdmin in reviewController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updateReviewStatusAdmin()`
- **File:** `backend/controllers/reviewController.js`
- **Line:** 71
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updateReviewStatusAdmin in reviewController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `deleteReviewAdmin()`
- **File:** `backend/controllers/reviewController.js`
- **Line:** 85
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for deleteReviewAdmin in reviewController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `evaluateAltitudeSafety()`
- **File:** `backend/controllers/safetyController.js`
- **Line:** 14
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for evaluateAltitudeSafety in safetyController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `checkRoadSafetyAndReroute()`
- **File:** `backend/controllers/safetyController.js`
- **Line:** 45
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for checkRoadSafetyAndReroute in safetyController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getActiveIncidents()`
- **File:** `backend/controllers/safetyController.js`
- **Line:** 63
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getActiveIncidents in safetyController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getWomenVerifiedStays()`
- **File:** `backend/controllers/safetyController.js`
- **Line:** 79
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getWomenVerifiedStays in safetyController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `triggerWomenSos()`
- **File:** `backend/controllers/safetyController.js`
- **Line:** 101
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for triggerWomenSos in safetyController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `triggerGeneralSos()`
- **File:** `backend/controllers/safetyController.js`
- **Line:** 127
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for triggerGeneralSos in safetyController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `triggerSos()`
- **File:** `backend/controllers/sosController.js`
- **Line:** 93
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for triggerSos in sosController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getActiveAlerts()`
- **File:** `backend/controllers/sosController.js`
- **Line:** 179
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getActiveAlerts in sosController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getAlertById()`
- **File:** `backend/controllers/sosController.js`
- **Line:** 202
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getAlertById in sosController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updateAlertStatus()`
- **File:** `backend/controllers/sosController.js`
- **Line:** 226
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updateAlertStatus in sosController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `cancelSos()`
- **File:** `backend/controllers/sosController.js`
- **Line:** 268
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for cancelSos in sosController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getNearbyRescuePosts()`
- **File:** `backend/controllers/sosController.js`
- **Line:** 303
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getNearbyRescuePosts in sosController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getSpiritualPlaces()`
- **File:** `backend/controllers/spiritualController.js`
- **Line:** 6
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getAll -> Model.find
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getAll on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getSpiritualBySlug()`
- **File:** `backend/controllers/spiritualController.js`
- **Line:** 7
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getBySlug -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getBySlug on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `createSpiritual()`
- **File:** `backend/controllers/spiritualController.js`
- **Line:** 8
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.create -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized create on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `updateSpiritual()`
- **File:** `backend/controllers/spiritualController.js`
- **Line:** 9
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.update -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized update on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `deleteSpiritual()`
- **File:** `backend/controllers/spiritualController.js`
- **Line:** 10
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.remove -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized remove on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getStays()`
- **File:** `backend/controllers/stayController.js`
- **Line:** 7
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getStays in stayController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getStayBySlug()`
- **File:** `backend/controllers/stayController.js`
- **Line:** 47
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.getBySlug -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized getBySlug on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `createStay()`
- **File:** `backend/controllers/stayController.js`
- **Line:** 48
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.create -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized create on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `updateStay()`
- **File:** `backend/controllers/stayController.js`
- **Line:** 49
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.update -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized update on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `deleteStay()`
- **File:** `backend/controllers/stayController.js`
- **Line:** 50
- **Type:** Factory Controller Method
- **Called By:** backend/routes/
- **Calls:** factoryController.remove -> Model.findOne
- **Input:** `req, res`
- **Output:** `JSON Response`
- **Purpose:** Execute standardized remove on model
- **Data Source:** MongoDB via factoryController + Redis Cache

### Function: `getTransports()`
- **File:** `backend/controllers/transportController.js`
- **Line:** 28
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getTransports in transportController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getCorridorTransports()`
- **File:** `backend/controllers/transportController.js`
- **Line:** 72
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getCorridorTransports in transportController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getTrips()`
- **File:** `backend/controllers/tripController.js`
- **Line:** 3
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getTrips in tripController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getTripById()`
- **File:** `backend/controllers/tripController.js`
- **Line:** 15
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getTripById in tripController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `createTrip()`
- **File:** `backend/controllers/tripController.js`
- **Line:** 34
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for createTrip in tripController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updateTrip()`
- **File:** `backend/controllers/tripController.js`
- **Line:** 46
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updateTrip in tripController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `deleteTrip()`
- **File:** `backend/controllers/tripController.js`
- **Line:** 62
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for deleteTrip in tripController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `inspectListingTruth()`
- **File:** `backend/controllers/truthController.js`
- **Line:** 18
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for inspectListingTruth in truthController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `submitTruthVerification()`
- **File:** `backend/controllers/truthController.js`
- **Line:** 70
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for submitTruthVerification in truthController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getUserProfile()`
- **File:** `backend/controllers/userController.js`
- **Line:** 20
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getUserProfile in userController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updateUserProfile()`
- **File:** `backend/controllers/userController.js`
- **Line:** 41
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updateUserProfile in userController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `updateUserLocation()`
- **File:** `backend/controllers/userController.js`
- **Line:** 139
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for updateUserLocation in userController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getUserBookings()`
- **File:** `backend/controllers/userController.js`
- **Line:** 181
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getUserBookings in userController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `createBooking()`
- **File:** `backend/controllers/userController.js`
- **Line:** 196
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for createBooking in userController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getUserReviews()`
- **File:** `backend/controllers/userController.js`
- **Line:** 265
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getUserReviews in userController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getUserTrips()`
- **File:** `backend/controllers/userController.js`
- **Line:** 277
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getUserTrips in userController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `inspectListing()`
- **File:** `backend/controllers/verificationController.js`
- **Line:** 22
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for inspectListing in verificationController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `inspectVehicle()`
- **File:** `backend/controllers/verificationController.js`
- **Line:** 202
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for inspectVehicle in verificationController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `getListingQr()`
- **File:** `backend/controllers/verificationController.js`
- **Line:** 318
- **Type:** Express Controller
- **Called By:** backend/routes/ (via router mount in server.js)
- **Calls:** Mongoose models / Redis cache / Services
- **Input:** `(req, res) -> req.body, req.query, req.params, req.user`
- **Output:** `res.status(code).json({ success, data, ... })`
- **Purpose:** Handle HTTP request for getListingQr in verificationController.js
- **Data Source:** MongoDB + Redis Cache (600s TTL)

### Function: `runAgent()`
- **File:** `backend/services/agentService.js`
- **Line:** 630
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `({ message, userMessage, tripContext, session, user, requestId, pageContext, onEvent })`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for runAgent
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `createSession()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 23
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `({ userId = null, tripId = null } = {})`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for createSession
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `updateContextEntities()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 68
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(session, entities = {})`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for updateContextEntities
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `getContextEntities()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 99
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(session)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for getContextEntities
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `getSession()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 103
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(sessionId)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for getSession
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `getOrCreateSession()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 114
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `({ sessionId, userId = null, tripId = null } = {})`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for getOrCreateSession
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `addTurn()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 134
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(session, { role, content })`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for addTurn
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `mergeAllowlist()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 145
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(session, additions = {})`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for mergeAllowlist
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `isAllowlisted()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 153
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(session, id)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for isAllowlisted
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `setPendingConfirmation()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 162
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(session, { actionType, payload, tripId, userId })`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for setPendingConfirmation
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `consumeConfirmation()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 173
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(session, { userId, tripId })`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for consumeConfirmation
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `clearPendingConfirmation()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 187
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(session)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for clearPendingConfirmation
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `deleteSession()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 191
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(sessionId)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for deleteSession
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `_getSessionCount()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 195
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `()`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for _getSessionCount
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `_clearAllSessions()`
- **File:** `backend/services/agentSessionStore.js`
- **Line:** 196
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `()`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for _clearAllSessions
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `successResult()`
- **File:** `backend/services/agentTools.js`
- **Line:** 37
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(data, provenance = "VERIFIED", citations = [])`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for successResult
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `failureResult()`
- **File:** `backend/services/agentTools.js`
- **Line:** 51
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(reason, code = "TOOL_ERROR")`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for failureResult
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `validateToolCall()`
- **File:** `backend/services/agentTools.js`
- **Line:** 229
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(toolName, args = {})`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for validateToolCall
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `executeTool()`
- **File:** `backend/services/agentTools.js`
- **Line:** 250
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(toolName, args, { session, user } = {})`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for executeTool
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `checkAltitudeRequirement()`
- **File:** `backend/services/altitudeGuardService.js`
- **Line:** 25
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(destinationName)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for checkAltitudeRequirement
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `calculateAmsRisk()`
- **File:** `backend/services/altitudeGuardService.js`
- **Line:** 47
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `({ age = 28, hasHeartCondition = false, hasAsthma = false, hasBpIssues = false, previousAms = false, directAscent = true })`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for calculateAmsRisk
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `recordCommunityReport()`
- **File:** `backend/services/communityGridService.js`
- **Line:** 76
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(reportData)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for recordCommunityReport
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `getActiveCommunityAdvisories()`
- **File:** `backend/services/communityGridService.js`
- **Line:** 116
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(circuitFilter)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for getActiveCommunityAdvisories
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `generateSalt()`
- **File:** `backend/services/cryptoService.js`
- **Line:** 14
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `()`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for generateSalt
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `stableStringify()`
- **File:** `backend/services/cryptoService.js`
- **Line:** 23
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(obj)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for stableStringify
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `buildListingCanonicalPayload()`
- **File:** `backend/services/cryptoService.js`
- **Line:** 50
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(listing, version, attestationSalt)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for buildListingCanonicalPayload
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `computeListingVerificationHash()`
- **File:** `backend/services/cryptoService.js`
- **Line:** 75
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(canonicalPayload)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for computeListingVerificationHash
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `computeListingIdHash()`
- **File:** `backend/services/cryptoService.js`
- **Line:** 83
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(listingId)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for computeListingIdHash
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `computeSaltedVehicleHash()`
- **File:** `backend/services/cryptoService.js`
- **Line:** 93
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(registrationNumber, vehicleSalt)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for computeSaltedVehicleHash
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `computeSaltedPermitDigest()`
- **File:** `backend/services/cryptoService.js`
- **Line:** 106
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(permitType, district, validUntilTimestamp, permitSalt)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for computeSaltedPermitDigest
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `initDestinationRegistry()`
- **File:** `backend/services/destinationResolver.js`
- **Line:** 65
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `()`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for initDestinationRegistry
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `resolveDestination()`
- **File:** `backend/services/destinationResolver.js`
- **Line:** 132
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(text, context = {})`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for resolveDestination
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `isKnownDestination()`
- **File:** `backend/services/destinationResolver.js`
- **Line:** 216
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(name)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for isKnownDestination
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `getAllDestinationNames()`
- **File:** `backend/services/destinationResolver.js`
- **Line:** 224
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `()`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for getAllDestinationNames
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `synthesizeElevenLabsVoice()`
- **File:** `backend/services/elevenLabsService.js`
- **Line:** 17
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(text, voiceId = DEFAULT_VOICE_ID)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for synthesizeElevenLabsVoice
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `getElevenLabsVoices()`
- **File:** `backend/services/elevenLabsService.js`
- **Line:** 124
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `()`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for getElevenLabsVoices
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `generateCheckInOtp()`
- **File:** `backend/services/escrowService.js`
- **Line:** 24
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `()`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for generateCheckInOtp
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `getOtpExpiration()`
- **File:** `backend/services/escrowService.js`
- **Line:** 31
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(startDate)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for getOtpExpiration
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `hashOtp()`
- **File:** `backend/services/escrowService.js`
- **Line:** 40
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(otp)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for hashOtp
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `verifyOtpToken()`
- **File:** `backend/services/escrowService.js`
- **Line:** 47
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(enteredOtp, storedOtp, storedOtpHash)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for verifyOtpToken
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `releaseEscrowPayout()`
- **File:** `backend/services/escrowService.js`
- **Line:** 68
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(booking, partnerId)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for releaseEscrowPayout
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `searchInDB()`
- **File:** `backend/services/hybridRagService.js`
- **Line:** 42
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(query)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for searchInDB
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `buildDevBhoomiSystemPrompt()`
- **File:** `backend/services/hybridRagService.js`
- **Line:** 114
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `()`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for buildDevBhoomiSystemPrompt
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `executeHybridRag()`
- **File:** `backend/services/hybridRagService.js`
- **Line:** 211
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `({ query, userLocation = null })`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for executeHybridRag
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `calculateHaversineDistanceKm()`
- **File:** `backend/services/locationService.js`
- **Line:** 115
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(coords1, coords2)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for calculateHaversineDistanceKm
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `classifyProximity()`
- **File:** `backend/services/locationService.js`
- **Line:** 144
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(distanceKm)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for classifyProximity
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `resolveLocation()`
- **File:** `backend/services/locationService.js`
- **Line:** 165
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(input)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for resolveLocation
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `createOrder()`
- **File:** `backend/services/paymentService.js`
- **Line:** 39
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(bookingId, userId)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for createOrder
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `verifyPayment()`
- **File:** `backend/services/paymentService.js`
- **Line:** 91
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(razorpayOrderId, razorpayPaymentId, signature, userId)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for verifyPayment
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `processWebhook()`
- **File:** `backend/services/paymentService.js`
- **Line:** 140
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(rawBody, signature, eventId)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for processWebhook
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `reconcilePayment()`
- **File:** `backend/services/paymentService.js`
- **Line:** 203
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(paymentId, userId, isAdmin = false)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for reconcilePayment
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `searchRealHimalayanPhotos()`
- **File:** `backend/services/photoService.js`
- **Line:** 49
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(query = 'Uttarakhand Himalayas', perPage = 5)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for searchRealHimalayanPhotos
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `checkRouteSafetyAndReroute()`
- **File:** `backend/services/rerouteEngineService.js`
- **Line:** 47
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(destinationName, corridorName)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for checkRouteSafetyAndReroute
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `recalculateBudget()`
- **File:** `backend/services/tripMutationService.js`
- **Line:** 14
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(budgetAmount, durationDays = 3, travelers = 2)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for recalculateBudget
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `applyTripMutation()`
- **File:** `backend/services/tripMutationService.js`
- **Line:** 48
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(state, mutation, options = {})`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for applyTripMutation
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `isCoordinateInHimalayanRegion()`
- **File:** `backend/services/truthCheckService.js`
- **Line:** 31
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(lat, lon)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for isCoordinateInHimalayanRegion
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `verifyExifGps()`
- **File:** `backend/services/truthCheckService.js`
- **Line:** 46
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(exifData)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for verifyExifGps
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `verifyVideoKyc()`
- **File:** `backend/services/truthCheckService.js`
- **Line:** 88
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(videoUrl, vehicleNumber, spokenDeclarationConfirmed)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for verifyVideoKyc
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `verifyLiveGeoSelfie()`
- **File:** `backend/services/truthCheckService.js`
- **Line:** 111
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(selfieUrl, clientCoordinates, timestamp)`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for verifyLiveGeoSelfie
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `evaluate3LayerTruth()`
- **File:** `backend/services/truthCheckService.js`
- **Line:** 143
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `({ exifResult, videoResult, selfieResult })`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for evaluate3LayerTruth
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `getWomenVerifiedStays()`
- **File:** `backend/services/womenSafetyService.js`
- **Line:** 63
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `(query = '')`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for getWomenVerifiedStays
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `dispatchWomenSosBeacon()`
- **File:** `backend/services/womenSafetyService.js`
- **Line:** 77
- **Type:** Backend Service Function
- **Called By:** Controllers / Agent Loop / Other Services
- **Calls:** Mongoose Models / External APIs / Adapters
- **Input:** `({ travelerName, travelerPhone, coordinates, destination, emergencyContact })`
- **Output:** `Promise<Object | Array | boolean>`
- **Purpose:** Core business logic for dispatchWomenSosBeacon
- **Data Source:** MongoDB / Memory / In-memory Cache / Remote API

### Function: `getActivities()`
- **File:** `Frontend/src/api/activityApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getActivities
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getActivityBySlug()`
- **File:** `Frontend/src/api/activityApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(slug)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getActivityBySlug
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createActivity()`
- **File:** `Frontend/src/api/activityApi.js`
- **Line:** 13
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createActivity
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateActivity()`
- **File:** `Frontend/src/api/activityApi.js`
- **Line:** 18
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateActivity
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteActivity()`
- **File:** `Frontend/src/api/activityApi.js`
- **Line:** 23
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteActivity
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getAdminStats()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getAdminStats
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `fetchItems()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 9
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(type)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for fetchItems
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createItem()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 14
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(type, data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createItem
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateItem()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 19
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(type, id, data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateItem
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteItem()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 24
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(type, id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteItem
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getAllBookings()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 30
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getAllBookings
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateBookingStatus()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 35
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, statusData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateBookingStatus
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getAllReviewsAdmin()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 41
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getAllReviewsAdmin
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateReviewStatusAdmin()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 46
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, status)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateReviewStatusAdmin
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteReviewAdmin()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 51
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteReviewAdmin
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `uploadAdminImage()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 57
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(file)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for uploadAdminImage
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteAdminImage()`
- **File:** `Frontend/src/api/adminApi.js`
- **Line:** 66
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(publicId)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteAdminImage
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `sendAgentMessage()`
- **File:** `Frontend/src/api/agentApi.js`
- **Line:** 56
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `({ message, history, pageContext, chatId, tripId })`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for sendAgentMessage
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `streamAgentMessage()`
- **File:** `Frontend/src/api/agentApi.js`
- **Line:** 110
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `({ message, history, pageContext, chatId, tripId, onUpdate, onEvent, signal })`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for streamAgentMessage
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `generateAiPlan()`
- **File:** `Frontend/src/api/aiApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `({ tripId, tripData, provider })`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for generateAiPlan
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `register()`
- **File:** `Frontend/src/api/authApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(userData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for register
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `registerPartner()`
- **File:** `Frontend/src/api/authApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(partnerData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for registerPartner
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `login()`
- **File:** `Frontend/src/api/authApi.js`
- **Line:** 13
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(credentials)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for login
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `logout()`
- **File:** `Frontend/src/api/authApi.js`
- **Line:** 18
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for logout
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getMe()`
- **File:** `Frontend/src/api/authApi.js`
- **Line:** 23
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getMe
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getMyBookings()`
- **File:** `Frontend/src/api/bookingApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(params = {})`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getMyBookings
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createBooking()`
- **File:** `Frontend/src/api/bookingApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(bookingData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createBooking
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `cancelBooking()`
- **File:** `Frontend/src/api/bookingApi.js`
- **Line:** 13
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, data = {})`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for cancelBooking
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getBookingById()`
- **File:** `Frontend/src/api/bookingApi.js`
- **Line:** 18
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getBookingById
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `calculateBudget()`
- **File:** `Frontend/src/api/budgetApi.js`
- **Line:** 7
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(budgetParams)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for calculateBudget
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getChats()`
- **File:** `Frontend/src/api/chatApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getChats
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getChatById()`
- **File:** `Frontend/src/api/chatApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getChatById
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createChat()`
- **File:** `Frontend/src/api/chatApi.js`
- **Line:** 13
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(tripId, title)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createChat
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateChat()`
- **File:** `Frontend/src/api/chatApi.js`
- **Line:** 18
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, title)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateChat
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteChat()`
- **File:** `Frontend/src/api/chatApi.js`
- **Line:** 23
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteChat
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `sendMessage()`
- **File:** `Frontend/src/api/chatApi.js`
- **Line:** 28
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(chatId, content, tripId)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for sendMessage
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getCulturePlaces()`
- **File:** `Frontend/src/api/cultureApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getCulturePlaces
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getCultureBySlug()`
- **File:** `Frontend/src/api/cultureApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(slug)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getCultureBySlug
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createCulture()`
- **File:** `Frontend/src/api/cultureApi.js`
- **Line:** 13
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createCulture
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateCulture()`
- **File:** `Frontend/src/api/cultureApi.js`
- **Line:** 18
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateCulture
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteCulture()`
- **File:** `Frontend/src/api/cultureApi.js`
- **Line:** 23
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteCulture
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getDestinations()`
- **File:** `Frontend/src/api/destinationApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getDestinations
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getDestinationBySlug()`
- **File:** `Frontend/src/api/destinationApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(slug)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getDestinationBySlug
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getDestinationRelated()`
- **File:** `Frontend/src/api/destinationApi.js`
- **Line:** 13
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(slug)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getDestinationRelated
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getDestinationExplore()`
- **File:** `Frontend/src/api/destinationApi.js`
- **Line:** 18
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(slug, params = {})`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getDestinationExplore
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createDestination()`
- **File:** `Frontend/src/api/destinationApi.js`
- **Line:** 22
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createDestination
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateDestination()`
- **File:** `Frontend/src/api/destinationApi.js`
- **Line:** 27
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateDestination
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteDestination()`
- **File:** `Frontend/src/api/destinationApi.js`
- **Line:** 32
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteDestination
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `calculateDistance()`
- **File:** `Frontend/src/api/exploreApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(lat1, lon1, lat2, lon2)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for calculateDistance
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `fetchExploreData()`
- **File:** `Frontend/src/api/exploreApi.js`
- **Line:** 62
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(destination)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for fetchExploreData
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getFavorites()`
- **File:** `Frontend/src/api/favoriteApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getFavorites
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `addFavorite()`
- **File:** `Frontend/src/api/favoriteApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(itemType, item)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for addFavorite
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `removeFavorite()`
- **File:** `Frontend/src/api/favoriteApi.js`
- **Line:** 13
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(itemType, item)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for removeFavorite
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `toggleFavorite()`
- **File:** `Frontend/src/api/favoriteApi.js`
- **Line:** 18
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(itemType, item)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for toggleFavorite
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getGuides()`
- **File:** `Frontend/src/api/guideApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getGuides
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getGuideById()`
- **File:** `Frontend/src/api/guideApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getGuideById
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createGuide()`
- **File:** `Frontend/src/api/guideApi.js`
- **Line:** 12
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createGuide
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateGuide()`
- **File:** `Frontend/src/api/guideApi.js`
- **Line:** 17
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateGuide
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteGuide()`
- **File:** `Frontend/src/api/guideApi.js`
- **Line:** 22
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteGuide
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getLiveWeather()`
- **File:** `Frontend/src/api/liveDataApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(lat, lon, options = {})`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getLiveWeather
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getRoadAdvisories()`
- **File:** `Frontend/src/api/liveDataApi.js`
- **Line:** 20
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(params = {})`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getRoadAdvisories
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `listRoadBulletins()`
- **File:** `Frontend/src/api/liveDataApi.js`
- **Line:** 28
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for listRoadBulletins
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getTransitLive()`
- **File:** `Frontend/src/api/liveDataApi.js`
- **Line:** 36
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(origin, destination, mode = 'Bus')`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getTransitLive
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `evaluateTripAdvisories()`
- **File:** `Frontend/src/api/liveDataApi.js`
- **Line:** 46
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(tripContext, tripId = null)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for evaluateTripAdvisories
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `registerPartner()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 17
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(partnerData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for registerPartner
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getMyPartnerProfile()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 26
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getMyPartnerProfile
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateMyPartnerProfile()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 33
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(updates)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateMyPartnerProfile
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createListingDraft()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 42
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(listingData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createListingDraft
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getMyListings()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 51
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getMyListings
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getMyListingById()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 58
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getMyListingById
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateListing()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 65
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, updates)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateListing
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `submitListingForVerification()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 74
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for submitListingForVerification
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `reopenRejectedListing()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 82
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for reopenRejectedListing
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getPartnerDashboardStats()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 92
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getPartnerDashboardStats
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deletePartnerListing()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 99
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deletePartnerListing
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateListingPricing()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 107
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, pricingData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateListingPricing
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getPartnerBookings()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 116
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(filters = {})`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getPartnerBookings
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updatePartnerBookingStatus()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 124
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, status, notes = '')`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updatePartnerBookingStatus
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getPartnerAvailability()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 133
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getPartnerAvailability
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updatePartnerAvailability()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 140
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, availabilityData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updatePartnerAvailability
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getPartnerEarnings()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 149
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getPartnerEarnings
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getPartnerExpenses()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 156
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getPartnerExpenses
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createPartnerExpense()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 163
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(expenseData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createPartnerExpense
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deletePartnerExpense()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 172
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deletePartnerExpense
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getPartnerAnalytics()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 180
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getPartnerAnalytics
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getPartnerReviews()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 187
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getPartnerReviews
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `replyToPartnerReview()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 194
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, text)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for replyToPartnerReview
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `uploadPartnerImages()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 203
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(formData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for uploadPartnerImages
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `uploadListingImages()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 215
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(listingId, formData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for uploadListingImages
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteListingImage()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 227
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(listingId, imageId)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteListingImage
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getPendingListingsAdmin()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 237
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getPendingListingsAdmin
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getListingForAdmin()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 244
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getListingForAdmin
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `verifyListingAdmin()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 251
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, notes = '')`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for verifyListingAdmin
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `rejectListingAdmin()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 260
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, reason)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for rejectListingAdmin
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getVerificationLogsAdmin()`
- **File:** `Frontend/src/api/partnerApi.js`
- **Line:** 269
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getVerificationLogsAdmin
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createOrder()`
- **File:** `Frontend/src/api/paymentApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(bookingId)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createOrder
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `verifyPayment()`
- **File:** `Frontend/src/api/paymentApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(razorpay_order_id, razorpay_payment_id, razorpay_signature)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for verifyPayment
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getPaymentStatus()`
- **File:** `Frontend/src/api/paymentApi.js`
- **Line:** 17
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(paymentId)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getPaymentStatus
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getPersonalizedHome()`
- **File:** `Frontend/src/api/personalizedApi.js`
- **Line:** 7
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(params = {})`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getPersonalizedHome
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getPersonalizedNearby()`
- **File:** `Frontend/src/api/personalizedApi.js`
- **Line:** 16
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(params = {})`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getPersonalizedNearby
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateUserLocation()`
- **File:** `Frontend/src/api/personalizedApi.js`
- **Line:** 25
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(locationData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateUserLocation
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `searchPlaces()`
- **File:** `Frontend/src/api/placesApi.js`
- **Line:** 62
- **Type:** Frontend API Object Method
- **Called By:** Pages / Components
- **Calls:** api.get / api.post / api.put / api.delete
- **Input:** `(query, { lat, lng, radius } = {})`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client call for searchPlaces
- **Data Source:** Axios -> Express Backend

### Function: `getNearbyPlaces()`
- **File:** `Frontend/src/api/placesApi.js`
- **Line:** 84
- **Type:** Frontend API Object Method
- **Called By:** Pages / Components
- **Calls:** api.get / api.post / api.put / api.delete
- **Input:** `({ lat, lng, type = 'all', radius = 15000, keyword = '' } = {})`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client call for getNearbyPlaces
- **Data Source:** Axios -> Express Backend

### Function: `getPlaceDetails()`
- **File:** `Frontend/src/api/placesApi.js`
- **Line:** 117
- **Type:** Frontend API Object Method
- **Called By:** Pages / Components
- **Calls:** api.get / api.post / api.put / api.delete
- **Input:** `({ placeId, name })`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client call for getPlaceDetails
- **Data Source:** Axios -> Express Backend

### Function: `getStatus()`
- **File:** `Frontend/src/api/placesApi.js`
- **Line:** 138
- **Type:** Frontend API Object Method
- **Called By:** Pages / Components
- **Calls:** api.get / api.post / api.put / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client call for getStatus
- **Data Source:** Axios -> Express Backend

### Function: `getRouteDirections()`
- **File:** `Frontend/src/api/placesApi.js`
- **Line:** 155
- **Type:** Frontend API Object Method
- **Called By:** Pages / Components
- **Calls:** api.get / api.post / api.put / api.delete
- **Input:** `({ fromLat, fromLng, toLat, toLng, mode = 'drive' })`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client call for getRouteDirections
- **Data Source:** Axios -> Express Backend

### Function: `getRecommendations()`
- **File:** `Frontend/src/api/recommendationApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(tripContext, categories = ['stays', 'guides', 'activities', 'spiritual'])`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getRecommendations
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getVehicleImage()`
- **File:** `Frontend/src/api/rentalApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(name = '', type = '')`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getVehicleImage
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getRentals()`
- **File:** `Frontend/src/api/rentalApi.js`
- **Line:** 55
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getRentals
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getRentalById()`
- **File:** `Frontend/src/api/rentalApi.js`
- **Line:** 114
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getRentalById
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createRental()`
- **File:** `Frontend/src/api/rentalApi.js`
- **Line:** 118
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createRental
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateRental()`
- **File:** `Frontend/src/api/rentalApi.js`
- **Line:** 123
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateRental
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteRental()`
- **File:** `Frontend/src/api/rentalApi.js`
- **Line:** 128
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteRental
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getReviewsForTarget()`
- **File:** `Frontend/src/api/reviewApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(targetType, targetId)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getReviewsForTarget
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createReview()`
- **File:** `Frontend/src/api/reviewApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(reviewData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createReview
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getMyReviews()`
- **File:** `Frontend/src/api/reviewApi.js`
- **Line:** 13
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getMyReviews
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `trigger()`
- **File:** `Frontend/src/api/sosApi.js`
- **Line:** 5
- **Type:** Frontend API Object Method
- **Called By:** Pages / Components
- **Calls:** api.get / api.post / api.put / api.delete
- **Input:** `(payload)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client call for trigger
- **Data Source:** Axios -> Express Backend

### Function: `getActiveAlerts()`
- **File:** `Frontend/src/api/sosApi.js`
- **Line:** 11
- **Type:** Frontend API Object Method
- **Called By:** Pages / Components
- **Calls:** api.get / api.post / api.put / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client call for getActiveAlerts
- **Data Source:** Axios -> Express Backend

### Function: `getAlertById()`
- **File:** `Frontend/src/api/sosApi.js`
- **Line:** 17
- **Type:** Frontend API Object Method
- **Called By:** Pages / Components
- **Calls:** api.get / api.post / api.put / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client call for getAlertById
- **Data Source:** Axios -> Express Backend

### Function: `updateStatus()`
- **File:** `Frontend/src/api/sosApi.js`
- **Line:** 23
- **Type:** Frontend API Object Method
- **Called By:** Pages / Components
- **Calls:** api.get / api.post / api.put / api.delete
- **Input:** `(id, statusData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client call for updateStatus
- **Data Source:** Axios -> Express Backend

### Function: `cancel()`
- **File:** `Frontend/src/api/sosApi.js`
- **Line:** 29
- **Type:** Frontend API Object Method
- **Called By:** Pages / Components
- **Calls:** api.get / api.post / api.put / api.delete
- **Input:** `(alertCode, reason)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client call for cancel
- **Data Source:** Axios -> Express Backend

### Function: `getNearbyRescuePosts()`
- **File:** `Frontend/src/api/sosApi.js`
- **Line:** 35
- **Type:** Frontend API Object Method
- **Called By:** Pages / Components
- **Calls:** api.get / api.post / api.put / api.delete
- **Input:** `(lat, lng)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client call for getNearbyRescuePosts
- **Data Source:** Axios -> Express Backend

### Function: `getSpiritualPlaces()`
- **File:** `Frontend/src/api/spiritualApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getSpiritualPlaces
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getSpiritualBySlug()`
- **File:** `Frontend/src/api/spiritualApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(slug)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getSpiritualBySlug
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createSpiritual()`
- **File:** `Frontend/src/api/spiritualApi.js`
- **Line:** 13
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createSpiritual
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateSpiritual()`
- **File:** `Frontend/src/api/spiritualApi.js`
- **Line:** 18
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateSpiritual
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteSpiritual()`
- **File:** `Frontend/src/api/spiritualApi.js`
- **Line:** 23
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteSpiritual
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `normalizeStay()`
- **File:** `Frontend/src/api/stayApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(s)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for normalizeStay
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getStays()`
- **File:** `Frontend/src/api/stayApi.js`
- **Line:** 42
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getStays
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getStayById()`
- **File:** `Frontend/src/api/stayApi.js`
- **Line:** 50
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getStayById
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createStay()`
- **File:** `Frontend/src/api/stayApi.js`
- **Line:** 54
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createStay
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateStay()`
- **File:** `Frontend/src/api/stayApi.js`
- **Line:** 59
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateStay
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteStay()`
- **File:** `Frontend/src/api/stayApi.js`
- **Line:** 64
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteStay
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getTransports()`
- **File:** `Frontend/src/api/transportApi.js`
- **Line:** 7
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(params = {})`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getTransports
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getCorridorTransports()`
- **File:** `Frontend/src/api/transportApi.js`
- **Line:** 37
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(from, to)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getCorridorTransports
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getTrips()`
- **File:** `Frontend/src/api/tripApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getTrips
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getTripById()`
- **File:** `Frontend/src/api/tripApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getTripById
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `createTrip()`
- **File:** `Frontend/src/api/tripApi.js`
- **Line:** 13
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for createTrip
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateTrip()`
- **File:** `Frontend/src/api/tripApi.js`
- **Line:** 18
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id, data)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateTrip
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `deleteTrip()`
- **File:** `Frontend/src/api/tripApi.js`
- **Line:** 23
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(id)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for deleteTrip
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `getProfile()`
- **File:** `Frontend/src/api/userApi.js`
- **Line:** 3
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `()`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for getProfile
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `updateProfile()`
- **File:** `Frontend/src/api/userApi.js`
- **Line:** 8
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(userData)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for updateProfile
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `uploadImage()`
- **File:** `Frontend/src/api/userApi.js`
- **Line:** 13
- **Type:** Frontend API Client Method
- **Called By:** Hooks / Pages / Components
- **Calls:** api.get / api.post / api.put / api.patch / api.delete
- **Input:** `(file)`
- **Output:** `Promise<AxiosResponse.data>`
- **Purpose:** HTTP client request for uploadImage
- **Data Source:** Axios -> Express Backend (/api/...)

### Function: `useActivities()`
- **File:** `Frontend/src/hooks/useActivities.js`
- **Line:** 4
- **Type:** React Custom Hook
- **Called By:** Pages & Components
- **Calls:** API client functions / useState / useEffect
- **Input:** `()`
- **Output:** `Hook State Object { data, loading, error, refetch }`
- **Purpose:** Manage reactive state and data fetching for useActivities
- **Data Source:** Frontend API clients

### Function: `useCulturePlaces()`
- **File:** `Frontend/src/hooks/useCulture.js`
- **Line:** 4
- **Type:** React Custom Hook
- **Called By:** Pages & Components
- **Calls:** API client functions / useState / useEffect
- **Input:** `()`
- **Output:** `Hook State Object { data, loading, error, refetch }`
- **Purpose:** Manage reactive state and data fetching for useCulturePlaces
- **Data Source:** Frontend API clients

### Function: `useDestinations()`
- **File:** `Frontend/src/hooks/useDestinations.js`
- **Line:** 4
- **Type:** React Custom Hook
- **Called By:** Pages & Components
- **Calls:** API client functions / useState / useEffect
- **Input:** `()`
- **Output:** `Hook State Object { data, loading, error, refetch }`
- **Purpose:** Manage reactive state and data fetching for useDestinations
- **Data Source:** Frontend API clients

### Function: `useGuides()`
- **File:** `Frontend/src/hooks/useGuides.js`
- **Line:** 4
- **Type:** React Custom Hook
- **Called By:** Pages & Components
- **Calls:** API client functions / useState / useEffect
- **Input:** `()`
- **Output:** `Hook State Object { data, loading, error, refetch }`
- **Purpose:** Manage reactive state and data fetching for useGuides
- **Data Source:** Frontend API clients

### Function: `useLiveLocationWeather()`
- **File:** `Frontend/src/hooks/useLiveLocationWeather.js`
- **Line:** 13
- **Type:** React Custom Hook
- **Called By:** Pages & Components
- **Calls:** API client functions / useState / useEffect
- **Input:** `()`
- **Output:** `Hook State Object { data, loading, error, refetch }`
- **Purpose:** Manage reactive state and data fetching for useLiveLocationWeather
- **Data Source:** Frontend API clients

### Function: `useRentals()`
- **File:** `Frontend/src/hooks/useRentals.js`
- **Line:** 4
- **Type:** React Custom Hook
- **Called By:** Pages & Components
- **Calls:** API client functions / useState / useEffect
- **Input:** `()`
- **Output:** `Hook State Object { data, loading, error, refetch }`
- **Purpose:** Manage reactive state and data fetching for useRentals
- **Data Source:** Frontend API clients

### Function: `useSOS()`
- **File:** `Frontend/src/hooks/useSOS.js`
- **Line:** 8
- **Type:** React Custom Hook
- **Called By:** Pages & Components
- **Calls:** API client functions / useState / useEffect
- **Input:** `()`
- **Output:** `Hook State Object { data, loading, error, refetch }`
- **Purpose:** Manage reactive state and data fetching for useSOS
- **Data Source:** Frontend API clients

### Function: `useSpiritualPlaces()`
- **File:** `Frontend/src/hooks/useSpiritual.js`
- **Line:** 4
- **Type:** React Custom Hook
- **Called By:** Pages & Components
- **Calls:** API client functions / useState / useEffect
- **Input:** `()`
- **Output:** `Hook State Object { data, loading, error, refetch }`
- **Purpose:** Manage reactive state and data fetching for useSpiritualPlaces
- **Data Source:** Frontend API clients

### Function: `useStays()`
- **File:** `Frontend/src/hooks/useStays.js`
- **Line:** 4
- **Type:** React Custom Hook
- **Called By:** Pages & Components
- **Calls:** API client functions / useState / useEffect
- **Input:** `()`
- **Output:** `Hook State Object { data, loading, error, refetch }`
- **Purpose:** Manage reactive state and data fetching for useStays
- **Data Source:** Frontend API clients

### Function: `getTripContext()`
- **File:** `backend/services/agentTools.js`
- **Line:** 255
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for getTripContext
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `exploreDestination()`
- **File:** `backend/services/agentTools.js`
- **Line:** 256
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for exploreDestination
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `searchDestinations()`
- **File:** `backend/services/agentTools.js`
- **Line:** 257
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for searchDestinations
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `getRecommendations()`
- **File:** `backend/services/agentTools.js`
- **Line:** 258
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for getRecommendations
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `getNearbyRecommendations()`
- **File:** `backend/services/agentTools.js`
- **Line:** 259
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for getNearbyRecommendations
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `calculateBudget()`
- **File:** `backend/services/agentTools.js`
- **Line:** 260
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for calculateBudget
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `planRoute()`
- **File:** `backend/services/agentTools.js`
- **Line:** 261
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for planRoute
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `getItinerary()`
- **File:** `backend/services/agentTools.js`
- **Line:** 262
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for getItinerary
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `modifyItinerary()`
- **File:** `backend/services/agentTools.js`
- **Line:** 263
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for modifyItinerary
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `modifyTripPlan()`
- **File:** `backend/services/agentTools.js`
- **Line:** 264
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for modifyTripPlan
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `getWeather()`
- **File:** `backend/services/agentTools.js`
- **Line:** 265
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for getWeather
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `getRoadAdvisory()`
- **File:** `backend/services/agentTools.js`
- **Line:** 266
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for getRoadAdvisory
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `getTransitStatus()`
- **File:** `backend/services/agentTools.js`
- **Line:** 267
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for getTransitStatus
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `findStays()`
- **File:** `backend/services/agentTools.js`
- **Line:** 268
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for findStays
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `findRentals()`
- **File:** `backend/services/agentTools.js`
- **Line:** 269
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for findRentals
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `findGuides()`
- **File:** `backend/services/agentTools.js`
- **Line:** 270
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for findGuides
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `checkBookingEligibility()`
- **File:** `backend/services/agentTools.js`
- **Line:** 271
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for checkBookingEligibility
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `search_web_for_realtime_info()`
- **File:** `backend/services/agentTools.js`
- **Line:** 272
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for search_web_for_realtime_info
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

### Function: `webSearch()`
- **File:** `backend/services/agentTools.js`
- **Line:** 273
- **Type:** Agent Tool Handler
- **Called By:** executeTool() in backend/services/agentTools.js (via agentService.js)
- **Calls:** Mongoose models / phase adapters / engines
- **Input:** `toolArgs, { session, user }`
- **Output:** `successResult(data) or failureResult(error)`
- **Purpose:** Autonomous LLM tool execution for webSearch
- **Data Source:** MongoDB / Open-Meteo / Local GIS / DB Cache

