import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export { LanguageContext };

interface LanguageProviderProps {
  children: ReactNode;
}

// Import translation files
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

// Translation dictionaries
const translations = {
  en: enTranslations,
  ar: arTranslations,
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    const langTranslations = translations[language];
    const translation = (langTranslations as any)[key] || key;
    if (!options) return translation;

    return translation.replace(/{{(\w+)}}/g, (_: string, k: string) => String(options![k]));
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}