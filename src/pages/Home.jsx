import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag, 
  Play, 
  Phone, 
  Heart, 
  Sparkles,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import Hero from '../components/Hero';
import QuickActionBar from '../components/QuickActionBar';
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

  return (
    <div className="home-page">
      {/* Hero Section */}
      <Hero onOpenConsultation={() => setIsConsultationOpen(true)} />

      {/* Quick Action Bar */}
      <QuickActionBar onOpenConsultation={() => setIsConsultationOpen(true)} />

      {/* Trust & Scientific Ayurvedic Highlights */}
      <TrustSection />

      {/* About Sahara Social Foundation & Mission/Vision */}
      <AboutSection />

      {/* Major Campaigns Section */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Sparkles size={16} />
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
      <section className="section" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <ShieldCheck size={16} />
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

      {/* Product / Shop Section */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          {/* Important Notice Before Shop */}
          <div className="notice-strip" style={{ marginBottom: '2.5rem' }}>
            <ShieldCheck size={22} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>{language === 'mr' ? 'महत्त्वाची सूचना:' : 'Important Regimen Note:'}</strong>{' '}
              {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
            </div>
          </div>

          <div className="section-header">
            <div className="section-badge">
              <ShoppingBag size={16} />
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

          <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
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

      {/* Result Videos Section */}
      <section className="section" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Play size={16} />
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

          {/* 9:16 Vertical Reels Grid (Featured 4) */}
          <div className="grid-reels" style={{ marginBottom: '2.5rem' }}>
            {resultVideos.slice(0, 4).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/videos" className="btn btn-outline btn-lg" style={{ gap: '0.6rem' }}>
              <Play size={18} />
              <span>{language === 'mr' ? 'सर्व १२ व्हिडिओ व रील्स पहा' : 'View All 12 Videos & Reels'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials / Reviews Section */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Heart size={16} />
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
      <section className="section-sm" style={{ backgroundColor: '#f0fdf4' }}>
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
              <h2 style={{ fontSize: '1.85rem', color: '#064e3b' }}>
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
                  boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                  backgroundColor: '#0f172a'
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
                  background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)'
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
      <section className="section-sm" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <div className="section-badge">
              <ShieldCheck size={16} />
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
                  padding: '1.25rem 1.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#064e3b', marginBottom: '0.4rem' }}>
                  Q: {language === 'mr' ? faq.qMr : faq.qEn}
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {language === 'mr' ? faq.aMr : faq.aEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
        color: '#ffffff',
        padding: '4.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
            {language === 'mr'
              ? 'आजच निरोगी आणि व्यसनमुक्त आयुष्याकडे पाऊल टाका'
              : 'Take the Step Towards a Healthier, Addiction-Free Life Today'}
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#d1fae5', lineHeight: 1.6, marginBottom: '2rem' }}>
            {language === 'mr'
              ? 'सहारा सोशल फाऊंडेशनच्या तज्ज्ञ समुपदेशकांकडून मोफत फोन मार्गदर्शन मिळवण्यासाठी आताच संपर्क साधा किंवा फॉर्म्युला मागवा.'
              : 'Contact our helpline at 8421154090 or explore our authentic Ayurvedic kits.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn-light-primary btn-lg">
              <ShoppingBag size={18} />
              <span>{language === 'mr' ? 'फॉर्म्युला ऑर्डर करा' : 'Order Formula Online'}</span>
            </Link>

            <a
              href={`tel:${organizationInfo.contact.primaryPhone}`}
              className="btn btn-call btn-lg"
            >
              <Phone size={18} />
              <span>{language === 'mr' ? 'कॉल करा: ८४२११५४०९०' : 'Call 8421154090'}</span>
            </a>

            <button
              onClick={() => setIsConsultationOpen(true)}
              className="btn btn-outline btn-lg"
              style={{ borderColor: '#ffffff', color: '#ffffff' }}
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
