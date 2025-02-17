// Theme configuration
const theme = {
  colors: {
    primary: {
      main: '#00f2ea',
      hover: '#00d8d8',
      light: '#e6fffd',
      dark: '#00a7a7'
    },
    secondary: {
      main: '#ff0050',
      hover: '#e6004a',
      light: '#ffe6ed',
      dark: '#b3003d'
    },
    background: {
      main: '#000000',
      card: '#1a1a1a',
      paper: '#262626',
      elevated: '#333333'
    },
    text: {
      primary: '#ffffff',
      secondary: '#a3a3a3',
      disabled: '#666666'
    },
    success: {
      main: '#22c55e',
      hover: '#16a34a',
      light: '#dcfce7',
      dark: '#15803d'
    },
    error: {
      main: '#ef4444',
      hover: '#dc2626',
      light: '#fee2e2',
      dark: '#b91c1c'
    },
    warning: {
      main: '#f59e0b',
      hover: '#d97706',
      light: '#fef3c7',
      dark: '#b45309'
    },
    info: {
      main: '#3b82f6',
      hover: '#2563eb',
      light: '#dbeafe',
      dark: '#1d4ed8'
    },
    border: {
      main: '#404040',
      light: '#525252',
      dark: '#262626'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['Fira Code', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  transitions: {
    DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  // Common component styles
  components: {
    button: {
      base: 'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors',
      primary: 'bg-[#00f2ea] hover:bg-[#00d8d8] text-black',
      secondary: 'bg-[#ff0050] hover:bg-[#e6004a] text-white',
      outline: 'border-[#00f2ea] text-[#00f2ea] hover:bg-[#00f2ea] hover:text-black',
      ghost: 'text-[#00f2ea] hover:bg-[#00f2ea]/10',
      disabled: 'opacity-50 cursor-not-allowed'
    },
    input: {
      base: 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
      primary: 'border-gray-800 bg-black/50 text-white placeholder-gray-500 focus:ring-[#00f2ea] focus:border-[#00f2ea]',
      error: 'border-red-500 focus:ring-red-500 focus:border-red-500'
    },
    card: {
      base: 'overflow-hidden transition-shadow',
      default: 'bg-[#1a1a1a] rounded-lg shadow-md hover:shadow-lg',
      elevated: 'bg-[#262626] rounded-lg shadow-lg hover:shadow-xl'
    }
  }
};

export default theme;
