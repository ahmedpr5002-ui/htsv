import React, { useState, useEffect } from 'react'; 
import { MdOutlineDangerous } from "react-icons/md";
import { BiCollapseHorizontal } from "react-icons/bi";
import { FaListCheck, FaLink, FaSun, FaMoon } from 'react-icons/fa6'; 
import { 
  IoGridOutline, 
  IoCreateOutline, 
  IoAlertCircleOutline, 
  IoFileTrayFullOutline, 
  IoFileTrayStackedOutline, 
  IoBarChartOutline, 
  IoLayersOutline, 
  IoLogOutOutline,
  IoCloudUploadOutline,  
  IoBuildOutline
} from "react-icons/io5"; 
import { LuDatabase } from "react-icons/lu";

import { useNavigate, useLocation } from 'react-router-dom'; 
import { useAuth } from '../../context/Auth';
import { useTranslation } from 'react-i18next'; 
import logo from '../../image/logo.png';
import userImg from '../../image/images-removebg-preview.png';
import './rightBar.css';

function RightBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); 
  const location = useLocation(); 
  const { t, i18n } = useTranslation(['common']); 

  // 1. تذكر الثيم عند إعادة التشغيل
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // 2. تذكر اللغة عند إعادة التشغيل (قرائتها من المتصفح أو الاعتماد على اللغة الحالية للمكتبة)
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng') || i18n.language || 'ar';
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  // مراقبة الثيم وتطبيقه على علامة الـ HTML الرئيسية فور تغييره
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // دالة تبديل الوضع
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // دالة تبديل اللغة وحفظها في localStorage
  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('ar') ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('i18nextLng', nextLang); // حفظ اختيار اللغة
  };

  const userMenuItems = [
    { name: t('common:dashboard'), path: "/dashb", icon: <IoGridOutline className="menu-icon" /> },
    { name: t('common:add_project'), path: "/createproject", icon: <IoCreateOutline className="menu-icon" /> },
    { name: t('common:add_risk'), path: "/add-risk", icon: <IoAlertCircleOutline className="menu-icon" /> },
    { name: t('common:risk_registry'), path: "/sjlmacater", icon: <IoFileTrayFullOutline className="menu-icon" /> },
    { name: t('common:risk_base'), path: "/riskActionpage", icon: <IoFileTrayStackedOutline className="menu-icon"/> },
    { name: t('common:actions_base'), path: "/ViewActions", icon: <FaListCheck className="menu-icon"/> },
    { name: t('common:knowledge_base'), path: "/post", icon: <LuDatabase className="menu-icon" /> },
    { name: t('common:reports'), path: "/ReportsDashboard", icon: <IoBarChartOutline className="menu-icon" /> },
    { name: t('common:projects'), path: "/projects", icon: <IoLayersOutline className="menu-icon" /> },
  ];

  const adminMenuItems = [
    { name: t('common:admin_add_central_risk'), path: "/admin/central-risks", icon: <IoCloudUploadOutline className="menu-icon" /> },
    { name: t('common:admin_new_risks'), path: "/admin/ManualRisksPage", icon: <MdOutlineDangerous className="menu-icon" /> },
    { name: t('common:admin_new_Mitigation'), path: "/admin/RiskMitigationPage", icon: <BiCollapseHorizontal className="menu-icon" /> },
    { name: t('common:admin_system_control'), path: "/admin/system-status", icon: <IoBuildOutline className="menu-icon" /> },
    { name: t('common:knowledge_base'), path: "/post", icon: <LuDatabase className="menu-icon" /> },
    { name: t('common:Linking_risks'), path: "/admin/LinkRiskAction", icon: <FaLink className="menu-icon" /> },
  ];

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  // التحقق مما إذا كانت اللغة الحالية هي العربية (لتفعيل سويتش اللغة)
  const isArabic = i18n.language ? i18n.language.startsWith('ar') : true;

  return (
    <div className="sidebar-container">
        {/* اللوغو واسم النظام */}
        <div className="sidebar-logo-section">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <h3 className="sidebar-title">HVTL IRS</h3>
        </div>

        {/* أزرار التحكم والتبديل المطورة */}
        <div className="control-switchers-wrapper">
          {/* سويتش تغيير اللغة المطور */}
          <div className="switch-container" onClick={toggleLanguage} title={isArabic ? "Switch to English" : "التحويل إلى العربية"}>
            <span className={`switch-label-text ${isArabic ? 'active' : ''}`}>عربي</span>
            <div className={`custom-switch-bg ${!isArabic ? 'switch-en' : ''}`}>
              <div className="switch-handle"></div>
            </div>
            <span className={`switch-label-text ${!isArabic ? 'active' : ''}`}>EN</span>
          </div>
          
          {/* زر تبديل الوضع المظلم والفاتح المطور */}
          <button 
            className={`theme-toggle-btn-modern ${theme === 'dark' ? 'dark-active' : ''}`} 
            onClick={toggleTheme} 
            title={theme === 'light' ? 'الوضع الليلي' : 'الوضع الفاتح'}
          >
            <div className="theme-icon-container">
              {theme === 'light' ? <FaMoon className="theme-btn-icon m-icon" /> : <FaSun className="theme-btn-icon s-icon" />}
            </div>
            
          </button>
        </div>

        {/* القائمة الجانبية المفلترة */}
        <nav className="sidebar-menu">
            <ul>
                {user?.role !== 'admin' && (
                  userMenuItems.map((item, index) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <li 
                          key={`user-${index}`} 
                          className={`menu-item ${isActive ? 'active' : ''}`} 
                          onClick={() => handleItemClick(item)} 
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </li>
                    );
                  })
                )}

                {user?.role === 'admin' && (
                  <>
                    {adminMenuItems.map((item, index) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <li 
                              key={`admin-${index}`} 
                              className={`menu-item admin-item ${isActive ? 'active' : ''}`} 
                              onClick={() => handleItemClick(item)} 
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </li>
                        );
                    })}
                  </>
                )}
            </ul>
        </nav>

        {/* الجزء السفلي للمستخدم */}
        <div className="sidebar-footer">
            <div className="user-profile" style={{cursor: 'pointer'}} onClick={() => navigate('/profile')}>
             <img src={user?.image || userImg} alt="User" className="user-avatar" />
             <div className="user-info" style={{overflow:'hidden'}}>
                <h4>{user?.username || t('common:username_placeholder')}</h4>
                <p>{user?.email || "user@email.com"}</p>
             </div>
            </div>
            <button className="logout-btn" title={t('common:logout')} onClick={() => {
               logout();
               navigate('/login');
            }}>
             <IoLogOutOutline />
            </button>
        </div>
    </div>
  );
}

export default RightBar;