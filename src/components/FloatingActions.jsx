import React from 'react';
import { Phone } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const FloatingActions = () => {
  const { language } = useLanguage();

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '1.5rem',
      zIndex: 9980,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }} className="floating-actions-container">
      {/* Floating Call */}
      <a
        href={`tel:${organizationInfo.contact.primaryPhone}`}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#0284c7',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(2, 132, 199, 0.4)',
          transition: 'all 0.25s ease'
        }}
        title={`Call Helpline: ${organizationInfo.contact.primaryPhone}`}
        className="floating-btn floating-action-animated"
      >
        <Phone size={24} />
      </a>

      {/* Floating WhatsApp with Pulse Waves & Icon Animation */}
      <div className="whatsapp-float-wrapper floating-action-animated" style={{ animationDelay: '1.2s' }}>
        <a
          href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
            language === 'mr'
              ? 'नमस्कार, मला सहारा सोशल फाऊंडेशनच्या आरोग्य सेवा आणि फॉर्म्युलाबद्दल माहिती हवी आहे.'
              : 'Hello, I would like to know more about Sahara Social Foundation and your health services.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float-btn"
          title="Chat on WhatsApp / व्हॉट्सअ‍ॅप संवाद"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon size={32} color="#ffffff" animated={true} />
        </a>
      </div>

      <style>{`
        .floating-btn:hover {
          transform: scale(1.1);
        }
        @media (max-width: 768px) {
          .floating-actions-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingActions;
