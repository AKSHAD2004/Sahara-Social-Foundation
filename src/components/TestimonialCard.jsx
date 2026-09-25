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
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
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
            <Star key={i} size={16} fill="#F4A261" color="#F4A261" />
          ))}
        </div>

        <Quote size={28} style={{ color: '#087E8B', opacity: 0.3 }} />
      </div>

      {/* Review text */}
      <p style={{
        fontSize: '0.92rem',
        color: '#172033',
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
        borderTop: '1px solid #e2eaf4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#12355B' }}>
            {testimonial.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#4f6182' }}>
            <MapPin size={12} style={{ color: '#087E8B' }} />
            <span>{testimonial.location}</span>
          </div>
        </div>

        <div style={{
          backgroundColor: '#dbf7fa',
          color: '#087E8B',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '0.25rem 0.6rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          border: '1px solid #abedf5'
        }}>
          <CheckCircle2 size={12} />
          <span>{testimonial.conditionEn}</span>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
