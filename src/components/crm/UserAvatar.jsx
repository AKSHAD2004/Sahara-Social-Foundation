import React from 'react';

// Generates consistent elegant background gradients based on string hash
const getGradientByName = (name = '') => {
  const gradients = [
    'linear-gradient(135deg, #065f46 0%, #047857 100%)',
    'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
    'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

// Extracts 2 clean uppercase initials
const getInitials = (name = '') => {
  const clean = name
    .replace(/\(.*?\)/g, '')
    .replace(/^Dr\.\s*/i, '')
    .trim();

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function UserAvatar({
  name = 'User',
  avatar = null,
  size = 36,
  fontSize = null,
  style = {},
  className = ''
}) {
  const [imgError, setImgError] = React.useState(false);
  const initials = getInitials(name);
  const background = getGradientByName(name);
  const calculatedFontSize = fontSize || Math.max(11, Math.round(size * 0.38));

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'inline-block',
          flexShrink: 0,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          ...style
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background,
        color: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${calculatedFontSize}px`,
        fontWeight: 700,
        letterSpacing: '0.02em',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        userSelect: 'none',
        ...style
      }}
      title={name}
    >
      {initials}
    </div>
  );
}
