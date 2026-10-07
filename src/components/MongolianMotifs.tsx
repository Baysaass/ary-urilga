import React from 'react';

/**
 * Traditional Mongolian Eternal Knot (Өлзий хээ - Ulzii)
 * Symbol of endless happiness, prosperity, and cosmic longevity.
 */
export const UlziiPattern: React.FC<{
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}> = ({ className = '', size = 48, color = 'currentColor', strokeWidth = 1.5 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer balanced interlaced knot paths */}
      <path
        d="M 50 15 L 70 35 L 50 55 L 30 35 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 50 45 L 70 65 L 50 85 L 30 65 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 25 40 L 45 60 L 25 80 L 5 60 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 75 40 L 95 60 L 75 80 L 55 60 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="3" fill={color} />
      <path
        d="M 50 5 L 95 50 L 50 95 L 5 50 Z"
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        strokeDasharray="2 3"
        opacity="0.4"
      />
    </svg>
  );
};

/**
 * Editorial Flourish Divider
 */
export const EditorialFlourish: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#B49368',
}) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-[#B49368]/40" />
      <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
        <path
          d="M 0 6 C 6 6, 8 2, 12 2 C 16 2, 18 6, 24 6 C 18 6, 16 10, 12 10 C 8 10, 6 6, 0 6 Z"
          fill={color}
          opacity="0.6"
        />
        <circle cx="12" cy="6" r="1.5" fill="#FAF7F0" />
      </svg>
      <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-[#B49368]/40" />
    </div>
  );
};

/**
 * Architectural Minimal Line-Art Home with Dynamic Illumination
 * Per requirement #17:
 * 0–10 blessings: one window illuminated
 * 10–25: more windows illuminate
 * 25–50: warm exterior light appears
 * 50+: stars / flowers / subtle light effects appear
 */
