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
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img
          src={campaign.image}
          alt={campaign.titleMr || campaign.titleEn}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)'
        }} />
        <div 
          style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.85rem',
            backgroundColor: '#087E8B',
            color: '#ffffff',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(8,126,139,0.35)'
          }}
        >
          {language === 'mr' ? campaign.badgeMr : campaign.badgeEn}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '0.85rem',
          left: '1rem',
          right: '1rem',
          color: '#ffffff'
        }}>
          <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
            {language === 'mr' ? campaign.titleMr : campaign.titleEn}
          </h3>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ fontSize: '0.92rem', color: '#374765', lineHeight: 1.6, marginBottom: '1.15rem' }}>
          {language === 'mr' ? campaign.descriptionMr : campaign.descriptionEn}
        </p>

        {/* Feature Points */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
          marginBottom: '1.35rem',
          backgroundColor: '#f0f4f9',
          padding: '0.85rem 1rem',
          borderRadius: '12px',
          border: '1px solid #e2eaf4'
        }}>
          {campaign.points.map((pt, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.84rem', color: '#172033' }}>
              <CheckCircle size={15} style={{ color: '#087E8B', flexShrink: 0, marginTop: '2px' }} />
              <span>{language === 'mr' ? pt.mr : pt.en}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.65rem' }}>
          <Link
            to="/shop"
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            <ShoppingBag size={16} />
            <span>{language === 'mr' ? campaign.ctaTextMr : campaign.ctaTextEn}</span>
          </Link>

          <a
            href={`tel:${organizationInfo.contact.primaryPhone}`}
            className="btn btn-outline"
            style={{ padding: '0.65rem 0.95rem' }}
            title="Call Helpline"
            aria-label="Call Helpline"
          >
            <Phone size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
