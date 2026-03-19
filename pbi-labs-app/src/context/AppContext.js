import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const getInitialLanguage = () => {
    const savedLang = localStorage.getItem('pbi_language');
    if (savedLang) return savedLang;
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
  };

  const getInitialTheme = () => {
    return localStorage.getItem('pbi_theme') || 'light';
  };

  const [language, setLanguage] = useState(getInitialLanguage);
  const [theme, setTheme] = useState(getInitialTheme); 

  // THE MASTER PAINT JOB
  useEffect(() => {
    // 1. Strip all old themes to prevent any conflicts
    document.body.classList.remove('light-theme', 'dark-theme', 'grayscale-theme', 'light', 'dark', 'grayscale');
    
    // 2. Force the exact theme requested by the user
    document.body.classList.add(`${theme}-theme`); 
    
    // 3. Lock it into the browser vault
    localStorage.setItem('pbi_theme', theme);
    localStorage.setItem('pbi_language', language);
  }, [theme, language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  return (
    <AppContext.Provider value={{ language, toggleLanguage, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);