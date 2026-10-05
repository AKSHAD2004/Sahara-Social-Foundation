import React, { useRef, useState, useEffect } from 'react';
import { User, CheckCircle, Clock, Sparkles, Phone, Video as VideoIcon } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const HorizontalVideoCard = ({ video }) => {
  const { language } = useLanguage();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const title = language === 'mr' ? (video.titleMr || video.title) : (video.titleEn || video.title);
  const speaker = language === 'mr' ? (video.speakerMr || video.patientName) : (video.speakerEn || video.patientName);
  const summary = language === 'mr' ? (video.summaryMr || video.summary) : (video.summaryEn || video.summary);
  const categoryLabel = language === 'mr' ? (video.categoryMr || video.category) : (video.categoryEn || video.category);

  // Global pause helper: when any video plays, pause all other videos on the page
  const pauseOtherVideos = () => {
    document.querySelectorAll('video').forEach((v) => {
      if (v !== videoRef.current && !v.paused) {
        v.pause();
      }
    });
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.currentTime === 0) {
      try {
        videoRef.current.currentTime = 0.1;
      } catch (e) {
        // Ignore seek errors
      }
    }
  };

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handlePlay = () => {
      pauseOtherVideos();
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);

    return () => {
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <div 
      className="horizontal-video-card"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1.5px solid #E1E9DF',
        boxShadow: '0 4px 20px rgba(0, 107, 45, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
      }}
    >
      {/* Video Header: Category Pill & Duration Badge */}
      <div 
        style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAF7',
          borderBottom: '1px solid #EBF2E9'
        }}
      >
        <div 
          style={{
            backgroundColor: '#006B2D',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Sparkles size={11} style={{ color: '#F4A261' }} />
          <span>{categoryLabel}</span>
        </div>

        {video.duration && (
          <div 
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #D5E4D2',
              color: '#2D3A30',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.22rem 0.55rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Clock size={11} style={{ color: '#006B2D' }} />
            <span>{video.duration}</span>
          </div>
        )}
      </div>

      {/* Video Player Frame with Native Controls and 100% Uncropped Display */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          backgroundColor: '#000000',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <video
          ref={videoRef}
          src={`${video.videoUrl}#t=0.1`}
          preload="metadata"
          playsInline
          controls
          onLoadedMetadata={handleLoadedMetadata}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#000000',
            display: 'block'
          }}
        >
          <source src={video.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Card Details Body */}
      <div 
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          gap: '0.85rem'
        }}
      >
        <div>
          {/* Speaker or Beneficiary Name */}
          {speaker && (
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                color: '#006B2D',
                fontWeight: 700,
                marginBottom: '0.45rem'
              }}
            >
              <User size={13} />
              <span>{speaker}</span>
              <CheckCircle size={13} style={{ color: '#006B2D' }} />
            </div>
          )}

          {/* Video Title */}
          <h3 
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#17251B',
              lineHeight: 1.35,
              margin: '0 0 0.5rem 0',
              fontFamily: 'var(--font-heading)'
            }}
          >
            {title}
          </h3>

          {/* Short Description */}
          {summary && (
            <p 
              style={{
                fontSize: '0.86rem',
                color: '#5F6B61',
                lineHeight: 1.5,
                margin: 0
              }}
            >
              {summary}
            </p>
          )}
        </div>

        {/* Quick Contact & Action Buttons */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #F0F4EF'
          }}
        >
          <a
            href={`tel:${organizationInfo.contact.primaryPhone}`}
            style={{
              backgroundColor: '#F3F8F1',
              color: '#006B2D',
              border: '1px solid #D5E4D2',
              padding: '0.5rem 0.6rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#006B2D'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F3F8F1'; e.currentTarget.style.color = '#006B2D'; }}
          >
            <Phone size={14} />
            <span>{language === 'mr' ? 'फोन करा' : 'Call'}</span>
          </a>

          <a
            href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(`नमस्कार, मी samarthkolhapur.com वरील व्हिडिओ पाहिला (${title}). मला अधिक माहिती हवी आहे.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#25D366',
              color: '#ffffff',
              padding: '0.5rem 0.6rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <WhatsAppIcon size={14} color="#ffffff" />
            <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप' : 'WhatsApp'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HorizontalVideoCard;
