import React from 'react';
import { motion } from 'framer-motion';

// SVGs for CODM-style badges
const LegendarySVG = () => (
  <svg viewBox="0 0 64 64" width="40" height="40" className="drop-shadow-[0_0_8px_gold]">
    <defs>
      <radialGradient id="legendaryGold" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fffbe6" />
        <stop offset="60%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#b8860b" />
      </radialGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <polygon points="32,4 40,24 62,24 44,38 50,60 32,48 14,60 20,38 2,24 24,24" fill="url(#legendaryGold)" stroke="#fffbe6" strokeWidth="2" filter="url(#glow)" />
    <path d="M32 12 L36 24 L32 20 L28 24 Z" fill="#fff700" stroke="#fff" strokeWidth="1" filter="url(#glow)" />
    <path d="M32 8 L34 16 L32 14 L30 16 Z" fill="#fff" opacity="0.7" />
    <g>
      <path d="M24 32 Q32 40 40 32" stroke="#fffbe6" strokeWidth="2" fill="none" />
      <ellipse cx="32" cy="28" rx="6" ry="4" fill="#fffbe6" opacity="0.3" />
    </g>
    {/* Lightning bolt */}
    <polyline points="32,16 36,28 30,28 34,40" fill="none" stroke="#fff700" strokeWidth="2.5" filter="url(#glow)" />
  </svg>
);

const EpicSVG = () => (
  <svg viewBox="0 0 64 64" width="36" height="36">
    <defs>
      <radialGradient id="epicPurple" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f3e8ff" />
        <stop offset="60%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#6d28d9" />
      </radialGradient>
    </defs>
    <polygon points="32,8 40,28 56,28 44,40 48,56 32,46 16,56 20,40 8,28 24,28" fill="url(#epicPurple)" stroke="#ede9fe" strokeWidth="2" />
    <ellipse cx="32" cy="28" rx="7" ry="4" fill="#ede9fe" opacity="0.3" />
    <path d="M32 16 L36 28 L32 24 L28 28 Z" fill="#fff" opacity="0.7" />
  </svg>
);

const RareSVG = () => (
  <svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <radialGradient id="rareBlue" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="60%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </radialGradient>
    </defs>
    <polygon points="32,12 38,30 52,30 42,40 44,52 32,44 20,52 22,40 12,30 26,30" fill="url(#rareBlue)" stroke="#bae6fd" strokeWidth="2" />
    <ellipse cx="32" cy="30" rx="6" ry="3" fill="#bae6fd" opacity="0.3" />
    <path d="M32 18 L36 30 L32 26 L28 30 Z" fill="#fff" opacity="0.7" />
  </svg>
);

const BADGE_TYPES = {
  GOON_KING: {
    icon: <LegendarySVG />,
    tooltip: 'Legendary Goon: #1 All-Time',
    gradient: 'from-yellow-400 to-yellow-600',
    glow: 'shadow-yellow-500/80',
    pixel: true
  },
  EDGE_EMPEROR: {
    icon: <EpicSVG />,
    tooltip: 'Epic Goon: #2',
    gradient: 'from-purple-400 to-purple-700',
    glow: 'shadow-purple-500/60',
    pixel: true
  },
  STROKE_SAGE: {
    icon: <RareSVG />,
    tooltip: 'Rare Goon: #3',
    gradient: 'from-blue-400 to-blue-700',
    glow: 'shadow-blue-500/50',
    pixel: true
  }
};

function PixelBorder({ children, className }) {
  return (
    <div className={`relative p-1 bg-[#222] rounded-lg pixel-border ${className || ''}`} style={{ boxShadow: '0 0 0 4px #fff, 0 0 8px #facc15, 0 0 16px #fbbf24' }}>
      {children}
      <style>{`
        .pixel-border {
          image-rendering: pixelated;
          border: 2px solid #fff;
          box-shadow: 0 0 0 4px #fff, 0 0 8px #facc15, 0 0 16px #fbbf24;
        }
      `}</style>
    </div>
  );
}

const Badge = ({ type, size = 'md', showTooltip = true }) => {
  const badge = BADGE_TYPES[type];
  if (!badge) return null;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const badgeContent = (
    <motion.div
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      <div
        className={`relative flex items-center justify-center ${sizeClasses[size]} rounded-full bg-gradient-to-r ${badge.gradient} shadow-xl ${badge.glow} font-mono select-none`}
        style={{
          border: badge.pixel ? '3px solid #fff' : undefined,
          boxShadow: badge.pixel ? '0 0 12px #fff, 0 0 32px #facc15, 0 0 64px #fbbf24' : undefined,
          filter: badge.pixel ? 'contrast(1.2) saturate(1.2)' : undefined,
          textShadow: badge.pixel ? '0 0 8px #fff, 0 0 16px #facc15' : undefined
        }}
      >
        {badge.icon}
      </div>
    </motion.div>
  );

  return (
    <div className="group relative inline-block">
      {badge.pixel ? <PixelBorder>{badgeContent}</PixelBorder> : badgeContent}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none font-mono border-2 border-yellow-400 shadow-lg">
          {badge.tooltip}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-l-2 border-b-2 border-yellow-400"></div>
        </div>
      )}
    </div>
  );
};

export default Badge;