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
  Edit,
  Save,
  AlertCircle,
  LogIn,
  UserPlus,
  Package,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { organizationInfo, productsData } from '../data/websiteData';
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

  // Products catalog & edit management
  const [products, setProducts] = useState(() => {
    const fromDb = dbService.getAll('products');
    return (Array.isArray(fromDb) && fromDb.length > 0) ? fromDb : productsData;
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '',
    sku: '',
    category: 'Diabetes',
    price: 2800,
    mrp: 3500,
    stock: 100,
    description: '',
    image: ''
  });
  const [productUpdateMsg, setProductUpdateMsg] = useState('');

  useEffect(() => {
    const unsub = dbService.subscribe('products', (prods) => {
      if (Array.isArray(prods) && prods.length > 0) {
        setProducts(prods);
      }
    });
    return unsub;
  }, []);

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductFormData({
      name: prod.name || prod.nameEn || '',
      sku: prod.sku || '',
      category: prod.category || 'Diabetes',
      price: prod.price || prod.sellingPrice || 0,
      mrp: prod.mrp || prod.originalPrice || 0,
      stock: prod.stock !== undefined ? prod.stock : 100,
      description: prod.description || prod.shortDescEn || '',
      image: prod.image || ''
    });
    setShowEditProductModal(true);
  };

  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct || !productFormData.name) return;

    await dbService.update('products', editingProduct.id, {
      ...editingProduct,
      name: productFormData.name,
      nameEn: productFormData.name,
      sku: productFormData.sku,
      category: productFormData.category,
      price: Number(productFormData.price),
      sellingPrice: Number(productFormData.price),
      mrp: Number(productFormData.mrp),
      stock: Number(productFormData.stock),
      description: productFormData.description,
      image: productFormData.image
    });

    setProductUpdateMsg(language === 'mr' ? 'उत्पादन माहिती यशस्वीरीत्या जतन केली!' : 'Product updated successfully!');
    setShowEditProductModal(false);
    setTimeout(() => setProductUpdateMsg(''), 4000);
  };

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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!customerUser) return;

    const cleanPhone = (profileData.phone || customerUser.phone || '').replace(/\D/g, '').trim();

    const updatedUser = {
      ...customerUser,
      ...profileData,
      phone: cleanPhone,
      mobileNumber: cleanPhone,
      whatsappNumber: profileData.whatsappNumber || cleanPhone,
      updatedAt: new Date().toISOString()
    };

    // Update in local auth context
    loginCustomer(updatedUser);

    // Save and store profile in Firebase Cloud Firestore
    try {
      await dbService.saveCustomerProfile(updatedUser);
    } catch (err) {
      console.warn('Error saving profile to Firebase:', err);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Existing Customer Login
  const handleExistingCustomerLogin = async (e) => {
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
        mobileNumber: cleanMobile,
        whatsappNumber: foundCustomer.whatsappNumber || cleanMobile,
        email: foundCustomer.email || '',
        address: foundCustomer.address || '',
        city: foundCustomer.city || 'कोल्हापूर',
        state: foundCustomer.state || 'Maharashtra',
        pincode: foundCustomer.pincode || ''
      };
      loginCustomer(userPayload);
      await dbService.saveCustomerProfile(userPayload);
    } else {
      // Check if user has past orders with this phone
      const allOrders = dbService.getAll('orders') || [];
      const pastOrder = allOrders.find(o => o.customerPhone === cleanMobile || o.phone === cleanMobile);

      if (pastOrder) {
        const userPayload = {
          id: pastOrder.customerId || `CUST-${cleanMobile}`,
          fullName: pastOrder.customerName || 'ग्राहक (Customer)',
          phone: cleanMobile,
          mobileNumber: cleanMobile,
          whatsappNumber: cleanMobile,
          email: pastOrder.customerEmail || '',
          address: pastOrder.shippingAddress || '',
          city: pastOrder.city || 'कोल्हापूर',
          state: pastOrder.state || 'Maharashtra',
          pincode: pastOrder.pincode || '',
          source: 'Website Buyer'
        };
        loginCustomer(userPayload);
        await dbService.saveCustomerProfile(userPayload);
      } else {
        // Direct seamless login with mobile number - create new customer profile & store on Firebase!
        const userPayload = {
          id: `CUST-${cleanMobile}`,
          customerId: `CUST-${cleanMobile}`,
          fullName: 'ग्राहक (Customer)',
          phone: cleanMobile,
          mobileNumber: cleanMobile,
          whatsappNumber: cleanMobile,
          email: '',
          address: '',
          city: 'कोल्हापूर',
          state: 'Maharashtra',
          pincode: '',
          source: 'Website Mobile Direct'
        };
        loginCustomer(userPayload);
        await dbService.saveCustomerProfile(userPayload);
      }
    }
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
    <div className="account-page" style={{ backgroundColor: '#F3F8F1', padding: '3.5rem 0 5.5rem 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: '#006B2D', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? 'माझे खाते (Customer Account)' : 'Customer Account'}
            </h1>
            <p style={{ color: '#5F6B61', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
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
            border: '1px solid #E1E9DF',
            boxShadow: '0 10px 25px -5px rgba(0, 107, 45, 0.06), 0 8px 10px -6px rgba(0, 107, 45, 0.02)',
            maxWidth: '520px',
            margin: '0 auto'
          }}>
            {/* Top Icon & Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#e2faea',
                color: '#006B2D',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '2px solid #b8eec8'
              }}>
                <User size={32} />
              </div>
              <h2 style={{ fontSize: '1.45rem', color: '#006B2D', fontWeight: 800, marginBottom: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                {language === 'mr' ? 'खात्यात लॉगिन करा' : 'Customer Account Login'}
              </h2>
              <p style={{ color: '#5F6B61', fontSize: '0.88rem', margin: 0 }}>
                {language === 'mr' 
                  ? 'आपला १० अंकी मोबाईल नंबर टाकून आपल्या ऑर्डर्स व माहिती पहा' 
                  : 'Enter your 10-digit mobile number to access your orders and profile'}
              </p>
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

            {/* Form: Customer Login (Mobile Number only) */}
            <form onSubmit={handleExistingCustomerLogin}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.4rem' }}>
                  {language === 'mr' ? '१० अंकी मोबाईल नंबर (Mobile Number) *' : '10-Digit Mobile Number *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#006B2D',
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
                      border: '1.5px solid #E1E9DF',
                      fontSize: '1rem',
                      outline: 'none',
                      letterSpacing: '1px',
                      fontWeight: 600,
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#5F6B61', marginTop: '0.35rem' }}>
                  {language === 'mr' 
                    ? 'आपल्या ऑर्डरमध्ये दिलेला मोबाईल नंबर येथे प्रविष्ट करा.' 
                    : 'Enter the mobile number used during your purchase to view orders.'}
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
                  boxShadow: '0 4px 14px rgba(0, 107, 45, 0.25)'
                }}
              >
                <LogIn size={18} />
                <span>{language === 'mr' ? 'लॉगिन करा (Sign In)' : 'Sign In with Mobile'}</span>
              </button>
            </form>

            {/* Security note */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginTop: '1.5rem',
              color: '#5F6B61',
              fontSize: '0.78rem'
            }}>
              <ShieldCheck size={15} style={{ color: '#006B2D' }} />
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
              border: '1px solid #E1E9DF',
              boxShadow: '0 4px 15px rgba(0,107,45,0.04)'
            }}>
              {/* Profile Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.5rem 1.25rem 0.5rem', borderBottom: '1px solid #E1E9DF', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#e2faea',
                  color: '#006B2D',
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
                  <div style={{ fontWeight: 700, color: '#006B2D', fontSize: '0.98rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-heading)' }}>
                    {customerUser.fullName || (language === 'mr' ? 'आरोग्य लाभार्थी' : 'Health Beneficiary')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#5F6B61' }}>
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
                    backgroundColor: activeTab === 'orders' ? '#e2faea' : 'transparent',
                    color: activeTab === 'orders' ? '#006B2D' : '#17251B',
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
                    backgroundColor: activeTab === 'profile' ? '#e2faea' : 'transparent',
                    color: activeTab === 'profile' ? '#006B2D' : '#17251B',
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

                <button
                  onClick={() => setActiveTab('products')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: activeTab === 'products' ? '#e2faea' : 'transparent',
                    color: activeTab === 'products' ? '#006B2D' : '#17251B',
                    fontWeight: activeTab === 'products' ? 700 : 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Package size={18} />
                  <span>{language === 'mr' ? 'उत्पादने (Products)' : 'Products Catalog'}</span>
                </button>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: '#E1E9DF', margin: '0.6rem 0' }} />

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
              border: '1px solid #E1E9DF',
              boxShadow: '0 4px 15px rgba(0,107,45,0.04)'
            }}>
              {/* Tab 1: Orders */}
              {activeTab === 'orders' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.3rem', color: '#006B2D', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                      {language === 'mr' ? 'मागील ऑर्डर्स व ट्रॅकिंग' : 'Order History & Status'}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#5F6B61', fontWeight: 600 }}>
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
                          border: '1px solid #E1E9DF',
                          borderRadius: '14px',
                          padding: '1.25rem',
                          marginBottom: '1rem',
                          backgroundColor: '#F3F8F1'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: '#006B2D', fontSize: '1rem' }}>{orderId}</span>
                            <span style={{ color: '#5F6B61', fontSize: '0.82rem', marginLeft: '0.75rem' }}>{orderDate}</span>
                          </div>
                          <span style={{
                            backgroundColor: orderStatus.toLowerCase().includes('deliver') ? '#e2faea' : '#fff9e6',
                            color: orderStatus.toLowerCase().includes('deliver') ? '#006B2D' : '#785300',
                            border: '1px solid',
                            borderColor: orderStatus.toLowerCase().includes('deliver') ? '#b8eec8' : '#ffe899',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px'
                          }}>
                            {language === 'mr' && ord.statusMr ? ord.statusMr : orderStatus}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#17251B', marginBottom: '0.35rem' }}>
                          {itemsName}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #E1E9DF' }}>
                          <span style={{ fontSize: '0.85rem', color: '#159B32', fontWeight: 600 }}>
                            {ord.counselingStatus || (language === 'mr' ? 'तज्ज्ञ मार्गदर्शन सक्रिय (८४२११५४०९०)' : 'Free Expert Guidance (8421154090)')}
                          </span>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#006B2D' }}>
                            ₹{amount}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{
                    backgroundColor: '#fff9e6',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid #FFC928',
                    marginTop: '1.5rem',
                    fontSize: '0.88rem',
                    color: '#785300'
                  }}>
                    <strong style={{ color: '#006B2D' }}>{language === 'mr' ? 'टीप:' : 'Note:'}</strong>{' '}
                    <span style={{ color: '#17251B' }}>
                      {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: Profile & Details */}
              {activeTab === 'profile' && (
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#006B2D', fontWeight: 800, marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                    {language === 'mr' ? 'वैयक्तिक माहिती व पत्ता' : 'Personal Profile & Address'}
                  </h3>

                  {saveSuccess && (
                    <div style={{
                      backgroundColor: '#e2faea',
                      color: '#006B2D',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #b8eec8',
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
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
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
                            border: '1px solid #E1E9DF',
                            fontSize: '0.95rem'
                          }}
                          required 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
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
                            border: '1px solid #E1E9DF',
                            fontSize: '0.95rem'
                          }}
                          required 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
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
                            border: '1px solid #E1E9DF',
                            fontSize: '0.95rem'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
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
                            border: '1px solid #E1E9DF',
                            fontSize: '0.95rem'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
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
                          border: '1px solid #E1E9DF',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
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
                            border: '1px solid #E1E9DF',
                            fontSize: '0.95rem'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
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
                            border: '1px solid #E1E9DF',
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
                    borderTop: '1px solid #E1E9DF',
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

              {/* Tab 3: Products Management */}
              {activeTab === 'products' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', color: '#006B2D', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                        {language === 'mr' ? 'उपलब्ध उत्पादने व संपादन' : 'Products & Catalog Management'}
                      </h3>
                      <p style={{ color: '#5F6B61', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                        {language === 'mr' 
                          ? 'येथून उत्पादनांचे नाव, विक्री किंमत (Price), MRP, स्टॉक व माहिती थेट संपादित करा.'
                          : 'Edit product name, selling price, MRP, stock count and details in realtime.'}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#006B2D', fontWeight: 700, backgroundColor: '#e2faea', padding: '0.3rem 0.75rem', borderRadius: '8px' }}>
                      {products.length} {language === 'mr' ? 'सक्रिय उत्पादने' : 'Active Products'}
                    </span>
                  </div>

                  {productUpdateMsg && (
                    <div style={{
                      backgroundColor: '#e2faea',
                      color: '#006B2D',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #b8eec8',
                      marginBottom: '1.25rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <CheckCircle2 size={18} />
                      <span>{productUpdateMsg}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {products.map((prod) => {
                      const effectivePrice = prod.price || prod.sellingPrice || 0;
                      const effectiveMrp = prod.mrp || prod.originalPrice || 0;
                      return (
                        <div
                          key={prod.id}
                          style={{
                            border: '1.5px solid #E1E9DF',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 2px 8px rgba(0,107,45,0.04)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px', flex: '1 1 auto' }}>
                            <img
                              src={prod.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'}
                              alt={prod.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';
                              }}
                              style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '12px',
                                objectFit: 'contain',
                                border: '1px solid #E1E9DF',
                                backgroundColor: '#F3F8F1',
                                padding: '4px',
                                flexShrink: 0
                              }}
                            />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                <strong style={{ color: '#006B2D', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>
                                  {prod.name}
                                </strong>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', color: '#5F6B61' }}>
                                <span style={{ fontWeight: 700, color: '#159B32' }}>{prod.sku}</span>
                                <span>•</span>
                                <span style={{ backgroundColor: '#F3F8F1', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600, color: '#17251B' }}>
                                  {prod.category}
                                </span>
                                <span>•</span>
                                <span style={{ color: prod.stock <= 0 ? '#ef4444' : '#159B32', fontWeight: 700 }}>
                                  {prod.stock !== undefined ? prod.stock : 100} {language === 'mr' ? 'नग शिल्लक' : 'units in stock'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#006B2D' }}>
                                ₹{effectivePrice}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(prod)}
                              className="btn btn-primary btn-sm"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.55rem 1rem',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit size={15} />
                              <span>{language === 'mr' ? 'बदल करा (Edit)' : 'Edit Product'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Edit Modal for Customer Dashboard */}
        {showEditProductModal && editingProduct && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(4, 32, 14, 0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowEditProductModal(false);
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                maxWidth: '560px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 107, 45, 0.35)',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid #E1E9DF',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #006B2D 0%, #04200e 100%)',
                color: '#ffffff',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                    {language === 'mr' ? 'उत्पादन संपादन करा (Edit Product)' : 'Edit Product Details'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#d6fae0', marginTop: '0.2rem' }}>
                    SKU: {productFormData.sku} • {productFormData.category}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditProductModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSaveProductEdit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
                    {language === 'mr' ? 'उत्पादनाचे नाव (Product Name) *' : 'Product Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E1E9DF',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
                      {language === 'mr' ? 'विक्री किंमत (Selling Price ₹) *' : 'Selling Price (₹) *'}
                    </label>
                    <input
                      type="number"
                      required
                      value={productFormData.price}
                      onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '10px',
                        border: '1.5px solid #E1E9DF',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
                      {language === 'mr' ? 'छापील किंमत (MRP ₹)' : 'MRP (₹)'}
                    </label>
                    <input
                      type="number"
                      value={productFormData.mrp}
                      onChange={(e) => setProductFormData({ ...productFormData, mrp: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '10px',
                        border: '1.5px solid #E1E9DF',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
                      {language === 'mr' ? 'शिल्लक नग (Stock Count)' : 'Stock Units'}
                    </label>
                    <input
                      type="number"
                      value={productFormData.stock}
                      onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '10px',
                        border: '1.5px solid #E1E9DF',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
                      {language === 'mr' ? 'कॅटेगरी (Category)' : 'Category'}
                    </label>
                    <select
                      value={productFormData.category}
                      onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '10px',
                        border: '1.5px solid #E1E9DF',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="Diabetes">Diabetes</option>
                      <option value="Heart Liver Kidney">Heart Liver Kidney</option>
                      <option value="Addiction">Addiction</option>
                      <option value="Bones">Bones</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
                    {language === 'mr' ? 'फोटो लिंक (Image URL)' : 'Product Image URL'}
                  </label>
                  <input
                    type="text"
                    value={productFormData.image}
                    onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E1E9DF',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
                    {language === 'mr' ? 'वर्णन व माहिती (Description)' : 'Description & Details'}
                  </label>
                  <textarea
                    rows={3}
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E1E9DF',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #E1E9DF' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditProductModal(false)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.65rem 1.25rem', borderRadius: '10px' }}
                  >
                    {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 700 }}
                  >
                    <Save size={15} />
                    <span>{language === 'mr' ? 'जतन करा (Save Changes)' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
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
