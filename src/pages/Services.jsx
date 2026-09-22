import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Phone, 
  ArrowRight,
  ShoppingBag,
  Calendar
} from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import CampaignCard from '../components/CampaignCard';
import ConsultationModal from '../components/ConsultationModal';
import { campaignsData, healthCategories, organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const Services = () => {
  const { language } = useLanguage();
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  return (
    <div className="services-page">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        color: '#ffffff',
        padding: '3.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <div className="section-badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fef3c7' }}>
            <Activity size={16} />
            <span>{language === 'mr' ? 'आरोग्य मार्गदर्शन व सेवा' : 'Health Guidance & Services'}</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            {language === 'mr' ? 'आरोग्य सेवा व विशेष अभियाने' : 'Health Services & Campaigns'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#d1fae5', maxWidth: '700px', margin: '0 auto' }}>
            {language === 'mr'
              ? 'मधुमेह नियंत्रण, व्यसनमुक्ती, सांधेदुखी व जुनाट विकारांवर शास्त्रीय आयुर्वेदिक मार्गदर्शन आणि आहाराचे नियोजन.'
              : 'Holistic Ayurvedic care, dietary pathya, and lifestyle counseling for lifestyle health conditions.'}
          </p>
        </div>
      </div>

      {/* Flagship Campaigns */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Sparkles size={16} />
              <span>{language === 'mr' ? 'राष्ट्रीय मोहिमा' : 'Flagship Campaigns'}</span>
            </div>
            <h2>
              {language === 'mr' ? 'सहारा सोशल फाऊंडेशनची मुख्य अभियाने' : 'Our Major Social Initiatives'}
            </h2>
            <p>
              {language === 'mr'
                ? 'देशभरातील नागरिकांना निरोगी आणि व्यसनमुक्त जीवनशैलीकडे नेणारे व्यापक अभियान.'
                : 'National campaigns fostering health awareness, counseling, and natural herbal care.'}
            </p>
          </div>

          <div className="grid-2" style={{ marginBottom: '3rem' }}>
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

      {/* All Health Categories Grid */}
      <section className="section" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <ShieldCheck size={16} />
              <span>{language === 'mr' ? 'आरोग्य मार्गदर्शन विभाग' : 'Health Categories'}</span>
            </div>
            <h2>
              {language === 'mr' ? 'सर्व आरोग्य सेवा व सल्ला विभाग' : 'All Health Guidance Categories'}
            </h2>
            <p>
              {language === 'mr'
                ? 'प्रत्येक समस्येसाठी योग्य मार्गदर्शन आणि योग्य आयुर्वेदिक फॉर्म्युलाची निवड.'
                : 'Targeted support across specialized lifestyle and physiological wellness areas.'}
            </p>
          </div>

          <div className="grid-3" style={{ marginBottom: '3.5rem' }}>
            {healthCategories.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onOpenConsultation={() => setIsConsultationOpen(true)}
              />
            ))}
          </div>

          {/* Helpline Callout */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h3 style={{ fontSize: '1.6rem', color: '#064e3b', fontWeight: 800, marginBottom: '0.75rem' }}>
              {language === 'mr' ? 'आपल्या आरोग्यासाठी मोफत तज्ज्ञ सल्ला हवा आहे?' : 'Need Free Health Guidance for Your Condition?'}
            </h3>
            <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {language === 'mr'
                ? 'सहारा सोशल फाऊंडेशनच्या समुपदेशकांशी थेट बोला किंवा मोफत मार्गदर्शनासाठी नोंदणी करा.'
                : 'Call our dedicated Kolhapur helpline directly or register your counseling request.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href={`tel:${organizationInfo.contact.primaryPhone}`}
                className="btn btn-call btn-lg"
              >
                <Phone size={18} />
                <span>{language === 'mr' ? 'कॉल करा: ८४२११५४०९०' : 'Call 8421154090'}</span>
              </a>

              <button
                onClick={() => setIsConsultationOpen(true)}
                className="btn btn-primary btn-lg"
              >
                <Calendar size={18} />
                <span>{language === 'mr' ? 'समुपदेशन नोंदणी करा' : 'Book Free Consultation'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default Services;
