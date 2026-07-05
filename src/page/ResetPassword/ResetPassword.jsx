import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoLockClosedOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(''); // استقبال الرمز رقمياً من المدخلات يدويًا
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setMessage({ type: 'error', text: 'كلمات المرور غير متطابقة.' });
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // إرسال طلب الـ OTP إلى الرابط الخلفي مباشرة
      const response = await fetch(`https://ahmedpr5002-irs-hvtl.hf.space/user/reset-password/${token.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'تمت إعادة تعيين كلمة المرور بنجاح! جاري التوجيه لتسجيل الدخول...' });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'الرمز غير صحيح أو انتهت صلاحيته.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم. حاول لاحقاً.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-glass-card">
        <div className="login-header">
          <h2>تعيين كلمة المرور الجديدة</h2>
          <p>يرجى إدخال رمز التحقق (OTP) المرسل لبريدك الإلكتروني وكلمة المرور الجديدة</p>
        </div>

        {message.text && (
          <div className={`login-alert ${message.type}`}>
            {message.type === 'success' && <IoCheckmarkCircleOutline style={{ marginLeft: '8px', fontSize: '18px' }} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* حقل إدخال الرمز المكون من 6 أرقام */}
          <div className="login-field">
            <label htmlFor="token">رمز التحقق (OTP)</label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="أدخل الرمز المكون من 6 أرقام"
              required
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '6px', fontWeight: 'bold', fontSize: '1.2rem' }}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">كلمة المرور الجديدة</label>
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
            <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
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
            {loading ? <div className="loader-spinner"></div> : <span>تحديث كلمة المرور</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;