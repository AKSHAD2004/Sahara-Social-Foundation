import React from 'react';
import { 
  ShieldCheck, 
  HeartHandshake, 
  PhoneCall, 
  Leaf, 
  Users, 
  Award,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TrustSection = () => {
  const { language } = useLanguage();

  const trustPoints = [
    {
      icon: <Leaf size={28} style={{ color: '#059669' }} />,
      titleEn: "Pure Ayurvedic Formulations",
      titleMr: "१००% शुद्ध आयुर्वेदिक औषधी",
      descEn: "Natural herbal ingredients prepared under Ayurvedic safety standards with zero harmful chemicals.",
      descMr: "कोणत्याही घातक रसायनांशिवाय, प्राचीन आयुर्वेदिक ग्रंथांच्या आधारे तयार केलेले शुद्ध व सुरक्षित फॉर्म्युला."
    },
    {
      icon: <PhoneCall size={28} style={{ color: '#0284c7' }} />,
      titleEn: "Dedicated Regimen Helpline",
      titleMr: "थेट फोनवर आहार व पथ्य मार्गदर्शन",
      descEn: "Call 8421154090 upon receiving your formula for detailed dosage and dietary advice tailored for you.",
      descMr: "फॉर्म्युला मिळाल्यानंतर ८४२११५४०९० वर कॉल करून आपल्या प्रकृतीनुसार औषध घेण्याची पद्धत व पथ्य समजून घ्या."
    },
    {
      icon: <Users size={28} style={{ color: '#d97706' }} />,
      titleEn: "Statewide Health Awareness",
      titleMr: "राज्यव्यापी आरोग्य व व्यसनमुक्ती मोहीम",
      descEn: "Regular social camps, public seminars, and counseling initiatives in Maharashtra.",
      descMr: "कोल्हापूर, सांगली, सातारा, पुणे व सोलापूरसह संपूर्ण महाराष्ट्रात नियमित जनजागृती शिबिरे."
    },
    {
      icon: <HeartHandshake size={28} style={{ color: '#7c3aed' }} />,
      titleEn: "Aadhar Guidance Association",
      titleMr: "आधार मार्गदर्शन केंद्र सहकार्य",
      descEn: "Working closely with Aadhar Madhumeh-Mukti Margdarshan Kendra in Shahupuri, Kolhapur.",
      descMr: "आधार मधुमेह-मुक्ती मार्गदर्शन केंद्र, शाहूपुरी, कोल्हापूर यांच्या संयुक्त विद्यमाने चालवले जाणारे कार्य."
    }
  ];

  return (
    <section className="section-sm" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '2.5rem' }}>
          <div className="section-badge">
            <ShieldCheck size={16} />
            <span>{language === 'mr' ? 'विश्वासार्हता आणि सामाजिक बांधिलकी' : 'Our Trust & Commitment'}</span>
          </div>
          <h2>
            {language === 'mr' ? 'आरोग्य संवर्धनाचा शास्त्रीय दृष्टिकोन' : 'Scientific & Authentic Health Approach'}
          </h2>
          <p>
            {language === 'mr'
              ? 'कोणत्याही अंधश्रद्धेशिवाय किंवा खोट्या दाव्यांशिवाय, आयुर्वेदाचे मूळ तत्त्व आणि योग्य जीवनशैलीचे महत्त्व पटवून देणारे कार्य.'
              : 'Empowering individuals with genuine Ayurvedic wisdom, dietary discipline, and continuous counselor support.'}
          </p>
        </div>

        <div className="grid-4">
          {trustPoints.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                padding: '1.65rem 1.4rem',
                border: '1px solid #e2e8f0'
              }}
              className="card trust-card-animated"
            >
              <div 
                className="trust-card-icon-wrap"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.15rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0'
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#064e3b', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                {language === 'mr' ? item.titleMr : item.titleEn}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
                {language === 'mr' ? item.descMr : item.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
