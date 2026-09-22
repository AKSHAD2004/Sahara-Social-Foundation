import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Eye, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';
import MissionLogoBadge from './MissionLogoBadge';

const AboutSection = () => {
  const { language } = useLanguage();

  return (
    <section className="section" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
          gap: '3.5rem',
          alignItems: 'center'
        }} className="about-grid">
          {/* Left Column: Visual & Badges */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              position: 'relative',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              height: '460px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)'
            }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <MissionLogoBadge size={240} />
              </div>
              <div style={{ textAlign: 'center', color: '#064e3b' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  {language === 'mr' ? 'सहारा सोशल फाऊंडेशन' : 'Sahara Social Foundation'}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 600 }}>
                  {language === 'mr' ? 'मधुमेहमुक्त व व्यसनमुक्त भारत अभियान • कोल्हापूर' : 'Diabetes Free & Addiction Free Mission • Kolhapur'}
                </div>
              </div>
            </div>

            {/* Floating Experience Badge */}
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              right: '-1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              maxWidth: '220px'
            }} className="about-float-badge">
              <Building2 size={28} style={{ color: '#059669', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#064e3b' }}>
                  {language === 'mr' ? 'शाहूपुरी, कोल्हापूर' : 'Shahupuri, Kolhapur'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {language === 'mr' ? 'रॉयल प्रेस्टीज संकुल' : 'Royal Prestige Complex'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission, Vision, Text */}
          <div>
            <div className="section-badge">
              <ShieldCheck size={16} />
              <span>{language === 'mr' ? 'संस्थेची ओळख व उद्दिष्टे' : 'About Organization'}</span>
            </div>

            <h2 style={{ fontSize: '2.2rem', marginBottom: '1.2rem', color: '#064e3b' }}>
              {language === 'mr' ? organizationInfo.about.titleMr : organizationInfo.about.titleEn}
            </h2>

            <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {language === 'mr' ? organizationInfo.about.descriptionMr : organizationInfo.about.descriptionEn}
            </p>

            {/* Mission & Vision Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
              {/* Mission Card */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '1.25rem',
                borderLeft: '4px solid #059669',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #e2e8f0',
                borderLeftWidth: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Target size={20} style={{ color: '#059669' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#064e3b' }}>
                    {language === 'mr' ? 'आमचे ध्येय (Our Mission)' : 'Our Mission'}
                  </h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {language === 'mr' ? organizationInfo.about.missionMr : organizationInfo.about.missionEn}
                </p>
              </div>

              {/* Vision Card */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '1.25rem',
                borderLeft: '4px solid #d97706',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #e2e8f0',
                borderLeftWidth: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Eye size={20} style={{ color: '#d97706' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#78350f' }}>
                    {language === 'mr' ? 'आमची दूरदृष्टी (Our Vision)' : 'Our Vision'}
                  </h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {language === 'mr' ? organizationInfo.about.visionMr : organizationInfo.about.visionEn}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/about" className="btn btn-primary">
                <span>{language === 'mr' ? 'सविस्तर वाचा' : 'Learn More About Us'}</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn btn-outline">
                <span>{language === 'mr' ? 'कार्यालयाशी संपर्क' : 'Contact Office'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .about-float-badge {
            right: 1rem !important;
            top: 1rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;
