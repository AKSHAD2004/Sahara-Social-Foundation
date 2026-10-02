import React from 'react';
import { Star, Quote, MapPin, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TestimonialCard = ({ testimonial }) => {
  const { language } = useLanguage();

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        padding: '1.75rem',
        border: '1px solid #E1E9DF',
        boxShadow: '0 4px 15px rgba(0, 107, 45, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      className="card testimonial-card-animated"
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        {/* Rating Stars */}
        <div style={{ display: 'flex', gap: '0.2rem' }}>
          {[...Array(testimonial.rating || 5)].map((_, i) => (
            <Star key={i} size={16} fill="#FFC928" color="#FFC928" />
          ))}
        </div>

        <Quote size={28} style={{ color: '#159B32', opacity: 0.35 }} />
      </div>

      {/* Review text */}
      <p style={{
        fontSize: '0.92rem',
        color: '#17251B',
        lineHeight: 1.65,
        marginBottom: '1.25rem',
        flex: 1,
        fontStyle: 'italic'
      }}>
        "{language === 'mr' ? testimonial.reviewMr : testimonial.reviewEn}"
      </p>

      {/* Patient info */}
      <div style={{
        paddingTop: '0.85rem',
        borderTop: '1px solid #E1E9DF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#17251B' }}>
            {testimonial.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#5F6B61' }}>
            <MapPin size={12} style={{ color: '#006B2D' }} />
            <span>{testimonial.location}</span>
          </div>
        </div>

        <div style={{
          backgroundColor: '#e2faea',
          color: '#006B2D',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '0.25rem 0.6rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          border: '1px solid #c2f5d2'
        }}>
          <CheckCircle2 size={12} />
          <span>{testimonial.conditionEn}</span>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
