import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  ShoppingBag, 
  ShieldCheck, 
  Heart, 
  Activity, 
  Sparkles, 
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo, heroSlidesData } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const Hero = ({ onOpenConsultation }) => {
  const { language } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState({});
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = heroSlidesData && heroSlidesData.length > 0 ? heroSlidesData : [
    {
      id: 1,
      titleEn: "Antox D & T Formula",
      titleMr: "Antox D & T (मधुमेह नियंत्रण आणि डिटॉक्स)",
      badgeEn: "Antox Herbal Care",
      badgeMr: "Antox आयुर्वेदिक मालिका",
      image: "https://samarthkolhapur.com/wp-content/uploads/2026/04/Antox-D-T.jpeg",
      fallbackImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
      descriptionEn: "Natural Ayurvedic formula for blood sugar balance, pancreatic health, and metabolic detox.",
      descriptionMr: "रक्तातील साखर नियंत्रण, स्वादुपिंड पोषण आणि शरीर शुद्धीकरणासाठी प्रभावी आयुर्वेदिक फॉर्म्युला.",
      link: "/shop",
      ctaEn: "Order Formula",
      ctaMr: "फॉर्म्युला मागवा"
    }
  ];

  const currentSlide = slides[activeSlide] || slides[0];

  // Auto-play interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleImageError = (slideId) => {
    setImageErrorMap((prev) => ({ ...prev, [slideId]: true }));
  };

  return (
    <section className="hero-section" style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
      color: '#ffffff',
      padding: '0.5rem 0 2.5rem 0',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Circles */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0) 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, rgba(6, 78, 59, 0) 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '2.5rem',
          alignItems: 'center'
        }} className="hero-grid">
          {/* Left Column: Heading & Content */}
          <div>
            {/* Campaign Badge */}
            <div 
              className="hero-slide-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#fef3c7',
                fontSize: '0.88rem',
                fontWeight: 600,
                marginBottom: '0.65rem'
              }}
            >
              <Sparkles size={16} style={{ color: '#fbbf24' }} />
              <span>
                {language === 'mr' ? 'मधुमेह मुक्त भारत आणि व्यसनमुक्त भारत अभियान' : 'National Health & De-Addiction Initiative'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '0.85rem',
              letterSpacing: '-0.02em'
            }} className="hero-title">
              {language === 'mr' ? (
                <>
                  <span style={{ color: '#a7f3d0' }}>सहारा सोशल फाऊंडेशन</span>, कोल्हापूर<br />
                  <span style={{ color: '#fef3c7', fontSize: '2.4rem' }}>मधुमेह मुक्त भारत अभियान</span>
                </>
              ) : (
                <>
                  <span style={{ color: '#a7f3d0' }}>Sahara Social Foundation</span><br />
                  <span style={{ color: '#fef3c7', fontSize: '2.3rem' }}>Diabetes-Free India Campaign</span>
                </>
              )}
            </h1>

            {/* Supporting Text */}
            <p style={{
              fontSize: '1.15rem',
              color: '#d1fae5',
              lineHeight: 1.6,
              marginBottom: '1rem',
              maxWidth: '620px'
            }}>
              {language === 'mr'
                ? 'आधार मधुमेह-मुक्ती मार्गदर्शन केंद्राच्या सहयोगाने नैसर्गिक आयुर्वेदिक फॉर्म्युला, योग्य आहाराचे पथ्य आणि समुपदेशनाद्वारे रक्तातील साखर व व्यसनावर मात करण्यासाठी प्रभावी मार्गदर्शन.'
                : 'In collaboration with Aadhar Madhumeh-Mukti Margdarshan Kendra, delivering authentic Ayurvedic wellness formulas, dietary counseling, and dedicated guidance for diabetes control and de-addiction.'}
            </p>

            {/* Key Notice Strip in Hero */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderLeft: '4px solid #34d399',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#fef3c7',
              marginBottom: '1.25rem',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <ShieldCheck size={20} style={{ color: '#34d399', flexShrink: 0 }} />
              <span>
                {language === 'mr'
                  ? 'नोंदणीकृत सामाजिक संस्था (Reg. No. MAH/582/2014/KOP) • अधिकृत आयुर्वेद सल्ला'
                  : 'Registered Foundation (Reg. No. MAH/582/2014/KOP) • Authentic Ayurvedic Guidance'}
              </span>
            </div>

            {/* CTA Action Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={onOpenConsultation}
                className="btn btn-accent btn-lg"
                style={{
                  boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)'
                }}
              >
                <Heart size={18} />
                <span>{language === 'mr' ? 'मोफत मार्गदर्शन अर्ज' : 'Free Consultation'}</span>
              </button>

              <a
                href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
                  language === 'mr'
                    ? 'नमस्कार, मला मधुमेह मुक्ती अभियानाबद्दल माहिती हवी आहे.'
                    : 'Hello, I want details about the Diabetes-Free India campaign.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <WhatsAppIcon size={18} />
                <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅपवर बोला' : 'WhatsApp Us'}</span>
              </a>

              <a
                href={`tel:${organizationInfo.contact.primaryPhone}`}
                className="btn btn-call btn-lg"
              >
                <Phone size={18} />
                <span>{language === 'mr' ? 'कॉल करा: ८४२११५४०९०' : 'Call: 8421154090'}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual Slideshow Card */}
          <div style={{ position: 'relative' }}>
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '1rem',
                color: '#1e293b',
                boxShadow: '0 20px 45px -12px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                position: 'relative'
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Card Top Header Strip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                padding: '0 0.25rem'
              }}>
                {/* Antox Herbal Care Brand Pill */}
                <div style={{
                  backgroundColor: '#064e3b',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  boxShadow: '0 2px 6px rgba(6, 78, 59, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                  {language === 'mr' ? currentSlide.badgeMr : currentSlide.badgeEn}
                </div>

                {/* Slide Index Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ecfdf5',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px'
                  }}>
                    {language === 'mr' ? currentSlide.categoryMr : currentSlide.categoryEn}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#475569',
                    backgroundColor: '#f1f5f9',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px'
                  }}>
                    {activeSlide + 1} / {slides.length}
                  </span>
                </div>
              </div>

              {/* Slideshow Image Box Frame - Fitted perfectly to avoid cropping */}
              <div style={{
                position: 'relative',
                borderRadius: '14px',
                overflow: 'hidden',
                marginBottom: '0.65rem',
                aspectRatio: '16/9.5',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
              }}>
                {/* Active Slide Image - object-fit contain so all text & graphics are 100% visible */}
                <img
                  key={currentSlide.id}
                  src={imageErrorMap[currentSlide.id] ? currentSlide.fallbackImage : currentSlide.image}
                  alt={language === 'mr' ? currentSlide.titleMr : currentSlide.titleEn}
                  onError={() => handleImageError(currentSlide.id)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    backgroundColor: '#ffffff'
                  }}
                />

                {/* Left Navigation Arrow */}
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous Slide"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '8px',
                    transform: 'translateY(-50%)',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(4px)',
                    color: '#064e3b',
                    border: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
                    transition: 'all 0.2s ease',
                    zIndex: 4
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>

                {/* Right Navigation Arrow */}
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next Slide"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '8px',
                    transform: 'translateY(-50%)',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(4px)',
                    color: '#064e3b',
                    border: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
                    transition: 'all 0.2s ease',
                    zIndex: 4
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Pagination Dots Placed Cleanly Below Image */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '5px',
                alignItems: 'center',
                marginBottom: '0.65rem'
              }}>
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    style={{
                      width: activeSlide === idx ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '9999px',
                      backgroundColor: activeSlide === idx ? '#059669' : '#cbd5e1',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>

              {/* Slide Text Content & Highlights */}
              <div style={{ minHeight: '56px', marginBottom: '0.65rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#064e3b', margin: '0 0 0.2rem 0' }}>
                  {language === 'mr' ? currentSlide.titleMr : currentSlide.titleEn}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                  {language === 'mr' ? currentSlide.descriptionMr : currentSlide.descriptionEn}
                </p>
              </div>

              {/* Key Trust Badges Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.4rem',
                paddingTop: '0.6rem',
                borderTop: '1px solid #e2e8f0',
                marginBottom: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={15} style={{ color: '#059669', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                    {language === 'mr' ? '१००% आयुर्वेदिक' : '100% Ayurvedic'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Activity size={15} style={{ color: '#059669', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                    {language === 'mr' ? 'आहार व पथ्य' : 'Dietary Pathya'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={15} style={{ color: '#059669', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                    {language === 'mr' ? 'फोनवर मार्गदर्शन' : 'Phone Guidance'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Heart size={15} style={{ color: '#059669', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                    {language === 'mr' ? 'हजारो लाभार्थी' : 'Statewide Reach'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <Link
                  to={currentSlide.link || '/shop'}
                  className="btn btn-primary"
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    justifyContent: 'center',
                    backgroundColor: '#065f46',
                    borderColor: '#065f46'
                  }}
                >
                  <ShoppingBag size={14} />
                  <span>{language === 'mr' ? currentSlide.ctaMr : currentSlide.ctaEn}</span>
                </Link>

                <button
                  type="button"
                  onClick={onOpenConsultation}
                  className="btn btn-outline"
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    justifyContent: 'center'
                  }}
                >
                  <span>{language === 'mr' ? 'मोफत सल्ला' : 'Free Advice'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Interactive Thumbnail Carousel Strip */}
              <div style={{
                display: 'flex',
                gap: '6px',
                marginTop: '0.65rem',
                paddingTop: '0.6rem',
                borderTop: '1px solid #f1f5f9',
                overflowX: 'auto',
                paddingBottom: '2px',
                scrollbarWidth: 'none'
              }}>
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    style={{
                      width: '42px',
                      height: '30px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: activeSlide === idx ? '2px solid #059669' : '1px solid #e2e8f0',
                      padding: 0,
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      flexShrink: 0,
                      opacity: activeSlide === idx ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                      boxShadow: activeSlide === idx ? '0 0 0 2px rgba(5,150,105,0.2)' : 'none'
                    }}
                    title={language === 'mr' ? slide.titleMr : slide.titleEn}
                  >
                    <img
                      src={imageErrorMap[slide.id] ? slide.fallbackImage : slide.image}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#ffffff' }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding: 0.5rem 0 2.5rem 0;
        }
        @media (max-width: 960px) {
          .hero-section {
            padding: 0.5rem 0 1.75rem 0 !important;
          }
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .hero-title {
            font-size: 2.15rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
