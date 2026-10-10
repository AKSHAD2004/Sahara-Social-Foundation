import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, X, ZoomIn, Eye, Phone } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { galleryPhotos, organizationInfo, socialLinks } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';
import { dbService } from '../services/db';

const Photos = () => {
  const { language } = useLanguage();
  const [photos, setPhotos] = useState(() => {
    try {
      const stored = dbService.getAll('galleryPhotos');
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {}
    return galleryPhotos;
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => {
    // Proactively pull latest photos from Cloud Firestore
    dbService.refreshFromFirebase('galleryPhotos').catch(() => {});

    const unsub = dbService.subscribe('galleryPhotos', (newPhotos) => {
      if (Array.isArray(newPhotos) && newPhotos.length > 0) {
        setPhotos(newPhotos);
      } else {
        setPhotos(galleryPhotos);
      }
    });
    return unsub;
  }, []);

  const categories = [
    { id: 'All', nameEn: `All Photos (${photos.length})`, nameMr: `सर्व फोटो (${photos.length})` },
    { id: 'Campaigns', nameEn: 'Campaigns & Banners', nameMr: 'अभियान व पोस्टर्स' },
    { id: 'Camps', nameEn: 'Health Camps', nameMr: 'आरोग्य शिबिरे' },
    { id: 'Counseling', nameEn: 'Patient Guidance', nameMr: 'समुपदेशन कक्ष' },
    { id: 'Ayurveda', nameEn: 'Ayurveda & Dietary Pathya', nameMr: 'आयुर्वेद व पथ्य' },
    { id: 'Community', nameEn: 'Community Drives', nameMr: 'सामाजिक उपक्रम' }
  ];

  const filteredPhotos = selectedCategory === 'All'
    ? photos
    : photos.filter((p) => p.category === selectedCategory);

  return (
    <div className="photos-page">
      {/* Header */}
      <div className="page-hero-header">
        <div className="container">
          <div className="section-badge">
            <ImageIcon size={14} />
            <span>{language === 'mr' ? 'छायाचित्रे संग्रह' : 'Official Photo Gallery'}</span>
          </div>
          <h1>
            {language === 'mr' ? 'सहारा सोशल फाऊंडेशनचे आरोग्य उपक्रम व शिबिरे' : 'Field Activities & Health Camps'}
          </h1>
          <p>
            {language === 'mr'
              ? 'मधुमेह मुक्त भारत आणि व्यसनमुक्त भारत अभियानाची महाराष्ट्रभरातील शिबिरे, रुग्ण संवाद आणि अधिकृत उपक्रमांचे फोटो.'
              : 'Official photo documentation of nationwide health checkup drives, patient counseling sessions, and social outreach.'}
          </p>
        </div>
      </div>

      <section className="section" style={{ backgroundColor: '#F3F8F1' }}>
        <div className="container">
          {/* Category Filter Chips */}
          <div className="photos-filter-chips" style={{
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

          {/* Photos Grid - 3 cols on desktop, 2 cols on mobile view */}
          <div className="photos-gallery-grid">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="card photo-card-item"
              >
                <img
                  src={photo.image}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = photo.fallback;
                  }}
                  alt={photo.titleMr || photo.titleEn}
                  className="photo-card-img"
                />

                <div className="photo-card-overlay">
                  <div className="photo-card-header">
                    <span className="photo-badge">
                      {photo.category}
                    </span>

                    <span className="photo-enlarge-badge">
                      <ZoomIn size={12} />
                      <span>{language === 'mr' ? 'मोठा करा' : 'Enlarge'}</span>
                    </span>
                  </div>

                  <h3 className="photo-card-title">
                    {language === 'mr' ? photo.titleMr : photo.titleEn}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Social Contact Strip */}
          <div className="photos-camp-callout" style={{
            marginTop: '4rem',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2.5rem',
            border: '1px solid #E1E9DF',
            boxShadow: '0 10px 30px rgba(0, 107, 45, 0.05)',
            textAlign: 'center',
            maxWidth: '840px',
            margin: '4rem auto 0 auto'
          }}>
            <h3 style={{ fontSize: '1.5rem', color: '#006B2D', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? 'आमच्या पुढील आरोग्य शिबिरात सहभागी व्हा' : 'Join Our Next Health Checkup Camp'}
            </h3>
            <p style={{ color: '#5F6B61', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
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
              backgroundColor: '#04200e',
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
