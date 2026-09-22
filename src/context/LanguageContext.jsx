import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Default to Marathi 'mr' as primary language for Sahara Social Foundation
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('ssf_language') || 'mr';
  });

  useEffect(() => {
    localStorage.setItem('ssf_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'mr' ? 'en' : 'mr'));
  };

  const t = (obj, field) => {
    if (!obj) return '';
    if (language === 'mr') {
      return obj[`${field}Mr`] || obj[`${field}En`] || obj[field] || '';
    }
    return obj[`${field}En`] || obj[`${field}Mr`] || obj[field] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
