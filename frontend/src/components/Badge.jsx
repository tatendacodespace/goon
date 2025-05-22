import React from 'react';
import { motion } from 'framer-motion';

const BADGE_TYPES = {
  GOON_KING: {
    icon: '👑',
    tooltip: 'The undisputed master of the edge.',
    gradient: 'from-yellow-400 to-yellow-600',
    glow: 'shadow-yellow-500/50'
  },
  EDGE_EMPEROR: {
    icon: '⏱️',
    tooltip: 'Second only to royalty.',
    gradient: 'from-gray-300 to-gray-400',
    glow: 'shadow-gray-400/50'
  },
  STROKE_SAGE: {
    icon: '🧙',
    tooltip: 'Trained in the ancient techniques of delay.',
    gradient: 'from-amber-600 to-amber-800',
    glow: 'shadow-amber-600/50'
  }
};

const Badge = ({ type, size = 'md', showTooltip = true }) => {
  const badge = BADGE_TYPES[type];
  if (!badge) return null;

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-12 h-12 text-xl'
  };

  return (
    <div className="group relative inline-block">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div
          className={`
            ${sizeClasses[size]}
            rounded-full
            bg-gradient-to-r ${badge.gradient}
            flex items-center justify-center
            shadow-lg ${badge.glow}
            transition-all duration-300
            hover:shadow-xl
            cursor-default
          `}
        >
          <span className="select-none">{badge.icon}</span>
        </div>
      </motion.div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
          {badge.tooltip}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default Badge; 