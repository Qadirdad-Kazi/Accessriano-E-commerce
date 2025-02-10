import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // load translation files via HTTP
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass i18n instance to react-i18next
  .init({
    fallbackLng: 'en', // default language if detection fails
    debug: true, // set to false in production

    interpolation: {
      escapeValue: false, // react already safes from xss
    },

    backend: {
      // Path where translation files are stored
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
