import React from 'react'; 
import { MdOutlineDangerous } from "react-icons/md";
import { FaListCheck } from 'react-icons/fa6';
import { 
  IoGridOutline, 
  IoCreateOutline, 
  IoAlertCircleOutline, 
  IoFileTrayFullOutline, 
  IoFileTrayStackedOutline, 
  IoBarChartOutline, 
  IoLayersOutline, 
  IoSettingsOutline,
  IoLogOutOutline,
  IoCloudUploadOutline,  
  IoBuildOutline          
} from "react-icons/io5"; 
import { LuDatabase } from "react-icons/lu";

import { useNavigate, useLocation } from 'react-router-dom'; 
import { useAuth } from '../../context/Auth';
import { useTranslation } from 'react-i18next'; // 1. استيراد التابع
import logo from '../../image/logo.png';
import userImg from '../../image/images-removebg-preview.png';
import './rightBar.css';

function RightBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); 
  const location = useLocation(); 
  const { t, i18n } = useTranslation(['common']); // 2. تهيئة الترجمة من قسم common

  // 3. استبدال النصوص الثابتة بمفاتيح الترجمة t()
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
    { name: t('common:admin_system_control'), path: "/admin/system-status", icon: <IoBuildOutline className="menu-icon" /> },
    { name: t('common:knowledge_base'), path: "/post", icon: <LuDatabase className="menu-icon" /> },
  ];

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  // 4. تابع تبديل اللغة
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="sidebar-container">
        {/* اللوغو واسم النظام */}
        <div className="sidebar-logo-section">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <h3 className="sidebar-title">HVTL IRS</h3>
        </div>

        {/* 5. زر تبديل اللغة المضاف بتصميم متناسق */}
        <div className="language-switcher-container">
          <button className="lang-toggle-btn" onClick={toggleLanguage}>
            {i18n.language === 'ar' ? 'English' : 'العربية'}
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
            <div className="user-profile" >
             <img src={user?.image || userImg} alt="User" className="user-avatar" onClick={() => navigate('/profile')} />
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