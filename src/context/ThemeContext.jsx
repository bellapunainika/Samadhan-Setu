import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('samadhan_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.style.backgroundColor = '#0B1120';
      body.style.color = '#F8FAFC';
      if (metaThemeColor) metaThemeColor.content = '#0B1120';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.style.backgroundColor = '#F8FAFC';
      body.style.color = '#0F172A';
      if (metaThemeColor) metaThemeColor.content = '#F8FAFC';
    }
    localStorage.setItem('samadhan_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
