import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Phone, 
  MapPin, 
  Award,
  CheckCircle2,
  Building
} from 'lucide-react';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';
import MissionLogoBadge from '../components/MissionLogoBadge';

const About = () => {
  const { language } = useLanguage();

  return (
    <div className="about-page">
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        color: '#ffffff',
        padding: '3.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <div className="section-badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fef3c7' }}>
            <ShieldCheck size={16} />
            <span>{language === 'mr' ? 'सहारा सोशल फाऊंडेशन' : 'Sahara Social Foundation'}</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            {language === 'mr' ? organizationInfo.about.titleMr : organizationInfo.about.titleEn}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#d1fae5', maxWidth: '700px', margin: '0 auto' }}>
            {language === 'mr' ? organizationInfo.about.subtitleMr : organizationInfo.about.subtitleEn}
          </p>
        </div>
      </div>

      {/* Main Content Section */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '3.5rem',
            alignItems: 'center',
            marginBottom: '4rem'
          }} className="about-details-grid">
            <div>
              <h2 style={{ fontSize: '2rem', color: '#064e3b', marginBottom: '1.25rem' }}>
                {language === 'mr' ? 'संस्थेची पार्श्वभूमी व कार्य' : 'Organization Overview & Purpose'}
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                {language === 'mr' ? organizationInfo.about.descriptionMr : organizationInfo.about.descriptionEn}
              </p>
              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                {language === 'mr'
                  ? 'आमच्या कोल्हापूर येथील कार्यालयातून (रॉयल प्रेस्टीज संकुल, शाहूपुरी) तसेच दूरध्वनी प्रणालीद्वारे दररोज शेकडो रुग्णांना त्यांच्या आजारानुसार पथ्य आणि योग्य आयुर्वेदिक उपायांचे मोफत समुपदेशन केले जाते.'
                  : 'From our central Kolhapur center (Royal Prestige, Shahupuri) and statewide telephone counseling support, we provide free diet guidance and herbal solutions to hundreds of families daily.'}
              </p>

              <div style={{
                backgroundColor: '#f0fdf4',
                borderLeft: '4px solid #059669',
                padding: '1.25rem',
                borderRadius: '8px',
                marginBottom: '1.75rem'
              }}>
                <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
                  {language === 'mr' ? 'सहयोगी संस्था व केंद्र:' : 'Collaborating Guidance Center:'}
                </div>
                <div style={{ fontSize: '0.95rem', color: '#1e293b' }}>
                  {language === 'mr' ? organizationInfo.associatedCenterMr : organizationInfo.associatedCenter}
                </div>
              </div>
            </div>

            <div>
              <div style={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                padding: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)'
              }}>
                <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
                  <MissionLogoBadge size={220} />
                </div>
                <div style={{ padding: '0.75rem 0 0', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#064e3b', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <MapPin size={18} style={{ color: '#059669' }} />
                    <span>{language === 'mr' ? 'शाहूपुरी, कोल्हापूर (महाराष्ट्र)' : 'Shahupuri, Kolhapur (Maharashtra)'}</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                    {language === 'mr' ? organizationInfo.contact.visitingNoteMr : organizationInfo.contact.visitingNote}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Vision Pillars */}
          <div className="grid-2" style={{ marginBottom: '4rem' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '2rem',
              border: '1px solid #e2e8f0',
              borderTop: '5px solid #059669',
              boxShadow: '0 8px 25px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Target size={26} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b' }}>
                  {language === 'mr' ? 'आमचे ध्येय (Mission)' : 'Our Mission'}
                </h3>
              </div>
              <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.7 }}>
                {language === 'mr' ? organizationInfo.about.missionMr : organizationInfo.about.missionEn}
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '2rem',
              border: '1px solid #e2e8f0',
              borderTop: '5px solid #d97706',
              boxShadow: '0 8px 25px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#fffbeb',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Eye size={26} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#78350f' }}>
                  {language === 'mr' ? 'आमची दूरदृष्टी (Vision)' : 'Our Vision'}
                </h3>
              </div>
              <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.7 }}>
                {language === 'mr' ? organizationInfo.about.visionMr : organizationInfo.about.visionEn}
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div>
            <div className="section-header">
              <div className="section-badge">
                <Heart size={16} />
                <span>{language === 'mr' ? 'मूल्ये आणि तत्त्वे' : 'Our Values'}</span>
              </div>
              <h2>
                {language === 'mr' ? 'आमची कार्यसंस्कृती आणि तत्त्वे' : 'Principles Guiding Our Work'}
              </h2>
            </div>

            <div className="grid-3">
              {organizationInfo.about.values.map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    padding: '1.75rem',
                    border: '1px solid #e2e8f0'
                  }}
                  className="card"
                >
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#064e3b', marginBottom: '0.6rem' }}>
                    {language === 'mr' ? val.titleMr : val.titleEn}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                    {language === 'mr' ? val.descMr : val.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          .about-details-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default About;
