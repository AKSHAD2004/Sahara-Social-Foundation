import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  ShoppingBag, 
  Calendar 
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const MobileBottomBar = ({ onOpenConsultation }) => {
  const { language } = useLanguage();

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9990,
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.1)',
      display: 'none',
      padding: '0.5rem 0.75rem'
    }} className="mobile-bottom-bar">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.4rem',
        alignItems: 'center'
      }}>
        {/* Call */}
        <a
          href={`tel:${organizationInfo.contact.primaryPhone}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            color: '#0284c7',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.35rem 0'
          }}
        >
          <Phone size={19} />
          <span>{language === 'mr' ? 'कॉल' : 'Call'}</span>
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
            language === 'mr'
              ? 'नमस्कार, मला सहारा सोशल फाऊंडेशनच्या आरोग्य सेवांबद्दल माहिती हवी आहे.'
              : 'Hello, I want details regarding Sahara Social Foundation formulas.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            color: '#16a34a',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.35rem 0'
          }}
        >
          <WhatsAppIcon size={20} color="#16a34a" animated={true} />
          <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप' : 'WhatsApp'}</span>
        </a>

        {/* Order Shop */}
        <Link
          to="/shop"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            color: '#d97706',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.35rem 0'
          }}
        >
          <ShoppingBag size={19} />
          <span>{language === 'mr' ? 'ऑर्डर' : 'Order'}</span>
        </Link>

        {/* Counseling */}
        <button
          onClick={onOpenConsultation}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            color: '#065f46',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.35rem 0'
          }}
        >
          <Calendar size={19} />
          <span>{language === 'mr' ? 'सल्ला' : 'Counsel'}</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-bottom-bar {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileBottomBar;
