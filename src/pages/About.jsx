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
        background: 'linear-gradient(135deg, #12355B 0%, #087E8B 100%)',
        color: '#ffffff',
        padding: '3rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <div className="section-badge" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
            <ShieldCheck size={15} />
            <span>{language === 'mr' ? 'सहारा सोशल फाऊंडेशन' : 'Sahara Social Foundation'}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#ffffff', marginBottom: '0.65rem' }}>
            {language === 'mr' ? organizationInfo.about.titleMr : organizationInfo.about.titleEn}
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#dbf7fa', maxWidth: '700px', margin: '0 auto' }}>
            {language === 'mr' ? organizationInfo.about.subtitleMr : organizationInfo.about.subtitleEn}
          </p>
        </div>
      </div>

      {/* Main Content Section */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="about-details-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '3rem',
            alignItems: 'center',
            marginBottom: '3.5rem'
          }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#12355B', marginBottom: '1rem' }}>
                {language === 'mr' ? 'संस्थेची पार्श्वभूमी व कार्य' : 'Organization Overview & Purpose'}
              </h2>
              <p style={{ fontSize: '1rem', color: '#172033', lineHeight: 1.65, marginBottom: '1.15rem' }}>
                {language === 'mr' ? organizationInfo.about.descriptionMr : organizationInfo.about.descriptionEn}
              </p>
              <p style={{ fontSize: '0.95rem', color: '#4f6182', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                {language === 'mr'
                  ? 'आमच्या कोल्हापूर येथील कार्यालयातून (रॉयल प्रेस्टीज संकुल, शाहूपुरी) तसेच दूरध्वनी प्रणालीद्वारे दररोज शेकडो रुग्णांना त्यांच्या आजारानुसार पथ्य आणि योग्य आयुर्वेदिक उपायांचे मोफत समुपदेशन केले जाते.'
                  : 'From our central Kolhapur center (Royal Prestige, Shahupuri) and statewide telephone counseling support, we provide free diet guidance and herbal solutions to hundreds of families daily.'}
              </p>

              <div style={{
                backgroundColor: '#eefcfd',
                borderLeft: '4px solid #087E8B',
                padding: '1.15rem',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                borderTop: '1px solid #abedf5',
                borderRight: '1px solid #abedf5',
                borderBottom: '1px solid #abedf5'
              }}>
                <div style={{ fontWeight: 700, color: '#05464d', marginBottom: '0.2rem' }}>
                  {language === 'mr' ? 'सहयोगी संस्था व केंद्र:' : 'Collaborating Guidance Center:'}
                </div>
                <div style={{ fontSize: '0.92rem', color: '#172033' }}>
                  {language === 'mr' ? organizationInfo.associatedCenterMr : organizationInfo.associatedCenter}
                </div>
              </div>
            </div>

            <div>
              <div style={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(18,53,91,0.08)',
                border: '1px solid #e2eaf4',
                backgroundColor: '#ffffff',
                padding: '1.75rem 1.25rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #e2effc 100%)'
              }}>
                <div style={{ marginBottom: '1.15rem', display: 'flex', justifyContent: 'center' }}>
                  <MissionLogoBadge size={190} />
                </div>
                <div style={{ padding: '0.75rem 0 0', borderTop: '1px solid #e2eaf4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#12355B', fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.92rem' }}>
                    <MapPin size={16} style={{ color: '#087E8B' }} />
                    <span>{language === 'mr' ? 'शाहूपुरी, कोल्हापूर (महाराष्ट्र)' : 'Shahupuri, Kolhapur (Maharashtra)'}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#4f6182' }}>
                    {language === 'mr' ? organizationInfo.contact.visitingNoteMr : organizationInfo.contact.visitingNote}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Vision Pillars */}
          <div className="grid-2" style={{ marginBottom: '3.5rem' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              border: '1px solid #e2eaf4',
              borderTop: '5px solid #087E8B',
              boxShadow: '0 4px 15px rgba(18,53,91,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#dbf7fa',
                  color: '#087E8B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Target size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#12355B', margin: 0 }}>
                  {language === 'mr' ? 'आमचे ध्येय (Mission)' : 'Our Mission'}
                </h3>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#4f6182', lineHeight: 1.65, margin: 0 }}>
                {language === 'mr' ? organizationInfo.about.missionMr : organizationInfo.about.missionEn}
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              border: '1px solid #e2eaf4',
              borderTop: '5px solid #F4A261',
              boxShadow: '0 4px 15px rgba(18,53,91,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fff3ec',
                  color: '#F4A261',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Eye size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c2530c', margin: 0 }}>
                  {language === 'mr' ? 'आमची दूरदृष्टी (Vision)' : 'Our Vision'}
                </h3>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#4f6182', lineHeight: 1.65, margin: 0 }}>
                {language === 'mr' ? organizationInfo.about.visionMr : organizationInfo.about.visionEn}
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div>
            <div className="section-header">
              <div className="section-badge">
                <Heart size={15} />
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
                    backgroundColor: '#F5F7FA',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid #e2eaf4'
                  }}
                  className="card"
                >
                  <h4 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#12355B', marginBottom: '0.5rem' }}>
                    {language === 'mr' ? val.titleMr : val.titleEn}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#4f6182', lineHeight: 1.55, margin: 0 }}>
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
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default About;
