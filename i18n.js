import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend) // استخدام Backend لتحميل ملفات JSON
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'ar', // اللغة الافتراضية
    
    // تحديد مسار ملفات الترجمة
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json', 
    },

    
    ns: ['common'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;