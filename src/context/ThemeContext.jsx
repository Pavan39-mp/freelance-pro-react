import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'freelancepro_theme';

export const ThemeProvider = ({ children }) => {
  const { user, updateUser } = useUser();

  // Priority: user DB preference > localStorage > default light
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'light';
  });

  // When user loads (login), sync theme from their DB preference
  useEffect(() => {
    if (user?.themePreference) {
      setThemeState(user.themePreference);
      localStorage.setItem(STORAGE_KEY, user.themePreference);
    }
  }, [user]);

  // Apply theme class to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    if (user) {
      try {
        await updateUser({ themePreference: newTheme });
      } catch (err) {
        console.error('Failed to persist theme preference', err);
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
