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
      {/* Outer Circle with Gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff0080" />
          <stop offset="50%" stopColor="#7928ca" />
          <stop offset="100%" stopColor="#00f2ea" />
        </linearGradient>
      </defs>
      
      <circle cx="50" cy="50" r="45" stroke="url(#logoGradient)" strokeWidth="2">
        <animate
          attributeName="stroke-dasharray"
          from="0 283"
          to="283 283"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Clock Lines with Gradient */}
      <line x1="50" y1="10" x2="50" y2="20" stroke="url(#logoGradient)" strokeWidth="2" />
      <line x1="90" y1="50" x2="80" y2="50" stroke="url(#logoGradient)" strokeWidth="2" />
      <line x1="50" y1="90" x2="50" y2="80" stroke="url(#logoGradient)" strokeWidth="2" />
      <line x1="10" y1="50" x2="20" y2="50" stroke="url(#logoGradient)" strokeWidth="2" />
      
      {/* Check Mark with Gradient */}
      <motion.path
        initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        d="M30 50L45 65L70 35"
        stroke="url(#logoGradient)"
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
        initial={animated ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl font-bold tracking-tight"
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00f2ea]">
          Attendance
        </span>
        <span className="ml-1 text-white">System</span>
      </motion.div>
    </div>
  );
}
