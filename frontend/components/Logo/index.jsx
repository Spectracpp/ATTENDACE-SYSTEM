'use client';

import { motion } from 'framer-motion';

export function Logo({ height = 40, animated = true }) {
  const logoPath = '/logo.svg';
  
  if (!animated) {
    return <img src={logoPath} alt="AttendEase Logo" height={height} />;
  }

  return (
    <motion.img
      src={logoPath}
      alt="AttendEase Logo"
      height={height}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  );
}

export function LogoWithText({ className = '', height = 40, animated = true }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo height={height} animated={animated} />
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
