'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState({
    primary: '#00f2ea',
    secondary: '#00d8d2',
    background: {
      primary: '#111827',
      secondary: '#1f2937',
      accent: '#374151'
    },
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af',
      accent: '#6b7280'
    }
  });

  const updateTheme = (newTheme) => {
    setTheme(prev => ({
      ...prev,
      ...newTheme
    }));
  };

  useEffect(() => {
    // Apply theme to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--bg-primary', theme.background.primary);
    root.style.setProperty('--bg-secondary', theme.background.secondary);
    root.style.setProperty('--bg-accent', theme.background.accent);
    root.style.setProperty('--text-primary', theme.text.primary);
    root.style.setProperty('--text-secondary', theme.text.secondary);
    root.style.setProperty('--text-accent', theme.text.accent);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
