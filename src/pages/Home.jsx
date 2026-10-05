import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag, 
  Play, 
  Phone, 
  Heart, 
  Sparkles, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Hero from '../components/Hero';
import TrustSection from '../components/TrustSection';
import AboutSection from '../components/AboutSection';
import CampaignCard from '../components/CampaignCard';
import ServiceCard from '../components/ServiceCard';
import ProductCard from '../components/ProductCard';
import TestimonialCard from '../components/TestimonialCard';
import HorizontalVideoCard from '../components/HorizontalVideoCard';
import ConsultationModal from '../components/ConsultationModal';

import { 
  organizationInfo, 
  campaignsData, 
  healthCategories, 
  productsData, 
  horizontalVideosData,
  resultVideos, 
  testimonialsData, 
  galleryPhotos, 
  faqsData
} from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

// 9. Testimonials Smooth Auto-sliding Carousel Component
const TestimonialsCarousel = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = testimonialsData.length;

  // Auto-slide every 5.5s, pause on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, total]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Visible items (pair of 2 for desktop, 1 for mobile)
  const firstItem = testimonialsData[currentIndex];
  const secondItem = testimonialsData[(currentIndex + 1) % total];

  return (
    <section 
      className="section testimonials-section" 
      style={{ backgroundColor: '#ffffff', borderTop: '1px solid #E1E9DF', position: 'relative' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <div className="section-badge">
            <Heart size={15} />
            <span>{language === 'mr' ? 'रुग्णांचा विश्वास' : 'Patient Reviews'}</span>
          </div>
          <h2>
            {language === 'mr' ? 'समाधानी रुग्णांचे अभिप्राय' : 'What Our Beneficiaries Say'}
          </h2>
          <p>
            {language === 'mr'
              ? 'कोल्हापूर, सांगली, सातारा, पुणे व महाराष्ट्रातील रुग्णांनी नोंदवलेले प्रामाणिक अनुभव.'
              : 'Genuine feedback from individuals and families supported by Sahara Social Foundation.'}
          </p>
        </div>

        {/* Carousel Container */}
        <div style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto' }}>
          <div className="testimonials-carousel-grid">
            <div className="testimonials-slide-anim">
              <TestimonialCard testimonial={firstItem} />
            </div>
            <div className="testimonials-slide-anim desktop-only-slide">
              <TestimonialCard testimonial={secondItem} />
            </div>
          </div>

          {/* Nav Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.25rem',
            marginTop: '1.75rem'
          }}>
            <button
              type="button"
              onClick={handlePrev}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1.5px solid #E1E9DF',
                color: '#006B2D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 107, 45, 0.08)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#006B2D'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#006B2D'; }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Pagination Dots */}
            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
              {testimonialsData.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  style={{
                    width: dotIdx === currentIndex ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: dotIdx === currentIndex ? '#006B2D' : '#E1E9DF',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1.5px solid #E1E9DF',
                color: '#006B2D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 107, 45, 0.08)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#006B2D'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#006B2D'; }}
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .testimonials-carousel-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .testimonials-slide-anim {
          animation: testimonialSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes testimonialSlideIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 768px) {
          .testimonials-carousel-grid {
            grid-template-columns: 1fr;
          }
          .desktop-only-slide {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

// 8. Gallery Staggered Reveal Component (0ms, 100ms, 200ms scale 0.95 -> 1, opacity 0 -> 1)
const GalleryStaggeredPreview = () => {
  const { language } = useLanguage();
  const [inView, setInView] = useState(false);
  const galleryRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (galleryRef.current) observer.observe(galleryRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={galleryRef} className={`section-sm gallery-section ${inView ? 'gallery-in-view' : ''}`} style={{ backgroundColor: '#ffffff', borderTop: '1px solid #E1E9DF' }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div className="section-badge">
              <Sparkles size={14} />
              <span>{language === 'mr' ? 'छायाचित्रे' : 'Photo Gallery'}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', color: '#006B2D', margin: 0 }}>
              {language === 'mr' ? 'संस्थेचे आरोग्य उपक्रम व शिबिरे' : 'Health Camps & Field Activities'}
            </h2>
          </div>

          <Link to="/photos" className="btn btn-outline btn-sm">
            <span>{language === 'mr' ? 'सर्व फोटो पहा' : 'View Full Gallery'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid-3 gallery-stagger-grid">
          {galleryPhotos.slice(0, 3).map((photo, index) => (
            <div
              key={photo.id}
              className={`gallery-reveal-card gallery-delay-${index + 1}`}
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                height: '240px',
                boxShadow: '0 4px 15px rgba(0, 107, 45, 0.08)',
                backgroundColor: '#04200e'
              }}
            >
              <img
                src={photo.image}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = photo.fallback;
                }}
                alt={photo.titleMr || photo.titleEn}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                className="gallery-zoom-img"
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(4,32,14,0.9) 0%, transparent 60%)'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                right: '1rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700
              }}>
                {language === 'mr' ? photo.titleMr : photo.titleEn}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .gallery-reveal-card {
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gallery-in-view .gallery-delay-1 {
          opacity: 1;
          transform: scale(1);
          transition-delay: 0ms;
        }

        .gallery-in-view .gallery-delay-2 {
          opacity: 1;
          transform: scale(1);
          transition-delay: 100ms;
        }

        .gallery-in-view .gallery-delay-3 {
          opacity: 1;
          transform: scale(1);
          transition-delay: 200ms;
        }

        .gallery-reveal-card:hover .gallery-zoom-img {
          transform: scale(1.06);
        }
      `}</style>
    </section>
  );
};

const Home = () => {
  const { language } = useLanguage();
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <Hero onOpenConsultation={() => setIsConsultationOpen(true)} />

      {/* Product / Shop Section (Moved Upside First) */}
      <section className="section home-products-section" style={{ backgroundColor: '#ffffff', paddingTop: '2.5rem' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <ShoppingBag size={15} />
              <span>{language === 'mr' ? 'आयुर्वेदिक उत्पादने' : 'Products'}</span>
            </div>
            <h2>
              {language === 'mr' ? 'आमची निवडक आयुर्वेदिक उत्पादने' : 'Featured Nutraceutical Products'}
            </h2>
            <p>
              {language === 'mr'
                ? 'शास्त्रीय पद्धतीनुसार तयार केलेले १००% शुद्ध व सुरक्षित आयुर्वेदिक फॉर्म्युला.'
                : 'Authentic botanical health products manufactured with stringent quality and safety.'}
            </p>
          </div>

          <div className="products-grid" style={{ marginBottom: '2.5rem' }}>
            {productsData.slice(0, 9).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/shop" className="btn btn-primary btn-lg">
              <ShoppingBag size={18} />
              <span>{language === 'mr' ? 'सर्व उत्पादने पहा आणि ऑर्डर करा' : 'Explore All Products'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Official Beneficiary & Campaign Videos from samarthkolhapur.com */}
      <section className="section home-videos-section" style={{ backgroundColor: '#F3F8F1', borderTop: '1px solid #E1E9DF' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <div className="section-badge">
              <Play size={15} />
              <span>{language === 'mr' ? 'अधिकृत व्हिडिओ निकाल' : 'Official Result Videos'}</span>
            </div>
            <h2>
              {language === 'mr' ? 'सहारा सोशल फाऊंडेशन - प्रत्यक्ष निकाल व्हिडिओ' : 'Official Patient Recovery & Beneficiary Videos'}
            </h2>
            <p>
              {language === 'mr'
                ? 'samarthkolhapur.com वरील अधिकृत व्हिडिओ: Antox D & T चा प्रत्यक्ष वापर आणि शुगरमुक्ती अभियानाचे अनुभव.'
                : 'Direct recorded testimonials from samarthkolhapur.com: Antox D & T patient results and Sugar-Free Mission.'}
            </p>
          </div>

          {/* Featured Primary Videos Grid (Matching Image 2 from samarthkolhapur.com) */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
              gap: '1.75rem',
              marginBottom: '2rem'
            }}
          >
            {horizontalVideosData.slice(0, 2).map((video) => (
              <HorizontalVideoCard key={video.id} video={video} />
            ))}
          </div>

          {/* "More Videos" Action Button */}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link 
              to="/videos" 
              className="btn btn-primary btn-lg" 
              style={{ 
                gap: '0.75rem', 
                padding: '0.95rem 2.8rem', 
                borderRadius: '9999px',
                fontSize: '1.05rem',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(0, 107, 45, 0.22)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Play size={20} fill="currentColor" />
              <span>{language === 'mr' ? 'More Videos (अधिक व्हिडिओ पहा)' : 'More Videos'}</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Scientific Ayurvedic Highlights */}
      <TrustSection />

      {/* About Sahara Social Foundation & Mission/Vision */}
      <AboutSection />

      {/* Major Campaigns Section */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Sparkles size={15} />
              <span>{language === 'mr' ? 'प्रमुख राष्ट्रीय मोहिमा' : 'Flagship Campaigns'}</span>
            </div>
            <h2>
              {language === 'mr' ? 'आमची सामाजिक व आरोग्य अभियाने' : 'Our Flagship Health Initiatives'}
            </h2>
            <p>
              {language === 'mr'
                ? 'मधुमेह आणि व्यसनाधीनतेविरुद्धच्या लढ्यात नागरिकांना योग्य दिशा, मार्गदर्शन आणि नैसर्गिक उपचार देणारे उपक्रम.'
                : 'Pioneering health movements delivering authentic Nutraceutical counseling, dietary pathya, and herbal support.'}
            </p>
          </div>

          <div className="grid-2">
            {campaignsData.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onOpenConsultation={() => setIsConsultationOpen(true)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Health Categories / Services Grid */}
      <section className="section" style={{ backgroundColor: '#F3F8F1' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <ShieldCheck size={15} />
              <span>{language === 'mr' ? 'आरोग्य मार्गदर्शन वर्ग' : 'Health Categories'}</span>
            </div>
            <h2>
              {language === 'mr' ? 'आरोग्य समस्या व आयुर्वेदिक मार्गदर्शन' : 'Health Conditions & Nutraceutical Care'}
            </h2>
            <p>
              {language === 'mr'
                ? 'विविध जुनाट व जीवनशैली विकारांवर योग्य समुपदेशन आणि शुद्ध वनौषधींचा आधार.'
                : 'Comprehensive herbal support and lifestyle counseling across primary health categories.'}
            </p>
          </div>

          <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
            {healthCategories.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onOpenConsultation={() => setIsConsultationOpen(true)}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/services" className="btn btn-primary">
              <span>{language === 'mr' ? 'सर्व आरोग्य सेवा पहा' : 'View All Health Services'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Testimonials / Reviews Smooth Auto-Sliding Carousel Section */}
      <TestimonialsCarousel />

      {/* 8. Gallery Staggered Reveal Preview */}
      <GalleryStaggeredPreview />

      {/* Frequently Asked Questions */}
      <section className="section-sm" style={{ backgroundColor: '#F3F8F1', borderTop: '1px solid #E1E9DF' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <div className="section-badge">
              <ShieldCheck size={15} />
              <span>{language === 'mr' ? 'वारंवार विचारले जाणारे प्रश्न' : 'Frequently Asked Questions'}</span>
            </div>
            <h2>{language === 'mr' ? 'महत्त्वाचे प्रश्न आणि उत्तरे' : 'Important Questions Answered'}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqsData.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '1.25rem 1.4rem',
                  border: '1px solid #E1E9DF',
                  boxShadow: '0 2px 8px rgba(0, 107, 45, 0.04)'
                }}
              >
                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#006B2D', marginBottom: '0.35rem' }}>
                  Q: {language === 'mr' ? faq.qMr : faq.qEn}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#5F6B61', lineHeight: 1.6, margin: 0 }}>
                  {language === 'mr' ? faq.aMr : faq.aEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #006B2D 0%, #04200e 100%)',
        color: '#ffffff',
        padding: '3.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw + 0.5rem, 2.3rem)', fontWeight: 800, color: '#ffffff', marginBottom: '0.85rem' }}>
            {language === 'mr'
              ? 'आजच निरोगी आणि व्यसनमुक्त आयुष्याकडे पाऊल टाका'
              : 'Take the Step Towards a Healthier, Addiction-Free Life Today'}
          </h2>
          <p style={{ fontSize: 'clamp(0.95rem, 1vw + 0.5rem, 1.1rem)', color: '#d6fae0', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            {language === 'mr'
              ? 'सहारा सोशल फाऊंडेशनच्या तज्ज्ञ समुपदेशकांकडून मोफत फोन मार्गदर्शन मिळवण्यासाठी आताच संपर्क साधा किंवा फॉर्म्युला मागवा.'
              : 'Contact our helpline at 7745066707 or explore our authentic Nutraceutical kits.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn-accent btn-lg" style={{ backgroundColor: '#FFC928', color: '#17251B', fontWeight: 700 }}>
              <ShoppingBag size={18} />
              <span>{language === 'mr' ? 'फॉर्म्युला ऑर्डर करा' : 'Order Formula Online'}</span>
            </Link>

            <a
              href={`tel:${organizationInfo.contact.primaryPhone}`}
              className="btn btn-call btn-lg"
            >
              <Phone size={18} />
              <span>{language === 'mr' ? 'कॉल: ७७४५०६६७०७' : 'Call 7745066707'}</span>
            </a>

            <button
              type="button"
              onClick={() => setIsConsultationOpen(true)}
              className="btn btn-outline btn-lg"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Calendar size={18} />
              <span>{language === 'mr' ? 'मोफत नोंदणी' : 'Book Consultation'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default Home;
