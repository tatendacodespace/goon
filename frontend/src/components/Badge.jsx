import React from 'react';
import { motion } from 'framer-motion';

const BADGE_TYPES = {
  GOON_KING: {
    icon: '👑',
    tooltip: 'The undisputed master of the edge.',
    gradient: 'from-yellow-400 to-yellow-600',
    glow: 'shadow-yellow-500/80',
    pixel: true
  },
  STROKE_SAGE: {
    icon: '🧙',
    tooltip: 'Wizard of the edge.',
    gradient: 'from-purple-400 to-purple-700',
    glow: 'shadow-purple-500/60',
    pixel: true
  },
  EDGE_EMPEROR: {
    icon: '🍆',
    tooltip: 'Eggplant Emperor.',
    gradient: 'from-blue-400 to-blue-700',
    glow: 'shadow-blue-500/50',
    pixel: true
  }
};

function PixelBorder({ children, className }) {
  // Remove pixel border wrapper, just render children
  return children;
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
        <span>{badge.icon}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="group relative inline-block">
      {badgeContent}
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