import React, { useState } from 'react';
import { 
  Phone, 
  ShieldCheck, 
  Heart, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const Hero = ({ onOpenConsultation }) => {
  const { language } = useLanguage();
  const [showMore, setShowMore] = useState(false);

  return (
    <section className="hero-section">
      {/* Desktop Background Camp Image with soft left gradient */}
      <div className="hero-bg-image-overlay" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-content-wrapper">
          {/* Campaign Badge */}
          <div className="hero-slide-badge hero-animated-badge">
            <Sparkles size={15} className="hero-sparkle-icon" style={{ color: '#F4A261' }} />
            <span>
              {language === 'mr' ? 'मधुमेह मुक्त भारत व व्यसनमुक्त भारत अभियान' : 'National Health & De-Addiction Initiative'}
            </span>
          </div>

          {/* Dedicated Photo Card — Only on Mobile (Completely Hidden on Web/Desktop to prevent overlap) */}
          <div className="hero-mobile-image-card">
            <img 
              src="/hero-camp-bg.jpg" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/hero-bg.jpg';
              }}
              alt="Sahara Social Foundation Health Camp" 
              className="hero-mobile-img"
            />
            <div className="hero-mobile-img-badge">
              <ShieldCheck size={13} style={{ color: '#3cd0e2' }} />
              <span>{language === 'mr' ? 'अधिकृत आरोग्य शिबिर • कोल्हापूर' : 'Official Health Camp • Kolhapur'}</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title hero-animated-title">
            {language === 'mr' ? (
              <>
                <span className="hero-title-highlight">सहारा सोशल फाऊंडेशन</span>, कोल्हापूर<br />
                <span className="hero-campaign-highlight">मधुमेह मुक्त भारत अभियान</span>
              </>
            ) : (
              <>
                <span className="hero-title-highlight">Sahara Social Foundation</span><br />
                <span className="hero-campaign-highlight">Diabetes-Free India Campaign</span>
              </>
            )}
          </h1>

          {/* Interactive More Details Toggle (Only shows information when clicked) */}
          <div className="hero-subtext-container" style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setShowMore(prev => !prev)}
              className="hero-read-more-btn"
              aria-expanded={showMore}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: showMore ? 'rgba(8, 126, 139, 0.4)' : 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                transition: 'all 0.25s ease'
              }}
            >
              <span>
                {showMore 
                  ? (language === 'mr' ? 'कमी माहिती दाखवा (Show Less)' : 'Show Less')
                  : (language === 'mr' ? 'अधिक माहिती वाचा (More Details)' : 'More Details')}
              </span>
              {showMore ? <ChevronUp size={15} style={{ color: '#F4A261' }} /> : <ChevronDown size={15} style={{ color: '#F4A261' }} />}
            </button>

            {/* Expandable Information Section */}
            {showMore && (
              <div 
                className="hero-expanded-content"
                style={{
                  marginTop: '0.85rem',
                  backgroundColor: 'rgba(10, 27, 46, 0.85)',
                  border: '1px solid rgba(8, 126, 139, 0.4)',
                  borderRadius: '16px',
                  padding: '1.15rem',
                  backdropFilter: 'blur(10px)',
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <p style={{
                  color: '#e2effc',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  marginBottom: '0.95rem'
                }}>
                  {language === 'mr'
                    ? 'आधार मधुमेह-मुक्ती मार्गदर्शन केंद्राच्या सहयोगाने नैसर्गिक आयुर्वेदिक फॉर्म्युला, योग्य आहाराचे पथ्य आणि समुपदेशनाद्वारे रक्तातील साखर व व्यसनावर मात करण्यासाठी प्रभावी मार्गदर्शन.'
                    : 'In collaboration with Aadhar Madhumeh-Mukti Margdarshan Kendra, delivering authentic Ayurvedic wellness formulas, dietary counseling, and dedicated guidance for diabetes control and de-addiction.'}
                </p>

                <div className="hero-expanded-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.82rem', color: '#ffffff' }}>
                    <CheckCircle2 size={15} style={{ color: '#F4A261', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#3cd0e2' }}>{language === 'mr' ? 'मधुमेह नियंत्रण:' : 'Diabetes Support:'}</strong>{' '}
                      {language === 'mr' 
                        ? 'स्वादुपिंडाची कार्यक्षमता वाढवून रक्तातील साखर नैसर्गिकरीत्या नियंत्रित ठेवण्यास मदत.'
                        : 'Natural support for cellular insulin uptake and blood glucose balance.'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.82rem', color: '#ffffff' }}>
                    <CheckCircle2 size={15} style={{ color: '#F4A261', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#3cd0e2' }}>{language === 'mr' ? 'आहाराचे पथ्य:' : 'Dietary Pathya:'}</strong>{' '}
                      {language === 'mr'
                        ? 'प्रत्येक रुग्णाला फोन व प्रत्यक्ष भेटीत आहाराचे शास्त्रीय नियोजन व पथ्य मार्गदर्शन.'
                        : 'Scientific nutritional schedule and personalized dietary guidelines.'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.82rem', color: '#ffffff' }}>
                    <CheckCircle2 size={15} style={{ color: '#F4A261', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#3cd0e2' }}>{language === 'mr' ? 'व्यसनमुक्ती अभियान:' : 'De-Addiction Drive:'}</strong>{' '}
                      {language === 'mr'
                        ? 'दारू, तंबाखू व सिगारेटची तीव्र तलफ नैसर्गिक हर्बल फॉर्म्युलाने कमी करणे.'
                        : 'Safe herbal support to curb urges for alcohol, tobacco, and smoking.'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.82rem', color: '#ffffff' }}>
                    <CheckCircle2 size={15} style={{ color: '#F4A261', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#3cd0e2' }}>{language === 'mr' ? 'मोफत फोन सल्ला:' : 'Free Helpline:'}</strong>{' '}
                      {language === 'mr'
                        ? 'सहारा सोशल फाऊंडेशन, कोल्हापूर कार्यालयाशी थेट संपर्क: ८४२११५४०९०.'
                        : 'Direct counselor support at Kolhapur center: 8421154090.'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Notice Strip */}
          <div className="hero-trust-strip">
            <ShieldCheck size={17} style={{ color: '#3cd0e2', flexShrink: 0 }} />
            <span>
              {language === 'mr'
                ? 'नोंदणीकृत सामाजिक संस्था (Reg. No. MAH/582/2014/KOP) • अधिकृत आयुर्वेद सल्ला'
                : 'Registered Foundation (Reg. No. MAH/582/2014/KOP) • Authentic Ayurvedic Guidance'}
            </span>
          </div>

          {/* CTA Action Buttons */}
          <div className="hero-cta-group">
            <button
              type="button"
              onClick={onOpenConsultation}
              className="btn btn-accent btn-lg hero-main-cta"
            >
              <Heart size={18} />
              <span>{language === 'mr' ? 'मोफत मार्गदर्शन नोंदणी' : 'Free Consultation'}</span>
            </button>

            <div className="hero-secondary-cta-row">
              <a
                href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
                  language === 'mr'
                    ? 'नमस्कार, मला मधुमेह मुक्ती अभियानाबद्दल माहिती हवी आहे.'
                    : 'Hello, I want details about the Diabetes-Free India campaign.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg hero-sub-cta"
              >
                <WhatsAppIcon size={18} animated={true} />
                <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप' : 'WhatsApp'}</span>
              </a>

              <a
                href={`tel:${organizationInfo.contact.primaryPhone}`}
                className="btn btn-call btn-lg hero-sub-cta"
              >
                <Phone size={17} />
                <span>{language === 'mr' ? 'कॉल करा' : 'Call'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Cinematic Entrance Animations for Hero */
        .hero-section {
          position: relative;
          background-color: #12355B;
          color: #ffffff;
          padding: 2.75rem 0 3.75rem 0;
          overflow: hidden;
          font-family: var(--font-family);
        }

        /* Desktop Background Image - Slow Cinematic Zoom (1.05 -> 1 over 1.4s) */
        .hero-bg-image-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(
              to right, 
              rgba(18, 53, 91, 0.96) 0%, 
              rgba(18, 53, 91, 0.85) 42%, 
              rgba(8, 126, 139, 0.45) 75%, 
              rgba(18, 53, 91, 0.12) 100%
            ),
            url('/hero-camp-bg.jpg'),
            url('/hero-bg.jpg');
          background-size: cover;
          background-position: center right;
          background-repeat: no-repeat;
          opacity: 1;
          pointer-events: none;
          z-index: 1;
          animation: cinematicZoomIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform;
        }

        @keyframes cinematicZoomIn {
          0% {
            transform: scale(1.06);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .hero-content-wrapper {
          max-width: 860px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        /* 1. Badge Entrance (0ms) */
        .hero-animated-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Baloo 2', 'Poppins', sans-serif;
          background: linear-gradient(135deg, rgba(18, 53, 91, 0.95) 0%, rgba(8, 126, 139, 0.85) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 0.45rem 1.1rem;
          border-radius: 9999px;
          border: 1px solid rgba(244, 162, 97, 0.5);
          color: #ffffff;
          font-size: 0.92rem;
          font-weight: 700;
          letter-spacing: 0.015em;
          margin-bottom: 0.9rem;
          width: fit-content;
          max-width: 100%;
          box-shadow: 0 4px 18px rgba(10, 27, 46, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          animation: heroFadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* 2. Heading: Fade + Slide Up */
        .hero-title {
          font-family: 'Baloo 2', 'Poppins', sans-serif;
          font-size: clamp(2rem, 4.5vw + 0.8rem, 3.4rem);
          font-weight: 800;
          color: #ffffff;
          line-height: 1.22;
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
          text-shadow: 0 3px 16px rgba(10, 27, 46, 0.8);
          animation: heroFadeSlideUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }

        .hero-title-highlight {
          color: #ffffff;
          font-weight: 800;
          text-shadow: 0 3px 16px rgba(10, 27, 46, 0.9);
        }

        .hero-campaign-highlight {
          font-family: 'Baloo 2', 'Poppins', sans-serif;
          font-weight: 800;
          color: #ffffff;
          font-size: clamp(1.75rem, 3.6vw + 0.5rem, 2.7rem);
          text-shadow: 0 3px 16px rgba(10, 27, 46, 0.9);
          display: inline-block;
        }

        /* 3. Description / More Details Toggle: Fade Up with 150ms delay */
        .hero-subtext-container {
          width: 100%;
          margin-bottom: 1.35rem;
          animation: heroFadeSlideUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both;
        }

        /* 4. Notice / Trust Strip: Subtle Stagger */
        .hero-trust-strip {
          font-family: 'Baloo 2', 'Poppins', sans-serif;
          font-weight: 600;
          background-color: rgba(18, 53, 91, 0.88);
          border-left: 4px solid #087E8B;
          padding: 0.75rem 1.15rem;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #ffffff;
          margin-bottom: 1.6rem;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-top: 1px solid rgba(255, 255, 255, 0.18);
          border-right: 1px solid rgba(255, 255, 255, 0.18);
          border-bottom: 1px solid rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          gap: 0.65rem;
          max-width: 100%;
          box-shadow: 0 6px 20px rgba(10, 27, 46, 0.35);
          animation: heroFadeSlideUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
        }

        /* 5. CTA Buttons: Fade Up with 250ms+ delay */
        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
          margin-bottom: 0.5rem;
          width: 100%;
          font-family: 'Baloo 2', 'Poppins', sans-serif;
          animation: heroFadeSlideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both;
        }

        .hero-main-cta {
          flex: 0 0 auto;
          font-weight: 700;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 16px rgba(220, 106, 27, 0.4);
          transition: all 0.25s ease;
        }

        .hero-main-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(220, 106, 27, 0.5);
        }

        .hero-secondary-cta-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .hero-sub-cta {
          font-weight: 700;
          transition: all 0.25s ease;
        }

        .hero-sub-cta:hover {
          transform: translateY(-2px);
        }

        @keyframes heroFadeSlideUp {
          0% {
            opacity: 0;
            transform: translateY(22px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroSparklePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        /* Web View: strictly hide mobile card to prevent double image overlap */
        .hero-mobile-image-card {
          display: none !important;
        }

        /* Mobile Breakpoint (<= 640px) */
        @media (max-width: 640px) {
          .hero-section {
            padding: 1.5rem 0 2.25rem 0 !important;
            background-color: #12355B !important;
          }

          /* Hide desktop background overlay on mobile to prevent any double image overlap */
          .hero-bg-image-overlay {
            display: none !important;
          }

          /* Show clean dedicated photo card on Mobile only */
          .hero-mobile-image-card {
            display: block !important;
            position: relative;
            width: 100%;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(10, 27, 46, 0.45);
            border: 1.5px solid rgba(8, 126, 139, 0.35);
            margin-bottom: 1.15rem;
            background-color: #0a1b2e;
            animation: heroMobileCardZoom 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          @keyframes heroMobileCardZoom {
            0% {
              opacity: 0;
              transform: scale(1.04);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          .hero-mobile-img {
            width: 100%;
            height: auto;
            aspect-ratio: 16 / 9;
            object-fit: cover;
            object-position: center 30%;
            display: block;
          }

          .hero-mobile-img-badge {
            position: absolute;
            bottom: 8px;
            left: 8px;
            background: rgba(18, 53, 91, 0.92);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            color: #ffffff;
            font-size: 0.74rem;
            font-weight: 700;
            padding: 0.28rem 0.65rem;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 0.35rem;
            border: 1px solid rgba(8, 126, 139, 0.35);
            font-family: 'Baloo 2', 'Poppins', sans-serif;
          }

          .hero-animated-badge {
            font-size: 0.8rem;
            padding: 0.38rem 0.85rem;
            margin-bottom: 0.75rem;
          }

          .hero-title {
            font-size: clamp(1.4rem, 5.8vw, 1.95rem) !important;
            line-height: 1.25 !important;
            margin-bottom: 0.65rem !important;
          }

          .hero-campaign-highlight {
            font-size: clamp(1.25rem, 5vw, 1.65rem) !important;
          }

          .hero-subtext-container {
            margin-bottom: 0.9rem !important;
          }

          .hero-trust-strip {
            font-size: 0.8rem !important;
            padding: 0.55rem 0.85rem !important;
            margin-bottom: 1.15rem !important;
            line-height: 1.4 !important;
          }

          /* Smart 2-row Mobile CTA buttons */
          .hero-cta-group {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 0.6rem !important;
            margin-bottom: 0.5rem !important;
          }

          .hero-main-cta {
            width: 100% !important;
            justify-content: center !important;
            font-size: 1rem !important;
            padding: 0.8rem !important;
          }

          .hero-secondary-cta-row {
            display: flex;
            width: 100%;
            gap: 0.6rem;
          }

          .hero-sub-cta {
            flex: 1 !important;
            justify-content: center !important;
            font-size: 0.9rem !important;
            padding: 0.7rem !important;
            min-height: 46px;
          }
        }

        @media (max-width: 360px) {
          .hero-title {
            font-size: 1.3rem !important;
          }
          .hero-campaign-highlight {
            font-size: 1.15rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
