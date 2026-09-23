import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Public Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import MobileBottomBar from './components/MobileBottomBar';
import Toast from './components/Toast';
import ConsultationModal from './components/ConsultationModal';
import CustomerAuthModal from './components/CustomerAuthModal';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Photos from './pages/Photos';
import Videos from './pages/Videos';
import Contact from './pages/Contact';
import Account from './pages/Account';
import Affiliate from './pages/Affiliate';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import NotFound from './pages/NotFound';

// Context Providers
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// CRM Components & Pages
import CrmLayout from './components/crm/CrmLayout';
import CrmLogin from './pages/crm/auth/Login';
import CrmDashboard from './pages/crm/dashboard/Dashboard';
import CustomerList from './pages/crm/customers/CustomerList';
import LeadList from './pages/crm/leads/LeadList';
import FollowupList from './pages/crm/followups/FollowupList';
import OrderList from './pages/crm/orders/OrderList';
import ProductList from './pages/crm/products/ProductList';
import AffiliateList from './pages/crm/affiliates/AffiliateList';
import AffiliatePortal from './pages/crm/affiliates/AffiliatePortal';
import CommissionDashboard from './pages/crm/commission/CommissionDashboard';
import CommissionSlabs from './pages/crm/commission/CommissionSlabs';
import EmployeeCommission from './pages/crm/commission/EmployeeCommission';
import CommissionTransactions from './pages/crm/commission/CommissionTransactions';
import CommissionPayouts from './pages/crm/commission/CommissionPayouts';
import PaymentList from './pages/crm/payments/PaymentList';
import SupportTicketList from './pages/crm/support/SupportTicketList';
import Reports from './pages/crm/reports/Reports';
import Notifications from './pages/crm/notifications/Notifications';
import UserList from './pages/crm/users/UserList';
import AuditLogs from './pages/crm/audit/AuditLogs';
import Settings from './pages/crm/settings/Settings';

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetails />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
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
          <Router>
            <AppTracker />
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
              <Route path="/*" element={<PublicLayout />} />
            </Routes>
          </Router>
        </AuthProvider>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;