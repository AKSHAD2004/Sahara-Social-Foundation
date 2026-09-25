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
    <section className="section" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="container">
        <div className="about-grid">
          {/* Left Column: Visual & Badges */}
          <div className="about-visual-wrapper">
            <div className="about-visual-card">
              <div className="about-logo-box">
                <MissionLogoBadge size={190} />
              </div>
              <div style={{ textAlign: 'center', color: '#12355B' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  {language === 'mr' ? 'सहारा सोशल फाऊंडेशन' : 'Sahara Social Foundation'}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#087E8B', fontWeight: 600 }}>
                  {language === 'mr' ? 'मधुमेहमुक्त व व्यसनमुक्त भारत अभियान • कोल्हापूर' : 'Diabetes Free & Addiction Free Mission • Kolhapur'}
                </div>
              </div>
            </div>

            {/* Floating Experience Badge */}
            <div className="about-float-badge">
              <Building2 size={24} style={{ color: '#087E8B', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#12355B' }}>
                  {language === 'mr' ? 'शाहूपुरी, कोल्हापूर' : 'Shahupuri, Kolhapur'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#4f6182' }}>
                  {language === 'mr' ? 'रॉयल प्रेस्टीज संकुल' : 'Royal Prestige Complex'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission, Vision, Text */}
          <div className="about-content-wrapper">
            <div className="section-badge">
              <ShieldCheck size={15} />
              <span>{language === 'mr' ? 'संस्थेची ओळख व उद्दिष्टे' : 'About Organization'}</span>
            </div>

            <h2 className="about-heading">
              {language === 'mr' ? organizationInfo.about.titleMr : organizationInfo.about.titleEn}
            </h2>

            <p className="about-description">
              {language === 'mr' ? organizationInfo.about.descriptionMr : organizationInfo.about.descriptionEn}
            </p>

            {/* Mission & Vision Cards */}
            <div className="about-cards-list">
              {/* Mission Card */}
              <div className="about-card-mission">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Target size={18} style={{ color: '#087E8B' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#12355B', margin: 0 }}>
                    {language === 'mr' ? 'आमचे ध्येय (Our Mission)' : 'Our Mission'}
                  </h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#4f6182', lineHeight: 1.5, margin: 0 }}>
                  {language === 'mr' ? organizationInfo.about.missionMr : organizationInfo.about.missionEn}
                </p>
              </div>

              {/* Vision Card */}
              <div className="about-card-vision">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Eye size={18} style={{ color: '#F4A261' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#c2530c', margin: 0 }}>
                    {language === 'mr' ? 'आमची दूरदृष्टी (Our Vision)' : 'Our Vision'}
                  </h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#4f6182', lineHeight: 1.5, margin: 0 }}>
                  {language === 'mr' ? organizationInfo.about.visionMr : organizationInfo.about.visionEn}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="about-btn-group">
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
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 3.5rem;
          align-items: center;
        }

        .about-visual-wrapper {
          position: relative;
        }

        .about-visual-card {
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 16px 35px rgba(18,53,91,0.08);
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #e2effc 100%);
          border: 1px solid #e2eaf4;
          min-height: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }

        .about-logo-box {
          margin-bottom: 1.15rem;
          display: flex;
          justify-content: center;
          max-width: 100%;
        }

        .about-float-badge {
          position: absolute;
          top: 1.25rem;
          right: -1.25rem;
          background-color: #ffffff;
          border-radius: 14px;
          padding: 0.75rem 1rem;
          box-shadow: 0 10px 25px rgba(18,53,91,0.12);
          border: 1px solid #e2eaf4;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          max-width: 220px;
          z-index: 3;
        }

        .about-heading {
          font-size: clamp(1.45rem, 3vw + 0.4rem, 2.1rem);
          margin-bottom: 1rem;
          color: #12355B;
        }

        .about-description {
          font-size: clamp(0.92rem, 1vw + 0.4rem, 1.05rem);
          color: #374765;
          line-height: 1.65;
          margin-bottom: 1.35rem;
        }

        .about-cards-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .about-card-mission {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 1rem 1.15rem;
          border: 1px solid #e2eaf4;
          border-left: 4px solid #087E8B;
          box-shadow: 0 2px 6px rgba(18,53,91,0.04);
        }

        .about-card-vision {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 1rem 1.15rem;
          border: 1px solid #e2eaf4;
          border-left: 4px solid #F4A261;
          box-shadow: 0 2px 6px rgba(18,53,91,0.04);
        }

        .about-btn-group {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        @media (max-width: 960px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          .about-visual-card {
            min-height: auto;
            padding: 1.5rem 1rem;
          }

          .about-float-badge {
            position: static !important;
            margin-top: 0.75rem;
            max-width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .about-btn-group {
            flex-direction: column;
            width: 100%;
          }

          .about-btn-group .btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;
