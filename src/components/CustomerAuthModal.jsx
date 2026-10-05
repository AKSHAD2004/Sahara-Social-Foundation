import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Phone, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dbService } from '../services/db';

const CustomerAuthModal = () => {
  const { isCustomerAuthModalOpen, closeCustomerAuthModal, loginCustomer } = useAuth();
  const { language } = useLanguage();

  // 'existing' (Login with Mobile), 'password' (Email/Password)
  const [authMode, setAuthMode] = useState('existing'); 
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    city: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCustomerAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = formData.phone.replace(/\D/g, '').trim();

    if (authMode === 'existing') {
      if (!cleanPhone || cleanPhone.length < 10) {
        setError(language === 'mr' ? 'कृपया १० अंकी वैध मोबाईल नंबर टाका.' : 'Please enter a valid 10-digit mobile number.');
        return;
      }
    } else {
      // password mode
      if (!formData.email.trim() && !cleanPhone) {
        setError(language === 'mr' ? 'ईमेल किंवा मोबाईल नंबर आवश्यक आहे' : 'Email or phone number is required');
        return;
      }
      if (!formData.password || formData.password.length < 4) {
        setError(language === 'mr' ? 'पासवर्ड किमान ४ अक्षरांचा असावा' : 'Password must be at least 4 characters');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const customers = dbService.getAll('customers') || [];
      const existingCustomer = customers.find(c => 
        (cleanPhone && (c.mobileNumber === cleanPhone || c.phone === cleanPhone || c.whatsappNumber === cleanPhone)) ||
        (formData.email && c.email?.toLowerCase() === formData.email.trim().toLowerCase())
      );

      let customerPayload;

      if (authMode === 'existing') {
        if (existingCustomer) {
          customerPayload = {
            id: existingCustomer.id,
            fullName: existingCustomer.fullName || existingCustomer.name || 'ग्राहक (Customer)',
            phone: cleanPhone,
            email: existingCustomer.email || '',
            address: existingCustomer.address || '',
            city: existingCustomer.city || 'कोल्हापूर',
            state: existingCustomer.state || 'Maharashtra',
            pincode: existingCustomer.pincode || ''
          };
        } else {
          // Check previous orders
          const allOrders = dbService.getAll('orders') || [];
          const pastOrder = allOrders.find(o => o.customerPhone === cleanPhone || o.phone === cleanPhone);

          if (pastOrder) {
            customerPayload = {
              id: pastOrder.customerId || `CUST-${Date.now()}`,
              fullName: pastOrder.customerName || 'ग्राहक (Customer)',
              phone: cleanPhone,
              email: pastOrder.customerEmail || '',
              address: pastOrder.shippingAddress || '',
              city: pastOrder.city || 'कोल्हापूर',
              state: pastOrder.state || 'Maharashtra',
              pincode: pastOrder.pincode || ''
            };
          } else {
            // Not found in existing records, direct login with phone
            customerPayload = {
              id: `CUST-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
              fullName: 'ग्राहक (Customer)',
              phone: cleanPhone,
              email: '',
              address: '',
              city: 'कोल्हापूर',
              state: 'Maharashtra',
              pincode: ''
            };
          }
        }
      } else {
        // Password mode
        customerPayload = {
          id: existingCustomer?.id || `CUST-${Date.now()}`,
          fullName: existingCustomer?.fullName || formData.email.split('@')[0] || 'ग्राहक (Customer)',
          phone: cleanPhone || existingCustomer?.mobileNumber || '',
          email: formData.email.trim() || '',
          address: existingCustomer?.address || '',
          city: existingCustomer?.city || 'कोल्हापूर',
          state: existingCustomer?.state || 'Maharashtra',
          pincode: existingCustomer?.pincode || ''
        };
      }

      // Log in the customer and synchronize profile with Cloud Firestore
      loginCustomer(customerPayload);
      dbService.saveCustomerProfile(customerPayload);
    } catch (err) {
      console.error(err);
      setError(language === 'mr' ? 'लॉगिन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(4, 32, 14, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCustomerAuthModal();
      }}
    >
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '490px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 107, 45, 0.25)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #E1E9DF',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Top Accent Header */}
        <div style={{
          background: 'linear-gradient(135deg, #006B2D 0%, #04200e 100%)',
          color: '#ffffff',
          padding: '1.5rem 1.5rem 1.25rem 1.5rem',
          position: 'relative'
        }}>
          <button
            onClick={closeCustomerAuthModal}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
            <Sparkles size={16} style={{ color: '#FFC928' }} />
            <span style={{ fontSize: '0.78rem', color: '#d6fae0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {language === 'mr' ? 'सुरक्षित ग्राहक खरेदी पोर्टल' : 'Secure Customer Checkout'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#ffffff' }}>
            {authMode === 'password'
              ? (language === 'mr' ? 'पासवर्डने लॉगिन करा' : 'Sign In with Password')
              : (language === 'mr' ? 'मोबाईल नंबरने लॉगिन करा' : 'Sign In with Mobile')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#d6fae0', margin: 0, lineHeight: 1.4 }}>
            {authMode === 'password'
              ? (language === 'mr' ? 'आपला ईमेल किंवा मोबाईल आणि पासवर्ड प्रविष्ट करा.' : 'Enter your registered email/phone and password.')
              : (language === 'mr' ? 'आपला १० अंकी मोबाईल नंबर टाका आणि खरेदी पुढे न्या.' : 'Enter your 10-digit mobile number to proceed.')}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs (Mobile vs Password) */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E1E9DF', backgroundColor: '#F3F8F1', padding: '0.35rem', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => { setAuthMode('existing'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.65rem 0.5rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: authMode === 'existing' ? '#ffffff' : 'transparent',
              color: authMode === 'existing' ? '#006B2D' : '#5F6B61',
              fontWeight: authMode === 'existing' ? 700 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: authMode === 'existing' ? '0 2px 5px rgba(0,107,45,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={15} />
            <span>{language === 'mr' ? 'मोबाईल नंबर लॉगिन' : 'Mobile Number'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('password'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.65rem 0.5rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: authMode === 'password' ? '#ffffff' : 'transparent',
              color: authMode === 'password' ? '#006B2D' : '#5F6B61',
              fontWeight: authMode === 'password' ? 700 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: authMode === 'password' ? '0 2px 5px rgba(0,107,45,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Lock size={15} />
            <span>{language === 'mr' ? 'पासवर्ड लॉगिन' : 'Password Login'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              borderRadius: '10px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.84rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.4rem'
            }}>
              <span>{error}</span>
            </div>
          )}

          {/* Mode 1: Existing Customer Login (Just Mobile) */}
          {authMode === 'existing' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'नोंदणीकृत १० अंकी मोबाईल नंबर (Registered Mobile) *' : 'Registered 10-Digit Mobile Number *'}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#006B2D', fontWeight: 700, fontSize: '0.88rem' }}>+91</span>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  placeholder="8421154090"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.75rem 0.7rem 3.2rem',
                    borderRadius: '10px',
                    border: '1.5px solid #E1E9DF',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    boxSizing: 'border-box',
                    letterSpacing: '1px'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.78rem', color: '#5F6B61', marginTop: '0.35rem' }}>
                {language === 'mr' ? 'मोबाईल नंबर टाकून थेट खात्यात प्रवेश करा' : 'Login instantly with your registered mobile number'}
              </div>
            </div>
          )}

          {/* Mode 2: Password Login */}
          {authMode === 'password' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
                  {language === 'mr' ? 'ईमेल किंवा मोबाईल नंबर *' : 'Email or Mobile Number *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5F6B61' }} />
                  <input
                    type="text"
                    required
                    placeholder="user@example.com / 98XXXXXXXX"
                    value={formData.email || formData.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/@/.test(val)) {
                        setFormData({ ...formData, email: val });
                      } else {
                        setFormData({ ...formData, phone: val });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E1E9DF',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
                  {language === 'mr' ? 'पासवर्ड *' : 'Password *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5F6B61' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E1E9DF',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              backgroundColor: '#006B2D',
              borderColor: '#006B2D',
              padding: '0.75rem',
              fontSize: '0.98rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(0, 107, 45, 0.25)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? (
              <span>{language === 'mr' ? 'लॉगिन करत आहे...' : 'Logging in...'}</span>
            ) : (
              <>
                <span>
                  {language === 'mr' ? 'लॉगिन करा व खरेदी पुढे न्या' : 'Sign In & Buy Now'}
                </span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Trust Footer Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            marginTop: '1.25rem',
            color: '#5F6B61',
            fontSize: '0.78rem'
          }}>
            <ShieldCheck size={16} style={{ color: '#006B2D' }} />
            <span>
              {language === 'mr'
                ? 'नोंदणीकृत संस्था (MAH/582/2014/KOP) • आपली माहिती १००% सुरक्षित आहे'
                : 'Reg. No. MAH/582/2014/KOP • 100% Secure & Confidential'}
            </span>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CustomerAuthModal;
