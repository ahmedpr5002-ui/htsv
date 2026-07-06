import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import { IoMailOutline, IoArrowBackOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import './ForgotPassword.css'
const ForgotPassword = () => {
  const { t, i18n } = useTranslation('ForgotPassword'); 
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: data.message || t('forgot_password.success_fallback')
        });
        
        setTimeout(() => {
          navigate('/reset-password');
        }, 2500);

      } else {
        setMessage({ type: 'error', text: data.message || t('forgot_password.error_fallback') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('forgot_password.server_error') });
    } finally {
      setLoading(false);
    }
  };

  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="login-page-wrapper" dir={currentDir}>
      <div className="login-glass-card">
        <div className="login-header">
          <h2>{t('forgot_password.title')}</h2>
          <p>{t('forgot_password.subtitle')}</p>
        </div>

        {message.text && (
          <div className={`login-alert ${message.type}`}>
            <IoCheckmarkCircleOutline className="alert-status-icon" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">{t('forgot_password.email_label')}</label>
            <div className="input-with-icon-wrapper">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
              <IoMailOutline className="input-field-icon" />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <div className="loader-spinner"></div> : <span>{t('forgot_password.submit_btn')}</span>}
          </button>

          <div className="back-to-login-container">
            <p className="back-to-login-link" onClick={() => navigate('/login')}>
              <IoArrowBackOutline className="back-arrow-icon" />
              <span>{t('forgot_password.back_to_login')}</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;