import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Sparkles, ChevronDown, ChevronUp, ArrowDown } from 'lucide-react';
import { horizontalVideosData } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';
import { dbService } from '../services/db';

const ResultVideosSection = () => {
  const { language } = useLanguage();
  const [showAllVideos, setShowAllVideos] = useState(false);
  const sectionRef = useRef(null);

  const [videos, setVideos] = useState(() => {
    try {
      const stored = dbService.getAll('videos');
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {}
    return horizontalVideosData;
  });

  useEffect(() => {
    dbService.refreshFromFirebase('videos').catch(() => {});
    const unsub = dbService.subscribe('videos', (newVideos) => {
      if (Array.isArray(newVideos) && newVideos.length > 0) {
        setVideos(newVideos);
      } else {
        setVideos(horizontalVideosData);
      }
    });
    return unsub;
  }, []);

  // Top 4 shown by default, remaining revealed when user clicks "More Videos"
  const visibleVideos = showAllVideos
    ? videos.slice(0, 8)
    : videos.slice(0, 4);

  // Global mutual pause: ensures only ONE video can play at a time across the entire page
  const handlePlay = (e) => {
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach((v) => {
      if (v !== e.target && !v.paused) {
        v.pause();
      }
    });
  };

  // Ensure first frame of the video loads and is visible immediately (prevents black screen)
  const handleLoadedMetadata = (e) => {
    try {
      if (e.target.currentTime === 0) {
        e.target.currentTime = 0.1;
      }
    } catch (err) {
      // Ignore seek restriction errors
    }
  };

  // Smooth toggle with automatic glide into view
  const handleToggleVideos = () => {
    setShowAllVideos((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          window.scrollBy({ top: 380, behavior: 'smooth' });
        }, 120);
      }
      return next;
    });
  };

  // One-tap smooth scroll down to the next section
  const handleScrollDown = () => {
    const nextSection = document.querySelector('.trust-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="result-videos-section"
      className="section result-videos-section" 
      style={{ 
        backgroundColor: '#ffffff', 
        borderTop: '1px solid #EAEAEA',
        borderBottom: '1px solid #EAEAEA',
        padding: '3.5rem 0',
        touchAction: 'pan-y'
      }}
    >
      <div className="container">
        {/* Section Header matching website brand theme */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <span 
              style={{
                backgroundColor: '#E8F5E9',
                color: '#006B2D',
                padding: '0.25rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: '1px solid #C8E6C9'
              }}
            >
              <Sparkles size={13} style={{ color: '#006B2D' }} />
              <span>{language === 'mr' ? 'अधिकृत निकाल व्हिडिओ' : 'Official Case Studies'}</span>
            </span>
          </div>

          <h2 
            className="result-videos-heading"
            style={{ 
              color: '#006B2D', 
              fontSize: 'clamp(1.9rem, 3.5vw, 2.5rem)', 
              fontWeight: 800, 
              margin: '0 0 0.4rem 0',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <span>Result Videos</span>
            {language === 'mr' && (
              <span style={{ fontSize: '1.2rem', color: '#555555', fontWeight: 600 }}>
                (प्रत्यक्ष निकाल व्हिडिओ)
              </span>
            )}
          </h2>

          <p style={{ color: '#5F6B61', fontSize: '0.96rem', margin: '0 auto', maxWidth: '720px' }}>
            {language === 'mr'
              ? 'samarthkolhapur.com वरील अधिकृत व्हिडिओ: Antox D & T चे प्रत्यक्ष रुग्ण निकाल, साखर नियंत्रण व आरोग्य सुधारणा.'
              : 'Direct authentic case study videos adapted from samarthkolhapur.com showcasing patient results and vital recovery.'}
          </p>
        </div>

        {/* 2-Column Side-by-Side Video Grid Matching the Screenshot (media_1791263516313.png) */}
        <div 
          className="result-videos-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.75rem',
            marginBottom: '2.5rem',
            touchAction: 'pan-y'
          }}
        >
          {visibleVideos.map((video, idx) => (
            <div 
              key={video.id || idx}
              className="result-video-item"
              style={{
                backgroundColor: '#000000',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 6px 22px rgba(0, 0, 0, 0.12)',
                border: '1px solid #E0E0E0',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                touchAction: 'pan-y'
              }}
            >
              {/* Native Video Player with First-Frame Render and Mutual Pause */}
              <div 
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  backgroundColor: '#000000',
                  overflow: 'hidden',
                  touchAction: 'pan-y'
                }}
              >
                <video
                  src={`${video.videoUrl}#t=0.1`}
                  controls
                  playsInline
                  preload="metadata"
                  controlsList="nodownload"
                  onPlay={handlePlay}
                  onLoadedMetadata={handleLoadedMetadata}
                  onLoadedData={handleLoadedMetadata}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#000000',
                    display: 'block',
                    touchAction: 'pan-y'
                  }}
                >
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Minimal Clean Caption matching samarthkolhapur.com */}
              <div 
                style={{
                  backgroundColor: '#FAFAFA',
                  padding: '0.65rem 0.95rem',
                  borderTop: '1px solid #EEEEEE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <span 
                    style={{ 
                      fontSize: '0.88rem', 
                      fontWeight: 700, 
                      color: '#222222',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {language === 'mr' ? (video.speakerMr || video.titleMr) : (video.speakerEn || video.titleEn)}
                  </span>
                </div>

                {video.duration && (
                  <span 
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#666666',
                      backgroundColor: '#FFFFFF',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '6px',
                      border: '1px solid #E0E0E0',
                      flexShrink: 0
                    }}
                  >
                    {video.duration}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons: "More Videos" toggle + Link to Full Video Gallery + Easy Scroll Down */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {videos.length > 4 && (
            <button 
              type="button"
              onClick={handleToggleVideos}
              className="btn btn-more-videos"
            style={{ 
              backgroundColor: '#006B2D',
              color: '#ffffff',
              padding: '0.85rem 2.2rem', 
              borderRadius: '9999px',
              fontSize: '1.02rem',
              fontWeight: 700,
              boxShadow: '0 6px 20px rgba(0, 107, 45, 0.28)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#005022';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 107, 45, 0.38)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#006B2D';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 107, 45, 0.28)';
            }}
          >
            {showAllVideos ? (
              <>
                <ChevronUp size={18} />
                <span>{language === 'mr' ? 'कमी व्हिडिओ दाखवा (Show Less)' : 'Show Less Videos'}</span>
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                <span>{language === 'mr' ? 'More Videos (अधिक व्हिडिओ)' : 'More Videos'}</span>
                <ChevronDown size={18} />
              </>
            )}
          </button>
        )}

        <Link 
            to="/videos" 
            style={{ 
              backgroundColor: '#F3F8F1',
              color: '#006B2D',
              padding: '0.85rem 1.8rem', 
              borderRadius: '9999px',
              fontSize: '0.98rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              border: '1.5px solid #C8E6C9',
              boxShadow: '0 2px 10px rgba(0, 107, 45, 0.08)',
              transition: 'all 0.25s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#E2FAEA';
              e.currentTarget.style.borderColor = '#006B2D';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F8F1';
              e.currentTarget.style.borderColor = '#C8E6C9';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>{language === 'mr' ? 'सर्व व्हिडिओ दालन पहा' : 'View All in Gallery'}</span>
            <ArrowRight size={16} />
          </Link>

          {/* Quick-Scroll Down button to effortlessly glide to next section */}
          <button
            type="button"
            onClick={handleScrollDown}
            title={language === 'mr' ? 'पुढील माहितीकडे खाली स्क्रोल करा' : 'Scroll Down to Next Section'}
            style={{
              backgroundColor: '#ffffff',
              color: '#006B2D',
              padding: '0.85rem 1.4rem',
              borderRadius: '9999px',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              border: '1.5px solid #C8E6C9',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 107, 45, 0.06)',
              transition: 'all 0.25s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F8F1';
              e.currentTarget.style.borderColor = '#006B2D';
              e.currentTarget.style.transform = 'translateY(2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#C8E6C9';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>{language === 'mr' ? 'खाली स्क्रोल करा' : 'Scroll Down'}</span>
            <ArrowDown size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .result-videos-section {
          touch-action: pan-y !important;
          scroll-margin-top: 80px;
          -webkit-overflow-scrolling: touch;
        }
        .result-videos-grid {
          touch-action: pan-y !important;
        }
        .result-video-item {
          touch-action: pan-y !important;
          will-change: transform;
          transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          contain: paint layout;
        }
        .result-video-item video {
          touch-action: pan-y !important;
        }
        @media (max-width: 768px) {
          .result-videos-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .result-videos-section {
            padding: 2.25rem 0 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ResultVideosSection;