export const InteractiveHouseArt: React.FC<{
  blessingCount: number;
  className?: string;
}> = ({ blessingCount, className = '' }) => {
  const isStage1 = blessingCount >= 0;
  const isStage2 = blessingCount >= 10;
  const isStage3 = blessingCount >= 25;
  const isStage4 = blessingCount >= 50;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 320 220"
        className="w-full max-w-[280px] h-auto drop-shadow-sm select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Warm window glow gradient */}
          <radialGradient id="windowGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF2D6" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#F5D08C" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#E2A657" stopOpacity="0.3" />
          </radialGradient>

          {/* Exterior porch aura */}
          <radialGradient id="porchGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFDE99" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FFDE99" stopOpacity="0" />
          </radialGradient>

          {/* Hearth roof ambient warmth */}
          <linearGradient id="roofAura" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B49368" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B6785D" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Ambient Stage 4 Starlight and floating sparkles */}
        {isStage4 && (
          <g className="transition-opacity duration-1000 ease-out">
            <circle cx="45" cy="40" r="1.5" fill="#B49368" className="animate-pulse" />
            <circle cx="85" cy="25" r="2" fill="#D4B98E" />
            <circle cx="230" cy="30" r="1.5" fill="#B49368" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="270" cy="45" r="2" fill="#D4B98E" />
            <circle cx="160" cy="18" r="2.5" fill="#B6785D" />

            {/* Sparkle 4-point stars */}
            <path d="M 60 55 L 62 50 L 64 55 L 69 57 L 64 59 L 62 64 L 60 59 L 55 57 Z" fill="#D4B98E" opacity="0.8" />
            <path d="M 250 60 L 251.5 56 L 253 60 L 257 61.5 L 253 63 L 251.5 67 L 250 63 L 246 61.5 Z" fill="#D4B98E" opacity="0.8" />
          </g>
        )}

        {/* Chimney / Toono subtle warmth smoke */}
        <path
          d="M 160 52 Q 163 42 160 32 Q 157 22 162 12"
          stroke="#B49368"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="2 3"
          opacity={isStage3 ? "0.6" : "0.2"}
        />

        {/* Modern Mongolian Architectural Pavilion Outline (Combines modern lines with gentle crown roofline) */}
        {/* Foundation line */}
        <line x1="40" y1="190" x2="280" y2="190" stroke="#29231E" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="30" y1="195" x2="290" y2="195" stroke="#B49368" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

        {/* Main home structure walls */}
        <rect
          x="65"
          y="95"
          width="190"
          height="95"
          rx="3"
          stroke="#29231E"
          strokeWidth="1.6"
          fill="#FBF8F2"
        />

        {/* Contemporary pitched / crown roofline */}
        <path
          d="M 45 98 L 160 55 L 275 98 Z"
          stroke="#29231E"
          strokeWidth="1.8"
          fill="#F5EFE4"
          strokeLinejoin="round"
        />
        {/* Subtle decorative roof fascia line */}
        <path
          d="M 58 95 L 160 59 L 262 95"
          stroke="#B49368"
          strokeWidth="0.8"
          strokeDasharray="3 3"
        />

        {/* Traditional Mongolian circular crown/skylight motif (Toono symbol at crown) */}
        <circle cx="160" cy="55" r="9" stroke="#29231E" strokeWidth="1.4" fill="#FDFBF7" />
        <circle cx="160" cy="55" r="5" stroke="#B49368" strokeWidth="1" />
        <line x1="160" y1="46" x2="160" y2="64" stroke="#B49368" strokeWidth="0.8" />
        <line x1="151" y1="55" x2="169" y2="55" stroke="#B49368" strokeWidth="0.8" />

        {/* Main Entryway / Door */}
        <rect
          x="140"
          y="130"
          width="40"
          height="60"
          rx="2"
          stroke="#29231E"
          strokeWidth="1.4"
          fill="#EFE7DA"
        />
        {/* Door details */}
        <line x1="160" y1="130" x2="160" y2="190" stroke="#29231E" strokeWidth="0.8" strokeDasharray="3 2" />
        <circle cx="156" cy="162" r="1.5" fill="#29231E" />
        <circle cx="164" cy="162" r="1.5" fill="#29231E" />

        {/* Stage 3 & 4: Exterior Entryway Lamp & Warm Porch Light */}
        {isStage3 && (
          <g>
            <circle cx="160" cy="120" r="28" fill="url(#porchGlow)" />
            {/* Minimal wall sconce */}
            <rect x="156" y="118" width="8" height="4" rx="1" fill="#B49368" />
            <circle cx="160" cy="121" r="2" fill="#FFEBB8" />
          </g>
        )}

        {/* LEFT WINDOW - Always illuminated (Stage 1+) */}
        <g>
          {isStage1 && (
            <rect
              x="85"
              y="120"
              width="36"
              height="44"
              rx="2"
              fill="url(#windowGlow)"
              className="transition-all duration-700"
            />
          )}
          <rect
            x="85"
            y="120"
            width="36"
            height="44"
            rx="2"
            stroke="#29231E"
            strokeWidth="1.4"
            fill={isStage1 ? 'url(#windowGlow)' : '#EDE4D4'}
          />
          {/* Window pane mullions */}
          <line x1="103" y1="120" x2="103" y2="164" stroke="#29231E" strokeWidth="0.8" />
          <line x1="85" y1="142" x2="121" y2="142" stroke="#29231E" strokeWidth="0.8" />
        </g>

        {/* RIGHT WINDOW - Illuminated Stage 2+ */}
        <g>
          {isStage2 && (
            <rect
              x="199"
              y="120"
              width="36"
              height="44"
              rx="2"
              fill="url(#windowGlow)"
              className="transition-all duration-700"
            />
          )}
          <rect
            x="199"
            y="120"
            width="36"
            height="44"
            rx="2"
            stroke="#29231E"
            strokeWidth="1.4"
            fill={isStage2 ? 'url(#windowGlow)' : '#EDE4D4'}
          />
          <line x1="217" y1="120" x2="217" y2="164" stroke="#29231E" strokeWidth="0.8" />
          <line x1="199" y1="142" x2="235" y2="142" stroke="#29231E" strokeWidth="0.8" />
        </g>

        {/* TOP CLERESTORY WINDOWS - Illuminated Stage 2+ */}
        <g>
          <rect
            x="110"
            y="98"
            width="25"
            height="14"
            rx="1"
            stroke="#29231E"
            strokeWidth="1"
            fill={isStage2 ? 'url(#windowGlow)' : '#EDE4D4'}
          />
          <rect
            x="185"
            y="98"
            width="25"
            height="14"
            rx="1"
            stroke="#29231E"
            strokeWidth="1"
            fill={isStage2 ? 'url(#windowGlow)' : '#EDE4D4'}
          />
        </g>

        {/* Modern planter / flower pots at entryway */}
        <rect x="127" y="176" width="10" height="14" rx="1" stroke="#29231E" strokeWidth="1" fill="#CBB39C" />
        <path d="M 132 176 Q 128 168 130 162" stroke="#7E9276" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 132 176 Q 136 170 135 164" stroke="#7E9276" strokeWidth="1.2" strokeLinecap="round" />

        <rect x="183" y="176" width="10" height="14" rx="1" stroke="#29231E" strokeWidth="1" fill="#CBB39C" />
        <path d="M 188 176 Q 184 170 185 164" stroke="#7E9276" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 188 176 Q 192 168 190 162" stroke="#7E9276" strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      {/* Dynamic Blessing Light Milestone Subtitle */}
      <div className="mt-2 text-center">
        <p className="text-xs text-[#29231E]/80 font-medium">
          {blessingCount < 10 && 'Анхны гэгээ: Нэг цонх гэрэлтлээ'}
          {blessingCount >= 10 && blessingCount < 25 && 'Шинэ гэрийн цонхууд халуун дулаанаар гийж байна ✨'}
          {blessingCount >= 25 && blessingCount < 50 && 'Гэрийн гаднах босго, хүрээлэл гэрлээр бялхаж байна 🏡'}
          {blessingCount >= 50 && 'Ерөөл бүхний шидээр оддын гэгээ гийлээ 🌟'}
        </p>
        <span className="text-[11px] text-[#B49368] font-medium tracking-wide">
          ({blessingCount} ерөөл батлагдсан)
        </span>
      </div>
    </div>
  );
};
