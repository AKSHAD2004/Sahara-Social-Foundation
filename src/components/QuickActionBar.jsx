import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  ShoppingBag, 
  Calendar, 
  MapPin 
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const QuickActionBar = ({ onOpenConsultation }) => {
  const { language } = useLanguage();

  return (
    <div style={{
      marginTop: '-2rem',
      position: 'relative',
      zIndex: 10,
      marginBottom: '3rem'
    }}>
      <div className="container">
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          padding: '1.25rem 1.75rem',
          boxShadow: '0 12px 30px rgba(6, 78, 59, 0.12)',
          border: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.25rem',
          alignItems: 'center'
        }} className="quick-action-grid">
          {/* Action 1: Call Now */}
          <a
            href={`tel:${organizationInfo.contact.primaryPhone}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#059669',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Phone size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>
                {language === 'mr' ? 'थेट फोन करा' : 'Call Helpline'}
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#064e3b' }}>
                {organizationInfo.contact.primaryPhone}
              </div>
            </div>
          </a>

          {/* Action 2: WhatsApp Chat */}
          <a
            href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
              language === 'mr'
                ? 'नमस्कार, मला सहारा सोशल फाऊंडेशनच्या आरोग्य सेवा आणि फॉर्म्युलाबद्दल माहिती हवी आहे.'
                : 'Hello, I would like to know more about Sahara Social Foundation and your health services.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#25d366',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <WhatsAppIcon size={22} color="#ffffff" animated={true} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>
                {language === 'mr' ? 'व्हॉट्सअ‍ॅप संवाद' : 'WhatsApp Chat'}
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#064e3b' }}>
                {organizationInfo.contact.primaryPhone}
              </div>
            </div>
          </a>

          {/* Action 3: Order Online */}
          <Link
            to="/shop"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#d97706',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600 }}>
                {language === 'mr' ? 'ऑनलाइन ऑर्डर' : 'Online Order'}
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#78350f' }}>
                {language === 'mr' ? 'सर्व फॉर्म्युला' : 'All Formulas'}
              </div>
            </div>
          </Link>

          {/* Action 4: Counseling Booking */}
          <button
            onClick={onOpenConsultation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 600 }}>
                {language === 'mr' ? 'मोफत नोंदणी' : 'Free Booking'}
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1e3a8a' }}>
                {language === 'mr' ? 'आरोग्य समुपदेशन' : 'Counseling Session'}
              </div>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .quick-action-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 560px) {
          .quick-action-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default QuickActionBar;
