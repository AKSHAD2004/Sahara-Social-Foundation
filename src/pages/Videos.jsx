import React, { useState } from 'react';
import { Play, Sparkles, Phone, Video as VideoIcon, CheckCircle2 } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import VideoCard from '../components/VideoCard';
import HorizontalVideoCard from '../components/HorizontalVideoCard';
import { resultVideos, horizontalVideosData, organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const Videos = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { id: 'All', nameEn: 'All Videos', nameMr: 'सर्व व्हिडिओ' },
    { id: 'Diabetes', nameEn: 'Diabetes (मधुमेह)', nameMr: 'मधुमेह मुक्ती' },
    { id: 'Addiction', nameEn: 'De-Addiction (व्यसनमुक्ती)', nameMr: 'व्यसनमुक्त भारत' },
    { id: 'Bones', nameEn: 'Joint Pain (सांधेदुखी)', nameMr: 'सांधेदुखी व हाडे' },
    { id: 'Acidity', nameEn: 'Acidity & Digestion', nameMr: 'पित्त व पचन' },
    { id: 'Ayurveda', nameEn: 'Ayurveda & Guidance', nameMr: 'आयुर्वेद व पथ्य' },
    { id: 'Camps', nameEn: 'Health Camps', nameMr: 'आरोग्य शिबिरे' }
  ];

  const filteredHorizontalVideos = selectedCategory === 'All'
    ? horizontalVideosData
    : horizontalVideosData.filter((v) => v.category === selectedCategory);

  const filteredReels = selectedCategory === 'All'
    ? resultVideos
    : resultVideos.filter((v) => v.category === selectedCategory);

  return (
    <div className="videos-page">
      {/* Header */}
      <div className="page-hero-header">
        <div className="container">
          <div className="section-badge">
            <VideoIcon size={14} />
            <span>{language === 'mr' ? 'अधिकृत व्हिडिओ संग्रह' : 'Official Result Videos'}</span>
          </div>
          <h1>
            {language === 'mr' ? 'लाभार्थ्यांचे मनोगत व प्रत्यक्ष निकाल व्हिडिओ' : 'Patient Recovery & Beneficiary Videos'}
          </h1>
          <p>
            {language === 'mr'
              ? 'मधुमेह मुक्त भारत व व्यसनमुक्त भारत अभियानांतर्गत सहारा सोशल फाऊंडेशनच्या संपर्कात येऊन आजारांवर मात केलेल्या रुग्णांचे प्रत्यक्ष मनोगत.'
              : 'Authentic recorded testimonials and clinical counseling videos directly from Sahara Social Foundation, Kolhapur.'}
          </p>
        </div>
      </div>

      <section className="section" style={{ backgroundColor: '#F3F8F1' }}>
        <div className="container">
          {/* Category Filter Chips */}
          <div className="videos-filter-chips" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.6rem',
            flexWrap: 'wrap',
            marginBottom: '3rem'
          }}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.55rem 1.35rem',
                    borderRadius: '9999px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    border: '1.5px solid',
                    borderColor: isActive ? '#006B2D' : '#E1E9DF',
                    backgroundColor: isActive ? '#006B2D' : '#ffffff',
                    color: isActive ? '#ffffff' : '#17251B',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 12px rgba(0, 107, 45, 0.25)' : '0 2px 6px rgba(0, 107, 45, 0.04)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {language === 'mr' ? cat.nameMr : cat.nameEn}
                </button>
              );
            })}
          </div>

          {/* Authentic Videos Grid (Direct from samarthkolhapur.com) */}
          {filteredHorizontalVideos.length > 0 && (
            <div style={{ marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <Sparkles size={20} style={{ color: '#006B2D' }} />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#17251B', margin: 0 }}>
                  {language === 'mr' ? 'अधिकृत निकाल व्हिडिओ (samarthkolhapur.com)' : 'Featured Patient Recovery Videos'}
                </h2>
              </div>
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
                  gap: '1.75rem'
                }}
              >
                {filteredHorizontalVideos.map((video) => (
                  <HorizontalVideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          )}

          {/* 9:16 Vertical Reels & Guidance Grid */}
          {filteredReels.length > 0 && (
            <div style={{ marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <Play size={20} style={{ color: '#006B2D' }} />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#17251B', margin: 0 }}>
                  {language === 'mr' ? 'लघु व्हिडिओ व मार्गदर्शन' : 'Short Video Stories & Guidance'}
                </h2>
              </div>
              <div className="grid-reels videos-grid-reels">
                {filteredReels.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          )}

          {/* Video Counseling Strip */}
          <div className="videos-counseling-strip" style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 10px 30px rgba(0, 107, 45, 0.05)',
            border: '1px solid #E1E9DF',
            textAlign: 'center',
            maxWidth: '840px',
            margin: '0 auto'
          }}>
            <h3 style={{ fontSize: '1.5rem', color: '#006B2D', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? 'आपलाही अनुभव शेअर करायचा आहे किंवा सल्ला हवा आहे?' : 'Want to Share Your Story or Consult With Our Health Staff?'}
            </h3>
            <p style={{ color: '#5F6B61', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {language === 'mr'
                ? 'सहारा सोशल फाऊंडेशनच्या कोल्हापूर कार्यालयाशी थेट संपर्क साधा आणि मोफत फोन मार्गदर्शन मिळवा.'
                : 'Call our dedicated Kolhapur helpline directly or connect on WhatsApp for personalized guidance.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href={`tel:${organizationInfo.contact.primaryPhone}`}
                className="btn btn-call btn-lg"
              >
                <Phone size={18} />
                <span>{language === 'mr' ? 'कॉल करा: ८४२११५४०९०' : 'Call 8421154090'}</span>
              </a>

              <a
                href={`https://wa.me/${organizationInfo.contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <WhatsAppIcon size={20} color="#ffffff" animated={true} />
                <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅपवर बोला' : 'Chat on WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .videos-filter-chips {
            margin-bottom: 1.25rem !important;
            gap: 0.4rem !important;
          }
          .videos-grid-reels {
            margin-bottom: 1.5rem !important;
          }
          .videos-counseling-strip {
            padding: 1.25rem 1rem !important;
            border-radius: 14px !important;
          }
          .videos-counseling-strip h3 {
            font-size: 1.2rem !important;
            margin-bottom: 0.35rem !important;
          }
          .videos-counseling-strip p {
            font-size: 0.82rem !important;
            margin-bottom: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Videos;
