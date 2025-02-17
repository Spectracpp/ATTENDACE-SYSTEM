'use client';

import { motion } from 'framer-motion';

export default function Logo({ className = '', width = 40, height = 40, animated = true }) {
  const LogoComponent = () => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Circle */}
      <circle cx="50" cy="50" r="45" stroke="#00f2ea" strokeWidth="2" />
      
      {/* Clock Lines */}
      <line x1="50" y1="10" x2="50" y2="20" stroke="#00f2ea" strokeWidth="2" />
      <line x1="90" y1="50" x2="80" y2="50" stroke="#00f2ea" strokeWidth="2" />
      <line x1="50" y1="90" x2="50" y2="80" stroke="#00f2ea" strokeWidth="2" />
      <line x1="10" y1="50" x2="20" y2="50" stroke="#00f2ea" strokeWidth="2" />
      
      {/* Check Mark */}
      <motion.path
        initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        d="M30 50L45 65L70 35"
        stroke="#00f2ea"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  if (!animated) {
    return <LogoComponent />;
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <LogoComponent />
    </motion.div>
  );
}

// Also export a text logo version
export function LogoWithText({ className = '', width = 150, height = 40, animated = true }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo width={height} height={height} animated={animated} />
      <motion.div
        initial={animated ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center"
      >
        <span className="text-2xl font-bold text-white">
          Attend<span className="text-[#00f2ea]">Ease</span>
        </span>
      </motion.div>
    </div>
  );
}
