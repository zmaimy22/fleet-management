import React, { useEffect, createContext, useContext } from 'react';
import { getTranslation } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const language = 'es'; // Fixed Spanish only

  useEffect(() => {
    // Set Spanish direction and language
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'es';
  }, []);

  const t = (key) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
