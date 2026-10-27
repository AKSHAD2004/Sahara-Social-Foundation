import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';

// Public Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import MobileBottomBar from './components/MobileBottomBar';
import Toast from './components/Toast';
import ConsultationModal from './components/ConsultationModal';
import CustomerAuthModal from './components/CustomerAuthModal';

// Core Public Pages (Home synchronous for instantaneous first paint, others lazy-loaded)
import Home from './pages/Home';
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));

// Secondary Public Pages (Lazy Loaded on Demand)
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Photos = lazy(() => import('./pages/Photos'));
const Videos = lazy(() => import('./pages/Videos'));
const Contact = lazy(() => import('./pages/Contact'));
const Account = lazy(() => import('./pages/Account'));
const Affiliate = lazy(() => import('./pages/Affiliate'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const StudyReport = lazy(() => import('./pages/StudyReport'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Context Providers
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// CRM Components & Pages (Lazy Loaded so public visitors never download CRM code)
const CrmLayout = lazy(() => import('./components/crm/CrmLayout'));
const CrmLogin = lazy(() => import('./pages/crm/auth/Login'));
const CrmDashboard = lazy(() => import('./pages/crm/dashboard/Dashboard'));
const CustomerList = lazy(() => import('./pages/crm/customers/CustomerList'));
const LeadList = lazy(() => import('./pages/crm/leads/LeadList'));
const FollowupList = lazy(() => import('./pages/crm/followups/FollowupList'));
const OrderList = lazy(() => import('./pages/crm/orders/OrderList'));
const ProductList = lazy(() => import('./pages/crm/products/ProductList'));
const HeroSlideList = lazy(() => import('./pages/crm/banners/HeroSlideList'));
const GalleryManager = lazy(() => import('./pages/crm/gallery/GalleryManager'));
const VideoManager = lazy(() => import('./pages/crm/videos/VideoManager'));
const ReviewManager = lazy(() => import('./pages/crm/reviews/ReviewManager'));
const AffiliateList = lazy(() => import('./pages/crm/affiliates/AffiliateList'));
const AffiliatePortal = lazy(() => import('./pages/crm/affiliates/AffiliatePortal'));
const CommissionDashboard = lazy(() => import('./pages/crm/commission/CommissionDashboard'));
const CommissionSlabs = lazy(() => import('./pages/crm/commission/CommissionSlabs'));
const EmployeeCommission = lazy(() => import('./pages/crm/commission/EmployeeCommission'));
const CommissionTransactions = lazy(() => import('./pages/crm/commission/CommissionTransactions'));
const CommissionPayouts = lazy(() => import('./pages/crm/commission/CommissionPayouts'));
const PaymentList = lazy(() => import('./pages/crm/payments/PaymentList'));
const SupportTicketList = lazy(() => import('./pages/crm/support/SupportTicketList'));
const Reports = lazy(() => import('./pages/crm/reports/Reports'));
const Notifications = lazy(() => import('./pages/crm/notifications/Notifications'));
const UserList = lazy(() => import('./pages/crm/users/UserList'));
const AuditLogs = lazy(() => import('./pages/crm/audit/AuditLogs'));
const Settings = lazy(() => import('./pages/crm/settings/Settings'));

// Lightweight Page Loading Spinner
const RouteLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', padding: '2rem' }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid #E8F5E9',
      borderTop: '3px solid #006B2D',
      borderRadius: '50%',
      animation: 'appSpin 0.75s linear infinite'
    }} />
    <style>{`
      @keyframes appSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Scroll to top & Affiliate Referral Link Tracker
function AppTracker() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Track ?ref=SAHARA... in URL parameters
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('sahara_active_ref', refCode.toUpperCase());
    }

    // Toggle GTranslate visibility: keep clean on CRM login and dashboard
    const isCrmRoute = location.pathname.startsWith('/crm');
    const gtWrappers = document.querySelectorAll('.gtranslate_wrapper, #gt_float_wrapper');
    gtWrappers.forEach((el) => {
      if (el) el.style.display = isCrmRoute ? 'none' : '';
    });

    // Global single-video playback: whenever any video plays, pause all other videos
    const handleGlobalVideoPlay = (e) => {
      const playingVideo = e.target;
      if (playingVideo && playingVideo.tagName === 'VIDEO') {
        document.querySelectorAll('video').forEach((v) => {
          if (v !== playingVideo && !v.paused) {
            v.pause();
          }
        });
      }
    };

    document.addEventListener('play', handleGlobalVideoPlay, true);
    return () => {
      document.removeEventListener('play', handleGlobalVideoPlay, true);
    };
  }, [location]);

  return null;
}

// Public Website Layout
function PublicLayout() {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
      <MobileBottomBar onOpenConsultation={() => setIsConsultationOpen(true)} />
      <Toast />
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
      <CustomerAuthModal />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppTracker />
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                {/* CRM Public Login */}
                <Route path="/crm/login" element={<CrmLogin />} />

                {/* Secure CRM Portal (Role-Protected) */}
                <Route
                  path="/crm"
                  element={
                    <ProtectedRoute>
                      <CrmLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CrmDashboard />} />
                  <Route path="customers" element={<CustomerList />} />
                  <Route path="leads" element={<LeadList />} />
                  <Route path="followups" element={<FollowupList />} />
                  <Route path="orders" element={<OrderList />} />
                  <Route path="products" element={<ProductList />} />
                  <Route path="banners" element={<HeroSlideList />} />
                  <Route path="slides" element={<HeroSlideList />} />
                  <Route path="gallery" element={<GalleryManager />} />
                  <Route path="photos-manager" element={<GalleryManager />} />
                  <Route path="videos" element={<VideoManager />} />
                  <Route path="videos-manager" element={<VideoManager />} />
                  <Route path="reviews" element={<ReviewManager />} />
                  <Route path="reviews-manager" element={<ReviewManager />} />
                  <Route path="affiliates" element={<AffiliateList />} />
                  <Route path="affiliate-portal" element={<AffiliatePortal />} />
                  
                  {/* Commission Subroutes */}
                  <Route path="commission" element={<CommissionDashboard />} />
                  <Route path="commission/slabs" element={<CommissionSlabs />} />
                  <Route path="commission/employees" element={<EmployeeCommission />} />
                  <Route path="commission/transactions" element={<CommissionTransactions />} />
                  <Route path="commission/payouts" element={<CommissionPayouts />} />

                  <Route path="payments" element={<PaymentList />} />
                  <Route path="support" element={<SupportTicketList />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="users" element={<UserList />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Public Website Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/about-us" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/:id" element={<ProductDetails />} />
                  <Route path="/nutrifeel-product" element={<Shop />} />
                  <Route path="/nutrifeel-products" element={<Shop />} />
                  <Route path="/products" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/photos" element={<Photos />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/video" element={<Videos />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/contact-us" element={<Contact />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/my-account" element={<Account />} />
                  <Route path="/affiliate" element={<Affiliate />} />
                  <Route path="/affiliates" element={<Affiliate />} />
                  <Route path="/affiliate-registration" element={<Affiliate />} />
                  <Route path="/affiliate/register" element={<Affiliate />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/refund_returns" element={<RefundPolicy />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/study-report" element={<StudyReport />} />
                  <Route path="/clinical-report" element={<StudyReport />} />
                  <Route path="/clinical-reports" element={<StudyReport />} />
                  <Route path="/report" element={<StudyReport />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;