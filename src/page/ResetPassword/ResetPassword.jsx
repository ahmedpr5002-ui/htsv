import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import { IoLockClosedOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
'./ResetPassword.css'
const ResetPassword = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('resetPassword'); // استخدام ملف ترجمة المصادقة والحسابات
  
  const [token, setToken] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setMessage({ type: 'error', text: t('resetPassword.messages.mismatch') });
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`https://ahmedpr5002-irs-hvtl.hf.space/user/reset-password/${token.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: t('resetPassword.messages.success') });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message || t('resetPassword.messages.invalid_token') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('resetPassword.messages.server_error') });
    } finally {
      setLoading(false);
    }
  };

  // تحديد اتجاه الصفحة والهامش بناءً على اللغة الحالية
  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const iconMargin = i18n.language === 'ar' ? { marginLeft: '8px' } : { marginRight: '8px' };

  return (
    <div className="login-page-wrapper" dir={currentDir}>
      <div className="login-glass-card">
        <div className="login-header">
          <h2>{t('resetPassword.title')}</h2>
          <p>{t('resetPassword.subtitle')}</p>
        </div>

        {message.text && (
          <div className={`login-alert ${message.type}`}>
            {message.type === 'success' && (
              <IoCheckmarkCircleOutline style={{ ...iconMargin, fontSize: '18px' }} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* حقل إدخال الرمز المكون من 6 أرقام */}
          <div className="login-field">
            <label htmlFor="token">{t('resetPassword.fields.otp_label')}</label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t('resetPassword.fields.otp_placeholder')}
              required
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '6px', fontWeight: 'bold', fontSize: '1.2rem' }}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">{t('resetPassword.fields.password_label')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="confirmPassword">{t('resetPassword.fields.confirm_password_label')}</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <div className="loader-spinner"></div> : <span>{t('resetPassword.submit_btn')}</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;