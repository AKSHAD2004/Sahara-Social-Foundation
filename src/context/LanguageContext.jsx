import React, { createContext, useContext, useState, useEffect } from 'react';

export const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', englishName: 'English', region: 'All India / Global', script: 'Latin' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', region: 'Maharashtra', script: 'Devanagari' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', region: 'Pan-India', script: 'Devanagari' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', region: 'Gujarat', script: 'Gujarati' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', region: 'Karnataka', script: 'Kannada' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', region: 'Andhra & Telangana', script: 'Telugu' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', region: 'Tamil Nadu', script: 'Tamil' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', region: 'West Bengal', script: 'Bengali' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', region: 'Kerala', script: 'Malayalam' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', region: 'Punjab', script: 'Gurmukhi' },
  { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia', region: 'Odisha', script: 'Odia' }
];

export const applyGoogleTranslate = (langCode) => {
  try {
    const targetCode = langCode || 'en';
    const cookieVal = `/mr/${targetCode}`;
    
    // Set cookies across root and domain
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;
    
    if (window.location.hostname.includes('.')) {
      const parts = window.location.hostname.split('.');
      if (parts.length > 1) {
        const rootDomain = '.' + parts.slice(-2).join('.');
        document.cookie = `googtrans=${cookieVal}; path=/; domain=${rootDomain};`;
      }
    }

    // Direct trigger for Google Translate select element
    let attempts = 0;
    const triggerCombo = () => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = targetCode;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (attempts < 15) {
        attempts++;
        setTimeout(triggerCombo, 200);
      }
    };

    triggerCombo();
  } catch (err) {
    console.warn('Google Translate trigger error:', err);
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Always default strictly to English 'en' on every page refresh / initial load
  const [language, setLanguage] = useState('en');

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Always reset and apply English on page mount / refresh
  useEffect(() => {
    // Clear any stale persistent storage on page refresh so it always defaults to English
    sessionStorage.removeItem('ssf_language');
    localStorage.removeItem('ssf_language');
    document.documentElement.lang = 'en';
    applyGoogleTranslate('en');
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    applyGoogleTranslate(language);
  }, [language]);

  const toggleLanguage = () => {
    setIsLanguageModalOpen(true);
  };

  const openLanguageModal = () => setIsLanguageModalOpen(true);
  const closeLanguageModal = () => setIsLanguageModalOpen(false);

  const selectLanguage = (code) => {
    setLanguage(code);
    applyGoogleTranslate(code);
    setIsLanguageModalOpen(false);
  };

  const currentLanguageObj = INDIAN_LANGUAGES.find(l => l.code === language) || INDIAN_LANGUAGES[0];

  const t = (obj, field) => {
    if (!obj) return '';
    // English priority if language is English
    if (language === 'en') {
      return obj[`${field}En`] || obj[field] || obj[`${field}Mr`] || '';
    }
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
    return obj[`${field}En`] || obj[field] || obj[`${field}Mr`] || '';
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

