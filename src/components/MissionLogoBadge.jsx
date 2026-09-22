import React from 'react';

/**
 * High-definition vector badge representing the official
 * "MISION DIABETES FREE INDIA - मधुमेह मुक्तभारत अभियान" logo.
 * 100% crisp vector SVG with zero pixelation on any screen.
 */
export const MissionLogoBadge = ({ size = 260, className = '', style = {} }) => {
  return (
    <div 
      className={`mission-logo-badge-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        maxWidth: '100%',
        maxHeight: '100%',
        position: 'relative',
        filter: 'drop-shadow(0 12px 28px rgba(6, 78, 59, 0.18))',
        ...style
      }}
    >
      <svg
        viewBox="0 0 500 500"
        width="100%"
        height="100%"
        style={{ display: 'block', overflow: 'visible' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Circular path for top arc text */}
          <path
            id="textArcPath"
            d="M 60,250 A 190,190 0 1,1 440,250"
            fill="none"
          />
          {/* Gradient for the flame */}
          <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          {/* Flame highlight */}
          <linearGradient id="flameCore" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
          {/* Sun Gradient */}
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="85%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </radialGradient>
        </defs>

        {/* Outer White Background Circle */}
        <circle cx="250" cy="250" r="236" fill="#FFFFFF" />

        {/* Dark Green Outer Ring */}
        <circle
          cx="250"
          cy="250"
          r="230"
          fill="none"
          stroke="#0F4C2C"
          strokeWidth="14"
        />

        {/* Top Arc Text: MISION DIABETES FREE INDIA */}
        <text
          fill="#0F4C2C"
          fontSize="26"
          fontWeight="900"
          fontFamily="'Arial Black', 'Montserrat', Impact, sans-serif"
          letterSpacing="4"
        >
          <textPath
            href="#textArcPath"
            startOffset="50%"
            textAnchor="middle"
          >
            MISION DIABETES FREE INDIA
          </textPath>
        </text>

        {/* Sun Circle in Background */}
        <circle cx="250" cy="290" r="115" fill="url(#sunGrad)" />
        
        {/* Subtle Sunburst Rays */}
        <g stroke="#FDE047" strokeWidth="2.5" opacity="0.6">
          {[...Array(18)].map((_, i) => {
            const angle = (i * 20) * (Math.PI / 180);
            const x1 = 250 + 40 * Math.cos(angle);
            const y1 = 290 - 40 * Math.sin(angle);
            const x2 = 250 + 110 * Math.cos(angle);
            const y2 = 290 - 110 * Math.sin(angle);
            return y2 <= 290 ? (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ) : null;
          })}
        </g>

        {/* Torch & Flame Graphic */}
        <g id="torchGroup">
          {/* Flame Back Layer */}
          <path
            d="M 130,170 C 120,130 150,105 180,95 C 175,115 195,120 215,110 C 235,100 245,115 270,140 C 230,150 250,175 220,175 C 190,175 180,160 160,172 Z"
            fill="url(#flameGrad)"
            stroke="#C2410C"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Flame Core Glow */}
          <path
            d="M 145,168 C 140,140 160,120 185,115 C 180,128 198,132 210,125 C 225,120 235,135 245,150 C 215,158 225,170 205,170 C 185,170 175,160 160,168 Z"
            fill="url(#flameCore)"
            opacity="0.9"
          />

          {/* Torch Cup Top Rim */}
          <path
            d="M 120,170 L 195,170 C 197,175 197,180 195,185 L 120,185 C 118,180 118,175 120,170 Z"
            fill="#FFFFFF"
            stroke="#0F4C2C"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Torch Bowl */}
          <path
            d="M 125,185 L 190,185 C 185,210 170,225 160,245 L 155,245 C 145,225 130,210 125,185 Z"
            fill="#FFFFFF"
            stroke="#0F4C2C"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Torch Handle Ribs */}
          <path
            d="M 148,245 L 167,245 L 165,300 L 150,300 Z"
            fill="#FFFFFF"
            stroke="#0F4C2C"
            strokeWidth="4"
          />

          {/* Hand Holding the Torch */}
          {/* Wrist & Forearm entering from lower left */}
          <path
            d="M 170,300 C 185,290 205,280 230,295 L 215,315 C 195,305 180,312 165,320 Z"
            fill="#FFFFFF"
            stroke="#0F4C2C"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Fist Fingers curled around handle */}
          <g fill="#FFFFFF" stroke="#0F4C2C" strokeWidth="4.5">
            {/* Finger 1 (Top / Index) */}
            <rect x="135" y="240" width="38" height="15" rx="7" transform="rotate(-5 135 240)" />
            {/* Finger 2 (Middle) */}
            <rect x="133" y="255" width="40" height="15" rx="7" transform="rotate(-5 133 255)" />
            {/* Finger 3 (Ring) */}
            <rect x="135" y="270" width="38" height="15" rx="7" transform="rotate(-5 135 270)" />
            {/* Finger 4 (Pinky) */}
            <rect x="138" y="285" width="35" height="14" rx="7" transform="rotate(-5 138 285)" />
            {/* Thumb */}
            <path d="M 145,248 C 145,235 158,232 166,242" fill="none" strokeWidth="4.5" />
          </g>
        </g>

        {/* Central/Right Text Banner Boxes: 'मधुमेह मुक्तभारत अभियान' */}
        <g id="marathiBanners" transform="translate(10, 0)">
          {/* Block 1: मधुमेह */}
          <g>
            <rect
              x="215"
              y="238"
              width="185"
              height="62"
              rx="8"
              fill="#0F4C2C"
              stroke="#FFFFFF"
              strokeWidth="4"
            />
            <text
              x="307"
              y="282"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="38"
              fontWeight="900"
              fontFamily="'Yantramanav', 'Mukta', 'Nirmala UI', 'Segoe UI', Arial, sans-serif"
            >
              मधुमेह
            </text>
          </g>

          {/* Block 2: मुक्तभारत */}
          <g>
            <rect
              x="145"
              y="298"
              width="270"
              height="66"
              rx="8"
              fill="#0F4C2C"
              stroke="#FFFFFF"
              strokeWidth="4"
            />
            <text
              x="280"
              y="346"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="40"
              fontWeight="900"
              fontFamily="'Yantramanav', 'Mukta', 'Nirmala UI', 'Segoe UI', Arial, sans-serif"
            >
              मुक्तभारत
            </text>
          </g>

          {/* Block 3: अभियान */}
          <g>
            <rect
              x="158"
              y="360"
              width="235"
              height="65"
              rx="8"
              fill="#0F4C2C"
              stroke="#FFFFFF"
              strokeWidth="4"
            />
            <text
              x="275"
              y="408"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="40"
              fontWeight="900"
              fontFamily="'Yantramanav', 'Mukta', 'Nirmala UI', 'Segoe UI', Arial, sans-serif"
            >
              अभियान
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default MissionLogoBadge;
