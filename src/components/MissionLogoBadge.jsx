import React from 'react';

/**
 * Official Sahara Social Foundation Emblem Badge
 * Displays the high-definition circular emblem with gold border and shadows.
 */
export const MissionLogoBadge = ({ size = 44, className = '', style = {} }) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div 
      className={`mission-logo-badge-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: pixelSize,
        height: pixelSize,
        maxWidth: '100%',
        maxHeight: '100%',
        position: 'relative',
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        backgroundColor: '#ffffff',
        boxShadow: '0 3px 12px rgba(0, 107, 45, 0.15), 0 0 10px rgba(212, 175, 55, 0.35)',
        border: '2px solid #D4AF37',
        ...style
      }}
    >
      <img
        src="/sahara-logo.jpg"
        alt="Sahara Social Foundation Official Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          borderRadius: '50%'
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/logo.png';
        }}
      />
    </div>
  );
};

export default MissionLogoBadge;
