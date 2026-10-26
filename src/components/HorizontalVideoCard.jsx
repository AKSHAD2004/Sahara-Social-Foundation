import React, { useRef, useState, useEffect } from 'react';
import { Video as VideoIcon } from 'lucide-react';

const HorizontalVideoCard = ({ video }) => {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // Lazy observe when this card is near the viewport before downloading video metadata
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

  // Global pause helper: when any video plays, pause all other videos on the page
  const pauseOtherVideos = () => {
    document.querySelectorAll('video').forEach((v) => {
      if (v !== videoRef.current && !v.paused) {
        v.pause();
      }
    });
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
  }, [isInView]);

  return (
    <div 
      ref={cardRef}
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
        {isInView ? (
          <video
            ref={videoRef}
            src={`${video.videoUrl}#t=0.5`}
            preload="metadata"
            playsInline
            controls
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
              <VideoIcon size={22} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HorizontalVideoCard;
