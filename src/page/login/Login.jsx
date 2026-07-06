import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // استيراد خطاف التوجيه
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import './login.css';
import { useAuth } from '../../context/Auth';
import logo from '../../image/logo.png';
import { MdLanguage } from "react-icons/md"; // استيراد أيقونة مناسبة للغة

const Login = () => {
  const { t, i18n } = useTranslation('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const navigate = useNavigate(); // تهيئة خطاف التوجيه
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: t('login.messages.success') });
        
        // حفظ التوكن في الـ localStorage عبر الـ Context
        login(data.token);
        
        // التوجيه السلس الذكي بدون عمل Refresh للمتصفح
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || t('login.messages.fail') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('login.messages.server_error') });
    } finally {
      setLoading(false);
    }
  };

  // دالة تبديل اللغة وحفظها في localStorage لضمان استمراريتها في التطبيق
  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('ar') ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('i18nextLng', nextLang);
  };

  // تحديد اتجاه الصفحة والمحاذاة بناءً على اللغة الحالية
  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const flexAlignment = i18n.language === 'ar' ? 'flex-start' : 'flex-end';
  const isArabic = i18n.language.startsWith('ar');

  return (
    // استخدام فئة الـ wrapper المعزولة تماماً بمحاذاة الشاشة كاملة وعزل الـ Navbar
    <div className="login-page-wrapper" dir={currentDir}>
      <div className="login-glass-card" style={{ position: 'relative' }}>
        
        {/* زر تبديل اللغة المطور في أعلى البطاقة */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          [isArabic ? 'left' : 'right']: '20px', 
          zIndex: 10 
        }}>
          <button
            type="button"
            onClick={toggleLanguage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '6px 12px',
              borderRadius: '20px',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              backdropFilter: 'blur(5px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <MdLanguage style={{ fontSize: '1.1rem' }} />
            <span>{isArabic ? 'English' : 'عربي'}</span>
          </button>
        </div>

        {/* الهيدر والشعار المستوحى من الهوية */}
        <div className="login-header" style={{ paddingTop: '20px' }}>
           <img src={logo} alt="Logo" className='logoLogin'/>
           <h2>{t('login.header.title')}</h2>
          <p>{t('login.header.subtitle')}</p>
        </div>

        {/* صندوق رسائل حالة النظام */}
        {message.text && (
          <div className={`login-alert ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* النموذج */}
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">{t('login.fields.email_label')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">{t('login.fields.password_label')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* رابط "هل نسيت كلمة المرور؟" بمحاذاة متناسقة ديناميكياً هندسياً */}
          <div style={{ display: 'flex', justifyContent: flexAlignment, marginTop: '-8px', marginBottom: '20px' }}>
            <span 
              style={{ color: '#479FD7', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', transition: 'opacity 0.2s' }}
              onClick={() => navigate('/forgot-password')}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {t('login.links.forgot_password')}
            </span>
          </div>

          {/* زر تسجيل الدخول الرئيسي */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <div className="loader-spinner"></div> : <span>{t('login.buttons.submit')}</span>}
          </button>
          
          {/* القسم الخاص بالتوجيه لإنشاء حساب */}
          <div className="register-redirect-section" style={{ textAlign: 'center', marginTop: '15px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--energy-text-dark)', marginBottom: '10px', opacity: 0.8 }}>
              {t('login.register_redirect.text')}{' '}
              <strong 
                style={{ color: "#479FD7", cursor: "pointer" }} 
                onClick={() => navigate('/register')}
              >
                {t('login.register_redirect.action')}
              </strong>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;