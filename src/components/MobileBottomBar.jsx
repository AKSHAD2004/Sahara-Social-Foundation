import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  return (
    <div className="mobile-bottom-bar" role="navigation" aria-label="Quick Mobile Navigation">
      <div className="mobile-bottom-grid">
        {/* Call Helpline */}
        <a
          href={`tel:${organizationInfo.contact.primaryPhone}`}
          className="mobile-bottom-item bottom-item-call"
          aria-label="Call Helpline"
        >
          <Phone size={20} />
          <span>{language === 'mr' ? 'कॉल' : 'Call'}</span>
        </a>

        {/* WhatsApp Chat */}
        <a
          href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
            language === 'mr'
              ? 'नमस्कार, मला सहारा सोशल फाऊंडेशनच्या आरोग्य सेवांबद्दल माहिती हवी आहे.'
              : 'Hello, I want details regarding Sahara Social Foundation formulas.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-bottom-item bottom-item-wa"
          aria-label="WhatsApp Chat"
        >
          <WhatsAppIcon size={21} color="#159B32" animated={true} />
          <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप' : 'WhatsApp'}</span>
        </a>

        {/* Order Shop */}
        <Link
          to="/shop"
          className={`mobile-bottom-item bottom-item-shop ${location.pathname === '/shop' ? 'active' : ''}`}
          aria-label="Shop Products"
        >
          <ShoppingBag size={20} />
          <span>{language === 'mr' ? 'उत्पादने' : 'Products'}</span>
        </Link>

        {/* Counseling Consultation */}
        <button
          type="button"
          onClick={onOpenConsultation}
          className="mobile-bottom-item bottom-item-counsel"
          aria-label="Free Consultation"
        >
          <Calendar size={20} />
          <span>{language === 'mr' ? 'मोफत सल्ला' : 'Counsel'}</span>
        </button>
      </div>

      <style>{`
        .mobile-bottom-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9980;
          background-color: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-top: 1px solid #E1E9DF;
          box-shadow: 0 -4px 20px rgba(0, 107, 45, 0.08);
          display: none;
          padding: 0.35rem 0.5rem calc(0.35rem + env(safe-area-inset-bottom, 0px)) 0.5rem;
        }

        .mobile-bottom-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.3rem;
          align-items: center;
          max-width: 500px;
          margin: 0 auto;
        }

        .mobile-bottom-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.2rem;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.4rem 0.2rem;
          border-radius: 8px;
          text-decoration: none;
          min-height: 48px;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          touch-action: manipulation;
        }

        .mobile-bottom-item:active {
          transform: scale(0.94);
          background-color: #F3F8F1;
        }

        .bottom-item-call { color: #006B2D; }
        .bottom-item-wa { color: #159B32; }
        .bottom-item-shop { color: #17251B; }
        .bottom-item-shop.active {
          color: #006B2D;
          background-color: #F3F8F1;
        }
        .bottom-item-counsel { color: #006B2D; }

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
