import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, User, CheckCircle, Clock, Sparkles, Phone } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const VideoCard = ({ video }) => {
  const { language } = useLanguage();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const title = language === 'mr' ? video.titleMr : video.titleEn;
  const summary = language === 'mr' ? video.summaryMr : video.summaryEn;

  const handlePlayToggle = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log('Video play error:', err));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div
      className="reel-card-vertical"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '9 / 16',
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: '#000000',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }}
      onClick={handlePlayToggle}
    >
      {/* Pure Direct HTML5 MP4 Video - NO Image Thumbnail */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        preload="metadata"
        playsInline
        controls={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: '#000000',
          zIndex: 1
        }}
      >
        <source src={video.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Top Floating Badges (Category & Duration) */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        padding: '0.85rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(10,27,46,0.85) 0%, transparent 100%)'
      }}>
        <div style={{
          backgroundColor: 'rgba(8, 126, 139, 0.92)',
          backdropFilter: 'blur(6px)',
          color: '#ffffff',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '0.25rem 0.65rem',
          borderRadius: '9999px',
          border: '1px solid rgba(8, 126, 139, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          <Sparkles size={11} style={{ color: '#F4A261' }} />
          <span>{video.category}</span>
        </div>

        <div style={{
          backgroundColor: 'rgba(18, 53, 91, 0.85)',
          backdropFilter: 'blur(6px)',
          color: '#ffffff',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <Clock size={11} style={{ color: '#F4A261' }} />
          <span>{video.duration}</span>
        </div>
      </div>

      {/* Big Center Glowing Play Button (Visible when paused or initially loaded) */}
      {!isPlaying && (
        <div 
          onClick={handlePlayToggle}
          style={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#087E8B',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 8px rgba(8, 126, 139, 0.35), 0 10px 30px rgba(0, 0, 0, 0.7)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: 'scale(1)'
          }}
          className="play-pulse-btn"
          >
            <Play size={32} fill="#ffffff" style={{ marginLeft: '4px' }} />
          </div>

          <span style={{
            backgroundColor: 'rgba(18, 53, 91, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            letterSpacing: '0.02em'
          }}>
            {language === 'mr' ? 'प्ले करा' : 'Play Reel'}
          </span>
        </div>
      )}

      {/* Bottom Info & Contact Strip */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        padding: '1rem 0.85rem 0.85rem 0.85rem',
        background: 'linear-gradient(0deg, rgba(10,27,46,0.95) 0%, rgba(10,27,46,0.7) 75%, transparent 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        pointerEvents: isPlaying ? 'none' : 'auto'
      }}>
        {/* Patient / Beneficiary Name */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.78rem',
          color: '#e2effc',
          fontWeight: 600
        }}>
          <User size={12} style={{ color: '#087E8B' }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {video.patientName}
          </span>
          <CheckCircle size={12} style={{ color: '#087E8B', flexShrink: 0 }} />
        </div>

        {/* Video Title */}
        <h4 style={{
          fontSize: '0.92rem',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.3,
          margin: 0,
          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {title}
        </h4>

        {/* Direct Action Row: Call + WhatsApp */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.45rem',
          marginTop: '0.3rem',
          pointerEvents: 'auto'
        }}>
          <a
            href={`tel:${organizationInfo.contact.primaryPhone}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '0.45rem 0.6rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Phone size={13} />
            <span>{language === 'mr' ? 'फोन करा' : 'Call Staff'}</span>
          </a>

          <a
            href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(`नमस्कार, मी वेबसाईटवरील व्हिडिओ पाहिला (${title}). मला अधिक माहिती हवी आहे.`)}`}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#25d366',
              color: '#ffffff',
              padding: '0.45rem 0.6rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <WhatsAppIcon size={15} color="#ffffff" animated={true} />
            <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप' : 'WhatsApp'}</span>
          </a>
        </div>
      </div>

      <style>{`
        .play-pulse-btn {
          animation: playPulseGlow 2s infinite ease-in-out;
        }

        @keyframes playPulseGlow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(8, 126, 139, 0.6), 0 10px 25px rgba(0, 0, 0, 0.6);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 0 12px rgba(8, 126, 139, 0), 0 14px 30px rgba(0, 0, 0, 0.8);
          }
        }

        .reel-card-vertical {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .reel-card-vertical:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          border-color: rgba(8, 126, 139, 0.8);
        }
      `}</style>
    </div>
  );
};

export default VideoCard;
