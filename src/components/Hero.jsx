import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Phone, 
  ShieldCheck, 
  Heart, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

// Configurable Hero Slideshow Images
// Replace or add your custom image paths here when ready
export const heroSlidesData = [
  {
    id: 1,
    image: '/slide-antox-d.jpg',
    fallback: '/hero-slide-1.jpg',
    badgeEn: 'Antox D + Antox T • Diabetes Care',
    badgeMr: 'मधुमेहमुक्त भारत अभियान • Antox D + Antox T',
    titleEn: 'Nutrifeel Antox D & Antox T Herbal Formula',
    titleMr: 'मधुमेहामुळे होणाऱ्या समस्यांमध्ये दिलासा देण्यासाठी लाभदायक'
  },
  {
    id: 2,
    image: '/slide-vyasanmukt.jpg',
    fallback: '/slide-vyasanmukt.jpg',
    badgeEn: 'Addiction-Free Campaign • Antox B-AL-NICO + Antox T',
    badgeMr: 'व्यसनमुक्त भारत अभियान • Antox B-AL-NICO + Antox T',
    titleEn: 'Herbal Spray & Tea for Tobacco & Alcohol De-addiction',
    titleMr: 'कोणत्याही प्रकारचे व्यसन सोडवण्यासाठी अत्यंत फायदेशीर'
  },
  {
    id: 3,
    image: '/slide-rogmukt-hlk.jpg',
    fallback: '/slide-rogmukt-hlk.jpg',
    badgeEn: 'Disease-Free Campaign • Heart, Liver & Kidney Care',
    badgeMr: 'रोगमुक्त भारत अभियान • Antox HLK + Antox T',
    titleEn: 'Arjun & Methi Nutraceutical Formulation for Vital Organs',
    titleMr: 'हार्ट, लिव्हर आणि किडनी संरक्षणासाठी व आरोग्यासाठी फायदेशीर'
  },
  {
    id: 4,
    image: '/slide-vednamukt.jpg',
    fallback: '/slide-vednamukt.jpg',
    badgeEn: 'Pain-Free Campaign • Joint, Bone & Spine Care',
    badgeMr: 'वेदनामुक्त भारत अभियान • Antox PN Powder + Oil',
    titleEn: 'Marine Collagen & Herbal Oil for Joint and Back Relief',
    titleMr: 'सर्व प्रकारच्या सांधेदुखी व मणक्याच्या त्रासापासून आराम मिळवण्यात फायदेशीर'
  },
  {
    id: 5,
    image: '/slide-rogmukt-bacid.jpg',
    fallback: '/slide-rogmukt-bacid.jpg',
    badgeEn: 'Disease-Free Campaign • Acidity & Digestion Care',
    badgeMr: 'रोगमुक्त भारत अभियान • Antox B-Acid + Antox T',
    titleEn: 'Electro-Homeopathic & Herbal Formula for Hyperacidity Relief',
    titleMr: 'ॲसिडिटी (आम्लपित्त) व पचन विकार नियंत्रित करण्यासाठी लाभदायक'
  },
  {
    id: 6,
    image: '/slide-rogmukt-antox-x.jpg',
    fallback: '/slide-rogmukt-antox-x.jpg',
    badgeEn: 'Disease-Free Campaign • Vitality & Men Strength',
    badgeMr: 'रोगमुक्त भारत अभियान • Antox X + Antox T',
    titleEn: 'Safed Musali & Botanical Extracts for Energy & Vitality',
    titleMr: 'पुरुषांच्या लैंगिक समस्या व अशक्तपणा दूर करण्यासाठी लाभदायक'
  },
  {
    id: 7,
    image: '/slide-antox-amrut.jpg',
    fallback: '/hero-slide-2.jpg',
    badgeEn: 'Pre-Clinically Tested • Sharir Shuddhi Panchakarma',
    badgeMr: 'शरीरशुद्धी पंचकर्म • Antox Amrut 51 + Antox T',
    titleEn: 'Detoxification & Essential Nutrition for Complete Body Health',
    titleMr: 'शरीरशुद्धी + पोषक तत्व = आरोग्यदायी निरोगी शरीर'
  }
];

