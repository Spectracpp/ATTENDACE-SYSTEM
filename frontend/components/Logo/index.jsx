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

export function LogoWithText({ height = 40, animated = true }) {
  const textStyle = {
    background: 'linear-gradient(to right, #00f2ea, #00c4fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <div className="flex items-center gap-2">
      <Logo height={height} animated={animated} />
      <motion.h1
        className="text-2xl font-bold"
        style={textStyle}
        initial={animated ? { x: -20, opacity: 0 } : {}}
        animate={animated ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        AttendEase
      </motion.h1>
    </div>
  );
}
