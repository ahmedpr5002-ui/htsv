// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // استيراد خطاف التوجيه
// import './login.css';
// import { useAuth } from '../../context/Auth';
// import logo from '../../image/logo.png'

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
  
//   const navigate = useNavigate(); // تهيئة خطاف التوجيه
//   const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/user/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setMessage({ type: 'success', text: 'تم تسجيل الدخول بنجاح! جاري التوجيه...' });
        
//         // حفظ التوكن في الـ localStorage عبر الـ Context
//         login(data.token)
        
//         // التوجيه السلس الذكي بدون عمل Refresh للمتصفح
//         setTimeout(() => {
//           navigate('/');
//         }, 1500);
//       } else {
//         setMessage({ type: 'error', text: data.message || 'فشل تسجيل الدخول، يرجى التحقق من البيانات.' });
//       }
//     } catch (error) {
//       setMessage({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم. حاول لاحقاً.' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     // استخدام فئة الـ wrapper المعزولة تماماً بمحاذاة الشاشة كاملة وعزل الـ Navbar
//     <div className="login-page-wrapper">
//       <div className="login-glass-card">
        
//         {/* الهيدر والشعار المستوحى من الهوية */}
//         <div className="login-header">
//            <img src={logo} alt="الشعار" className='logoLogin'/>
//            <h2>مرحباً بك مجدداً</h2>
//           <p>سجل دخولك للوصول إلى منصة إدارة المخاطر</p>
//         </div>

//         {/* صندوق رسائل حالة النظام */}
//         {message.text && (
//           <div className={`login-alert ${message.type}`}>
//             {message.text}
//           </div>
//         )}

//         {/* النموذج */}
//         <form onSubmit={handleSubmit}>
//           <div className="login-field">
//             <label htmlFor="email">البريد الإلكتروني</label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="name@company.com"
//               required
//             />
//           </div>

//           <div className="login-field">
//             <label htmlFor="password">كلمة المرور</label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               required
//             />
//           </div>

//           {/* زر تسجيل الدخول الرئيسي */}
//           <button type="submit" className="login-btn" disabled={loading}>
//             {loading ? <div className="loader-spinner"></div> : <span>تسجيل الدخول</span>}
//           </button>
          

//           {/* القسم الجديد الخاص بالتوجيه لإنشاء حساب */}
//           <div className="register-redirect-section" style={{ textAlign: 'center' }}>
//             <p style={{ fontSize: '0.9rem', color: 'var(--energy-text-dark)', marginBottom: '10px', opacity: 0.8 }}
//             >ليس لديك حساب؟<strong style={{color:"#479FD7",cursor:"pointer"}} onClick={()=>{
//               navigate('/register')
              

              


//             }}>انشاء حساب</strong></p>
          
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // استيراد خطاف التوجيه
import './login.css';
import { useAuth } from '../../context/Auth';
import logo from '../../image/logo.png';

const Login = () => {
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
        setMessage({ type: 'success', text: 'تم تسجيل الدخول بنجاح! جاري التوجيه...' });
        
        // حفظ التوكن في الـ localStorage عبر الـ Context
        login(data.token);
        
        // التوجيه السلس الذكي بدون عمل Refresh للمتصفح
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'فشل تسجيل الدخول، يرجى التحقق من البيانات.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم. حاول لاحقاً.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    // استخدام فئة الـ wrapper المعزولة تماماً بمحاذاة الشاشة كاملة وعزل الـ Navbar
    <div className="login-page-wrapper">
      <div className="login-glass-card">
        
        {/* الهيدر والشعار المستوحى من الهوية */}
        <div className="login-header">
           <img src={logo} alt="الشعار" className='logoLogin'/>
           <h2>مرحباً بك مجدداً</h2>
          <p>سجل دخولك للوصول إلى منصة إدارة المخاطر</p>
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
            <label htmlFor="email">البريد الإلكتروني</label>
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
            <label htmlFor="password">كلمة المرور</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* رابط "هل نسيت كلمة المرور؟" بمحاذاة يمين متناسقة هندسياً */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '-8px', marginBottom: '20px' }}>
            <span 
              style={{ color: '#479FD7', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', transition: 'opacity 0.2s' }}
              onClick={() => navigate('/forgot-password')}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              هل نسيت كلمة المرور؟
            </span>
          </div>

          {/* زر تسجيل الدخول الرئيسي */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <div className="loader-spinner"></div> : <span>تسجيل الدخول</span>}
          </button>
          
          {/* القسم الخاص بالتوجيه لإنشاء حساب */}
          <div className="register-redirect-section" style={{ textAlign: 'center', marginTop: '15px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--energy-text-dark)', marginBottom: '10px', opacity: 0.8 }}>
              ليس لديك حساب؟{' '}
              <strong 
                style={{ color: "#479FD7", cursor: "pointer" }} 
                onClick={() => navigate('/register')}
              >
                انشاء حساب
              </strong>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;