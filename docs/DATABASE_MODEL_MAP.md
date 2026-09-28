# Discovery Uttarakhand — Database Model Map
**Generated:** 2026-09-28
**Database Engine:** MongoDB Atlas
**Total Mongoose Models:** 27

### Model: `Activity`
- **File:** `backend/models/Activity.js`
- **MongoDB Collection:** `activitys`
- **Total Defined Fields:** 14
- **Important Fields:**
  - `name`, `slug`, `description`, `shortDescription`, `district`, `region`, `location`, `locationSource`, `bestTimeToVisit`, `bestTimeSourceSentence`, `idealDuration`, `budgetLevel`, `coverImage`, `category`
- **Indexes:**
  - `activitySchema.index({ district: 1 });` (Line 30)
  - `activitySchema.index({ location: '2dsphere' }, { sparse: true });` (Line 31)
- **References (Foreign Keys):**
  - None
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/activitys`, `GET /api/activitys/:id`
- **Write APIs:** `POST /api/activitys`, `PUT/PATCH /api/activitys/:id`, `DELETE /api/activitys/:id`

### Model: `Booking`
- **File:** `backend/models/Booking.js`
- **MongoDB Collection:** `bookings`
- **Total Defined Fields:** 60
- **Important Fields:**
  - `amount`, `unit`, `currency`, `quantity`, `subtotal`, `total`, `provenance`, `title`, `category`, `district`, `listingType`, `location`, `name`, `email`, `phone`... (and more)
- **Indexes:**
  - `bookingSchema.index({ user: 1, createdAt: -1 });` (Line 160)
  - `bookingSchema.index({ status: 1 });` (Line 161)
  - `bookingSchema.index({ partnerListing: 1 });` (Line 162)
- **References (Foreign Keys):**
  - `User` (Line 43: `cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },`)
  - `User` (Line 48: `user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },`)
  - `PartnerListing` (Line 58: `partnerListing: { type: mongoose.Schema.Types.ObjectId, ref: 'PartnerListing' },`)
  - `Stay` (Line 59: `stay: { type: mongoose.Schema.Types.ObjectId, ref: 'Stay' },`)
  - `Rental` (Line 60: `rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental' },`)
  - `Guide` (Line 61: `guide: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide' },`)
  - `SavedTrip` (Line 62: `trip: { type: mongoose.Schema.Types.ObjectId, ref: 'SavedTrip' },`)
  - `User` (Line 120: `reverseRentalReassignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/bookings`, `GET /api/bookings/:id`
- **Write APIs:** `POST /api/bookings`, `PUT/PATCH /api/bookings/:id`, `DELETE /api/bookings/:id`

### Model: `Chat`
- **File:** `backend/models/Chat.js`
- **MongoDB Collection:** `chats`
- **Total Defined Fields:** 8
- **Important Fields:**
  - `role`, `content`, `provenance`, `metadata`, `userId`, `tripId`, `title`, `messages`
- **Indexes:**
  - Default `_id_` index
- **References (Foreign Keys):**
  - `User` (Line 30: `ref: 'User',`)
  - `SavedTrip` (Line 36: `ref: 'SavedTrip',`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/chats`, `GET /api/chats/:id`
- **Write APIs:** `POST /api/chats`, `PUT/PATCH /api/chats/:id`, `DELETE /api/chats/:id`

### Model: `CommunityReport`
- **File:** `backend/models/CommunityReport.js`
- **MongoDB Collection:** `communityreports`
- **Total Defined Fields:** 16
- **Important Fields:**
  - `location`, `circuit`, `condition`, `severity`, `description`, `coordinates`, `lat`, `lon`, `reporterName`, `reporterRole`, `reporterId`, `upvotes`, `consensusVerified`, `consensusCount`, `isOfflineSynced`... (and more)
- **Indexes:**
  - `communityReportSchema.index({ location: 1, createdAt: -1 });` (Line 72)
- **References (Foreign Keys):**
  - `User` (Line 45: `ref: 'User'`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/communityreports`, `GET /api/communityreports/:id`
- **Write APIs:** `POST /api/communityreports`, `PUT/PATCH /api/communityreports/:id`, `DELETE /api/communityreports/:id`

### Model: `Culture`
- **File:** `backend/models/Culture.js`
- **MongoDB Collection:** `cultures`
- **Total Defined Fields:** 13
- **Important Fields:**
  - `name`, `slug`, `description`, `shortDescription`, `district`, `region`, `location`, `locationSource`, `bestTimeToVisit`, `bestTimeSourceSentence`, `idealDuration`, `budgetLevel`, `coverImage`
- **Indexes:**
  - `cultureSchema.index({ district: 1 });` (Line 26)
  - `cultureSchema.index({ location: '2dsphere' }, { sparse: true });` (Line 27)
- **References (Foreign Keys):**
  - None
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/cultures`, `GET /api/cultures/:id`
- **Write APIs:** `POST /api/cultures`, `PUT/PATCH /api/cultures/:id`, `DELETE /api/cultures/:id`

### Model: `Destination`
- **File:** `backend/models/Destination.js`
- **MongoDB Collection:** `destinations`
- **Total Defined Fields:** 23
- **Important Fields:**
  - `name`, `slug`, `description`, `shortDescription`, `locationString`, `district`, `region`, `location`, `locationSource`, `bestTimeToVisit`, `bestTimeSourceSentence`, `idealDuration`, `budgetLevel`, `coverImage`, `category`... (and more)
- **Indexes:**
  - `destinationSchema.index({ district: 1 });` (Line 47)
  - `destinationSchema.index({ location: '2dsphere' }, { sparse: true });` (Line 48)
  - `destinationSchema.index({ name: 'text', description: 'text', highlights: 'text' });` (Line 49)
- **References (Foreign Keys):**
  - None
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/destinations`, `GET /api/destinations/:id`
- **Write APIs:** `POST /api/destinations`, `PUT/PATCH /api/destinations/:id`, `DELETE /api/destinations/:id`

### Model: `Favorite`
- **File:** `backend/models/Favorite.js`
- **MongoDB Collection:** `favorites`
- **Total Defined Fields:** 5
- **Important Fields:**
  - `user`, `itemType`, `item`, `targetType`, `targetId`
- **Indexes:**
  - `favoriteSchema.index({ user: 1, itemType: 1, item: 1 }, { unique: true });` (Line 17)
- **References (Foreign Keys):**
  - `User` (Line 4: `user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/favorites`, `GET /api/favorites/:id`
- **Write APIs:** `POST /api/favorites`, `PUT/PATCH /api/favorites/:id`, `DELETE /api/favorites/:id`

### Model: `Guide`
- **File:** `backend/models/Guide.js`
- **MongoDB Collection:** `guides`
- **Total Defined Fields:** 19
- **Important Fields:**
  - `name`, `slug`, `bio`, `location`, `experience`, `phone`, `profileUrl`, `profileImage`, `rating`, `reviewCount`, `verifiedByGovt`, `verificationStatus`, `user`, `speciality`, `category`... (and more)
- **Indexes:**
  - `guideSchema.index({ districts: 1 });` (Line 34)
  - `guideSchema.index({ languages: 1 });` (Line 35)
  - `guideSchema.index({ specialties: 1 });` (Line 36)
  - `guideSchema.index({ verificationStatus: 1 });` (Line 37)
- **References (Foreign Keys):**
  - `User` (Line 22: `user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/guides`, `GET /api/guides/:id`
- **Write APIs:** `POST /api/guides`, `PUT/PATCH /api/guides/:id`, `DELETE /api/guides/:id`

### Model: `Listing`
- **File:** `backend/models/Listing.js`
- **MongoDB Collection:** `listings`
- **Total Defined Fields:** 38
- **Important Fields:**
  - `name`, `slug`, `category`, `source`, `partnerId`, `location`, `address`, `city`, `district`, `coordinates`, `altitudeMeters`, `pricing`, `basePrice`, `unit`, `currency`... (and more)
- **Indexes:**
  - `ListingSchema.index({ category: 1, 'location.district': 1, status: 1 });` (Line 107)
  - `ListingSchema.index({ 'pricing.basePrice': 1, 'verification.isVerified': 1 });` (Line 108)
- **References (Foreign Keys):**
  - `Partner` (Line 39: `ref: 'Partner',`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/listings`, `GET /api/listings/:id`
- **Write APIs:** `POST /api/listings`, `PUT/PATCH /api/listings/:id`, `DELETE /api/listings/:id`

### Model: `Partner`
- **File:** `backend/models/Partner.js`
- **MongoDB Collection:** `partners`
- **Total Defined Fields:** 26
- **Important Fields:**
  - `user`, `businessName`, `legalBusinessName`, `partnerType`, `phone`, `email`, `district`, `city`, `locality`, `address`, `location`, `logo`, `coverImage`, `operatingHours`, `pickupInformation`... (and more)
- **Indexes:**
  - `partnerSchema.index({ district: 1 });` (Line 139)
  - `partnerSchema.index({ city: 1 });` (Line 140)
  - `partnerSchema.index({ locality: 1 });` (Line 141)
  - `partnerSchema.index({ partnerType: 1 });` (Line 142)
  - `partnerSchema.index({ verificationStatus: 1 });` (Line 143)
  - `partnerSchema.index({ location: '2dsphere' }, { sparse: true });` (Line 144)
- **References (Foreign Keys):**
  - `User` (Line 13: `ref: 'User',`)
  - `User` (Line 116: `ref: 'User',`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/partners`, `GET /api/partners/:id`
- **Write APIs:** `POST /api/partners`, `PUT/PATCH /api/partners/:id`, `DELETE /api/partners/:id`

### Model: `PartnerExpense`
- **File:** `backend/models/PartnerExpense.js`
- **MongoDB Collection:** `partnerexpenses`
- **Total Defined Fields:** 8
- **Important Fields:**
  - `partner`, `ownerUser`, `listing`, `category`, `amount`, `date`, `note`, `receiptImage`
- **Indexes:**
  - `partnerExpenseSchema.index({ partner: 1, date: -1 });` (Line 60)
  - `partnerExpenseSchema.index({ ownerUser: 1, date: -1 });` (Line 61)
- **References (Foreign Keys):**
  - `Partner` (Line 12: `ref: 'Partner',`)
  - `User` (Line 18: `ref: 'User',`)
  - `PartnerListing` (Line 24: `ref: 'PartnerListing',`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/partnerexpenses`, `GET /api/partnerexpenses/:id`
- **Write APIs:** `POST /api/partnerexpenses`, `PUT/PATCH /api/partnerexpenses/:id`, `DELETE /api/partnerexpenses/:id`

### Model: `PartnerListing`
- **File:** `backend/models/PartnerListing.js`
- **MongoDB Collection:** `partnerlistings`
- **Total Defined Fields:** 66
- **Important Fields:**
  - `amount`, `unit`, `currency`, `provenance`, `lastVerifiedAt`, `partner`, `ownerUser`, `listingType`, `title`, `slug`, `category`, `district`, `city`, `locality`, `destination`... (and more)
- **Indexes:**
  - `partnerListingSchema.index({ partner: 1 });` (Line 236)
  - `partnerListingSchema.index({ ownerUser: 1 });` (Line 237)
  - `partnerListingSchema.index({ status: 1 });` (Line 238)
  - `partnerListingSchema.index({ district: 1 });` (Line 239)
  - `partnerListingSchema.index({ city: 1 });` (Line 240)
  - `partnerListingSchema.index({ locality: 1 });` (Line 241)
  - `partnerListingSchema.index({ destinationSlug: 1 });` (Line 242)
  - `partnerListingSchema.index({ destination: 1 });` (Line 243)
  - `partnerListingSchema.index({ listingType: 1 });` (Line 244)
  - `partnerListingSchema.index({ location: '2dsphere' }, { sparse: true });` (Line 245)
- **References (Foreign Keys):**
  - `Partner` (Line 41: `ref: 'Partner',`)
  - `User` (Line 46: `ref: 'User',`)
  - `Destination` (Line 85: `ref: 'Destination',`)
  - `User` (Line 188: `ref: 'User',`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/partnerlistings`, `GET /api/partnerlistings/:id`
- **Write APIs:** `POST /api/partnerlistings`, `PUT/PATCH /api/partnerlistings/:id`, `DELETE /api/partnerlistings/:id`

### Model: `Payment`
- **File:** `backend/models/Payment.js`
- **MongoDB Collection:** `payments`
- **Total Defined Fields:** 8
- **Important Fields:**
  - `bookingId`, `userId`, `razorpayOrderId`, `razorpayPaymentId`, `amount`, `currency`, `status`, `idempotencyKey`
- **Indexes:**
  - `paymentSchema.index({ bookingId: 1, userId: 1 });` (Line 18)
- **References (Foreign Keys):**
  - `Booking` (Line 4: `bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },`)
  - `User` (Line 5: `userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/payments`, `GET /api/payments/:id`
- **Write APIs:** `POST /api/payments`, `PUT/PATCH /api/payments/:id`, `DELETE /api/payments/:id`

### Model: `PaymentWebhookEvent`
- **File:** `backend/models/PaymentWebhookEvent.js`
- **MongoDB Collection:** `paymentwebhookevents`
- **Total Defined Fields:** 8
- **Important Fields:**
  - `eventId`, `eventType`, `razorpayPaymentId`, `razorpayOrderId`, `receivedAt`, `processedAt`, `processingStatus`, `errorMetadata`
- **Indexes:**
  - Default `_id_` index
- **References (Foreign Keys):**
  - None
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/paymentwebhookevents`, `GET /api/paymentwebhookevents/:id`
- **Write APIs:** `POST /api/paymentwebhookevents`, `PUT/PATCH /api/paymentwebhookevents/:id`, `DELETE /api/paymentwebhookevents/:id`

### Model: `Rental`
- **File:** `backend/models/Rental.js`
- **MongoDB Collection:** `rentals`
- **Total Defined Fields:** 23
- **Important Fields:**
  - `name`, `typeDetail`, `pricePerDay`, `priceNotes`, `image`, `name`, `slug`, `description`, `city`, `district`, `address`, `location`, `locationNotes`, `category`, `phone`... (and more)
- **Indexes:**
  - `rentalSchema.index({ district: 1 });` (Line 42)
  - `rentalSchema.index({ location: '2dsphere' }, { sparse: true });` (Line 43)
- **References (Foreign Keys):**
  - None
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/rentals`, `GET /api/rentals/:id`
- **Write APIs:** `POST /api/rentals`, `PUT/PATCH /api/rentals/:id`, `DELETE /api/rentals/:id`

### Model: `Review`
- **File:** `backend/models/Review.js`
- **MongoDB Collection:** `reviews`
- **Total Defined Fields:** 12
- **Important Fields:**
  - `user`, `rating`, `comment`, `targetType`, `target`, `status`, `reply`, `text`, `repliedAt`, `repliedBy`, `targetId`, `isApproved`
- **Indexes:**
  - `reviewSchema.index({ targetType: 1, target: 1, status: 1 });` (Line 48)
  - `reviewSchema.index({ user: 1 });` (Line 49)
- **References (Foreign Keys):**
  - `User` (Line 6: `ref: 'User',`)
  - `User` (Line 38: `repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/reviews`, `GET /api/reviews/:id`
- **Write APIs:** `POST /api/reviews`, `PUT/PATCH /api/reviews/:id`, `DELETE /api/reviews/:id`

### Model: `RoadBulletin`
- **File:** `backend/models/RoadBulletin.js`
- **MongoDB Collection:** `roadbulletins`
- **Total Defined Fields:** 14
- **Important Fields:**
  - `corridor`, `highway`, `district`, `roadStatus`, `restrictionType`, `severity`, `title`, `description`, `effectiveFrom`, `expiresAt`, `source`, `sourceUrl`, `isActive`, `createdBy`
- **Indexes:**
  - `roadBulletinSchema.index({ corridor: 1, isActive: 1, expiresAt: 1 });` (Line 88)
- **References (Foreign Keys):**
  - `User` (Line 83: `ref: 'User',`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/roadbulletins`, `GET /api/roadbulletins/:id`
- **Write APIs:** `POST /api/roadbulletins`, `PUT/PATCH /api/roadbulletins/:id`, `DELETE /api/roadbulletins/:id`

### Model: `SavedTrip`
- **File:** `backend/models/SavedTrip.js`
- **MongoDB Collection:** `savedtrips`
- **Total Defined Fields:** 15
- **Important Fields:**
  - `user`, `title`, `startDate`, `endDate`, `notes`, `startingLocation`, `name`, `duration`, `travelers`, `transport`, `pace`, `budget`, `status`, `routeData`, `generatedItinerary`
- **Indexes:**
  - `savedTripSchema.index({ user: 1 });` (Line 28)
- **References (Foreign Keys):**
  - `User` (Line 4: `user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },`)
  - `Destination` (Line 6: `destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],`)
  - `Activity` (Line 7: `activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],`)
  - `Stay` (Line 8: `stays: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stay' }],`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/savedtrips`, `GET /api/savedtrips/:id`
- **Write APIs:** `POST /api/savedtrips`, `PUT/PATCH /api/savedtrips/:id`, `DELETE /api/savedtrips/:id`

### Model: `sharedSchemas`
- **File:** `backend/models/sharedSchemas.js`
- **MongoDB Collection:** `unknown`
- **Total Defined Fields:** 14
- **Important Fields:**
  - `url`, `publicId`, `source`, `sourcePage`, `license`, `attribution`, `alt`, `coordinates`, `validate`, `sourceName`, `sourceUrl`, `sourcePageUrl`, `contentLicense`, `lastVerified`
- **Indexes:**
  - Default `_id_` index
- **References (Foreign Keys):**
  - None
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/unknown`, `GET /api/unknown/:id`
- **Write APIs:** `POST /api/unknown`, `PUT/PATCH /api/unknown/:id`, `DELETE /api/unknown/:id`

### Model: `SosAlert`
- **File:** `backend/models/SosAlert.js`
- **MongoDB Collection:** `sosalerts`
- **Total Defined Fields:** 34
- **Important Fields:**
  - `alertCode`, `userId`, `travelerName`, `travelerPhone`, `incidentType`, `severity`, `message`, `location`, `lat`, `lng`, `altitude`, `accuracy`, `nearestLandmark`, `district`, `deviceTelemetry`... (and more)
- **Indexes:**
  - `SosAlertSchema.index({ 'location.lat': 1, 'location.lng': 1 });` (Line 97)
  - `SosAlertSchema.index({ createdAt: -1 });` (Line 98)
- **References (Foreign Keys):**
  - `User` (Line 12: `ref: 'User',`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/sosalerts`, `GET /api/sosalerts/:id`
- **Write APIs:** `POST /api/sosalerts`, `PUT/PATCH /api/sosalerts/:id`, `DELETE /api/sosalerts/:id`

### Model: `Spiritual`
- **File:** `backend/models/Spiritual.js`
- **MongoDB Collection:** `spirituals`
- **Total Defined Fields:** 13
- **Important Fields:**
  - `name`, `slug`, `description`, `shortDescription`, `district`, `region`, `location`, `locationSource`, `bestTimeToVisit`, `bestTimeSourceSentence`, `idealDuration`, `budgetLevel`, `coverImage`
- **Indexes:**
  - `spiritualSchema.index({ district: 1 });` (Line 26)
  - `spiritualSchema.index({ location: '2dsphere' }, { sparse: true });` (Line 27)
- **References (Foreign Keys):**
  - None
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/spirituals`, `GET /api/spirituals/:id`
- **Write APIs:** `POST /api/spirituals`, `PUT/PATCH /api/spirituals/:id`, `DELETE /api/spirituals/:id`

### Model: `Stay`
- **File:** `backend/models/Stay.js`
- **MongoDB Collection:** `stays`
- **Total Defined Fields:** 29
- **Important Fields:**
  - `name`, `slug`, `description`, `shortDescription`, `city`, `district`, `address`, `location`, `locationSource`, `category`, `phone`, `email`, `website`, `price`, `amount`... (and more)
- **Indexes:**
  - `staySchema.index({ district: 1 });` (Line 49)
  - `staySchema.index({ location: '2dsphere' }, { sparse: true });` (Line 50)
- **References (Foreign Keys):**
  - `User` (Line 34: `owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/stays`, `GET /api/stays/:id`
- **Write APIs:** `POST /api/stays`, `PUT/PATCH /api/stays/:id`, `DELETE /api/stays/:id`

### Model: `Transport`
- **File:** `backend/models/Transport.js`
- **MongoDB Collection:** `transports`
- **Total Defined Fields:** 34
- **Important Fields:**
  - `mode`, `routingType`, `operator`, `serviceName`, `serviceNumber`, `origin`, `name`, `district`, `state`, `stationCode`, `destination`, `name`, `district`, `state`, `stationCode`... (and more)
- **Indexes:**
  - `transportSchema.index({ 'origin.name': 1, 'destination.name': 1 });` (Line 106)
  - `transportSchema.index({ mode: 1 });` (Line 107)
  - `transportSchema.index({ routingType: 1 });` (Line 108)
- **References (Foreign Keys):**
  - None
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/transports`, `GET /api/transports/:id`
- **Write APIs:** `POST /api/transports`, `PUT/PATCH /api/transports/:id`, `DELETE /api/transports/:id`

### Model: `Trip`
- **File:** `backend/models/Trip.js`
- **MongoDB Collection:** `unknown`
- **Total Defined Fields:** 0
- **Important Fields:**
  - ``
- **Indexes:**
  - Default `_id_` index
- **References (Foreign Keys):**
  - None
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/unknown`, `GET /api/unknown/:id`
- **Write APIs:** `POST /api/unknown`, `PUT/PATCH /api/unknown/:id`, `DELETE /api/unknown/:id`

### Model: `User`
- **File:** `backend/models/User.js`
- **MongoDB Collection:** `users`
- **Total Defined Fields:** 14
- **Important Fields:**
  - `name`, `email`, `phone`, `password`, `role`, `profileImage`, `location`, `city`, `district`, `state`, `country`, `coordinates`, `coordinates`, `isActive`
- **Indexes:**
  - `userSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });` (Line 62)
  - `userSchema.index({ 'location.city': 1 });` (Line 63)
  - `userSchema.index({ 'location.district': 1 });` (Line 64)
- **References (Foreign Keys):**
  - None
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/users`, `GET /api/users/:id`
- **Write APIs:** `POST /api/users`, `PUT/PATCH /api/users/:id`, `DELETE /api/users/:id`

### Model: `VehiclePermitRecord`
- **File:** `backend/models/VehiclePermitRecord.js`
- **MongoDB Collection:** `vehiclepermitrecords`
- **Total Defined Fields:** 19
- **Important Fields:**
  - `vehicleNumber`, `operatorName`, `district`, `permitType`, `validUntil`, `fitnessCertificateExpiry`, `insuranceExpiry`, `vehicleSalt`, `permitSalt`, `web3Sync`, `syncStatus`, `onChainStatus`, `vehicleHash`, `permitDigest`, `txHash`... (and more)
- **Indexes:**
  - `vehiclePermitRecordSchema.index({ 'web3Sync.vehicleHash': 1 });` (Line 89)
- **References (Foreign Keys):**
  - None
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/vehiclepermitrecords`, `GET /api/vehiclepermitrecords/:id`
- **Write APIs:** `POST /api/vehiclepermitrecords`, `PUT/PATCH /api/vehiclepermitrecords/:id`, `DELETE /api/vehiclepermitrecords/:id`

### Model: `VerificationAuditLog`
- **File:** `backend/models/VerificationAuditLog.js`
- **MongoDB Collection:** `verificationauditlogs`
- **Total Defined Fields:** 10
- **Important Fields:**
  - `admin`, `targetType`, `targetId`, `action`, `previousStatus`, `newStatus`, `reason`, `verificationVersion`, `decisionSource`, `timestamp`
- **Indexes:**
  - `verificationAuditLogSchema.index({ targetId: 1, timestamp: -1 });` (Line 63)
  - `verificationAuditLogSchema.index({ admin: 1 });` (Line 64)
- **References (Foreign Keys):**
  - `User` (Line 12: `ref: 'User',`)
- **Used By:** Controllers, Services, and Seed Scripts
- **Read APIs:** `GET /api/verificationauditlogs`, `GET /api/verificationauditlogs/:id`
- **Write APIs:** `POST /api/verificationauditlogs`, `PUT/PATCH /api/verificationauditlogs/:id`, `DELETE /api/verificationauditlogs/:id`

