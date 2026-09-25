import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, X, ZoomIn, Eye, Phone } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { galleryPhotos, organizationInfo, socialLinks } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const Photos = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePhoto, setActivePhoto] = useState(null);

  const categories = [
    { id: 'All', nameEn: 'All Photos (24)', nameMr: 'सर्व फोटो (२४)' },
    { id: 'Campaigns', nameEn: 'Campaigns & Banners', nameMr: 'अभियान व पोस्टर्स' },
    { id: 'Camps', nameEn: 'Health Camps', nameMr: 'आरोग्य शिबिरे' },
    { id: 'Counseling', nameEn: 'Patient Guidance', nameMr: 'समुपदेशन कक्ष' },
    { id: 'Ayurveda', nameEn: 'Ayurveda & Dietary Pathya', nameMr: 'आयुर्वेद व पथ्य' },
    { id: 'Community', nameEn: 'Community Drives', nameMr: 'सामाजिक उपक्रम' }
  ];

  const filteredPhotos = selectedCategory === 'All'
    ? galleryPhotos
    : galleryPhotos.filter((p) => p.category === selectedCategory);

  return (
    <div className="photos-page">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #12355B 0%, #087E8B 100%)',
        color: '#ffffff',
        padding: '3.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <div className="section-badge" style={{ backgroundColor: 'rgba(244,162,97,0.2)', color: '#F4A261', border: '1px solid rgba(244,162,97,0.4)' }}>
            <ImageIcon size={16} />
            <span>{language === 'mr' ? 'छायाचित्रे संग्रह' : 'Official Photo Gallery'}</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
            {language === 'mr' ? 'सहारा सोशल फाऊंडेशनचे आरोग्य उपक्रम व शिबिरे' : 'Field Activities & Health Camps'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#e2effc', maxWidth: '750px', margin: '0 auto' }}>
            {language === 'mr'
              ? 'मधुमेह मुक्त भारत आणि व्यसनमुक्त भारत अभियानाची महाराष्ट्रभरातील शिबिरे, रुग्ण संवाद आणि अधिकृत उपक्रमांचे फोटो.'
              : 'Official photo documentation of nationwide health checkup drives, patient counseling sessions, and social outreach.'}
          </p>
        </div>
      </div>

      <section className="section" style={{ backgroundColor: '#F5F7FA' }}>
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
                    borderColor: isActive ? '#087E8B' : '#e2eaf4',
                    backgroundColor: isActive ? '#087E8B' : '#ffffff',
                    color: isActive ? '#ffffff' : '#172033',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 12px rgba(8, 126, 139, 0.25)' : '0 2px 6px rgba(18,53,91,0.04)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {language === 'mr' ? cat.nameMr : cat.nameEn}
                </button>
              );
            })}
          </div>

          {/* Photos Grid */}
          <div className="grid-3" style={{ gap: '1.75rem' }}>
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  position: 'relative',
                  height: '300px',
                  boxShadow: '0 6px 20px rgba(18,53,91,0.06)',
                  cursor: 'pointer',
                  backgroundColor: '#0a1b2e',
                  border: '1px solid #e2eaf4'
                }}
                className="card"
              >
                <img
                  src={photo.image}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = photo.fallback;
                  }}
                  alt={photo.titleMr || photo.titleEn}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease'
                  }}
                />

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(18, 53, 91, 0.95) 0%, rgba(18, 53, 91, 0.3) 50%, transparent 80%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.25rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem'
                  }}>
                    <span style={{
                      backgroundColor: '#087E8B',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase'
                    }}>
                      {photo.category}
                    </span>

                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.72rem'
                    }}>
                      <ZoomIn size={12} />
                      <span>{language === 'mr' ? 'मोठा करा' : 'Enlarge'}</span>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700, lineHeight: 1.35, fontFamily: 'var(--font-heading)' }}>
                    {language === 'mr' ? photo.titleMr : photo.titleEn}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Social Contact Strip */}
          <div style={{
            marginTop: '4rem',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2.5rem',
            border: '1px solid #e2eaf4',
            boxShadow: '0 10px 30px rgba(18,53,91,0.05)',
            textAlign: 'center',
            maxWidth: '840px',
            margin: '4rem auto 0 auto'
          }}>
            <h3 style={{ fontSize: '1.5rem', color: '#12355B', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? 'आमच्या पुढील आरोग्य शिबिरात सहभागी व्हा' : 'Join Our Next Health Checkup Camp'}
            </h3>
            <p style={{ color: '#4f6182', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {language === 'mr'
                ? 'अधिक माहितीसाठी किंवा आपल्या गावात/संस्थेत शिबीर आयोजित करण्यासाठी संपर्क साधा.'
                : 'Call our Kolhapur helpline to organize or participate in upcoming awareness camps.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href={`tel:${organizationInfo.contact.primaryPhone}`}
                className="btn btn-call btn-lg"
              >
                <Phone size={18} />
                <span>{language === 'mr' ? 'कॉल करा: ८४२११५४०९०' : 'Call: 8421154090'}</span>
              </a>

              <a
                href={socialLinks.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <WhatsAppIcon size={20} color="#ffffff" animated={true} />
                <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप ग्रुप जॉईन करा' : 'Join WhatsApp Group'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="modal-overlay" onClick={() => setActivePhoto(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '900px', backgroundColor: '#000000', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', backgroundColor: '#000000' }}>
              <img
                src={activePhoto.image}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = activePhoto.fallback;
                }}
                alt={activePhoto.titleMr || activePhoto.titleEn}
                style={{ width: '100%', maxHeight: '78vh', objectFit: 'contain' }}
              />
            </div>

            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#12355B',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)' }}>
                  {language === 'mr' ? activePhoto.titleMr : activePhoto.titleEn}
                </h4>
                <span style={{ fontSize: '0.82rem', color: '#e2effc' }}>
                  Sahara Social Foundation • Category: {activePhoto.category}
                </span>
              </div>

              <button
                onClick={() => setActivePhoto(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
