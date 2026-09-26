import React, { useState } from 'react';
import { Globe, X, Check, Search, Sparkles } from 'lucide-react';
import { useLanguage, INDIAN_LANGUAGES } from '../context/LanguageContext';

const LanguageModal = () => {
  const { isLanguageModalOpen, closeLanguageModal, language, selectLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isLanguageModalOpen) return null;

  const filteredLanguages = INDIAN_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 27, 46, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLanguageModal();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(18, 53, 91, 0.35)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #e2eaf4',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Top Header */}
        <div style={{
          background: 'linear-gradient(135deg, #12355B 0%, #087E8B 100%)',
          color: '#ffffff',
          padding: '1.4rem 1.5rem',
          position: 'relative'
        }}>
          <button
            onClick={closeLanguageModal}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
            <Globe size={18} style={{ color: '#F4A261' }} />
            <span style={{ fontSize: '0.78rem', color: '#dbf7fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pan-India Language Selector • भाषा निवडा
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#ffffff' }}>
            आपली भाषा निवडा / Select Your Language
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#e2effc', margin: 0, lineHeight: 1.4 }}>
            भारतातील सर्व प्रमुख भाषांमध्ये माहिती व आरोग्य मार्गदर्शन उपलब्ध
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '1rem 1.25rem 0.5rem 1.25rem', backgroundColor: '#F5F7FA', borderBottom: '1px solid #e2eaf4' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#087E8B' }} />
            <input
              type="text"
              placeholder="भाषा किंवा राज्य शोधा (उदा. मराठी, Hindi, Gujarati, Kannada...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem 0.65rem 2.3rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Languages Grid */}
        <div style={{ 
          padding: '1.25rem', 
          maxHeight: '380px', 
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem'
        }}>
          {filteredLanguages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => selectLanguage(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid #087E8B' : '1.5px solid #e2eaf4',
                  backgroundColor: isSelected ? '#dbf7fa' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(8,126,139,0.15)' : '0 2px 5px rgba(18,53,91,0.02)'
                }}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#F5F7FA';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e2eaf4';
                  }
                }}
              >
                <div>
                  <div style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: isSelected ? '#087E8B' : '#12355B',
                    lineHeight: 1.2
                  }}>
                    {lang.name}
                  </div>
                  <div style={{
                    fontSize: '0.76rem',
                    color: '#4f6182',
                    marginTop: '0.2rem'
                  }}>
                    {lang.englishName} • <span style={{ color: '#087E8B', fontWeight: 600 }}>{lang.region}</span>
                  </div>
                </div>

                {isSelected ? (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#087E8B',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                ) : (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1.5px solid #cbd5e1',
                    flexShrink: 0
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Footer Note */}
        <div style={{
          backgroundColor: '#F5F7FA',
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid #e2eaf4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#4f6182'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={13} style={{ color: '#F4A261' }} />
            <span>सहारा सोशल फाऊंडेशन • संपूर्ण भारत सेवा</span>
          </div>
          <button
            type="button"
            onClick={closeLanguageModal}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', minHeight: '32px' }}
          >
            पूर्ण (Done)
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LanguageModal;
