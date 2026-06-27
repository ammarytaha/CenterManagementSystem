import { createContext, useContext, useEffect, useState } from 'react';

// Manual light/dark theme, layered on top of the design-system tokens. The
// default still follows the OS preference (resolved on first load), but the
// user can override it; the choice is persisted. The actual switch is just
// `data-theme` on <html>, which flips the CSS custom properties in index.css.
const ThemeContext = createContext(null);
const KEY = 'cms_theme';

const getInitial = () => {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
