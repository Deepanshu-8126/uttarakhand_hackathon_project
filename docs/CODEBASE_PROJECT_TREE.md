# Discovery Uttarakhand — Codebase Project Tree
**Generated:** 2026-09-28
**Scope:** Actual Verified Files (Excluding node_modules, .git, dist, build)

```
Discovery Uttarakhand Root/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── README.md
├── GEMINI.md
├── vercel.json
├── Frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   │   ├── assets/
│   │   │   ├── destinations/
│   │   │   │   ├── kedarnath/ (temple.jpg)
│   │   │   │   ├── bhimtal/ (cover.jpg, lake.jpg)
│   │   │   │   ├── sattal/ (cover.jpg)
│   │   │   │   ├── almora/ (cover.jpg, gallery-1.jpg)
│   │   │   │   ├── munsiyari/ (cover.jpg)
│   │   │   │   ├── pithoragarh/ (cover.jpg)
│   │   │   │   └── ...
│   │   │   ├── kedarnath.jpg
│   │   │   ├── badrinath.jpg
│   │   │   ├── rishikesh.jpg
│   │   │   ├── nainital.jpg
│   │   │   ├── auli.jpg
│   │   │   ├── chopta.jpg
│   │   │   ├── hemkund.jpg
│   │   │   └── fallback.svg
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── api/
│       │   ├── activityApi.js
│       │   ├── adminApi.js
│       │   ├── agentApi.js
│       │   ├── aiApi.js
│       │   ├── api.js
│       │   ├── authApi.js
│       │   ├── bookingApi.js
│       │   ├── budgetApi.js
│       │   ├── chatApi.js
│       │   ├── cultureApi.js
│       │   ├── destinationApi.js
│       │   ├── exploreApi.js
│       │   ├── favoriteApi.js
│       │   ├── guideApi.js
│       │   ├── liveDataApi.js
│       │   ├── partnerApi.js
│       │   ├── paymentApi.js
│       │   ├── personalizedApi.js
│       │   ├── placesApi.js
│       │   ├── recommendationApi.js
│       │   ├── rentalApi.js
│       │   ├── reviewApi.js
│       │   ├── sosApi.js
│       │   ├── spiritualApi.js
│       │   ├── stayApi.js
│       │   ├── transportApi.js
│       │   ├── tripApi.js
│       │   └── userApi.js
│       ├── chat/
│       │   ├── AgentThinking.jsx
│       │   ├── ChatInput.jsx
│       │   ├── ChatState.js
│       │   ├── ChatWindow.jsx
│       │   ├── index.js
│       │   ├── MessageRenderer.jsx
│       │   ├── SuggestedActions.jsx
│       │   ├── VoiceControls.jsx
│       │   └── VoxExpeditionCard.jsx
│       ├── components/
│       │   ├── ActivityCard.jsx
│       │   ├── AdaptiveMountainDock.jsx
│       │   ├── AuthModal.jsx
│       │   ├── CategoryHero.jsx
│       │   ├── CultureCard.jsx
│       │   ├── DestinationCard.jsx
│       │   ├── DestinationMap.jsx
│       │   ├── ErrorBoundary.jsx
│       │   ├── ExploreSection.jsx
│       │   ├── FavoriteButton.jsx
│       │   ├── FilterPills.jsx
│       │   ├── Footer.jsx
│       │   ├── GlobalLocationModal.jsx
│       │   ├── GooglePlacesRadarWidget.jsx
│       │   ├── GuideCard.jsx
│       │   ├── HeroSection.jsx
│       │   ├── ImageUploader.jsx
│       │   ├── Navbar.jsx
│       │   ├── PhotoGallery.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── RentalCard.jsx
│       │   ├── ReviewSection.jsx
│       │   ├── SearchBar.jsx
│       │   ├── SpiritualCard.jsx
│       │   ├── StayCard.jsx
│       │   ├── ThankYouSection.jsx
│       │   ├── admin/
│       │   │   └── PartnerVerificationQueue.jsx
│       │   ├── booking/
│       │   │   ├── BookingDetailsModal.jsx
│       │   │   ├── BookingModal.jsx
│       │   │   ├── EscrowOtpModal.jsx
│       │   │   └── MyBookings.jsx
│       │   ├── common/
│       │   │   ├── CinematicVideoShowcase.jsx
│       │   │   ├── DownloadAppModal.jsx
│       │   │   ├── GlobalToast.jsx
│       │   │   ├── ImageCarousel.jsx
│       │   │   ├── Pagination.jsx
│       │   │   └── TruthBadge.jsx
│       │   ├── copilot/
│       │   │   ├── AgenticToolCallTimeline.jsx
│       │   │   ├── AICopilotDrawer.jsx
│       │   │   ├── AICopilotDrawer.css
│       │   │   ├── ChatArea.jsx
│       │   │   ├── ChatHistorySidebar.jsx
│       │   │   ├── CopilotMessage.jsx
│       │   │   ├── DevbhoomiVoiceStudioModal.jsx
│       │   │   ├── GlobalAiCopilotLauncher.jsx
│       │   │   ├── GlobalAiCopilotLauncher.css
│       │   │   ├── QuickActions.jsx
│       │   │   ├── StructuredTravelCards.jsx
│       │   │   ├── StructuredTravelCards.css
│       │   │   ├── TripContextPanel.jsx
│       │   │   ├── TripContextStrip.jsx
│       │   │   ├── TripContextStrip.css
│       │   │   └── VoiceVisualizer.jsx
│       │   ├── destination/
│       │   │   └── DestinationDiscoveryWorkspace.jsx
│       │   ├── destinations/
│       │   │   ├── BottomTray.jsx
│       │   │   ├── DestinationCard.jsx
│       │   │   └── DestinationCarousel.jsx
│       │   ├── features/
│       │   │   ├── AltitudeSafetyAI.jsx
│       │   │   ├── ClaudeSkillsPanel.jsx
│       │   │   ├── CommunitySafetyGrid.jsx
│       │   │   ├── LiveMountainTelemetry.jsx
│       │   │   ├── OfflineEscrowHandshake.jsx
│       │   │   ├── PahadiCoinsWallet.jsx
│       │   │   └── StitchSyncDashboard.jsx
│       │   ├── home/
│       │   │   ├── PersonalizedNearYouSection.jsx
│       │   │   ├── ProblemStatement.jsx
│       │   │   ├── TrustProtocolStrip.jsx
│       │   │   └── TrustStrip.jsx
│       │   ├── layout/
│       │   │   ├── Header.jsx
│       │   │   └── LeftSidebar.jsx
│       │   ├── map/
│       │   │   ├── DestinationMarker.jsx
│       │   │   ├── DestinationPopup.jsx
│       │   │   ├── MapControls.jsx
│       │   │   ├── MapStage.jsx
│       │   │   ├── MarkerLayer.jsx
│       │   │   ├── RouteLayer.jsx
│       │   │   ├── SearchBar.jsx
│       │   │   ├── TransitRouteDrawer.jsx
│       │   │   ├── TripPlannerMap.jsx
│       │   │   ├── UnverifiedPlaceModal.jsx
│       │   │   └── UttarakhandMap.jsx
│       │   ├── navigation/
│       │   │   └── BottomNavBar.jsx
│       │   ├── partner/
│       │   │   ├── PartnerHeader.jsx
│       │   │   ├── PartnerListingsManager.jsx
│       │   │   ├── PartnerSidebar.jsx
│       │   │   └── tabs/
│       │   │       ├── AnalyticsTab.jsx
│       │   │       ├── AvailabilityTab.jsx
│       │   │       ├── BookingsTab.jsx
│       │   │       ├── EarningsTab.jsx
│       │   │       ├── ExpensesTab.jsx
│       │   │       ├── ListingFormTab.jsx
│       │   │       ├── ListingsTab.jsx
│       │   │       ├── OverviewTab.jsx
│       │   │       ├── PricingTab.jsx
│       │   │       ├── ProfileTab.jsx
│       │   │       └── ReviewsTab.jsx
│       │   ├── planner/
│       │   │   ├── AddDestinationDrawer.jsx
│       │   │   ├── AddToTripModal.jsx
│       │   │   ├── AiTripPlanCard.jsx
│       │   │   ├── BudgetBreakdownCard.jsx
│       │   │   ├── DayCard.jsx
│       │   │   ├── FloatingTripBasket.jsx
│       │   │   ├── GeneratedItineraryDrawer.jsx
│       │   │   ├── InterestSelector.jsx
│       │   │   ├── ItineraryPanel.jsx
│       │   │   ├── JourneySegmentStepper.jsx
│       │   │   ├── LiveSafetyBadge.jsx
│       │   │   ├── ModifyTripModal.jsx
│       │   │   ├── PlanTripPanel.jsx
│       │   │   ├── RouteSelector.jsx
│       │   │   ├── TripPlanner.jsx
│       │   │   ├── TripRightPanel.jsx
│       │   │   ├── TripSearchPanel.jsx
│       │   │   ├── TripSummaryPanel.jsx
│       │   │   ├── TripWorkspaceMap.jsx
│       │   │   ├── WeatherWidget.jsx
│       │   │   └── WorkspaceAdvisories.jsx
│       │   ├── rentals/
│       │   │   └── RentalHero.jsx
│       │   ├── safety/
│       │   │   ├── AltitudeGuardModal.jsx
│       │   │   ├── CommunityGridWidget.jsx
│       │   │   ├── FloatingSosBottomSheet.jsx
│       │   │   ├── LandslideAlertBanner.jsx
│       │   │   ├── SOSPanel.jsx
│       │   │   └── WomenSosModal.jsx
│       │   ├── sidebar/
│       │   │   ├── LayerControls.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   └── SidebarItem.jsx
│       │   ├── sos/
│       │   │   ├── SOSActiveBanner.jsx
│       │   │   ├── SOSFloatingButton.jsx
│       │   │   └── SOSModal.jsx
│       │   ├── verification/
│       │   │   └── VerificationBadge.jsx
│       │   └── widgets/
│       │       ├── DestinationWeatherCard.jsx
│       │       ├── ExploreMoreWidget.jsx
│       │       ├── StatsWidget.jsx
│       │       ├── TopNavWeatherBadge.jsx
│       │       └── WeatherWidget.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── CartContext.jsx
│       │   ├── FavoritesContext.jsx
│       │   └── LanguageContext.jsx
│       ├── data/
│       │   ├── activities.json
│       │   ├── destinations.json
│       │   ├── routes.json
│       │   ├── spiritual.json
│       │   ├── stays.json
│       │   └── verifiedTransports.js
│       ├── hooks/
│       │   ├── useActivities.js
│       │   ├── useCulture.js
│       │   ├── useDestinations.js
│       │   ├── useGuides.js
│       │   ├── useLiveLocationWeather.js
│       │   ├── useRentals.js
│       │   ├── useSOS.js
│       │   ├── useSpiritual.js
│       │   └── useStays.js
│       ├── lib/
│       │   └── voiceBridge.js
│       ├── pages/
│       │   ├── Activities.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminManagement.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── CopilotPage.jsx
│       │   ├── CopilotPage.css
│       │   ├── Culture.jsx
│       │   ├── DestinationDetails.jsx
│       │   ├── DetailPage.jsx
│       │   ├── GuideDashboard.jsx
│       │   ├── GuideProfilePage.jsx
│       │   ├── Guides.jsx
│       │   ├── Home.jsx
│       │   ├── InnovationShowcasePage.jsx
│       │   ├── LiveTrackingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── Map.jsx
│       │   ├── MyTripPage.jsx
│       │   ├── NotFoundPage.jsx
│       │   ├── ProductAuditPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── Rentals.jsx
│       │   ├── RescueOpsPage.jsx
│       │   ├── Spiritual.jsx
│       │   ├── Stays.jsx
│       │   ├── TrekkerLivePage.jsx
│       │   ├── TripPlanner.jsx
│       │   ├── VerificationProofPage.jsx
│       │   ├── VerifiedReviewPage.jsx
│       │   └── partner/
│       │       └── PartnerDashboardPage.jsx
│       ├── services/
│       │   ├── audioProcessor.js
│       │   ├── geminiLiveClient.js
│       │   └── tripService.js
│       ├── store/
│       │   ├── chatStore.js
│       │   └── mapStore.js
│       └── utils/
│           ├── agentActionExecutor.js
│           ├── audioRecorder.js
│           ├── constants.js
│           ├── discoveryAdapter.js
│           ├── geoHelpers.js
│           ├── imageHelpers.js
│           ├── images.js
│           ├── imageUtils.js
│           ├── itineraryGenerator.js
│           ├── locationHelpers.js
│           ├── mapConfig.js
│           ├── mapConstants.js
│           ├── mapHelpers.js
│           ├── routeHelpers.js
│           └── speechSynthesis.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   ├── ai/
│   │   ├── agents/
│   │   │   ├── BudgetAgent.js
│   │   │   ├── DestinationAgent.js
│   │   │   ├── FestivalAgent.js
│   │   │   ├── PlannerAgent.js
│   │   │   ├── RentalAgent.js
│   │   │   └── SafetyAgent.js
│   │   ├── memory/
│   │   │   └── conversationMemory.js
│   │   ├── prompts/
│   │   │   └── systemPrompts.js
│   │   ├── retrieval/
│   │   │   └── destinationStore.js
│   │   ├── tools/
│   │   │   ├── buildItinerary.js
│   │   │   ├── calculateBudget.js
│   │   │   ├── index.js
│   │   │   ├── searchActivities.js
│   │   │   ├── searchDestinations.js
│   │   │   ├── searchRentals.js
│   │   │   ├── searchStays.js
│   │   │   └── weatherTool.js
│   │   ├── voice/
│   │   │   └── voiceService.js
│   │   └── workflows/
│   │       └── agentRouter.js
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   ├── envValidator.js
│   │   ├── recommendationConfig.js
│   │   └── redis.js
│   ├── controllers/
│   │   ├── activityController.js
│   │   ├── adminController.js
│   │   ├── adminVerificationController.js
│   │   ├── agentController.js
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── chatController.js
│   │   ├── cultureController.js
│   │   ├── destinationController.js
│   │   ├── destinationExploreController.js
│   │   ├── factoryController.js
│   │   ├── favoriteController.js
│   │   ├── guideController.js
│   │   ├── liveDataController.js
│   │   ├── marketplaceController.js
│   │   ├── partnerController.js
│   │   ├── paymentController.js
│   │   ├── personalizedController.js
│   │   ├── placesController.js
│   │   ├── relatedController.js
│   │   ├── rentalController.js
│   │   ├── reviewController.js
│   │   ├── safetyController.js
│   │   ├── sosController.js
│   │   ├── spiritualController.js
│   │   ├── stayController.js
│   │   ├── transportController.js
│   │   ├── tripController.js
│   │   ├── truthController.js
│   │   ├── userController.js
│   │   └── verificationController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Activity.js
│   │   ├── Booking.js
│   │   ├── Chat.js
│   │   ├── CommunityReport.js
│   │   ├── Culture.js
│   │   ├── Destination.js
│   │   ├── Favorite.js
│   │   ├── Guide.js
│   │   ├── Listing.js
│   │   ├── Partner.js
│   │   ├── PartnerExpense.js
│   │   ├── PartnerListing.js
│   │   ├── Payment.js
│   │   ├── PaymentWebhookEvent.js
│   │   ├── Rental.js
│   │   ├── Review.js
│   │   ├── RoadBulletin.js
│   │   ├── SavedTrip.js
│   │   ├── sharedSchemas.js
│   │   ├── SosAlert.js
│   │   ├── Spiritual.js
│   │   ├── Stay.js
│   │   ├── Transport.js
│   │   ├── Trip.js
│   │   ├── User.js
│   │   ├── VehiclePermitRecord.js
│   │   └── VerificationAuditLog.js
│   ├── routes/
│   │   ├── activityRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── agentRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── cultureRoutes.js
│   │   ├── destinationRoutes.js
│   │   ├── favoriteRoutes.js
│   │   ├── guideRoutes.js
│   │   ├── internalAgentRoutes.js
│   │   ├── liveDataRoutes.js
│   │   ├── marketplaceRoutes.js
│   │   ├── partnerRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── personalizedRoutes.js
│   │   ├── photoRoutes.js
│   │   ├── placesRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── rentalRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── safetyRoutes.js
│   │   ├── sosRoutes.js
│   │   ├── spiritualRoutes.js
│   │   ├── stayRoutes.js
│   │   ├── transportRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── truthRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── userRoutes.js
│   │   ├── verificationRoutes.js
│   │   └── voiceRoutes.js
│   ├── seed/
│   │   ├── activities.json
│   │   ├── alternatives.json
│   │   ├── businesses.json
│   │   ├── culture.json
│   │   ├── data-summary.json
│   │   ├── destinations.json
│   │   ├── events.json
│   │   ├── guides.json
│   │   ├── image-manifest.json
│   │   ├── rentals.json
│   │   ├── spiritual.json
│   │   ├── stays.json
│   │   ├── transports.json
│   │   ├── transport_gateways.json
│   │   └── planner/
│   │       ├── gateway-hubs.json
│   │       ├── permit-rules.json
│   │       ├── transport-options.json
│   │       └── trek-meta.json
│   ├── services/
│   │   ├── advisoryEngine.js
│   │   ├── agentService.js
│   │   ├── agentSessionStore.js
│   │   ├── agentTools.js
│   │   ├── aiContextBuilder.js
│   │   ├── aiPlannerService.js
│   │   ├── altitudeGuardService.js
│   │   ├── budgetEngine.js
│   │   ├── chatService.js
│   │   ├── communityGridService.js
│   │   ├── cryptoService.js
│   │   ├── destinationResolver.js
│   │   ├── elevenLabsService.js
│   │   ├── escrowService.js
│   │   ├── googlePlacesService.js
│   │   ├── hybridRagService.js
│   │   ├── livePlacePhotoService.js
│   │   ├── locationService.js
│   │   ├── paymentService.js
│   │   ├── photoService.js
│   │   ├── recommendationService.js
│   │   ├── rerouteEngineService.js
│   │   ├── tripMutationService.js
│   │   ├── truthCheckService.js
│   │   ├── web3Service.js
│   │   ├── womenSafetyService.js
│   │   ├── adapters/
│   │   │   ├── openMeteoAdapter.js
│   │   │   ├── roadAdvisoryAdapter.js
│   │   │   └── transitLiveAdapter.js
│   │   ├── ai/
│   │   │   ├── copilotService.js
│   │   │   └── providers/
│   │   │       ├── BaseAiProvider.js
│   │   │       ├── DeterministicFallbackProvider.js
│   │   │       ├── GeminiProvider.js
│   │   │       ├── GroqProvider.js
│   │   │       ├── OmniRouteProvider.js
│   │   │       └── OpenAIProvider.js
│   │   └── cache/
│   │       └── memoryCache.js
│   └── utils/
│       ├── cloudinaryHelper.js
│       ├── errorHandler.js
│       ├── money.js
│       └── queryHelper.js
└── contracts/
    ├── src/
    │   ├── PartnerVerification.sol
    │   └── VehicleRegistry.sol
    └── artifacts/
        └── src/
            ├── PartnerVerification.sol/PartnerVerification.json
            └── VehicleRegistry.sol/VehicleRegistry.json
```
