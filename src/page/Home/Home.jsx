import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // استيراد Hook الترجمة
import { 
  FaTerminal, 
  FaCircleCheck, 
  FaCircleExclamation, 
  FaXmark,
  FaArrowLeftLong,
  FaChargingStation,
  FaShieldHalved,
  FaNetworkWired
} from 'react-icons/fa6';
import './home.css';

const Home = () => {
  const { t, i18n } = useTranslation('home'); // الاعتماد على ملف app.json
  const navigate = useNavigate();
  const [systemLive, setSystemLive] = useState(true); 
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  // تحديد اتجاه الصفحة (RTL للعربية و LTR للإنجليزية)
  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      {/* نظام التوست الإشاري الفاخر */}
      {toast.show && (
        <div className={`luxury-toast toast-${toast.type}`} dir={currentDir}>
          <div className="toast-content">
            {toast.type === 'success' && <FaCircleCheck className="toast-icon" />}
            {toast.type === 'warning' && <FaCircleExclamation className="toast-icon" style={{ color: 'var(--energy-blue-light)' }} />}
            {toast.type === 'error' && <FaCircleExclamation className="toast-icon" />}
            <span className="toast-text">{toast.message}</span>
          </div>
          <button className="toast-close-btn" onClick={() => setToast({ show: false, message: '', type: 'info' })}>
            <FaXmark />
          </button>
        </div>
      )}

      <div className="cyber-home-portal" dir={currentDir}>
        {/* الشبكة النيونية الخلفية العلوية */}
        <div className="portal-glow-bg"></div>

        {/* الشريط العلوي للمنصة */}
        <header className="portal-top-bar">
          <div className="portal-brand">
            <FaChargingStation className="portal-logo" />
            <div>
              <span className="brand-title">HVTL IRS</span>
              <span className="brand-sub">{t('home.brand_sub')}</span>
            </div>
          </div>

          <div className="portal-status-zone">
            <span className={`status-indicator ${systemLive ? 'online' : 'offline'}`}></span>
            <span className="status-text">
              {systemLive ? t('home.status_online') : t('home.status_offline')}
            </span>
          </div>
        </header>

        {/* القسم الأوسط: العناوين وأزرار الدخول السريع */}
        <main className="portal-core-content">
          <div className="portal-text-center">
            <div className="portal-tag">{t('home.portal_tag')}</div>
            <h1 className="portal-main-heading">
              {t('home.main_heading_part1')}<br />
              <span>{t('home.main_heading_part2')}</span>
            </h1>
            <p className="portal-lead">
              {t('home.portal_lead')}
            </p>

            {/* زر الانتقال الكبير والتفاعلي لصفحة التحكم */}
            <div className="portal-action-wrapper">
              <button className="portal-primary-btn" onClick={() => navigate('/login')}>
                {t('home.primary_btn')}
                <FaArrowLeftLong 
                  className="btn-arrow-icon" 
                  style={{ transform: i18n.language === 'en' ? 'rotate(180deg)' : 'none' }} 
                />
              </button>
            </div>
          </div>
        </main>

        {/* الشريط السفلي: مميزات الأمان والسرعة */}
        <footer className="portal-features-footer">
          <div className="feature-shortcut-card">
            <FaShieldHalved className="f-icon" />
            <div>
              <h3>{t('home.features.jwt.title')}</h3>
              <p>{t('home.features.jwt.desc')}</p>
            </div>
          </div>

          <div className="feature-shortcut-card">
            <FaNetworkWired className="f-icon" />
            <div>
              <h3>{t('home.features.rii.title')}</h3>
              <p>{t('home.features.rii.desc')}</p>
            </div>
          </div>

          <div className="feature-shortcut-card" onClick={() => showToast(t('home.toast_k6_message'), "success")}>
            <FaTerminal className="f-icon" />
            <div>
              <h3>{t('home.features.stable.title')}</h3>
              <p>{t('home.features.stable.desc')}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;