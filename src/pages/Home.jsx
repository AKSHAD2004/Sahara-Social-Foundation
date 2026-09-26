import React, { useState, useRef } from 'react';
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
import VideoCard from '../components/VideoCard';
import ConsultationModal from '../components/ConsultationModal';

import { 
  organizationInfo, 
  campaignsData, 
  healthCategories, 
  productsData, 
  resultVideos, 
  testimonialsData, 
  galleryPhotos, 
  faqsData
} from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { language } = useLanguage();
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const reelsScrollRef = useRef(null);

  const scrollReels = (direction) => {
    if (reelsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      reelsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <Hero onOpenConsultation={() => setIsConsultationOpen(true)} />

      {/* Product / Shop Section (Moved Upside First) */}
      <section className="section" style={{ backgroundColor: '#ffffff', paddingTop: '3.5rem' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <ShoppingBag size={15} />
              <span>{language === 'mr' ? 'Antox आयुर्वेदिक उत्पादने' : 'Antox Formulations'}</span>
            </div>
            <h2>
              {language === 'mr' ? 'आमची निवडक आयुर्वेदिक उत्पादने' : 'Featured Ayurvedic Formulas'}
            </h2>
            <p>
              {language === 'mr'
                ? 'शास्त्रीय पद्धतीनुसार तयार केलेले १००% शुद्ध व सुरक्षित आयुर्वेदिक फॉर्म्युला.'
                : 'Authentic botanical health products manufactured with stringent quality and safety.'}
            </p>
          </div>

          <div className="products-grid" style={{ marginBottom: '2.5rem' }}>
            {productsData.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/shop" className="btn btn-primary btn-lg">
              <ShoppingBag size={18} />
              <span>{language === 'mr' ? 'सर्व उत्पादने पहा आणि ऑर्डर करा' : 'Explore Complete Shop'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Result Videos / Reels Horizontal Slider Section */}
      <section className="section" style={{ backgroundColor: '#F5F7FA', borderTop: '1px solid #e2eaf4' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '1.75rem' }}>
            <div className="section-badge">
              <Play size={15} />
              <span>{language === 'mr' ? 'प्रत्यक्ष परिणाम व अनुभव' : 'Patient Experiences'}</span>
            </div>
            <h2>
              {language === 'mr' ? 'लाभार्थ्यांचे मनोगत व व्हिडिओ' : 'Result & Beneficiary Videos'}
            </h2>
            <p>
              {language === 'mr'
                ? 'मधुमेह नियंत्रण, व्यसनमुक्ती आणि सांधेदुखीत आराम मिळालेल्या रुग्णांचे प्रत्यक्ष अनुभव.'
                : 'Real video experiences of patients who regained health through our counseling and formulas.'}
            </p>
          </div>

          {/* Slider Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            padding: '0 0.25rem'
          }}>
            <div style={{ fontSize: '0.86rem', color: '#4f6182', fontWeight: 600 }}>
              {language === 'mr' ? '👈 डावीकडे / उजवीकडे स्वाइप करा' : '👈 Swipe / Slide horizontally 👉'}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => scrollReels('left')}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2eaf4',
                  color: '#12355B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(18,53,91,0.08)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#12355B'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#12355B'; }}
                aria-label="Previous reel"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => scrollReels('right')}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2eaf4',
                  color: '#12355B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(18,53,91,0.08)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#12355B'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#12355B'; }}
                aria-label="Next reel"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Horizontal Reels Slider Track */}
          <div
            ref={reelsScrollRef}
            style={{
              display: 'flex',
              gap: '1.15rem',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '1.5rem',
              marginBottom: '1.5rem'
            }}
            className="reels-slider-track"
          >
            {resultVideos.map((video) => (
              <div
                key={video.id}
                style={{
                  flex: '0 0 clamp(250px, 72vw, 290px)',
                  scrollSnapAlign: 'start'
                }}
              >
                <VideoCard video={video} />
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/videos" className="btn btn-outline btn-lg" style={{ gap: '0.6rem' }}>
              <Play size={18} />
              <span>{language === 'mr' ? 'सर्व व्हिडिओ व रील्स पहा' : 'Explore All Videos & Reels'}</span>
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
                : 'Pioneering health movements delivering authentic Ayurvedic counseling, dietary pathya, and herbal support.'}
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
      <section className="section" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <ShieldCheck size={15} />
              <span>{language === 'mr' ? 'आरोग्य मार्गदर्शन वर्ग' : 'Health Categories'}</span>
            </div>
            <h2>
              {language === 'mr' ? 'आरोग्य समस्या व आयुर्वेदिक मार्गदर्शन' : 'Health Conditions & Ayurvedic Care'}
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

      {/* Testimonials / Reviews Section */}
      <section className="section" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2eaf4' }}>
        <div className="container">
          <div className="section-header">
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

          <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
            {testimonialsData.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="section-sm" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2eaf4' }}>
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
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', color: '#12355B', margin: 0 }}>
                {language === 'mr' ? 'संस्थेचे आरोग्य उपक्रम व शिबिरे' : 'Health Camps & Field Activities'}
              </h2>
            </div>

            <Link to="/photos" className="btn btn-outline btn-sm">
              <span>{language === 'mr' ? 'सर्व फोटो पहा' : 'View Full Gallery'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid-3">
            {galleryPhotos.slice(0, 3).map((photo) => (
              <div
                key={photo.id}
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  height: '240px',
                  boxShadow: '0 4px 15px rgba(18,53,91,0.08)',
                  backgroundColor: '#0a1b2e'
                }}
              >
                <img
                  src={photo.image}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = photo.fallback;
                  }}
                  alt={photo.titleMr || photo.titleEn}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10,27,46,0.85) 0%, transparent 60%)'
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
      </section>

      {/* Frequently Asked Questions */}
      <section className="section-sm" style={{ backgroundColor: '#F5F7FA', borderTop: '1px solid #e2eaf4' }}>
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
                  border: '1px solid #e2eaf4',
                  boxShadow: '0 2px 8px rgba(18,53,91,0.04)'
                }}
              >
                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#12355B', marginBottom: '0.35rem' }}>
                  Q: {language === 'mr' ? faq.qMr : faq.qEn}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#4f6182', lineHeight: 1.6, margin: 0 }}>
                  {language === 'mr' ? faq.aMr : faq.aEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #12355B 0%, #087E8B 100%)',
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
          <p style={{ fontSize: 'clamp(0.95rem, 1vw + 0.5rem, 1.1rem)', color: '#e2effc', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            {language === 'mr'
              ? 'सहारा सोशल फाऊंडेशनच्या तज्ज्ञ समुपदेशकांकडून मोफत फोन मार्गदर्शन मिळवण्यासाठी आताच संपर्क साधा किंवा फॉर्म्युला मागवा.'
              : 'Contact our helpline at 8421154090 or explore our authentic Ayurvedic kits.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn-light-primary btn-lg" style={{ backgroundColor: '#F4A261', color: '#172033', fontWeight: 700 }}>
              <ShoppingBag size={18} />
              <span>{language === 'mr' ? 'फॉर्म्युला ऑर्डर करा' : 'Order Formula Online'}</span>
            </Link>

            <a
              href={`tel:${organizationInfo.contact.primaryPhone}`}
              className="btn btn-call btn-lg"
            >
              <Phone size={18} />
              <span>{language === 'mr' ? 'कॉल: ८४२११५४०९०' : 'Call 8421154090'}</span>
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
