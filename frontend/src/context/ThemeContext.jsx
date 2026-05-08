import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'default',
    label: 'Monochrome',
    accent: '#e2b714',
    bg: '#0f0f17',
    preview: ['#0f0f17', '#e2b714', '#87c27a'],
  },
  {
    id: 'ocean',
    label: 'Ocean',
    accent: '#38bdf8',
    bg: '#0a1628',
    preview: ['#0a1628', '#38bdf8', '#34d399'],
  },
  {
    id: 'forest',
    label: 'Forest',
    accent: '#86efac',
    bg: '#0d1f0f',
    preview: ['#0d1f0f', '#86efac', '#fbbf24'],
  },
  {
    id: 'rose',
    label: 'Rose',
    accent: '#fb7185',
    bg: '#1a0a0f',
    preview: ['#1a0a0f', '#fb7185', '#c084fc'],
  },
  {
    id: 'aurora',
    label: 'Aurora',
    accent: '#a78bfa',
    bg: '#0d0d1a',
    preview: ['#0d0d1a', '#a78bfa', '#34d399'],
  },
];

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem('typecraft_theme') || 'default'
  );

  useEffect(() => {
    // Remove all theme classes then apply the active one
    document.documentElement.className = '';
    if (themeId !== 'default') {
      document.documentElement.classList.add(`theme-${themeId}`);
    }
    localStorage.setItem('typecraft_theme', themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
