import React, { useState } from 'react';
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
  ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { organizationInfo } from '../data/websiteData';

const Account = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'profile', 'login'
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Mock demo orders for UI representation
  const userOrders = [
    {
      id: 'SSF-842101',
      date: '10 Aug 2026',
      productNameMr: 'Antox D आणि Antox T (मधुमेह नियंत्रण किट)',
      productNameEn: 'Antox D & Antox T Kit',
      total: 1499,
      statusMr: 'डिलिव्हर झाले (Delivered)',
      statusEn: 'Delivered',
      counselingStatus: 'Counseling Complete (8421154090)'
    }
  ];

  return (
    <div className="account-page" style={{ backgroundColor: '#f8fafc', padding: '3.5rem 0 5.5rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#064e3b', fontWeight: 800, marginBottom: '2rem' }}>
          {language === 'mr' ? 'माझे खाते (My Account)' : 'My Account Dashboard'}
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '2rem',
          alignItems: 'flex-start'
        }} className="account-layout-grid">
          {/* Left Sidebar Tabs */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.5rem 1.25rem 0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.75rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#064e3b', fontSize: '0.98rem' }}>
                  {language === 'mr' ? 'आरोग्य लाभार्थी' : 'Health Beneficiary'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Sahara Social Member
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activeTab === 'orders' ? '#ecfdf5' : 'transparent',
                  color: activeTab === 'orders' ? '#065f46' : '#475569',
                  fontWeight: activeTab === 'orders' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <ShoppingBag size={17} />
                <span>{language === 'mr' ? 'माझ्या ऑर्डर्स' : 'My Orders'}</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activeTab === 'profile' ? '#ecfdf5' : 'transparent',
                  color: activeTab === 'profile' ? '#065f46' : '#475569',
                  fontWeight: activeTab === 'profile' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <User size={17} />
                <span>{language === 'mr' ? 'माझी प्रोफाइल' : 'Profile & Address'}</span>
              </button>
            </div>
          </div>

          {/* Right Main Panel */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            {activeTab === 'orders' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.25rem' }}>
                  {language === 'mr' ? 'मागील ऑर्डर्स व ट्रॅकिंग' : 'Order History & Guidance'}
                </h3>

                {userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      marginBottom: '1rem',
                      backgroundColor: '#f8fafc'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: '#064e3b', fontSize: '1rem' }}>{ord.id}</span>
                        <span style={{ color: '#64748b', fontSize: '0.82rem', marginLeft: '0.75rem' }}>{ord.date}</span>
                      </div>
                      <span style={{
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px'
                      }}>
                        {language === 'mr' ? ord.statusMr : ord.statusEn}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                      {language === 'mr' ? ord.productNameMr : ord.productNameEn}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
                      <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                        {ord.counselingStatus}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064e3b' }}>
                        ₹{ord.total}
                      </span>
                    </div>
                  </div>
                ))}

                <div style={{
                  backgroundColor: '#fffbeb',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid #fde68a',
                  marginTop: '1.5rem',
                  fontSize: '0.88rem',
                  color: '#92400e'
                }}>
                  <strong>{language === 'mr' ? 'टीप:' : 'Note:'}</strong>{' '}
                  {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.25rem' }}>
                  {language === 'mr' ? 'वैयक्तिक माहिती' : 'Personal Details'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">{language === 'mr' ? 'नाव' : 'Full Name'}</label>
                    <input type="text" className="form-input" defaultValue="बाबासाहेब जाधव" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{language === 'mr' ? 'मोबाईल' : 'Mobile'}</label>
                    <input type="text" className="form-input" defaultValue="98XXXXXXXX" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{language === 'mr' ? 'पत्ता' : 'Address'}</label>
                  <input type="text" className="form-input" defaultValue="शाहूपुरी, कोल्हापूर, महाराष्ट्र - ४१६००१" />
                </div>

                <button className="btn btn-primary btn-sm">
                  <span>{language === 'mr' ? 'माहिती जतन करा' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
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
