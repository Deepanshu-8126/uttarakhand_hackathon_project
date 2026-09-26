import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Rentals from './pages/Rentals';
import Stays from './pages/Stays';
import Spiritual from './pages/Spiritual';
import Culture from './pages/Culture';
import Activities from './pages/Activities';
import Guides from './pages/Guides';
import MapPage from './pages/Map';
import TripPlanner from './pages/TripPlanner';
import MyTripPage from './pages/MyTripPage';
import DestinationDetails from './pages/DestinationDetails';
import GuideProfilePage from './pages/GuideProfilePage';
import DetailPage from './pages/DetailPage';
import CopilotPage from './pages/CopilotPage';
import LoginPage from './pages/LoginPage';
import ProductAuditPage from './pages/ProductAuditPage';
import InnovationShowcasePage from './pages/InnovationShowcasePage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminManagement from './pages/AdminManagement';
import VerificationProofPage from './pages/VerificationProofPage';
import PartnerDashboardPage from './pages/partner/PartnerDashboardPage';
import GuideDashboard from './pages/GuideDashboard';
import LiveTrackingPage from './pages/LiveTrackingPage';
import RescueOpsPage from './pages/RescueOpsPage';
import TrekkerLivePage from './pages/TrekkerLivePage';
import VerifiedReviewPage from './pages/VerifiedReviewPage';
import ErrorBoundary from './components/ErrorBoundary';
import CheckoutPage from './pages/CheckoutPage';
import BottomNavBar from './components/navigation/BottomNavBar';
import AddToTripModal from './components/planner/AddToTripModal';
import GlobalToast from './components/common/GlobalToast';
import GlobalAiCopilotLauncher from './components/copilot/GlobalAiCopilotLauncher';
import SOSFloatingButton from './components/sos/SOSFloatingButton';
import SOSActiveBanner from './components/sos/SOSActiveBanner';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <Router>
                <SOSActiveBanner />
                <ErrorBoundary fallback={null}>
                  <AddToTripModal />
                </ErrorBoundary>
                <GlobalToast />
                <ErrorBoundary fallback={null}>
                  <GlobalAiCopilotLauncher />
                </ErrorBoundary>
                <ErrorBoundary fallback={null}>
                  <SOSFloatingButton />
                </ErrorBoundary>
                <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/stays" element={<Stays />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/:type/:id" element={<CheckoutPage />} />
              <Route path="/spiritual" element={<Spiritual />} />
              <Route path="/culture" element={<Culture />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/guides/:slug" element={<GuideProfilePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/guide" element={<GuideDashboard />} />
              <Route path="/live/:tripId" element={<LiveTrackingPage />} />
              <Route path="/admin/live/:tripId" element={<LiveTrackingPage />} />
              <Route path="/rescue-ops" element={<RescueOpsPage />} />
              <Route path="/admin/rescue-ops" element={<RescueOpsPage />} />
              <Route path="/trekker" element={<TrekkerLivePage />} />
              <Route path="/trip-planner" element={<TripPlanner />} />
              <Route path="/planner" element={<TripPlanner />} />
              <Route path="/review/:tripId" element={<VerifiedReviewPage />} />
              <Route path="/review" element={<VerifiedReviewPage />} />
              <Route path="/reviews" element={<VerifiedReviewPage defaultView="feed" />} />
              <Route path="/copilot" element={<CopilotPage />} />
              <Route path="/innovations" element={<InnovationShowcasePage />} />
              <Route path="/features" element={<InnovationShowcasePage />} />
              <Route path="/audit" element={<ProductAuditPage />} />
              <Route path="/system-health" element={<ProductAuditPage />} />
              <Route path="/my-trip/:tripId" element={<MyTripPage />} />
              <Route path="/my-trip" element={<MyTripPage />} />
              <Route path="/verify/listing/:id" element={<VerificationProofPage />} />
              <Route path="/verify/vehicle/:vehicleNumber" element={<VerificationProofPage />} />
              <Route path="/destinations" element={<Navigate to="/" replace />} />
              <Route path="/destinations/:slug" element={<DestinationDetails />} />
              <Route path="/:category/:slug" element={<DetailPage />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/partner" element={
                <ProtectedRoute partnerOnly={true}>
                  <PartnerDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/partner/:tab" element={
                <ProtectedRoute partnerOnly={true}>
                  <PartnerDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/partner/*" element={
                <ProtectedRoute partnerOnly={true}>
                  <PartnerDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/:type" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminManagement />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  </LanguageProvider>
</ErrorBoundary>
);
}

export default App;
