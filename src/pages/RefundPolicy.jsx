import React from 'react';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { policiesData } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const RefundPolicy = () => {
  const { language } = useLanguage();
  const policy = policiesData.refundPolicy;

  return (
    <div className="policy-page" style={{ backgroundColor: '#F3F8F1', padding: '3.5rem 0 5.5rem 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#006B2D',
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            <ArrowLeft size={16} />
            <span>{language === 'mr' ? 'मुख्यपृष्ठावर परत जा' : 'Back to Home'}</span>
          </Link>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '3rem',
          border: '1px solid #E1E9DF',
          boxShadow: '0 8px 30px rgba(0,107,45,0.04)'
        }}>
          <div className="section-badge" style={{ marginBottom: '1rem' }}>
            <RotateCcw size={16} />
            <span>{language === 'mr' ? 'परतावा व बदली' : 'Refund & Returns'}</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', color: '#006B2D', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            {language === 'mr' ? policy.titleMr : policy.titleEn}
          </h1>

          <div style={{ fontSize: '0.85rem', color: '#5F6B61', marginBottom: '2rem' }}>
            Last updated: {policy.lastUpdated}
          </div>

          <div style={{
            fontSize: '1rem',
            color: '#17251B',
            lineHeight: 1.8,
            whiteSpace: 'pre-line'
          }}>
            {language === 'mr' ? policy.contentMr : policy.contentEn}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
