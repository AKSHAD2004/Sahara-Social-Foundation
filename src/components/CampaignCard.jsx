import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  Phone, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const CampaignCard = ({ campaign, onOpenConsultation }) => {
  const { language } = useLanguage();

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column'
      }}
      className="card product-card-animated"
    >
      {/* Campaign Image */}
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
        <img
          src={campaign.image}
          alt={campaign.titleMr || campaign.titleEn}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)'
        }} />
        <div 
          className="hero-slide-badge"
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            backgroundColor: '#059669',
            color: '#ffffff',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
          }}
        >
          {language === 'mr' ? campaign.badgeMr : campaign.badgeEn}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1.25rem',
          right: '1.25rem',
          color: '#ffffff'
        }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
            {language === 'mr' ? campaign.titleMr : campaign.titleEn}
          </h3>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {language === 'mr' ? campaign.descriptionMr : campaign.descriptionEn}
        </p>

        {/* Feature Points */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          marginBottom: '1.5rem',
          backgroundColor: '#f8fafc',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          {campaign.points.map((pt, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.86rem', color: '#334155' }}>
              <CheckCircle size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
              <span>{language === 'mr' ? pt.mr : pt.en}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/shop"
            className="btn btn-primary"
            style={{ flex: 1, minWidth: '160px' }}
          >
            <ShoppingBag size={16} />
            <span>{language === 'mr' ? campaign.ctaTextMr : campaign.ctaTextEn}</span>
          </Link>

          <a
            href={`tel:${organizationInfo.contact.primaryPhone}`}
            className="btn btn-outline"
            style={{ padding: '0.7rem 1rem' }}
            title="Call Helpline"
          >
            <Phone size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
