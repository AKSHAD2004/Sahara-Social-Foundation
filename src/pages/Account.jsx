import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShoppingBag, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Edit2,
  Save,
  AlertCircle,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { organizationInfo } from '../data/websiteData';
import { dbService } from '../services/db';

const Account = () => {
  const { language } = useLanguage();
  const { customerUser, logoutCustomer, openCustomerAuthModal, loginCustomer } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'profile'
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Login / Register mode for logged out state: 'existing' or 'new'
  const [authMode, setAuthMode] = useState('existing'); // 'existing' (Login) vs 'new' (Register)
  const [loginMobile, setLoginMobile] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerMobile, setRegisterMobile] = useState('');
  const [registerCity, setRegisterCity] = useState('');

  // Profile form state for logged-in user
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: ''
  });

  // Orders list
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (customerUser) {
      setProfileData({
        fullName: customerUser.fullName || customerUser.name || '',
        phone: customerUser.phone || '',
        email: customerUser.email || '',
        address: customerUser.address || '',
        city: customerUser.city || 'कोल्हापूर',
        state: customerUser.state || 'Maharashtra',
        pincode: customerUser.pincode || ''
      });

      // Fetch customer orders from dbService
      const allOrders = dbService.getAll('orders') || [];
      const userMatched = allOrders.filter(o => 
        (customerUser.phone && (o.customerPhone === customerUser.phone || o.phone === customerUser.phone)) ||
        (customerUser.id && o.customerId === customerUser.id)
      );

      if (userMatched.length > 0) {
        setOrders(userMatched);
      } else {
        // Mock demo order for initial view
        setOrders([
          {
            id: 'SSF-842101',
            createdAt: new Date().toISOString(),
            date: '10 Aug 2026',
            productNameMr: 'Antox D आणि Antox T (मधुमेह नियंत्रण किट)',
            productNameEn: 'Antox D & Antox T Kit',
            total: 1499,
            totalAmount: 1499,
            status: 'Delivered',
            statusMr: 'डिलिव्हर झाले (Delivered)',
            statusEn: 'Delivered',
            counselingStatus: 'Counseling Complete (8421154090)'
          }
        ]);
      }
    }
  }, [customerUser]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!customerUser) return;

    const updatedUser = {
      ...customerUser,
      ...profileData
    };

    // Update in local auth & dbService
    loginCustomer(updatedUser);

    // Save in CRM customers if present
    const existingCusts = dbService.getAll('customers') || [];
    const idx = existingCusts.findIndex(c => c.phone === profileData.phone || c.mobileNumber === profileData.phone || c.id === customerUser.id);
    if (idx >= 0) {
      existingCusts[idx] = { ...existingCusts[idx], ...profileData, updatedAt: new Date().toISOString() };
      dbService.save('customers', existingCusts);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Existing Customer Login
  const handleExistingCustomerLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanMobile = loginMobile.replace(/\D/g, '').trim();
    if (!cleanMobile || cleanMobile.length < 10) {
      setLoginError(language === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर टाका.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    // Check if customer exists in CRM customers or orders
    const allCustomers = dbService.getAll('customers') || [];
    const foundCustomer = allCustomers.find(c => 
      c.mobileNumber === cleanMobile || 
      c.phone === cleanMobile || 
      c.whatsappNumber === cleanMobile
    );

    if (foundCustomer) {
      // Existing profile found!
      const userPayload = {
        id: foundCustomer.id,
        fullName: foundCustomer.fullName || foundCustomer.name || 'ग्राहक (Customer)',
        phone: cleanMobile,
        email: foundCustomer.email || '',
        address: foundCustomer.address || '',
        city: foundCustomer.city || 'कोल्हापूर',
        state: foundCustomer.state || 'Maharashtra',
        pincode: foundCustomer.pincode || ''
      };
      loginCustomer(userPayload);
    } else {
      // Check if user has past orders with this phone
      const allOrders = dbService.getAll('orders') || [];
      const pastOrder = allOrders.find(o => o.customerPhone === cleanMobile || o.phone === cleanMobile);

      if (pastOrder) {
        const userPayload = {
          id: pastOrder.customerId || `CUST-${Date.now()}`,
          fullName: pastOrder.customerName || 'ग्राहक (Customer)',
          phone: cleanMobile,
          email: pastOrder.customerEmail || '',
          address: pastOrder.shippingAddress || '',
          city: pastOrder.city || 'कोल्हापूर',
          state: pastOrder.state || 'Maharashtra',
          pincode: pastOrder.pincode || ''
        };
        loginCustomer(userPayload);
      } else {
        // Not found, notify user and switch to Register tab with prefilled mobile
        setRegisterMobile(cleanMobile);
        setLoginError(
          language === 'mr' 
            ? 'या मोबाईल नंबरचे जुने खाते सापडले नाही. कृपया नवीन खात्यासाठी नोंदणी करा.' 
            : 'No existing account found with this mobile number. Please register your details below.'
        );
        setAuthMode('new');
      }
    }
  };

  // New Customer Register
  const handleNewCustomerRegister = (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanMobile = registerMobile.replace(/\D/g, '').trim();
    if (!cleanMobile || cleanMobile.length < 10) {
      setLoginError(language === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर टाका.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!registerName.trim()) {
      setLoginError(language === 'mr' ? 'कृपया आपले पूर्ण नाव टाका.' : 'Please enter your full name.');
      return;
    }

    // Create and save new customer record
    const newCustId = `CUST-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const newCustomerObj = {
      customerId: newCustId,
      fullName: registerName.trim(),
      mobileNumber: cleanMobile,
      whatsappNumber: cleanMobile,
      email: '',
      address: '',
      city: registerCity.trim() || 'कोल्हापूर',
      state: 'Maharashtra',
      pincode: '',
      category: 'Ayurvedic Buyer',
      source: 'Website Account Registration',
      status: 'Active',
      totalPurchases: 0,
      createdAt: new Date().toISOString()
    };

    const created = dbService.add('customers', newCustomerObj);

    const userPayload = {
      id: created?.id || newCustId,
      fullName: registerName.trim(),
      phone: cleanMobile,
      email: '',
      address: '',
      city: registerCity.trim() || 'कोल्हापूर',
      state: 'Maharashtra',
      pincode: ''
    };

    loginCustomer(userPayload);
  };

  const handleLogout = () => {
    const confirmMsg = language === 'mr' 
      ? 'तुम्हाला खात्यातून लॉग आऊट करायचे आहे का?' 
      : 'Are you sure you want to log out of your customer account?';
    if (window.confirm(confirmMsg)) {
      logoutCustomer();
    }
  };

  return (
    <div className="account-page" style={{ backgroundColor: '#F5F7FA', padding: '3.5rem 0 5.5rem 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: '#12355B', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? 'माझे खाते (Customer Account)' : 'Customer Account'}
            </h1>
            <p style={{ color: '#4f6182', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
              {language === 'mr' 
                ? 'आपल्या ऑर्डर्स, पत्ता व ग्राहक प्रोफाइल व्यवस्थापित करा' 
                : 'Manage your orders, delivery address, and beneficiary profile'}
            </p>
          </div>

          {customerUser && (
            <button
              onClick={handleLogout}
              className="btn btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={language === 'mr' ? 'खात्यातून लॉग आऊट करा' : 'Logout from account'}
            >
              <LogOut size={16} />
              <span>{language === 'mr' ? 'लॉग आऊट' : 'Logout'}</span>
            </button>
          )}
        </div>

        {/* If customer is NOT logged in, show login/register card with Existing Account Option */}
        {!customerUser ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem',
            border: '1px solid #e2eaf4',
            boxShadow: '0 10px 25px -5px rgba(18, 53, 91, 0.06), 0 8px 10px -6px rgba(18, 53, 91, 0.02)',
            maxWidth: '520px',
            margin: '0 auto'
          }}>
            {/* Top Icon & Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dbf7fa',
                color: '#087E8B',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '2px solid #abedf5'
              }}>
                <User size={32} />
              </div>
              <h2 style={{ fontSize: '1.45rem', color: '#12355B', fontWeight: 800, marginBottom: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                {authMode === 'existing' 
                  ? (language === 'mr' ? 'आधीच्या खात्यात लॉगिन करा' : 'Login to Existing Account')
                  : (language === 'mr' ? 'नवीन ग्राहक नोंदणी' : 'Create Customer Account')}
              </h2>
              <p style={{ color: '#4f6182', fontSize: '0.88rem', margin: 0 }}>
                {authMode === 'existing'
                  ? (language === 'mr' ? 'आपला नोंदणीकृत १० अंकी मोबाईल नंबर टाकून लॉगिन करा' : 'Enter your registered 10-digit mobile number to access your account')
                  : (language === 'mr' ? 'आपल्या पहिल्या खरेदीसाठी व ऑर्डर ट्रॅकिंगसाठी नाव व मोबाईल नोंदवा' : 'Register your details for instant order tracking & delivery')}
              </p>
            </div>

            {/* Switch Tabs: Existing Account vs New Registration */}
            <div style={{
              display: 'flex',
              backgroundColor: '#F5F7FA',
              borderRadius: '12px',
              padding: '0.35rem',
              marginBottom: '1.75rem',
              border: '1px solid #e2eaf4'
            }}>
              <button
                type="button"
                onClick={() => { setAuthMode('existing'); setLoginError(''); }}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: authMode === 'existing' ? '#ffffff' : 'transparent',
                  color: authMode === 'existing' ? '#087E8B' : '#4f6182',
                  fontWeight: authMode === 'existing' ? 700 : 600,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: authMode === 'existing' ? '0 2px 6px rgba(18,53,91,0.08)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogIn size={15} />
                <span>{language === 'mr' ? 'आधीचे खाते (Login)' : 'Existing Account'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('new'); setLoginError(''); }}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: authMode === 'new' ? '#ffffff' : 'transparent',
                  color: authMode === 'new' ? '#087E8B' : '#4f6182',
                  fontWeight: authMode === 'new' ? 700 : 600,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: authMode === 'new' ? '0 2px 6px rgba(18,53,91,0.08)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <UserPlus size={15} />
                <span>{language === 'mr' ? 'नवीन नोंदणी (Register)' : 'New Account'}</span>
              </button>
            </div>

            {/* Error Message */}
            {loginError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{loginError}</span>
              </div>
            )}

            {/* Form 1: Existing Customer Login (Mobile Number only) */}
            {authMode === 'existing' ? (
              <form onSubmit={handleExistingCustomerLogin}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#172033', marginBottom: '0.4rem' }}>
                    {language === 'mr' ? 'नोंदणीकृत १० अंकी मोबाईल नंबर (Mobile Number) *' : 'Registered 10-Digit Mobile Number *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#087E8B',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      autoFocus
                      placeholder="8421154090"
                      value={loginMobile}
                      onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, ''))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 3.2rem',
                        borderRadius: '10px',
                        border: '1.5px solid #e2eaf4',
                        fontSize: '1rem',
                        outline: 'none',
                        letterSpacing: '1px',
                        fontWeight: 600,
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#4f6182', marginTop: '0.35rem' }}>
                    {language === 'mr' 
                      ? 'आपल्या पूर्वीच्या ऑर्डरमध्ये दिलेला मोबाईल नंबर येथे प्रविष्ट करा.' 
                      : 'Enter the mobile number used during your previous purchase or consultation.'}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    justifyContent: 'center',
                    backgroundColor: '#065f46',
                    boxShadow: '0 4px 14px rgba(6, 95, 70, 0.25)'
                  }}
                >
                  <LogIn size={18} />
                  <span>{language === 'mr' ? 'लॉगिन करा (Sign In)' : 'Sign In with Mobile'}</span>
                </button>

                {/* Switch helper link */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
                    {language === 'mr' ? 'नवीन ग्राहक आहात का? ' : 'New to Sahara Social Foundation? '}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('new'); setLoginError(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#059669',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    {language === 'mr' ? 'येथे नवीन खाते तयार करा' : 'Create New Account'}
                  </button>
                </div>
              </form>
            ) : (
              /* Form 2: New Customer Registration */
              <form onSubmit={handleNewCustomerRegister}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    {language === 'mr' ? 'पूर्ण नाव (Full Name) *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'mr' ? 'उदा. बाबासाहेब जाधव' : 'e.g. Ramesh Patil'}
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    {language === 'mr' ? '१० अंकी मोबाईल नंबर (Mobile Number) *' : '10-Digit Mobile Number *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="8421154090"
                      value={registerMobile}
                      onChange={(e) => setRegisterMobile(e.target.value.replace(/\D/g, ''))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 3.2rem',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                        letterSpacing: '1px',
                        fontWeight: 600,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    {language === 'mr' ? 'शहर / गाव (City / Village)' : 'City / Town'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'mr' ? 'उदा. कोल्हापूर' : 'e.g. Kolhapur'}
                    value={registerCity}
                    onChange={(e) => setRegisterCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    justifyContent: 'center'
                  }}
                >
                  <UserPlus size={18} />
                  <span>{language === 'mr' ? 'नोंदणी करा व खाते सुरू करा' : 'Register & Create Account'}</span>
                </button>

                {/* Switch helper link */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.86rem', color: '#4f6182' }}>
                    {language === 'mr' ? 'आधीपासून खाते आहे का? ' : 'Already have an existing account? '}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('existing'); setLoginError(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#087E8B',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    {language === 'mr' ? 'येथे लॉगिन करा' : 'Sign In here'}
                  </button>
                </div>
              </form>
            )}

            {/* Security note */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginTop: '1.5rem',
              color: '#4f6182',
              fontSize: '0.78rem'
            }}>
              <ShieldCheck size={15} style={{ color: '#087E8B' }} />
              <span>{language === 'mr' ? 'सहारा सोशल फाऊंडेशन • १००% सुरक्षित ग्राहक खाते' : 'Sahara Social Foundation • 100% Secure Account'}</span>
            </div>
          </div>
        ) : (
          /* When customer IS logged in */
          <div style={{
            display: 'grid',
            gridTemplateColumns: '270px 1fr',
            gap: '2rem',
            alignItems: 'flex-start'
          }} className="account-layout-grid">
            {/* Left Sidebar Tabs */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '1.25rem',
              border: '1px solid #e2eaf4',
              boxShadow: '0 4px 15px rgba(18,53,91,0.04)'
            }}>
              {/* Profile Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.5rem 1.25rem 0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#dbf7fa',
                  color: '#087E8B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  flexShrink: 0
                }}>
                  {customerUser.fullName ? customerUser.fullName.charAt(0).toUpperCase() : <User size={22} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#12355B', fontSize: '0.98rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-heading)' }}>
                    {customerUser.fullName || (language === 'mr' ? 'आरोग्य लाभार्थी' : 'Health Beneficiary')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#4f6182' }}>
                    {customerUser.phone || 'Sahara Member'}
                  </div>
                </div>
              </div>

              {/* Sidebar Navigation Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: activeTab === 'orders' ? '#dbf7fa' : 'transparent',
                    color: activeTab === 'orders' ? '#087E8B' : '#172033',
                    fontWeight: activeTab === 'orders' ? 700 : 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>{language === 'mr' ? 'माझ्या ऑर्डर्स' : 'My Orders'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: activeTab === 'profile' ? '#dbf7fa' : 'transparent',
                    color: activeTab === 'profile' ? '#087E8B' : '#172033',
                    fontWeight: activeTab === 'profile' ? 700 : 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <User size={18} />
                  <span>{language === 'mr' ? 'माझी प्रोफाइल व पत्ता' : 'Profile & Address'}</span>
                </button>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: '#e2eaf4', margin: '0.6rem 0' }} />

                {/* Logout Option Below Navigation */}
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid #fee2e2',
                    backgroundColor: '#fff1f2',
                    color: '#e11d48',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffe4e6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff1f2';
                  }}
                >
                  <LogOut size={18} />
                  <span>{language === 'mr' ? 'लॉग आऊट (Logout)' : 'Logout'}</span>
                </button>
              </div>
            </div>

            {/* Right Main Panel */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid #e2eaf4',
              boxShadow: '0 4px 15px rgba(18,53,91,0.04)'
            }}>
              {/* Tab 1: Orders */}
              {activeTab === 'orders' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.3rem', color: '#12355B', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                      {language === 'mr' ? 'मागील ऑर्डर्स व ट्रॅकिंग' : 'Order History & Status'}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#4f6182', fontWeight: 600 }}>
                      {orders.length} {language === 'mr' ? 'ऑर्डर्स' : 'Orders'}
                    </span>
                  </div>

                  {orders.map((ord, idx) => {
                    const orderId = ord.id || `SSF-${idx + 1001}`;
                    const orderDate = ord.createdAt 
                      ? new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : ord.date || 'Recent';
                    const orderStatus = ord.status || 'Processing';
                    const amount = ord.totalAmount || ord.total || 1499;
                    const itemsName = ord.items?.map(i => i.name).join(', ') || (language === 'mr' ? ord.productNameMr : ord.productNameEn) || 'Sahara Health Formula';

                    return (
                      <div
                        key={orderId}
                        style={{
                          border: '1px solid #e2eaf4',
                          borderRadius: '14px',
                          padding: '1.25rem',
                          marginBottom: '1rem',
                          backgroundColor: '#F5F7FA'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: '#12355B', fontSize: '1rem' }}>{orderId}</span>
                            <span style={{ color: '#4f6182', fontSize: '0.82rem', marginLeft: '0.75rem' }}>{orderDate}</span>
                          </div>
                          <span style={{
                            backgroundColor: orderStatus.toLowerCase().includes('deliver') ? '#fff3ec' : '#dbf7fa',
                            color: orderStatus.toLowerCase().includes('deliver') ? '#7c2d12' : '#087E8B',
                            border: '1px solid',
                            borderColor: orderStatus.toLowerCase().includes('deliver') ? '#ffd4b8' : '#abedf5',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px'
                          }}>
                            {language === 'mr' && ord.statusMr ? ord.statusMr : orderStatus}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#172033', marginBottom: '0.35rem' }}>
                          {itemsName}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
                          <span style={{ fontSize: '0.85rem', color: '#087E8B', fontWeight: 600 }}>
                            {ord.counselingStatus || (language === 'mr' ? 'तज्ज्ञ मार्गदर्शन सक्रिय (८४२११५४०९०)' : 'Free Expert Guidance (8421154090)')}
                          </span>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#12355B' }}>
                            ₹{amount}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{
                    backgroundColor: '#fff3ec',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid #ffd4b8',
                    marginTop: '1.5rem',
                    fontSize: '0.88rem',
                    color: '#7c2d12'
                  }}>
                    <strong style={{ color: '#12355B' }}>{language === 'mr' ? 'टीप:' : 'Note:'}</strong>{' '}
                    <span style={{ color: '#172033' }}>
                      {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: Profile & Details */}
              {activeTab === 'profile' && (
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#12355B', fontWeight: 800, marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                    {language === 'mr' ? 'वैयक्तिक माहिती व पत्ता' : 'Personal Profile & Address'}
                  </h3>

                  {saveSuccess && (
                    <div style={{
                      backgroundColor: '#dbf7fa',
                      color: '#087E8B',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #abedf5',
                      marginBottom: '1.25rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <CheckCircle2 size={18} />
                      <span>{language === 'mr' ? 'माहिती यशस्वीरित्या जतन केली!' : 'Profile details updated successfully!'}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                          {language === 'mr' ? 'पूर्ण नाव' : 'Full Name'}
                        </label>
                        <input 
                          type="text" 
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.9rem',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.95rem'
                          }}
                          required 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                          {language === 'mr' ? 'मोबाईल नंबर' : 'Mobile Number'}
                        </label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.9rem',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.95rem'
                          }}
                          required 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                          {language === 'mr' ? 'ईमेल (पर्यायी)' : 'Email (Optional)'}
                        </label>
                        <input 
                          type="email" 
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.9rem',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.95rem'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                          {language === 'mr' ? 'शहर / गाव' : 'City / Village'}
                        </label>
                        <input 
                          type="text" 
                          name="city"
                          value={profileData.city}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.9rem',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.95rem'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        {language === 'mr' ? 'डिलिव्हरी पत्ता' : 'Delivery Address'}
                      </label>
                      <textarea 
                        name="address"
                        rows={3}
                        value={profileData.address}
                        onChange={handleProfileChange}
                        placeholder={language === 'mr' ? 'उदा. घर नं., गल्ली, परिसर...' : 'House/Flat No., Landmark, Area...'}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.9rem',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                          {language === 'mr' ? 'पिनकोड' : 'Pincode'}
                        </label>
                        <input 
                          type="text" 
                          name="pincode"
                          maxLength={6}
                          value={profileData.pincode}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.9rem',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.95rem'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                          {language === 'mr' ? 'राज्य' : 'State'}
                        </label>
                        <input 
                          type="text" 
                          name="state"
                          value={profileData.state}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.9rem',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.95rem'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.65rem 1.25rem', borderRadius: '10px' }}>
                        <Save size={16} />
                        <span>{language === 'mr' ? 'माहिती जतन करा' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Customer Account Actions (Logout Option Below Profile Form) */}
                  <div style={{
                    marginTop: '2.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    backgroundColor: '#fff5f5',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    border: '1px solid #ffe4e6'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.95rem' }}>
                        {language === 'mr' ? 'खात्यातून लॉग आऊट करा' : 'Customer Account Logout'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#b91c1c' }}>
                        {language === 'mr' 
                          ? 'या उपकरणावरून आपले ग्राहक खाते सुरक्षितपणे बंद करण्यासाठी येथे क्लिक करा.' 
                          : 'Sign out from this device safely.'}
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.6rem 1.2rem',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={16} />
                      <span>{language === 'mr' ? 'खाते लॉग आऊट करा' : 'Logout Account'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .account-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Account;
