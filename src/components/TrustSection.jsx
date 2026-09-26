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
    <section className="section-sm trust-section-wrapper" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2eaf4', position: 'relative', overflow: 'hidden' }}>
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

        <div className="grid-4 trust-cards-grid">
          {trustPoints.map((item, index) => (
            <div
              key={index}
              className={`card trust-card-animated trust-card-stagger-${index + 1}`}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                padding: '1.5rem 1.3rem',
                border: '1.5px solid #e2eaf4',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(18, 53, 91, 0.07)'
              }}
            >
              {/* Top vibrant accent glow line */}
              <div 
                className="trust-card-top-line"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: index % 2 === 0 
                    ? 'linear-gradient(90deg, #087E8B, #3cd0e2)' 
                    : 'linear-gradient(90deg, #F4A261, #f7b785)'
                }}
              />

              {/* Shimmer light beam animation */}
              <div className="trust-card-shimmer" />

              <div 
                className="trust-icon-box"
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  backgroundColor: index % 2 === 0 ? '#eefcfd' : '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.1rem',
                  boxShadow: '0 4px 14px rgba(18,53,91,0.09)',
                  border: index % 2 === 0 ? '1.5px solid #dbf7fa' : '1.5px solid #ffedd5'
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#12355B', marginBottom: '0.45rem', lineHeight: 1.35 }}>
                {language === 'mr' ? item.titleMr : item.titleEn}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#4f6182', lineHeight: 1.6, margin: 0 }}>
                {language === 'mr' ? item.descMr : item.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Staggered Floating Wave Animation - Clearly Visible on Mobile & Desktop */
        .trust-card-stagger-1 {
          animation: trustFloatMobile 4s ease-in-out infinite 0s;
        }
        .trust-card-stagger-2 {
          animation: trustFloatMobile 4s ease-in-out infinite 1s;
        }
        .trust-card-stagger-3 {
          animation: trustFloatMobile 4s ease-in-out infinite 2s;
        }
        .trust-card-stagger-4 {
          animation: trustFloatMobile 4s ease-in-out infinite 3s;
        }

        .trust-card-animated {
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          will-change: transform, box-shadow;
          cursor: pointer;
        }

        .trust-card-animated:hover,
        .trust-card-animated:active {
          transform: translateY(-8px) scale(1.02) !important;
          box-shadow: 0 16px 36px rgba(18, 53, 91, 0.16) !important;
          border-color: #087E8B !important;
        }

        /* Gentle Icon Pulse & Bounce */
        .trust-icon-box {
          animation: trustIconFloat 3.6s ease-in-out infinite;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .trust-card-stagger-1 .trust-icon-box { animation-delay: 0s; }
        .trust-card-stagger-2 .trust-icon-box { animation-delay: 0.9s; }
        .trust-card-stagger-3 .trust-icon-box { animation-delay: 1.8s; }
        .trust-card-stagger-4 .trust-icon-box { animation-delay: 2.7s; }

        .trust-card-animated:hover .trust-icon-box {
          transform: scale(1.15) rotate(6deg) !important;
          box-shadow: 0 8px 22px rgba(8, 126, 139, 0.28) !important;
        }

        /* Shimmer light sweep across card */
        .trust-card-shimmer {
          position: absolute;
          top: -50%;
          left: -150%;
          width: 80%;
          height: 200%;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.55) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(25deg);
          animation: trustShimmer 6s ease-in-out infinite;
          pointer-events: none;
        }

        .trust-card-stagger-1 .trust-card-shimmer { animation-delay: 0s; }
        .trust-card-stagger-2 .trust-card-shimmer { animation-delay: 1.5s; }
        .trust-card-stagger-3 .trust-card-shimmer { animation-delay: 3s; }
        .trust-card-stagger-4 .trust-card-shimmer { animation-delay: 4.5s; }

        @keyframes trustFloatMobile {
          0%, 100% {
            transform: translateY(0px);
            box-shadow: 0 4px 16px rgba(18, 53, 91, 0.07);
          }
          50% {
            transform: translateY(-8px);
            box-shadow: 0 12px 28px rgba(18, 53, 91, 0.14);
          }
        }

        @keyframes trustIconFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.08);
          }
        }

        @keyframes trustShimmer {
          0% {
            left: -150%;
          }
          30%, 100% {
            left: 200%;
          }
        }

        /* Mobile specific enhancements */
        @media (max-width: 640px) {
          .trust-card-animated {
            margin-bottom: 0.25rem;
          }
          @keyframes trustFloatMobile {
            0%, 100% {
              transform: translateY(0px);
              box-shadow: 0 4px 14px rgba(18, 53, 91, 0.06);
            }
            50% {
              transform: translateY(-6px);
              box-shadow: 0 10px 24px rgba(18, 53, 91, 0.12);
            }
          }
        }
      `}</style>
    </section>
  );
};

export default TrustSection;
