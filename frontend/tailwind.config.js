const theme = require('./app/styles/theme').default;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#00f2ea',
          hover: '#00d8d8',
          dark: '#00a5a0',
        },
        secondary: {
          main: '#a855f7',
          hover: '#9333ea',
          dark: '#7e22ce',
        },
        accent: {
          main: '#f43f5e',
          hover: '#e11d48',
          dark: '#be123c',
        },
        neon: {
          blue: '#00f2ea',
          purple: '#a855f7',
          pink: '#f43f5e',
          yellow: '#fbbf24',
          green: '#4ade80',
        },
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        background: theme.colors.background,
        success: theme.colors.success,
        error: theme.colors.error,
        warning: theme.colors.warning,
        info: theme.colors.info,
      },
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize,
      fontWeight: theme.typography.fontWeight,
      borderRadius: theme.borderRadius,
      boxShadow: theme.shadows,
      transitionTimingFunction: theme.transitions,
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow-delay': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite 4s',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'neon-pulse': 'neonPulse 1.5s ease-in-out infinite',
        'rainbow-text': 'rainbowText 8s linear infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'rotate-3d': 'rotate3d 5s ease-in-out infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'levitate': 'levitate 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00f2ea, 0 0 10px #00f2ea, 0 0 15px #00f2ea' },
          '100%': { boxShadow: '0 0 20px #00f2ea, 0 0 30px #00f2ea, 0 0 40px #00f2ea' },
        },
        neonPulse: {
          '0%, 100%': { 
            textShadow: '0 0 7px #fff, 0 0 10px #fff, 0 0 21px #fff, 0 0 42px #00f2ea, 0 0 82px #00f2ea, 0 0 92px #00f2ea, 0 0 102px #00f2ea, 0 0 151px #00f2ea'
          },
          '50%': { 
            textShadow: '0 0 4px #fff, 0 0 7px #fff, 0 0 13px #fff, 0 0 26px #00f2ea, 0 0 51px #00f2ea, 0 0 57px #00f2ea, 0 0 64px #00f2ea, 0 0 94px #00f2ea'
          }
        },
        rainbowText: {
          '0%': { color: '#00f2ea' },
          '25%': { color: '#a855f7' },
          '50%': { color: '#f43f5e' },
          '75%': { color: '#fbbf24' },
          '100%': { color: '#00f2ea' },
        },
        sparkle: {
          '0%, 100%': { 
            backgroundImage: 'radial-gradient(circle, #00f2ea 20%, transparent 20%), radial-gradient(circle, transparent 20%, #00f2ea 20%, transparent 30%), radial-gradient(circle, #00f2ea 20%, transparent 20%)',
            backgroundSize: '15% 15%, 20% 20%, 18% 18%',
            backgroundPosition: '0% 0%, 50% 50%, 100% 100%'
          },
          '50%': {
            backgroundSize: '18% 18%, 15% 15%, 20% 20%',
            backgroundPosition: '50% 50%, 0% 0%, 100% 100%'
          }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px) rotate(-5deg)' },
          '75%': { transform: 'translateX(5px) rotate(5deg)' },
        },
        rotate3d: {
          '0%': { transform: 'perspective(1000px) rotateY(0deg)' },
          '50%': { transform: 'perspective(1000px) rotateY(180deg)' },
          '100%': { transform: 'perspective(1000px) rotateY(360deg)' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
        },
        levitate: {
          '0%, 100%': { 
            transform: 'translateY(0) rotate(0deg)',
            boxShadow: '0 5px 15px rgba(0, 242, 234, 0.4)'
          },
          '25%': {
            transform: 'translateY(-20px) rotate(-5deg)',
            boxShadow: '0 25px 15px rgba(0, 242, 234, 0.2)'
          },
          '75%': {
            transform: 'translateY(-20px) rotate(5deg)',
            boxShadow: '0 25px 15px rgba(0, 242, 234, 0.2)'
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-rainbow': 'linear-gradient(to right, #00f2ea, #a855f7, #f43f5e, #fbbf24, #4ade80)',
        'gradient-neon': 'linear-gradient(to right, #00f2ea, #a855f7)',
      },
      boxShadow: {
        'neon': '0 0 5px #00f2ea, 0 0 20px #00f2ea, 0 0 40px #00f2ea',
        'neon-strong': '0 0 10px #00f2ea, 0 0 30px #00f2ea, 0 0 60px #00f2ea',
        'rainbow': '0 0 10px #00f2ea, 0 0 20px #a855f7, 0 0 30px #f43f5e',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
