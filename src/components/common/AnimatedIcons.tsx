import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedIconProps {
  className?: string;
  size?: number;
}

// 1. Animated Leaf Component with breathing scale and sway
export const AnimatedLeaf: React.FC<AnimatedIconProps> = ({ className = "w-6 h-6 text-emerald-500", size }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
      animate={{
        rotate: [0, 8, -6, 4, 0],
        scale: [1, 1.08, 0.98, 1.04, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.path
        d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
        animate={{
          pathLength: [0.9, 1, 0.9],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"
        animate={{
          strokeDashoffset: [0, 2, 0],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    </motion.svg>
  );
};

// 2. Animated Sprout Component (grows upward and pulses)
export const AnimatedSprout: React.FC<AnimatedIconProps> = ({ className = "w-6 h-6 text-emerald-600", size }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.15 }}
    >
      <motion.path
        d="M7 20h10"
        strokeWidth="2.5"
      />
      <motion.path
        d="M12 20v-8"
        animate={{ scaleY: [0.9, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.path
        d="M12 12C12 7.5 8.5 4 4 4c0 4.5 3.5 8 8 8Z"
        animate={{
          rotate: [0, -5, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M12 12c0-4.5 3.5-8 8-8 0 4.5-3.5 8-8 8Z"
        animate={{
          rotate: [0, 5, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
    </motion.svg>
  );
};

// 3. Animated Cart Component (tilts & bounces wheels)
export const AnimatedCart: React.FC<AnimatedIconProps & { active?: boolean }> = ({
  className = "w-6 h-6 text-emerald-600",
  size,
  active = false
}) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
      animate={active ? {
        y: [0, -4, 0],
        rotate: [0, -6, 4, 0],
      } : {}}
      whileHover={{ y: -2, rotate: -4 }}
      transition={{ duration: 0.4 }}
    >
      <circle cx="8" cy="21" r="1" fill="currentColor" />
      <circle cx="19" cy="21" r="1" fill="currentColor" />
      <motion.path
        d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
        animate={active ? { strokeDashoffset: [0, 4, 0] } : {}}
        transition={{ duration: 0.5 }}
      />
    </motion.svg>
  );
};

// 4. Animated Sparkles AI Component (revolves star points and twinkles)
export const AnimatedSparkles: React.FC<AnimatedIconProps> = ({ className = "w-6 h-6 text-amber-400", size }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
    >
      <motion.path
        d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
        animate={{
          scale: [0.92, 1.1, 0.92],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <motion.path
        d="M5 3v4M3 5h4"
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M19 17v4M17 19h4"
        animate={{ scale: [1.2, 0.8, 1.2], opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </motion.svg>
  );
};

// 5. Animated Shield Guarantee Icon (scanning sheen sweep)
export const AnimatedShield: React.FC<AnimatedIconProps> = ({ className = "w-6 h-6 text-emerald-500", size }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.1 }}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <motion.path
        d="m9 12 2 2 4-4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
      />
    </motion.svg>
  );
};

// 6. Animated Truck Delivery Icon (speed motion lines & spinning wheels)
export const AnimatedTruck: React.FC<AnimatedIconProps> = ({ className = "w-6 h-6 text-emerald-600", size }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
      animate={{
        y: [0, -1.5, 0],
      }}
      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18h2a1 1 0 0 0 1-1v-4.343a1 1 0 0 0-.293-.707l-2.707-2.707A1 1 0 0 0 14.293 9H14" />
      <motion.circle
        cx="7" cy="18" r="2"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle
        cx="19" cy="18" r="2"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.svg>
  );
};

// 7. Animated Checkmark (path drawing with pop ring)
export const AnimatedCheck: React.FC<AnimatedIconProps> = ({ className = "w-6 h-6 text-emerald-500", size }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <motion.path
        d="M20 6 9 17l-5-5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </motion.svg>
  );
};

// 8. Animated Search Icon (radar lens zoom scan)
export const AnimatedSearch: React.FC<AnimatedIconProps> = ({ className = "w-5 h-5 text-gray-400", size }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.15, rotate: 10 }}
    >
      <motion.circle
        cx="11" cy="11" r="8"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
};

// 9. Animated Bell Notification Icon (ringing alarm tilt)
export const AnimatedBell: React.FC<AnimatedIconProps & { hasNotification?: boolean }> = ({
  className = "w-6 h-6 text-slate-600 dark:text-slate-300",
  size,
  hasNotification = false
}) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
      animate={hasNotification ? {
        rotate: [0, 15, -15, 10, -10, 0],
      } : {}}
      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
      whileHover={{ rotate: 12 }}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      {hasNotification && (
        <motion.circle
          cx="18" cy="5" r="3"
          fill="#ef4444"
          stroke="#ffffff"
          strokeWidth="1.5"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </motion.svg>
  );
};

// 10. Animated Live Pulse Badge (Pulsing status dot)
export const AnimatedPulseBadge: React.FC<{ text?: string; color?: 'emerald' | 'amber' | 'rose' }> = ({
  text = "Live",
  color = "emerald"
}) => {
  const bgClasses = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  const textClasses = {
    emerald: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/50",
    amber: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/50",
    rose: "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/50",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-xs whitespace-nowrap shrink-0 ${textClasses[color]}`}>
      <span className="relative flex h-2 w-2 shrink-0">
        <motion.span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${bgClasses[color]}`}
          animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${bgClasses[color]}`} />
      </span>
      <span>{text}</span>
    </span>
  );
};

// 11. Animated Flame Hot Offer Icon
export const AnimatedFlame: React.FC<AnimatedIconProps> = ({ className = "w-5 h-5 text-amber-500", size }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
      animate={{
        scaleY: [1, 1.12, 0.96, 1.08, 1],
        rotate: [-2, 2, -1, 3, 0],
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </motion.svg>
  );
};

// 12. Animated Crop Doctor Scanner Icon
export const AnimatedCropDoctor: React.FC<AnimatedIconProps> = ({ className = "w-6 h-6 text-emerald-400", size }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
    >
      <motion.path
        d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="12" cy="12" r="3"
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.path
        d="M12 7v2M12 15v2M7 12h2M15 12h2"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </motion.svg>
  );
};

// 13. Animated Heart Wishlist Icon
export const AnimatedHeart: React.FC<AnimatedIconProps & { isLiked?: boolean }> = ({
  className = "w-5 h-5 text-gray-500",
  size,
  isLiked = false
}) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={isLiked ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${isLiked ? 'text-rose-500' : ''}`}
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.75 }}
      whileHover={{ scale: 1.2 }}
      animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
      transition={{ type: "spring", stiffness: 500, damping: 12 }}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </motion.svg>
  );
};
