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

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      className="card service-card-animated"
    >
      <div 
        className="trust-card-icon-wrap"
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          backgroundColor: '#dbf7fa',
          color: '#087E8B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          border: '1px solid #abedf5'
        }}
      >
        <IconComponent size={26} />
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#12355B', marginBottom: '0.5rem' }}>
        {language === 'mr' ? service.nameMr : service.nameEn}
      </h3>

      <p style={{ fontSize: '0.88rem', color: '#4f6182', lineHeight: 1.55, marginBottom: '1.25rem' }}>
        {language === 'mr' ? service.descMr : service.descEn}
      </p>

      {service.popularProduct && (
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.85rem',
          borderTop: '1px dashed #e2eaf4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#087E8B', fontWeight: 600 }}>
            {service.popularProduct}
          </span>
          <Link
            to="/shop"
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#087E8B',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span>{language === 'mr' ? 'पहा' : 'View'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
