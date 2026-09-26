import React, { createContext, useContext, useState, useEffect } from 'react';

export const INDIAN_LANGUAGES = [
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', region: 'Maharashtra', script: 'Devanagari' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', region: 'Pan-India', script: 'Devanagari' },
  { code: 'en', name: 'English', englishName: 'English', region: 'All India / Global', script: 'Latin' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', region: 'Gujarat', script: 'Gujarati' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', region: 'Karnataka', script: 'Kannada' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', region: 'Andhra & Telangana', script: 'Telugu' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', region: 'Tamil Nadu', script: 'Tamil' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', region: 'West Bengal', script: 'Bengali' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', region: 'Kerala', script: 'Malayalam' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', region: 'Punjab', script: 'Gurmukhi' },
  { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia', region: 'Odisha', script: 'Odia' }
];

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Default to Marathi 'mr' as primary language for Sahara Social Foundation
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('ssf_language') || 'mr';
  });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ssf_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setIsLanguageModalOpen(true);
  };

  const openLanguageModal = () => setIsLanguageModalOpen(true);
  const closeLanguageModal = () => setIsLanguageModalOpen(false);

  const selectLanguage = (code) => {
    setLanguage(code);
    setIsLanguageModalOpen(false);
  };

  const currentLanguageObj = INDIAN_LANGUAGES.find(l => l.code === language) || INDIAN_LANGUAGES[0];

  const t = (obj, field) => {
    if (!obj) return '';
    // Check specific language code if present (e.g. nameHi, nameGu, etc.)
    const capitalized = language.charAt(0).toUpperCase() + language.slice(1);
    if (obj[`${field}${capitalized}`]) {
      return obj[`${field}${capitalized}`];
    }
    // Marathi fallback
    if (language === 'mr' && obj[`${field}Mr`]) {
      return obj[`${field}Mr`];
    }
    // Hindi fallback if regional
    if (language === 'hi' && (obj[`${field}Hi`] || obj[`${field}Mr`])) {
      return obj[`${field}Hi`] || obj[`${field}Mr`];
    }
    // English default fallback
    return obj[`${field}En`] || obj[`${field}Mr`] || obj[field] || '';
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      selectLanguage, 
      toggleLanguage, 
      openLanguageModal, 
      closeLanguageModal, 
      isLanguageModalOpen, 
      currentLanguageObj, 
      languagesList: INDIAN_LANGUAGES, 
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

