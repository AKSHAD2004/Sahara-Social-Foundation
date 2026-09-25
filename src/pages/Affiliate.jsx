import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  Share2, 
  TrendingUp, 
  CheckCircle2, 
  Phone, 
  DollarSign,
  ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { organizationInfo } from '../data/websiteData';
import { dbService } from '../services/db';

const Affiliate = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('register'); // 'register', 'dashboard'

  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    occupation: '',
    experience: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (regData.name && regData.phone) {
      const code = `SAHARA-${regData.name.split(' ')[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      setGeneratedCode(code);

      dbService.add('users', {
        name: regData.name,
        phone: regData.phone,
        email: regData.email || `${regData.phone}@saharaaffiliate.com`,
        role: 'affiliate',
        referralCode: code,
        city: regData.city || 'Kolhapur',
        state: 'Maharashtra',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
      });

      dbService.addNotification({
        title: 'New Affiliate Registered',
        message: `${regData.name} registered as Ambassador (Code: ${code}).`,
        type: 'affiliate',
        link: '/crm/affiliates'
      });

      setSubmitted(true);
    }
  };

  return (
    <div className="affiliate-page">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #12355B 0%, #087E8B 100%)',
        color: '#ffffff',
        padding: '3.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <div className="section-badge" style={{ backgroundColor: 'rgba(244,162,97,0.2)', color: '#F4A261', border: '1px solid rgba(244,162,97,0.4)' }}>
            <Users size={16} />
            <span>{language === 'mr' ? 'समाज सेवक / आरोग्य दूत' : 'Social Ambassador Program'}</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
            {language === 'mr' ? 'सहारा सोशल फाऊंडेशन आरोग्य दूत नोंदणी' : 'Sahara Health Ambassador & Affiliate'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#e2effc', maxWidth: '700px', margin: '0 auto' }}>
            {language === 'mr'
              ? 'मधुमेह मुक्त भारत आणि व्यसनमुक्त भारत अभियानात सहभागी होऊन आपल्या भागातील रुग्णांना मदत करा.'
              : 'Join the nationwide health campaign to refer patients and spread health awareness.'}
          </p>
        </div>
      </div>

      <section className="section" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          {/* Navigation Switch */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2.5rem'
          }}>
            <button
              onClick={() => setActiveTab('register')}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: '1.5px solid',
                borderColor: activeTab === 'register' ? '#087E8B' : '#e2eaf4',
                backgroundColor: activeTab === 'register' ? '#087E8B' : '#ffffff',
                color: activeTab === 'register' ? '#ffffff' : '#172033',
                cursor: 'pointer',
                boxShadow: activeTab === 'register' ? '0 4px 12px rgba(8, 126, 139, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {language === 'mr' ? 'नवीन समाज सेवक नोंदणी' : 'Ambassador Registration'}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: '1.5px solid',
                borderColor: activeTab === 'dashboard' ? '#087E8B' : '#e2eaf4',
                backgroundColor: activeTab === 'dashboard' ? '#087E8B' : '#ffffff',
                color: activeTab === 'dashboard' ? '#ffffff' : '#172033',
                cursor: 'pointer',
                boxShadow: activeTab === 'dashboard' ? '0 4px 12px rgba(8, 126, 139, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {language === 'mr' ? 'डॅशबोर्ड पूर्वदृश्य (Demo)' : 'Dashboard Preview'}
            </button>
          </div>

          {activeTab === 'register' ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2.5rem',
              border: '1px solid #e2eaf4',
              boxShadow: '0 8px 30px rgba(18,53,91,0.04)'
            }}>
              {!submitted ? (
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#12355B', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    {language === 'mr' ? 'आरोग्यदूत / समाज सेवक नोंदणी अर्ज' : 'Partner Registration Form'}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#4f6182', marginBottom: '1.75rem' }}>
                    {language === 'mr'
                      ? 'आपल्या गावातील किंवा परिसरातील गरजू रुग्णांना मधुमेह व व्यसनमुक्तीचे मार्गदर्शन देण्यासाठी नोंदणी करा.'
                      : 'Become an authorized social coordinator in your local region.'}
                  </p>

                  <form onSubmit={handleRegister}>
                    <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{language === 'mr' ? 'पूर्ण नाव *' : 'Full Name *'}</label>
                        <input
                          type="text"
                          className="form-input"
                          required
                          value={regData.name}
                          onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{language === 'mr' ? 'मोबाईल नंबर *' : 'Mobile *'}</label>
                        <input
                          type="tel"
                          className="form-input"
                          required
                          maxLength={10}
                          value={regData.phone}
                          onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{language === 'mr' ? 'गाव / तालुका / शहर' : 'City / Town'}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={regData.city}
                          onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{language === 'mr' ? 'व्यवसाय' : 'Occupation'}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={regData.occupation}
                          onChange={(e) => setRegData({ ...regData, occupation: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">{language === 'mr' ? 'सामाजिक किंवा आरोग्य क्षेत्रातील अनुभव' : 'Experience in Social/Health Work'}</label>
                      <textarea
                        rows={3}
                        className="form-textarea"
                        placeholder={language === 'mr' ? 'उदा. सामाजिक कार्यात ५ वर्षे कार्यरत...' : 'Brief description...'}
                        value={regData.experience}
                        onChange={(e) => setRegData({ ...regData, experience: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                      <span>{language === 'mr' ? 'नोंदणी पूर्ण करा' : 'Complete Registration'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#dbf7fa',
                    color: '#087E8B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#12355B', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    {language === 'mr' ? 'नोंदणी अर्ज यशस्वीरित्या प्राप्त झाला!' : 'Registration Completed!'}
                  </h3>
                  <p style={{ color: '#4f6182', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {language === 'mr'
                      ? 'सहारा सोशल फाऊंडेशनची टीम आपल्याशी संपर्क करून मार्गदर्शक पुस्तिका आणि संदर्भ कोड (Referral ID) देईल.'
                      : 'Our foundation team will contact you with promotional materials and your unique Ambassador ID.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 30px rgba(18,53,91,0.04)'
            }}>
              <h3 style={{ fontSize: '1.35rem', color: '#12355B', fontWeight: 800, marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                {language === 'mr' ? 'आरोग्यदूत डॅशबोर्ड (Ambassador Dashboard)' : 'Ambassador Portal'}
              </h3>

              <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#dbf7fa', padding: '1.25rem', borderRadius: '14px', border: '1px solid #abedf5' }}>
                  <div style={{ fontSize: '0.8rem', color: '#087E8B', fontWeight: 600 }}>
                    {language === 'mr' ? 'एकूण संदर्भित रुग्ण' : 'Referred Patients'}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12355B' }}>
                    18
                  </div>
                </div>

                <div style={{ backgroundColor: '#e2effc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #b8d4f6' }}>
                  <div style={{ fontSize: '0.8rem', color: '#12355B', fontWeight: 600 }}>
                    {language === 'mr' ? 'यशस्वी मार्गदर्शन' : 'Counseling Completed'}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12355B' }}>
                    14
                  </div>
                </div>

                <div style={{ backgroundColor: '#fff3ec', padding: '1.25rem', borderRadius: '14px', border: '1px solid #ffd4b8' }}>
                  <div style={{ fontSize: '0.8rem', color: '#7c2d12', fontWeight: 600 }}>
                    {language === 'mr' ? 'सक्रिय अभियान' : 'Active Campaign'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#7c2d12', marginTop: '0.5rem' }}>
                    मधुमेह मुक्त भारत
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#F5F7FA',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                border: '1px solid #e2eaf4',
                fontSize: '0.9rem',
                color: '#4f6182'
              }}>
                <strong style={{ color: '#12355B' }}>{language === 'mr' ? 'आपली विशेष संदर्भ लिंक:' : 'Your Referral Link:'}</strong><br />
                <code style={{ color: '#087E8B', fontSize: '0.88rem', fontWeight: 700 }}>
                  https://samarthkolhapur.com/?ref=SSF-AMB-8421
                </code>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Affiliate;
