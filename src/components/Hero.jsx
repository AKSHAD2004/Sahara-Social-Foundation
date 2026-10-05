import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Phone,
  Heart,
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

        {/* 2. HERO ACTION BUTTONS (Directly below slideshow) */}
        <div className="hero-action-bar-wrapper">
          <div className="hero-action-card">
            <div className="hero-cta-group">
              <button
                type="button"
                onClick={onOpenConsultation}
                className="btn btn-primary hero-main-cta"
              >
                <Heart size={20} style={{ color: '#FFC928' }} />
                <span>{language === 'mr' ? 'मोफत मार्गदर्शन नोंदणी' : 'Free Consultation'}</span>
              </button>

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
                <WhatsAppIcon size={20} animated={true} />
                <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप मार्गदर्शन' : 'WhatsApp Support'}</span>
              </a>

              <a
                href={`tel:${organizationInfo.contact.primaryPhone}`}
                className="btn btn-call hero-sub-cta"
              >
                <Phone size={18} />
                <span>{language === 'mr' ? 'कॉल करा: ७७४५०६६७०७' : 'Call: 7745066707'}</span>
              </a>
            </div>
          </div>
        </div>
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
           HERO ACTION BUTTONS (Directly below slideshow)
           ======================================================= */
        .hero-action-bar-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 1040px;
          margin: 0.85rem auto 0 auto;
        }

        .hero-action-card {
          width: 100%;
          max-width: 1040px;
          background: #ffffff;
          padding: 0.85rem 1.15rem;
          border-radius: 18px;
          border: 1.5px solid #E1E9DF;
          box-shadow: 0 8px 24px rgba(0, 107, 45, 0.08);
          box-sizing: border-box;
        }

        /* Desktop: 3-column horizontal spread across full 1040px width */
        .hero-cta-group {
          display: grid;
          grid-template-columns: 1.25fr 1fr 1fr;
          gap: 0.95rem;
          width: 100%;
          align-items: center;
          font-family: 'Baloo 2', 'Poppins', sans-serif;
          box-sizing: border-box;
        }

        .hero-main-cta {
          width: 100% !important;
          font-weight: 800;
          font-size: 0.96rem;
          letter-spacing: 0.01em;
          background: linear-gradient(135deg, #006B2D, #08481c);
          color: #ffffff;
          padding: 0.75rem 1rem !important;
          border-radius: 12px;
          min-height: 48px;
          box-shadow: 0 4px 14px rgba(0, 107, 45, 0.28);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-sizing: border-box;
          white-space: nowrap;
        }

        .hero-main-cta:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #028f3d, #006B2D);
          box-shadow: 0 6px 20px rgba(0, 107, 45, 0.35);
        }

        .hero-sub-cta {
          width: 100% !important;
          font-weight: 700;
          font-size: 0.92rem;
          padding: 0.75rem 0.85rem !important;
          border-radius: 12px;
          min-height: 48px;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          box-sizing: border-box;
          text-align: center;
          white-space: nowrap;
        }

        .hero-sub-cta:hover {
          transform: translateY(-2px);
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .hero-slideshow-wrapper {
            max-width: 820px;
          }
          .hero-action-bar-wrapper {
            max-width: 820px;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 0.65rem 0 0.85rem 0 !important;
          }

          .hero-slideshow-wrapper {
            margin-bottom: 0.65rem;
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

          .hero-action-bar-wrapper {
            margin: 0.35rem auto 0 auto;
            width: 100%;
          }

          /* Mobile Action Card */
          .hero-action-card {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0.72rem 0.85rem !important;
            border-radius: 14px !important;
            background: #ffffff !important;
            border: 1.5px solid #E1E9DF !important;
            box-shadow: 0 4px 16px rgba(0, 107, 45, 0.08) !important;
          }

          /* 2-row layout on tablet/mobile: Free Consultation full width, WhatsApp & Call 50/50 */
          .hero-cta-group {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem !important;
          }

          .hero-main-cta {
            grid-column: 1 / -1 !important;
            width: 100% !important;
            margin: 0 !important;
            justify-content: center !important;
            font-size: 0.94rem !important;
            font-weight: 800 !important;
            padding: 0.68rem 1rem !important;
            border-radius: 10px !important;
            min-height: 42px !important;
          }

          .hero-sub-cta {
            width: 100% !important;
            min-height: 38px !important;
            padding: 0.55rem 0.45rem !important;
            font-size: 0.85rem !important;
            font-weight: 700 !important;
            border-radius: 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.35rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
