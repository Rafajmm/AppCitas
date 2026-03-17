import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

const defaultTheme = {
  color_primario: '#3B82F6',
  color_secundario: '#10B981',
  color_acento: '#F59E0B',
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    if (business?.color_primario) {
      setTheme({
        color_primario: business.color_primario,
        color_secundario: business.color_secundario || '#10B981',
        color_acento: business.color_acento || '#F59E0B',
      });
    }
  }, [business]);

  const value = {
    theme,
    business,
    setBusiness,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <style>{`
        :root {
          --primary-color: ${theme.color_primario};
          --secondary-color: ${theme.color_secundario};
          --accent-color: ${theme.color_acento};
        }
        .btn-primary {
          background-color: ${theme.color_primario} !important;
          border-color: ${theme.color_primario} !important;
        }
        .btn-primary:hover {
          background-color: ${theme.color_primario}dd !important;
          border-color: ${theme.color_primario}dd !important;
        }
        .text-primary {
          color: ${theme.color_primario} !important;
        }
        .bg-primary {
          background-color: ${theme.color_primario} !important;
        }
        .border-primary {
          border-color: ${theme.color_primario} !important;
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
