import React, { useState } from 'react';
import { Play, Sparkles, Phone, Video as VideoIcon, CheckCircle2 } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import VideoCard from '../components/VideoCard';
import { resultVideos, organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const Videos = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { id: 'All', nameEn: 'All Videos (12)', nameMr: 'सर्व व्हिडिओ (१२)' },
    { id: 'Diabetes', nameEn: 'Diabetes (मधुमेह)', nameMr: 'मधुमेह मुक्त भारत' },
    { id: 'Addiction', nameEn: 'De-Addiction (व्यसनमुक्ती)', nameMr: 'व्यसनमुक्त भारत' },
    { id: 'Bones', nameEn: 'Joint Pain (सांधेदुखी)', nameMr: 'सांधेदुखी व हाडे' },
    { id: 'Acidity', nameEn: 'Acidity & Digestion', nameMr: 'पित्त व पचन' },
    { id: 'Ayurveda', nameEn: 'Ayurveda & Pathya', nameMr: 'आयुर्वेद व पथ्य' },
    { id: 'Camps', nameEn: 'Health Camps', nameMr: 'आरोग्य शिबिरे' }
  ];

  const filteredVideos = selectedCategory === 'All'
    ? resultVideos
    : resultVideos.filter((v) => v.category === selectedCategory);

  return (
    <div className="videos-page">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        color: '#ffffff',
        padding: '3.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <div className="section-badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fef3c7' }}>
            <VideoIcon size={16} />
            <span>{language === 'mr' ? 'अधिकृत व्हिडिओ संग्रह' : 'Official Result Videos'}</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            {language === 'mr' ? 'लाभार्थ्यांचे मनोगत व प्रत्यक्ष निकाल व्हिडिओ' : 'Patient Recovery & Beneficiary Videos'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#d1fae5', maxWidth: '750px', margin: '0 auto' }}>
            {language === 'mr'
              ? 'मधुमेह मुक्त भारत व व्यसनमुक्त भारत अभियानांतर्गत सहारा सोशल फाऊंडेशनच्या संपर्कात येऊन आजारांवर मात केलेल्या रुग्णांचे प्रत्यक्ष मनोगत.'
              : 'Authentic recorded testimonials and clinical counseling videos directly from Sahara Social Foundation, Kolhapur.'}
          </p>
        </div>
      </div>

      <section className="section" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container">
          {/* Category Filter Chips */}
          <div style={{
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
                    borderColor: isActive ? '#059669' : '#e2e8f0',
                    backgroundColor: isActive ? '#059669' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 12px rgba(5, 150, 105, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {language === 'mr' ? cat.nameMr : cat.nameEn}
                </button>
              );
            })}
          </div>

          {/* 9:16 Vertical Reels Grid (All 12 Videos) */}
          <div className="grid-reels" style={{ marginBottom: '3.5rem' }}>
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {/* Video Counseling Strip */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            maxWidth: '840px',
            margin: '0 auto'
          }}>
            <h3 style={{ fontSize: '1.5rem', color: '#064e3b', fontWeight: 800, marginBottom: '0.5rem' }}>
              {language === 'mr' ? 'आपलाही अनुभव शेअर करायचा आहे किंवा सल्ला हवा आहे?' : 'Want to Share Your Story or Consult With Our Health Staff?'}
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
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
    </div>
  );
};

export default Videos;
