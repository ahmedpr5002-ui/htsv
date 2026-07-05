import React, { useState, useEffect } from 'react';
import { 
  IoBuildOutline, 
  IoCloudUploadOutline, 
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoSaveOutline,
  IoInformationCircleOutline
} from "react-icons/io5";
import RightBar from '../../components/rightBar/rightBar';
import './SystemStatusDashboard.css';

function SystemStatusDashboard() {
  // الحالات الافتراضية للنموذج
  const [isActive, setIsActive] = useState(false);
  const [statusType, setStatusType] = useState('announcement');
  const [message, setMessage] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, text: '', type: '' });

  // جلب البيانات الحالية من السيرفر عند فتح لوحة التحكم لملء الحقول تلقائياً
  useEffect(() => {
    const loadCurrentStatus = async () => {
      try {
        const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/system/status');
        const data = await response.json();
        if (data.success || data.isActive !== undefined) {
          setIsActive(data.isActive ?? false);
          setStatusType(data.statusType ?? 'announcement');
          setMessage(data.message ?? '');
          setDownloadLink(data.downloadLink ?? '');
          setIsBlocking(data.isBlocking ?? false);
        }
      } catch (error) {
        console.error("فشل تحميل البيانات الأولية للوحة التحكم", error);
      }
    };
    loadCurrentStatus();
  }, []);

  // دالة لإظهار التنبيهات المؤقتة
  const showToast = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: '', type: '' }), 4000);
  };

  // إرسال البيانات إلى الـ Backend وبث الإشارة محلياً
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/system/admin/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // جلب توكن الأدمن
        },
        body: JSON.stringify({ isActive, statusType, message, downloadLink, isBlocking })
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast("تم تحديث حالة النظام وبثها بنجاح!", "success");
        
        // 🔥 بث الحدث لملف App.jsx لتحديث الواجهة فوراً بدون الحاجة لعمل Refresh
        window.dispatchEvent(new Event('systemStatusUpdated'));
        
      } else {
        showToast(data.message || "حدث خطأ أثناء التحديث", "error");
      }
    } catch (error) {
      showToast("فشل الاتصال بالخادم الرئيسي", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <RightBar/>
    
    <div className="status-dashboard-container">
      {/* التنبيه العائم (Toast) */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <IoCheckmarkCircleOutline /> : <IoAlertCircleOutline />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* الرأس / عنوان الصفحة */}
      <div className="dashboard-header-section">
        <div className="header-icon-wrapper">
          <IoBuildOutline className="header-main-icon" />
        </div>
        <div>
          <h2>التحكم في حالة التطبيق والصيانة</h2>
          <p>إدارة التنبيهات المركزية، الإعلان عن إصدارات جديدة، أو قفل النظام لأعمال الصيانة الدورية.</p>
        </div>
      </div>

      <div className="dashboard-grid-layout">
        {/* القسم الأيمن: نموذج الإعدادات */}
        <form className="settings-form-card" onSubmit={handleSubmit}>
          <h3 className="card-title">تحديث الحالة والإعلانات العامة</h3>
          
          {/* حقل التفعيل الرئيسي */}
          <div className="form-group toggle-group">
            <div className="toggle-label-desc">
              <label>تفعيل وضع الإعلان الحركي</label>
              <p>عند تفعيل هذا الخيار سيتم بث التنبيه لجميع المستخدمين فوراً.</p>
            </div>
            <label className="energy-switch">
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)} 
              />
              <span className="energy-slider"></span>
            </label>
          </div>

          <hr className="form-divider" />

          {/* نوع الحالة */}
          <div className="form-group">
            <label className="field-label">نوع التنبيه الموجه</label>
            <div className="status-type-selector">
              <label className={`type-box ${statusType === 'maintenance' ? 'selected-maintenance' : ''}`}>
                <input 
                  type="radio" 
                  name="statusType" 
                  value="maintenance"
                  checked={statusType === 'maintenance'}
                  onChange={(e) => { setStatusType(e.target.value); setIsBlocking(true); }}
                />
                <IoBuildOutline className="radio-icon" />
                <span>وضع الصيانة (حجب)</span>
              </label>

              <label className={`type-box ${statusType === 'update' ? 'selected-update' : ''}`}>
                <input 
                  type="radio" 
                  name="statusType" 
                  value="update"
                  checked={statusType === 'update'}
                  onChange={(e) => { setStatusType(e.target.value); setIsBlocking(false); }}
                />
                <IoCloudUploadOutline className="radio-icon" />
                <span>نسخة وتحديث جديد</span>
              </label>

              <label className={`type-box ${statusType === 'announcement' ? 'selected-announce' : ''}`}>
                <input 
                  type="radio" 
                  name="statusType" 
                  value="announcement"
                  checked={statusType === 'announcement'}
                  onChange={(e) => { setStatusType(e.target.value); setIsBlocking(false); }}
                />
                <IoInformationCircleOutline className="radio-icon" />
                <span>تنبيه / إعلان عام</span>
              </label>
            </div>
          </div>

          {/* نص الرسالة */}
          <div className="form-group">
            <label className="field-label">محتوى رسالة البث للمستخدمين</label>
            <textarea 
              className="energy-textarea" 
              placeholder="اكتب هنا الرسالة التي ستظهر في شاشة الصيانة أو شريط التنبيهات..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {/* رابط التحميل (يظهر عند اختيار نسخة جديدة فقط) */}
          {statusType === 'update' && (
            <div className="form-group animated-fade-in">
              <label className="field-label">رابط تحميل النسخة الجديدة (URL)</label>
              <input 
                type="url" 
                className="energy-input" 
                placeholder="https://example.com/download/app-v2.msi"
                value={downloadLink}
                onChange={(e) => setDownloadLink(e.target.value)}
                required={statusType === 'update'}
              />
            </div>
          )}

          {/* خيار الحجب الكامل للموقع */}
          <div className="form-group toggle-group bg-light-group">
            <div className="toggle-label-desc">
              <label>حجب واجهة التطبيق بالكامل (Blocking)</label>
              <p>تفعيل هذا الخيار سيمنع المستخدمين من تصفح أي صفحة وتوجيههم لصفحة مغلقة.</p>
            </div>
            <label className="energy-switch">
              <input 
                type="checkbox" 
                checked={isBlocking} 
                onChange={(e) => setIsBlocking(e.target.checked)}
                disabled={statusType === 'maintenance'} // إجباري يكون true في الصيانة
              />
              <span className="energy-slider"></span>
            </label>
          </div>

          {/* زر الحفظ */}
          <button type="submit" className="energy-submit-btn" disabled={loading}>
            <IoSaveOutline />
            <span>{loading ? 'جاري حفظ التعديلات...' : 'تحديث وبث الحالة الفورية'}</span>
          </button>
        </form>

        {/* القسم الأيسر: المعاينة الحية (Live Preview) */}
        <div className="preview-card-wrapper">
          <h3 className="card-title">معاينة حية لشاشات المستخدمين</h3>
          
          <div className="live-preview-window">
            <div className="browser-top-bar">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              <div className="mock-url">hvtl-irs.com</div>
            </div>

            <div className="mock-app-content">
              {/* إذا كانت مفعله وبلوك (مثل الصيانة) */}
              {isActive && isBlocking ? (
                <div className="mock-maintenance-screen">
                  <IoBuildOutline className="anim-pulse icon-big" />
                  <h4>التطبيق تحت الصيانة الحالية</h4>
                  <p>{message || "النظام حالياً تحت الصيانة الدورية، سنعود قريباً."}</p>
                </div>
              ) : (
                <div className="mock-normal-screen">
                  {/* شريط الإعلان العلوي في حال عدم الحجب */}
                  {isActive && statusType === 'update' && (
                    <div className="mock-update-banner">
                      <span>{message || "يتوفر إصدار جديد من التطبيق حالياً!"}</span>
                      <a href={downloadLink} onClick={(e) => e.preventDefault()} className="mock-btn">تحميل النسخة</a>
                    </div>
                  )}
                  {isActive && statusType === 'announcement' && (
                    <div className="mock-announcement-banner">
                      <span>{message || "تنبيه إداري عام لجميع المستخدمين."}</span>
                    </div>
                  )}
                  
                  {/* محتوى وهمي خلفي */}
                  <div className="mock-dashboard-data">
                    <div className="mock-box short"></div>
                    <div className="mock-box long"></div>
                    <div className="mock-box mid"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default SystemStatusDashboard;