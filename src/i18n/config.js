import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import roLocale from './locales/ro.json';
import enLocale from './locales/en.json';
import ruLocale from './locales/ru.json';

const resources = {
  ro: { translation: roLocale },
  en: { translation: enLocale },
  ru: { translation: ruLocale }
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ro',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'fiifit_language'
    }
  });

export default i18n;
