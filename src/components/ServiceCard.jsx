import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ShieldAlert, 
  HeartPulse, 
  Sparkles, 
  Droplets, 
  Zap, 
  Flame, 
  Leaf, 
  Smile, 
  ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const iconMap = {
  Activity,
  ShieldAlert,
  HeartPulse,
  Sparkles,
  Droplets,
  Zap,
  Flame,
  Leaf,
  Smile
};

const ServiceCard = ({ service, onOpenConsultation }) => {
  const { language } = useLanguage();
  const IconComponent = iconMap[service.iconName] || Activity;

  const productPath = service.productUrl || '/shop';

  return (
    <Link
      to={productPath}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #E1E9DF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        textDecoration: 'none',
        color: 'inherit'
      }}
      className="card service-card-animated"
    >
      <div 
        className="trust-card-icon-wrap"
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          backgroundColor: '#e2faea',
          color: '#006B2D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          border: '1px solid #c2f5d2'
        }}
      >
        <IconComponent size={26} />
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#17251B', marginBottom: '0.5rem' }}>
        {language === 'mr' ? service.nameMr : service.nameEn}
      </h3>

      <p style={{ fontSize: '0.88rem', color: '#5F6B61', lineHeight: 1.55, marginBottom: '1.25rem' }}>
        {language === 'mr' ? service.descMr : service.descEn}
      </p>

      {service.popularProduct && (
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.85rem',
          borderTop: '1px dashed #E1E9DF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#006B2D', fontWeight: 600 }}>
            {service.popularProduct}
          </span>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#006B2D',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span>{language === 'mr' ? 'पहा' : 'View'}</span>
            <ArrowRight size={14} />
          </span>
        </div>
      )}

      <style>{`
        .service-card-animated {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease, border-color 0.35s ease;
          cursor: pointer;
        }

        .service-card-animated:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(0, 107, 45, 0.12);
          border-color: #006B2D;
        }

        .service-card-animated .trust-card-icon-wrap {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease;
        }

        .service-card-animated:hover .trust-card-icon-wrap {
          transform: scale(1.08) rotate(3deg);
          background-color: #006B2D;
          color: #ffffff;
        }

        @media (max-width: 640px) {
          .service-card-animated:hover {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </Link>
  );
};

export default ServiceCard;
