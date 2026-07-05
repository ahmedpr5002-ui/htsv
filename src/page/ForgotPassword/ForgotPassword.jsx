import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMailOutline, IoArrowBackOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

const ForgotPassword = () => {
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
          text: data.message || 'إذا كان الحساب مسجلاً، فستتلقى رمزاً لإعادة تعيين كلمة المرور قريباً.' 
        });
        
        // التوجيه تلقائياً إلى صفحة إدخال الرمز داخل التطبيق بعد ثانيتين ونصف
        setTimeout(() => {
          navigate('/reset-password');
        }, 2500);

      } else {
        setMessage({ type: 'error', text: data.message || 'حدث خطأ أثناء معالجة الطلب.' });
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
          <h2>استعادة كلمة المرور</h2>
          <p>أدخل بريدك الإلكتروني المسجل لإرسال رمز إعادة التعيين</p>
        </div>

        {message.text && (
          <div className={`login-alert ${message.type}`}>
            {message.type === 'success' && <IoCheckmarkCircleOutline style={{ marginLeft: '8px', fontSize: '18px' }} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <div className="loader-spinner"></div> : <span>إرسال رمز التعيين</span>}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p 
              style={{ fontSize: '0.9rem', color: 'var(--energy-text-dark)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', opacity: 0.8 }}
              onClick={() => navigate('/login')}
            >
              <IoArrowBackOutline />
              <span>العودة لتسجيل الدخول</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;