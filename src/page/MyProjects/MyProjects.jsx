import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RightBar from '../../components/rightBar/rightBar';
import { 
  FaFolderPlus, 
  FaFolderOpen, 
  FaCalendarDays, 
  FaCircleCheck, 
  FaCircleExclamation, 
  FaXmark,
  FaArrowLeftLong
} from 'react-icons/fa6';
import { HiOutlineDocumentDuplicate } from "react-icons/hi2";
import './myProjects.css';

const MyProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  
  const token = localStorage.getItem('token') || "";

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  // جلب المشاريع من السيرفر
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/user/myprojects', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setProjects(data);
          }
        } else {
          showToast("فشل في جلب قائمة المشاريع", "error");
        }
      } catch (error) {
        console.error("خطأ في الاتصال:", error);
        showToast("خطأ في الاتصال بالسيرفر", "error");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    } else {
      showToast("الرجاء تسجيل الدخول أولاً", "warning");
      setLoading(false);
    }
  }, [token]);

  // الدخول إلى سجل مخاطر المشروع
  const handleSelectProject = (projectId) => {
    localStorage.setItem('projectId', projectId);
    navigate(`/register/${projectId}`);
  };

  return (
    <>
      <RightBar />

      {/* نظام التوست الفاخر */}
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

      <div className="luxury-projects-container" dir="rtl">
        {/* العناوين والتحكم العلوي */}
        <div className="projects-header-bar">
          <div className="header-title-zone">
            <h1><FaFolderOpen className="title-icon" /> منصة إدارة المخاطر</h1>
            <p>نظام تتبع وتحليل المخاطر</p>
          </div>
          <button className="btn-add-new-project" onClick={() => navigate('/createproject')}>
            <FaFolderPlus /> إضافة مشروع جديد
          </button>
        </div>

        {/* شبكة عرض المشاريع */}
        <div className="projects-grid-layout">
          {loading ? (
            <div className="projects-status-message">جاري تحميل المنصات الحية...</div>
          ) : projects.length === 0 ? (
            <div className="projects-status-message">لا توجد مشاريع مسجلة لحسابك حالياً.</div>
          ) : (
            projects.map((proj) => (
              <div key={proj._id} className="project-luxury-card" onClick={() => handleSelectProject(proj._id)}>
                <div className="project-card-accent-line"></div>
                
                <div className="project-main-info">
                  <span className="project-tag-id">ID: {proj._id.slice(-6).toUpperCase()}</span>
                  <h3 className="project-card-title">{proj.name || proj.projectName || "مشروع خط نقل غير مسمى"}</h3>
                  <p className="project-card-desc">{proj.description || "لا يوجد وصف متوفر للمشروع حالياً. يتضمن هذا الخط الفحوصات الفنية المستمرة للمحاور الأربعة."}</p>
                </div>

                {/* البيانات الفنية والعدادات */}
                <div className="project-meta-data-zone">
                  <div className="meta-item">
                    <span className="meta-icon"><FaCalendarDays /></span>
                    <div className="meta-text">
                      <label>تاريخ الإنشاء</label>
                      <span>{proj.createdAt ? proj.createdAt.split('T')[0] : "—"}</span>
                    </div>
                  </div>

                  <div className="meta-item">
                    <span className="meta-icon"><HiOutlineDocumentDuplicate /></span>
                    <div className="meta-text">
                      <label>سجل الحالات</label>
                      <span>نشط مسبقاً</span>
                    </div>
                  </div>
                </div>

                {/* زر التوجيه السريع السلس */}
                <div className="project-action-arrow-zone">
                  <button className="circle-arrow-navigate-btn">
                    <FaArrowLeftLong />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default MyProjects;