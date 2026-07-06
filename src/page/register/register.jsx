import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useTranslation } from "react-i18next"; 
import toast, { Toaster } from "react-hot-toast";
import "./register.css";

const Register = () => {
  const { t, i18n } = useTranslation('register'); 
  const navigate = useNavigate();

  // هيكلية البيانات الجغرافية ثابتة المفاتيح لضمان استقرار الفلترة عند تغيير اللغة
  const companyStructure = {
    north: ["nineveh", "kirkuk", "saladin"],
    middle: ["baghdad", "diyala", "wasit", "anbar"],
    euphrates: ["babylon", "najaf", "karbala", "diwaniyah"],
    south: ["basra", "dhi_qar", "maysan", "muthanna"]
  };

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    company: "",
    governorate: "",
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "company") {
      setFormData({
        ...formData,
        company: value,
        governorate: "" 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      toast.success(t('notifications.image_selected'), {
        style: { border: '1px solid #5ECDF5', padding: '12px', color: '#1A2B49', background: '#ffffff' },
        iconTheme: { primary: '#479FD7', secondary: '#FFF' },
      });
    }
  };

  // دالة التحقق الصارم من الحقول وإظهار التوست المناسب للنقص
  const validateForm = () => {
    if (!image) {
      toast.error(t('notifications.required_image'));
      return false;
    }
    if (!formData.username.trim()) {
      toast.error(t('notifications.required_username'));
      return false;
    }
    if (!formData.email.trim()) {
      toast.error(t('notifications.required_email'));
      return false;
    }
    if (!formData.password.trim()) {
      toast.error(t('notifications.required_password'));
      return false;
    }
    if (!formData.company) {
      toast.error(t('notifications.required_company'));
      return false;
    }
    if (!formData.governorate) {
      toast.error(t('notifications.required_governorate'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // تفعيل فحص المدخلات الصارم
    if (!validateForm()) return;

    setLoading(true);

    const dataToSend = new FormData();
    dataToSend.append("username", formData.username);
    dataToSend.append("email", formData.email);
    dataToSend.append("password", formData.password);
    // إرسال الاسم المترجم الفعلي أو المفتاح الثابت حسب متطلبات الباك إند لديك
    dataToSend.append("company", t(`companies.${formData.company}`));
    dataToSend.append("governorate", t(`governorates.${formData.governorate}`));
    dataToSend.append("image", image);

    try {
      const response = await fetch("https://ahmedpr5002-irs-hvtl.hf.space/user/register", {
        method: "POST",
        body: dataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('notifications.register_failed'));
      }

      toast.success(t('notifications.register_success'), {
        duration: 4000,
        position: "top-center",
        style: {
          background: 'linear-gradient(135deg, #479FD7 0%, #2F5C9E 100%)',
          color: '#ffffff',
          fontWeight: '600',
          borderRadius: '12px',
          fontSize: '14px',
          direction: i18n.language === 'ar' ? 'rtl' : 'ltr'
        },
        iconTheme: { primary: '#ffffff', secondary: '#2F5C9E' },
      });

      setFormData({ username: "", email: "", password: "", company: "", governorate: "" });
      setImage(null);
      setPreviewUrl("");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      toast.error(err.message, {
        duration: 4000,
        position: "top-center",
        style: { 
          border: '1px solid #ef4444', 
          background: '#fef2f2', 
          color: '#ef4444', 
          fontWeight: '500', 
          borderRadius: '12px', 
          fontSize: '14px', 
          direction: i18n.language === 'ar' ? 'rtl' : 'ltr'
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const availableGovernorates = formData.company ? companyStructure[formData.company] : [];
  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="light-glass-wrapper" dir={currentDir}>
      <Toaster />

      <div className="light-glow-blob blob-1"></div>
      <div className="light-glow-blob blob-2"></div>

      <div className="light-glass-card">
        <form onSubmit={handleSubmit} className="light-form" noValidate>
          
          <div className="avatar-upload-section">
            <label className="avatar-label">
              <input type="file" name="image" accept="image/*" onChange={handleFileChange} />
              <div className="avatar-preview-box">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder-icon">
                    <i className="fa-solid fa-user-plus"></i>
                  </div>
                )}
                <div className="avatar-overlay">
                  <i className="fa-solid fa-camera camera-icon"></i>
                </div>
              </div>
            </label>
            <h3>{t('title')}</h3>
          </div>

          <div className="form-row-grid">
            <div className="input-field-container">
              <i className="fa-solid fa-user field-icon"></i>
              <input
                type="text"
                name="username"
                placeholder={t('placeholders.username')}
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-field-container">
              <i className="fa-solid fa-envelope field-icon"></i>
              <input
                type="email"
                name="email"
                placeholder={t('placeholders.email')}
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="input-field-container">
            <i className="fa-solid fa-lock field-icon"></i>
            <input
              type="password"
              name="password"
              placeholder={t('placeholders.password')}
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row-grid">
            {/* 1. قائمة اختيار الشركة */}
            <div className="input-field-container">
              <i className="fa-solid fa-building field-icon"></i>
              <select
                name="company"
                className="governorate-select"
                value={formData.company}
                onChange={handleInputChange}
              >
                <option value="" disabled hidden>{t('placeholders.select_company')}</option>
                {Object.keys(companyStructure).map((companyKey) => (
                  <option key={companyKey} value={companyKey}>
                    {t(`companies.${companyKey}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. قائمة اختيار المحافظة */}
            <div className="input-field-container">
              <i className="fa-solid fa-map-location-dot field-icon"></i>
              <select
                name="governorate"
                className={`governorate-select ${!formData.company ? "disabled-select" : ""}`}
                value={formData.governorate}
                onChange={handleInputChange}
                disabled={!formData.company}
              >
                <option value="" disabled hidden>
                  {!formData.company ? t('placeholders.select_company_first') : t('placeholders.select_governorate')}
                </option>
                {availableGovernorates.map((govKey) => (
                  <option key={govKey} value={govKey}>
                    {t(`governorates.${govKey}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="light-btn-submit" disabled={loading}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : t('buttons.register')}
          </button>

          <hr className="form-divider-light" />

          <div className="login-redirect-footer">
            <span>{t('footer.has_account')}</span>
            <button 
              type="button" 
              className="login-link-btn" 
              onClick={() => navigate("/login")}
            >
              {t('buttons.login')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Register;