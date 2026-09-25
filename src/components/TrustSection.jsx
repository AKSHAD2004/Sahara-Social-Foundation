import React from 'react';
import { 
  ShieldCheck, 
  HeartHandshake, 
  PhoneCall, 
  Leaf, 
  Users 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TrustSection = () => {
  const { language } = useLanguage();

  const trustPoints = [
    {
      icon: <Leaf size={26} style={{ color: '#087E8B' }} />,
      titleEn: "Pure Ayurvedic Formulations",
      titleMr: "१००% शुद्ध आयुर्वेदिक औषधी",
      descEn: "Natural herbal ingredients prepared under Ayurvedic safety standards with zero harmful chemicals.",
      descMr: "कोणत्याही घातक रसायनांशिवाय, प्राचीन आयुर्वेदिक ग्रंथांच्या आधारे तयार केलेले शुद्ध व सुरक्षित फॉर्म्युला."
    },
    {
      icon: <PhoneCall size={26} style={{ color: '#12355B' }} />,
      titleEn: "Dedicated Regimen Helpline",
      titleMr: "थेट फोनवर आहार व पथ्य मार्गदर्शन",
      descEn: "Call 8421154090 upon receiving your formula for detailed dosage and dietary advice tailored for you.",
      descMr: "फॉर्म्युला मिळाल्यानंतर ८४२११५४०९० वर कॉल करून आपल्या प्रकृतीनुसार औषध घेण्याची पद्धत व पथ्य समजून घ्या."
    },
    {
      icon: <Users size={26} style={{ color: '#F4A261' }} />,
      titleEn: "Statewide Health Awareness",
      titleMr: "राज्यव्यापी आरोग्य व व्यसनमुक्ती मोहीम",
      descEn: "Regular social camps, public seminars, and counseling initiatives in Maharashtra.",
      descMr: "कोल्हापूर, सांगली, सातारा, पुणे व सोलापूरसह संपूर्ण महाराष्ट्रात नियमित जनजागृती शिबिरे."
    },
    {
      icon: <HeartHandshake size={26} style={{ color: '#0da3b3' }} />,
      titleEn: "Aadhar Guidance Association",
      titleMr: "आधार मार्गदर्शन केंद्र सहकार्य",
      descEn: "Working closely with Aadhar Madhumeh-Mukti Margdarshan Kendra in Shahupuri, Kolhapur.",
      descMr: "आधार मधुमेह-मुक्ती मार्गदर्शन केंद्र, शाहूपुरी, कोल्हापूर यांच्या संयुक्त विद्यमाने चालवले जाणारे कार्य."
    }
  ];

  return (
    <section className="section-sm" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2eaf4' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <ShieldCheck size={15} />
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
              className="card trust-card-animated"
              style={{
                backgroundColor: '#F5F7FA',
                borderRadius: '16px',
                padding: '1.4rem 1.25rem',
                border: '1px solid #e2eaf4'
              }}
            >
              <div 
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 10px rgba(18,53,91,0.06)',
                  border: '1px solid #e2eaf4'
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#12355B', marginBottom: '0.45rem', lineHeight: 1.35 }}>
                {language === 'mr' ? item.titleMr : item.titleEn}
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#4f6182', lineHeight: 1.55, margin: 0 }}>
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
