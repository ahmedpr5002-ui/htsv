import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import toast, { Toaster } from "react-hot-toast";
import "./register.css";

// هيكلية البيانات الجغرافية التابعة لكل شركة حسب منطقتها
const companyStructure = {
  "الشمال": ["نينوى", "كركوك", "صلاح الدين"],
  "الوسط": ["بغداد", "ديالى", "واسط", "الأنبار"],
  "فرات أوسط": ["بابل", "النجف", "كربلاء", "الديوانية"],
  "الجنوب": ["البصرة", "ذي قار", "ميسان", "المثنى"]
};

const Register = () => {
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

  const navigate = useNavigate();

  // معالجة تغيير المدخلات
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "company") {
      // إذا تغيرت الشركة، نقوم بتحديث الشركة وتصفير المحافظة لإجبار المستخدم على اختيار محافظة جديدة تابعة لها
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
      
      toast.success("تم اختيار الصورة بنجاح", {
        style: { border: '1px solid #5ECDF5', padding: '12px', color: '#1A2B49', background: '#ffffff' },
        iconTheme: { primary: '#479FD7', secondary: '#FFF' },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.company || !formData.governorate) {
      toast.error("يرجى اختيار الشركة والمحافظة التابعة لها أولاً");
      return;
    }

    setLoading(true);

    const dataToSend = new FormData();
    dataToSend.append("username", formData.username);
    dataToSend.append("email", formData.email);
    dataToSend.append("password", formData.password);
    dataToSend.append("company", formData.company);
    dataToSend.append("governorate", formData.governorate);
    if (image) dataToSend.append("image", image);

    try {
      const response = await fetch("https://ahmedpr5002-irs-hvtl.hf.space/user/register", {
        method: "POST",
        body: dataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشلت عملية إنشاء الحساب");
      }

      toast.success("تم تسجيل حسابك بنجاح أهلاً بك!", {
        duration: 4000,
        position: "top-center",
        style: {
          background: 'linear-gradient(135deg, #479FD7 0%, #2F5C9E 100%)',
          color: '#ffffff',
          fontWeight: '600',
          borderRadius: '12px',
          fontSize: '14px',
          direction: 'rtl'
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
        style: { border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontWeight: '500', borderRadius: '12px', fontSize: '14px', direction: 'rtl' },
      });
    } finally {
      setLoading(false);
    }
  };

  // جلب قائمة المحافظات المتاحة بناءً على الشركة المختارة حالياً
  const availableGovernorates = formData.company ? companyStructure[formData.company] : [];

  return (
    <div className="light-glass-wrapper">
      <Toaster />

      <div className="light-glow-blob blob-1"></div>
      <div className="light-glow-blob blob-2"></div>

      <div className="light-glass-card">
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="light-form">
          
          <div className="avatar-upload-section">
            <label className="avatar-label">
              <input type="file" name="image" accept="image/*" required onChange={handleFileChange} />
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
            <h3>إنشاء حساب جديد</h3>
          </div>

          <div className="form-row-grid">
            <div className="input-field-container">
              <i className="fa-solid fa-user field-icon"></i>
              <input
                type="text"
                name="username"
                required
                placeholder="اسم المستخدم"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-field-container">
              <i className="fa-solid fa-envelope field-icon"></i>
              <input
                type="email"
                name="email"
                required
                placeholder="البريد الإلكتروني"
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
              required
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row-grid">
            {/* 1. قائمة اختيار الشركة (إجبارية أولاً) */}
            <div className="input-field-container">
              <i className="fa-solid fa-building field-icon"></i>
              <select
                name="company"
                required
                className="governorate-select"
                value={formData.company}
                onChange={handleInputChange}
              >
                <option value="" disabled hidden>اختر الشركة</option>
                {Object.keys(companyStructure).map((companyName) => (
                  <option key={companyName} value={companyName}>{companyName}</option>
                ))}
              </select>
            </div>

            {/* 2. قائمة اختيار المحافظة (تعتمد كلياً على تفعيل حقل الشركة) */}
            <div className="input-field-container">
              <i className="fa-solid fa-map-location-dot field-icon"></i>
              <select
                name="governorate"
                required
                className={`governorate-select ${!formData.company ? "disabled-select" : ""}`}
                value={formData.governorate}
                onChange={handleInputChange}
                disabled={!formData.company} // يغلق الحقل تماماً إذا لم يتم اختيار شركة
              >
                <option value="" disabled hidden>
                  {!formData.company ? "اختر الشركة أولاً" : "اختر المحافظة"}
                </option>
                {availableGovernorates.map((gov) => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="light-btn-submit" disabled={loading}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "تسجيل الحساب"}
          </button>

          <hr className="form-divider-light" />

          <div className="login-redirect-footer">
            <span>لديك حساب بالفعل؟</span>
            <button 
              type="button" 
              className="login-link-btn" 
              onClick={() => navigate("/login")}
            >
              تسجيل الدخول
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Register;