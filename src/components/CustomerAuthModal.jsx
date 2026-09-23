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
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dbService } from '../services/db';

const CustomerAuthModal = () => {
  const { isCustomerAuthModalOpen, closeCustomerAuthModal, loginCustomer } = useAuth();
  const { language } = useLanguage();

  const [authMode, setAuthMode] = useState('mobile'); // 'mobile' or 'password'
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

    if (authMode === 'mobile') {
      if (!formData.fullName.trim()) {
        setError(language === 'mr' ? 'कृपया आपले पूर्ण नाव टाका' : 'Please enter your full name');
        return;
      }
      if (!formData.phone.trim()) {
        setError(language === 'mr' ? 'मोबाईल नंबर आवश्यक आहे' : 'Mobile number is required');
        return;
      }
      if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
        setError(language === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर टाका' : 'Please enter a valid 10-digit mobile number');
        return;
      }
    } else {
      if (!formData.email.trim() && !formData.phone.trim()) {
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
      // Find or create customer record in CRM dbService
      const customers = dbService.getAll('customers') || [];
      const existingCustomer = customers.find(c => 
        (formData.phone && c.mobileNumber === formData.phone.trim()) ||
        (formData.email && c.email?.toLowerCase() === formData.email.trim().toLowerCase())
      );

      let customerPayload;
      if (existingCustomer) {
        customerPayload = {
          id: existingCustomer.id,
          fullName: formData.fullName.trim() || existingCustomer.fullName,
          phone: formData.phone.trim() || existingCustomer.mobileNumber,
          email: formData.email.trim() || existingCustomer.email || '',
          address: formData.address.trim() || existingCustomer.address || '',
          city: formData.city.trim() || existingCustomer.city || '',
          state: existingCustomer.state || 'Maharashtra',
          pincode: existingCustomer.pincode || ''
        };
      } else {
        const newCustId = `CUST-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
        const created = dbService.add('customers', {
          customerId: newCustId,
          fullName: formData.fullName.trim() || 'ग्राहक (Customer)',
          mobileNumber: formData.phone.trim(),
          whatsappNumber: formData.phone.trim(),
          email: formData.email.trim() || '',
          address: formData.address.trim() || '',
          city: formData.city.trim() || '',
          state: 'Maharashtra',
          pincode: '',
          category: 'Ayurvedic Buyer',
          source: 'Website Direct Buy',
          status: 'Active',
          totalPurchases: 0
        });

        customerPayload = {
          id: created.id,
          fullName: created.fullName,
          phone: created.mobileNumber,
          email: created.email,
          address: created.address,
          city: created.city,
          state: created.state,
          pincode: created.pincode
        };
      }

      // Log in the customer and execute the pending direct buy action
      loginCustomer(customerPayload);
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
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #e2e8f0',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Top Accent Header */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
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
            <Sparkles size={16} style={{ color: '#fbbf24' }} />
            <span style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {language === 'mr' ? 'सुरक्षित ग्राहक खरेदी पोर्टल' : 'Secure Customer Checkout'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#ffffff' }}>
            {language === 'mr' ? 'खरेदीसाठी लॉगिन करा' : 'Customer Login to Buy'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#d1fae5', margin: 0, lineHeight: 1.4 }}>
            {language === 'mr' 
              ? 'उत्पादन खरेदी व मोफत आयुर्वेदिक मार्गदर्शनासाठी कृपया आपले नाव व मोबाईल नंबर प्रविष्ट करा.' 
              : 'Please enter your name & mobile number to proceed with buying the product.'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => { setAuthMode('mobile'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: 'none',
              backgroundColor: authMode === 'mobile' ? '#ffffff' : 'transparent',
              color: authMode === 'mobile' ? '#065f46' : '#64748b',
              fontWeight: authMode === 'mobile' ? 700 : 500,
              fontSize: '0.88rem',
              borderBottom: authMode === 'mobile' ? '2px solid #059669' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Phone size={15} />
            <span>{language === 'mr' ? 'मोबाईल नंबरने लॉगिन' : 'Quick Mobile Login'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('password'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: 'none',
              backgroundColor: authMode === 'password' ? '#ffffff' : 'transparent',
              color: authMode === 'password' ? '#065f46' : '#64748b',
              fontWeight: authMode === 'password' ? 700 : 500,
              fontSize: '0.88rem',
              borderBottom: authMode === 'password' ? '2px solid #059669' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Lock size={15} />
            <span>{language === 'mr' ? 'ईमेल / पासवर्ड' : 'Email & Password'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.84rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <span>{error}</span>
            </div>
          )}

          {authMode === 'mobile' ? (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  {language === 'mr' ? 'आपले पूर्ण नाव (Full Name) *' : 'Full Name *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    placeholder={language === 'mr' ? 'उदा. सचिन जाधव' : 'e.g. Ramesh Patil'}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  {language === 'mr' ? 'मोबाईल नंबर (Mobile Number) *' : 'Mobile Number (10 Digits) *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontWeight: 700, fontSize: '0.88rem' }}>+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="8421154090"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 3.2rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  {language === 'mr' ? 'डिलिव्हरी शहर / गाव (City / Village - ऐच्छिक)' : 'Delivery City / Town (Optional)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder={language === 'mr' ? 'उदा. कोल्हापूर / सांगली' : 'e.g. Kolhapur / Pune'}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  {language === 'mr' ? 'ईमेल किंवा मोबाईल नंबर *' : 'Email or Mobile Number *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
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
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  {language === 'mr' ? 'पासवर्ड *' : 'Password *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
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
                      border: '1px solid #cbd5e1',
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
              backgroundColor: '#065f46',
              borderColor: '#065f46',
              padding: '0.75rem',
              fontSize: '0.98rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 20px rgba(6, 95, 70, 0.25)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? (
              <span>{language === 'mr' ? 'लॉगिन करत आहे...' : 'Logging in...'}</span>
            ) : (
              <>
                <span>{language === 'mr' ? 'लॉगिन करा आणि खरेदी पुढे न्या' : 'Login & Proceed to Buy'}</span>
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
            color: '#64748b',
            fontSize: '0.78rem'
          }}>
            <ShieldCheck size={16} style={{ color: '#059669' }} />
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
