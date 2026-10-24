import React, { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';

const VideoCard = ({ video }) => {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pauseOtherVideos = () => {
    document.querySelectorAll('video').forEach((v) => {
      if (v !== videoRef.current && !v.paused) {
        v.pause();
      }
    });
  };

  return (
    <div
      ref={cardRef}
      className="reel-card-vertical"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '9 / 16',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#000000',
        border: '1.5px solid #E1E9DF',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {isInView ? (
        <video
          ref={videoRef}
          src={`${video.videoUrl}#t=0.5`}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          onPlay={pauseOtherVideos}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#000000',
            display: 'block'
          }}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0c140d'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Play size={22} style={{ color: 'rgba(255, 255, 255, 0.7)', marginLeft: '2px' }} />
          </div>
        </div>
      )}

      <style>{`
        .reel-card-vertical {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .reel-card-vertical:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.25);
          border-color: #006B2D;
        }
      `}</style>
    </div>
  );
};

export default VideoCard;
