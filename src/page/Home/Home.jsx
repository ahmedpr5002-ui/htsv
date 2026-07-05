import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [systemLive, setSystemLive] = useState(true); // محاكاة حالة اتصال السيرفر الحية
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  return (
    <>
      {/* نظام التوست الإشاري الفاخر */}
      {toast.show && (
        <div className={`luxury-toast toast-${toast.type}`} dir="rtl">
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

      <div className="cyber-home-portal" dir="rtl">
        {/* الشبكة النيونية الخلفية العلوية */}
        <div className="portal-glow-bg"></div>

        {/* الشريط العلوي للمنصة */}
        <header className="portal-top-bar">
          <div className="portal-brand">
            <FaChargingStation className="portal-logo" />
            <div>
              <span className="brand-title">HVTL IRS</span>
              <span className="brand-sub">نظام إدارة المخاطر</span>
            </div>
          </div>

          <div className="portal-status-zone">
            <span className={`status-indicator ${systemLive ? 'online' : 'offline'}`}></span>
            <span className="status-text">{systemLive ? "قنوات البيانات الحية: متصلة" : "قنوات البيانات الحية: منقطعة"}</span>
          </div>
        </header>

        {/* القسم الأوسط: العناوين وأزرار الدخول السريع */}
        <main className="portal-core-content">
          <div className="portal-text-center">
            <div className="portal-tag">المنصة الهندسية المتكاملة</div>
            <h1 className="portal-main-heading">
              مراقبة وتحليل المخاطر<br />
              <span>منصة ادارة مؤشرات الاهمية(RII)</span>
            </h1>
            <p className="portal-lead">
              نظام أتمتة حساب مؤشر الأهمية النسبية (RII) وحماية تدفق البيانات الفنية للمحاور الناقلة في العراق.
            </p>

            {/* زر الانتقال الكبير والتفاعلي لصفحة التحكم */}
            <div className="portal-action-wrapper">
              <button className="portal-primary-btn" onClick={() => navigate('/login')}>
                الدخول إلى لوحة التحكم المركزية
                <FaArrowLeftLong className="btn-arrow-icon" />
              </button>
            </div>
          </div>
        </main>

        {/* الشريط السفلي: مميزات الأمان والسرعة */}
        <footer className="portal-features-footer">
          <div className="feature-shortcut-card">
            <FaShieldHalved className="f-icon" />
            <div>
              <h3>تشفير JWT وهيكلية آمنة</h3>
              <p>حماية كاملة لجلسات العمل والروابط الفنية</p>
            </div>
          </div>

          <div className="feature-shortcut-card">
            <FaNetworkWired className="f-icon" />
            <div>
              <h3>مؤشرات RII دقيقة</h3>
              <p>حسابات رياضية فورية للمخاطر المالية والتشغيلية</p>
            </div>
          </div>

          <div className="feature-shortcut-card" onClick={() => showToast("نظام مراقبة الأداء k6 مستقر بالكامل", "success")}>
            <FaTerminal className="f-icon" />
            <div>
              <h3>بيئة مستقرة ومرنة</h3>
              <p>معمارية مدمجة وسريعة الاستجابة لخوادم Node.js</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;