const Hero = ({ onOpenConsultation, customSlides = null }) => {
  const { language } = useLanguage();
  const [showMore, setShowMore] = useState(false);

  // Slideshow state
  const slides = customSlides && customSlides.length > 0 ? customSlides : heroSlidesData;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  // Autoplay timer
  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      timerRef.current = setInterval(nextSlide, 4500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide, slides.length]);

  return (
    <section className="hero-section">
      {/* Background Ambient Glow */}
      <div className="hero-ambient-glow" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* 1. SLIDESHOW VISIBLE FIRST AT THE TOP */}
        <div 
          className="hero-slideshow-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="hero-slideshow-container">
            {/* Slides Wrapper */}
            <div className="hero-slides-wrapper">
              {slides.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <div
                    key={slide.id || index}
                    className={`hero-slide-item ${isActive ? 'slide-active' : ''}`}
                    aria-hidden={!isActive}
                  >
                    <img
                      src={slide.image}
                      alt={language === 'mr' ? slide.titleMr : slide.titleEn}
                      className="hero-slide-img"
                      onError={(e) => {
                        if (slide.fallback && e.target.src !== slide.fallback) {
                          e.target.onerror = null;
                          e.target.src = slide.fallback;
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="hero-carousel-arrow arrow-prev"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="hero-carousel-arrow arrow-next"
                  aria-label="Next Slide"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* Slide Counter Indicator */}
            <div className="hero-slide-counter">
              {currentSlide + 1} / {slides.length}
            </div>

            {/* Dot Pagination */}
            {slides.length > 1 && (
              <div className="hero-slide-dots">
                {slides.map((_, dotIndex) => (
                  <button
                    key={dotIndex}
                    type="button"
                    onClick={() => setCurrentSlide(dotIndex)}
                    className={`hero-slide-dot ${dotIndex === currentSlide ? 'dot-active' : ''}`}
                    aria-label={`Go to slide ${dotIndex + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. HERO CONTENT SECTION (Below Slideshow) - Side-by-Side Space Utilization */}
        <div className="hero-split-grid">
          {/* Left Column: Mission Branding & Headline */}
          <div className="hero-left-col">
            <div className="hero-badge-row">
              <div className="hero-slide-badge hero-animated-badge">
                <Sparkles size={14} className="hero-sparkle-icon" style={{ color: '#FFC928' }} />
                <span>
                  {language === 'mr' ? 'मधुमेह मुक्त भारत व व्यसनमुक्त भारत अभियान' : 'National Health & De-Addiction Initiative'}
                </span>
              </div>
            </div>

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

            <div className="hero-subtext-container">
              <button
                type="button"
                onClick={() => setShowMore(prev => !prev)}
                className="hero-read-more-btn"
                aria-expanded={showMore}
              >
                <span>
                  {showMore 
                    ? (language === 'mr' ? 'कमी माहिती दाखवा (Show Less)' : 'Show Less')
                    : (language === 'mr' ? 'अधिक माहिती वाचा (More Details)' : 'More Details')}
                </span>
                {showMore ? <ChevronUp size={15} style={{ color: '#006B2D' }} /> : <ChevronDown size={15} style={{ color: '#006B2D' }} />}
              </button>
            </div>
          </div>

          {/* Right Column: Registration Trust Strip & Quick Action Buttons */}
          <div className="hero-right-col">
            <div className="hero-action-card">
              <div className="hero-trust-strip">
                <ShieldCheck size={16} style={{ color: '#006B2D', flexShrink: 0 }} />
                <span>
                  {language === 'mr'
                    ? 'नोंदणीकृत संस्था (Reg. No. MAH/582/2014/KOP) • अधिकृत आयुर्वेद सल्ला'
                    : 'Registered Foundation (Reg. No. MAH/582/2014/KOP) • Ayurvedic Guidance'}
                </span>
              </div>

              <div className="hero-cta-group">
                <button
                  type="button"
                  onClick={onOpenConsultation}
                  className="btn btn-primary hero-main-cta"
                >
                  <Heart size={18} style={{ color: '#FFC928' }} />
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
                    className="btn btn-whatsapp hero-sub-cta"
                  >
                    <WhatsAppIcon size={18} animated={true} />
                    <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप' : 'WhatsApp'}</span>
                  </a>

                  <a
                    href={`tel:${organizationInfo.contact.primaryPhone}`}
                    className="btn btn-call hero-sub-cta"
                  >
                    <Phone size={17} />
                    <span>{language === 'mr' ? 'कॉल करा' : 'Call'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Information Box (Spans Full Width Below Grid) */}
        {showMore && (
          <div className="hero-expanded-content">
            <p className="hero-expanded-desc">
              {language === 'mr'
                ? 'आधार मधुमेह-मुक्ती मार्गदर्शन केंद्राच्या सहयोगाने नैसर्गिक आयुर्वेदिक फॉर्म्युला, योग्य आहाराचे पथ्य आणि समुपदेशनाद्वारे रक्तातील साखर व व्यसनावर मात करण्यासाठी प्रभावी मार्गदर्शन.'
                : 'In collaboration with Aadhar Madhumeh-Mukti Margdarshan Kendra, delivering authentic Ayurvedic wellness formulas, dietary counseling, and dedicated guidance for diabetes control and de-addiction.'}
            </p>

            <div className="hero-expanded-grid">
              <div className="hero-expanded-item">
                <CheckCircle2 size={15} className="hero-check-icon" />
                <div>
                  <strong>{language === 'mr' ? 'मधुमेह नियंत्रण:' : 'Diabetes Support:'}</strong>{' '}
                  {language === 'mr' 
                    ? 'स्वादुपिंडाची कार्यक्षमता वाढवून रक्तातील साखर नैसर्गिकरीत्या नियंत्रित ठेवण्यास मदत.'
                    : 'Natural support for cellular insulin uptake and blood glucose balance.'}
                </div>
              </div>

              <div className="hero-expanded-item">
                <CheckCircle2 size={15} className="hero-check-icon" />
                <div>
                  <strong>{language === 'mr' ? 'आहाराचे पथ्य:' : 'Dietary Pathya:'}</strong>{' '}
                  {language === 'mr'
                    ? 'प्रत्येक रुग्णाला फोन व प्रत्यक्ष भेटीत आहाराचे शास्त्रीय नियोजन व पथ्य मार्गदर्शन.'
                    : 'Scientific nutritional schedule and personalized dietary guidelines.'}
                </div>
              </div>

              <div className="hero-expanded-item">
                <CheckCircle2 size={15} className="hero-check-icon" />
                <div>
                  <strong>{language === 'mr' ? 'व्यसनमुक्ती अभियान:' : 'De-Addiction Drive:'}</strong>{' '}
                  {language === 'mr'
                    ? 'दारू, तंबाखू व सिगारेटची तीव्र तलफ नैसर्गिक हर्बल फॉर्म्युलाने कमी करणे.'
                    : 'Safe herbal support to curb urges for alcohol, tobacco, and smoking.'}
                </div>
              </div>

              <div className="hero-expanded-item">
                <CheckCircle2 size={15} className="hero-check-icon" />
                <div>
                  <strong>{language === 'mr' ? 'मोफत फोन सल्ला:' : 'Free Helpline:'}</strong>{' '}
                  {language === 'mr'
                    ? 'सहारा सोशल फाऊंडेशन, कोल्हापूर कार्यालयाशी थेट संपर्क: ७७४५०६६७०७.'
                    : 'Direct counselor support at Kolhapur center: 7745066707.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Hero Section General Styling - Brand Theme (Soft Green + White Base) */
        .hero-section {
          position: relative;
          background: linear-gradient(180deg, #F3F8F1 0%, #FFFFFF 55%, #EDF6EB 100%);
          color: #17251B;
          padding: 1.25rem 0 1.5rem 0;
          overflow: hidden;
          font-family: var(--font-family);
          border-bottom: 1px solid #E1E9DF;
        }

        /* Subtle Ambient Glow Effect Behind Content */
        .hero-ambient-glow {
          position: absolute;
          top: -15%;
          right: -10%;
          width: 55vw;
          height: 55vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(21, 155, 50, 0.12) 0%, rgba(243, 248, 241, 0) 70%);
          pointer-events: none;
          z-index: 1;
        }

        /* =======================================================
           TOP: PROMINENT HERO SLIDESHOW (VISIBLE FIRST)
           Full space utilization for high-resolution images
           ======================================================= */
        .hero-slideshow-wrapper {
          width: 100%;
          max-width: 1040px;
          margin: 0 auto 1.15rem auto;
          display: flex;
          justify-content: center;
          padding: 0 0.5rem;
          box-sizing: border-box;
        }

        .hero-slideshow-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 18px;
          overflow: hidden;
          background-color: #04200e;
          border: 3px solid #FFC928;
          box-shadow: 
            0 16px 45px rgba(0, 107, 45, 0.15), 
            0 0 25px rgba(255, 201, 40, 0.28),
            inset 0 0 0 1px rgba(255, 255, 255, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hero-slides-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .hero-slide-item {
          position: absolute;
          inset: 0;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          transform: scale(1.02);
        }

        .hero-slide-item.slide-active {
          opacity: 1;
          visibility: visible;
          transform: scale(1);
        }

        .hero-slide-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          border-radius: 15px;
        }

        /* Slide Counter Pill */
        .hero-slide-counter {
          position: absolute;
          bottom: 14px;
          right: 16px;
          background: rgba(4, 32, 14, 0.88);
          backdrop-filter: blur(8px);
          color: #FFC928;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.28rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 201, 40, 0.5);
          z-index: 6;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        }

        /* Carousel Navigation Buttons */
        .hero-carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(4, 32, 14, 0.88);
          border: 2px solid #FFC928;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.22s ease;
          z-index: 7;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.45);
        }

        .hero-carousel-arrow:hover {
          background: #FFC928;
          color: #17251B;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 20px rgba(255, 201, 40, 0.65);
        }

        .arrow-prev {
          left: 14px;
        }

        .arrow-next {
          right: 14px;
        }

        /* Slide Indicator Dots */
        .hero-slide-dots {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 4px 10px;
          border-radius: 9999px;
          background: rgba(4, 32, 14, 0.65);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          z-index: 6;
        }

        .hero-slide-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.45);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hero-slide-dot.dot-active {
          width: 22px;
          background: #FFC928;
          box-shadow: 0 0 10px rgba(255, 201, 40, 0.8);
        }

        /* =======================================================
           HERO CONTENT SECTION: SPLIT 2-COLUMN SIDE-BY-SIDE
           Removes center alignment and utilizes side remaining spaces
           ======================================================= */
        .hero-split-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 2.25rem;
          align-items: center;
          max-width: 1040px;
          margin: 0 auto;
        }

        .hero-left-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .hero-right-col {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }

        .hero-badge-row {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 0.35rem;
        }

        .hero-animated-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-family: 'Baloo 2', 'Poppins', sans-serif;
          background: #e2faea;
          padding: 0.28rem 0.95rem;
          border-radius: 9999px;
          border: 1px solid rgba(21, 155, 50, 0.35);
          color: #006B2D;
          font-size: 0.84rem;
          font-weight: 700;
          letter-spacing: 0.015em;
          box-shadow: 0 2px 8px rgba(0, 107, 45, 0.06);
        }

        /* Main Headline */
        .hero-title {
          font-family: 'Baloo 2', 'Poppins', sans-serif;
          font-size: clamp(1.5rem, 2.7vw + 0.2rem, 2.25rem);
          font-weight: 800;
          color: #006B2D;
          line-height: 1.22;
          margin-bottom: 0.4rem;
          letter-spacing: -0.01em;
          text-align: left;
        }

        .hero-title-highlight {
          color: #17251B;
          font-weight: 800;
        }

        .hero-campaign-highlight {
          font-family: 'Baloo 2', 'Poppins', sans-serif;
          font-weight: 800;
          color: #159B32;
        }

        /* Expandable More Details Button & Container */
        .hero-subtext-container {
          width: 100%;
          margin-bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .hero-read-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background-color: #ffffff;
          border: 1.5px solid #E1E9DF;
          color: #006B2D;
          padding: 0.28rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 107, 45, 0.05);
          transition: all 0.25s ease;
        }

        .hero-read-more-btn:hover {
          background-color: #F3F8F1;
          border-color: #159B32;
        }

        .hero-expanded-content {
          margin-top: 1rem;
          width: 100%;
          max-width: 1040px;
          margin-left: auto;
          margin-right: auto;
          background-color: #ffffff;
          border: 1.5px solid #E1E9DF;
          border-radius: 14px;
          padding: 1.15rem;
          text-align: left;
          box-shadow: 0 8px 24px rgba(0, 107, 45, 0.08);
          animation: fadeIn 0.3s ease-out;
        }

        .hero-expanded-desc {
          color: #5F6B61;
          font-size: 0.88rem;
          line-height: 1.55;
          margin-bottom: 0.85rem;
        }

        .hero-expanded-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .hero-expanded-item {
          display: flex;
          align-items: flex-start;
          gap: 0.45rem;
          font-size: 0.82rem;
          color: #17251B;
        }

        .hero-expanded-item strong {
          color: #006B2D;
        }

        .hero-check-icon {
          color: #159B32;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* Unified Action Container - Straight Aligned Edges */
        .hero-action-card {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          background: #ffffff;
          padding: 0.95rem 1.15rem;
          border-radius: 16px;
          border: 1.5px solid #E1E9DF;
          box-shadow: 0 8px 24px rgba(0, 107, 45, 0.08);
          box-sizing: border-box;
        }

        /* Trust Strip - Top of Action Box */
        .hero-trust-strip {
          font-family: 'Baloo 2', 'Poppins', sans-serif;
          font-weight: 700;
          background-color: #F3F8F1;
          border-left: 3.5px solid #006B2D;
          padding: 0.42rem 0.85rem;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #17251B;
          border-top: 1px solid rgba(21, 155, 50, 0.2);
          border-right: 1px solid rgba(21, 155, 50, 0.2);
          border-bottom: 1px solid rgba(21, 155, 50, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          width: 100%;
          box-sizing: border-box;
          line-height: 1.35;
          text-align: center;
        }

        /* CTA Buttons Group - Perfectly aligned, full-width */
        .hero-cta-group {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          width: 100%;
          font-family: 'Baloo 2', 'Poppins', sans-serif;
        }

        .hero-main-cta {
          width: 100% !important;
          font-weight: 800;
          letter-spacing: 0.01em;
          background: linear-gradient(135deg, #006B2D, #08481c);
          color: #ffffff;
          padding: 0.72rem 1.25rem !important;
          border-radius: 10px;
          min-height: 44px;
          box-shadow: 0 4px 14px rgba(0, 107, 45, 0.28);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-sizing: border-box;
        }

        .hero-main-cta:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #028f3d, #006B2D);
          box-shadow: 0 6px 20px rgba(0, 107, 45, 0.35);
        }

        /* 50/50 Split for WhatsApp & Call */
        .hero-secondary-cta-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.55rem;
          width: 100%;
          box-sizing: border-box;
        }

        .hero-sub-cta {
          width: 100% !important;
          font-weight: 700;
          padding: 0.65rem 0.75rem !important;
          border-radius: 10px;
          min-height: 44px;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          box-sizing: border-box;
          text-align: center;
        }

        .hero-sub-cta:hover {
          transform: translateY(-2px);
        }

        .hero-cta-micro-trust {
          display: none;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .hero-split-grid {
            grid-template-columns: 1fr;
            gap: 1.15rem;
          }

          .hero-left-col {
            align-items: center;
            text-align: center;
          }

          .hero-badge-row {
            justify-content: center;
          }

          .hero-title {
            text-align: center;
          }

          .hero-subtext-container {
            align-items: center;
          }

          .hero-right-col {
            display: flex;
            justify-content: center;
            width: 100%;
          }

          .hero-action-card {
            max-width: 420px;
            margin: 0 auto;
          }
        }
        @media (max-width: 992px) {
          .hero-slideshow-wrapper {
            max-width: 820px;
          }
        }

        @media (max-width: 640px) {
          .hero-section {
            padding: 0.75rem 0 1.25rem 0 !important;
          }

          .hero-slideshow-wrapper {
            margin-bottom: 0.85rem;
            padding: 0;
          }

          .hero-slideshow-container {
            aspect-ratio: 16 / 9;
            border-radius: 13px;
            border-width: 2.5px;
          }

          .hero-slide-counter {
            bottom: 10px;
            right: 12px;
            font-size: 0.72rem;
            padding: 0.2rem 0.6rem;
          }

          .hero-carousel-arrow {
            width: 36px;
            height: 36px;
          }

          .arrow-prev {
            left: 8px;
          }

          .arrow-next {
            right: 8px;
          }

          .hero-animated-badge {
            font-size: 0.78rem;
            padding: 0.25rem 0.8rem;
          }

          .hero-title {
            font-size: clamp(1.35rem, 5.5vw, 1.85rem) !important;
            line-height: 1.2 !important;
            margin-bottom: 0.35rem !important;
          }

          .hero-campaign-highlight {
            font-size: clamp(1.2rem, 4.8vw, 1.55rem) !important;
          }

          .hero-expanded-grid {
            grid-template-columns: 1fr;
          }

          .hero-trust-strip {
            font-size: 0.78rem !important;
            padding: 0.32rem 0.75rem !important;
            margin-bottom: 0.65rem !important;
            text-align: center;
            justify-content: center;
          }

          .hero-cta-group {
            flex-direction: column;
            align-items: center;
            width: 100%;
            gap: 0.45rem !important;
            margin-top: 0.25rem;
          }

          .hero-main-cta {
            width: 100% !important;
            max-width: 360px;
            margin: 0 auto;
            justify-content: center !important;
            font-size: 0.98rem !important;
            font-weight: 800;
            padding: 0.82rem 1.6rem !important;
            border-radius: 999px !important;
            background: linear-gradient(135deg, #006B2D 0%, #08481c 100%) !important;
            box-shadow: 0 4px 18px rgba(0, 107, 45, 0.28) !important;
            letter-spacing: 0.01em;
          }

          .hero-cta-micro-trust {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.72rem;
            color: #5F6B61;
            font-weight: 700;
            text-align: center;
            margin-top: 2px;
          }

          /* Remove bulky Call & WhatsApp secondary block buttons from mobile view */
          .hero-secondary-cta-row {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
