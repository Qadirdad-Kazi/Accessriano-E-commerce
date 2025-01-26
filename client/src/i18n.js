import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      shop: "Shop",
      cart: "Cart",
      login: "Login",
      signup: "Signup",
    },
  },
  ur: {
    translation: {
      welcome: "خوش آمدید",
      shop: "دکان",
      cart: "ٹوکری",
      login: "لاگ ان",
      signup: "رجسٹر کریں",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
