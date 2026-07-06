import React from 'react';
import './Profile.css';
import { useAuth } from '../../context/Auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة

// استيراد الأيقونات
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlineFolderOpen } from 'react-icons/hi';
import { BiBuildingHouse } from 'react-icons/bi';
import { FiArrowUpLeft, FiLogOut } from 'react-icons/fi';
import { RiUserSharedLine, RiAdminLine, RiShieldFlashLine } from 'react-icons/ri';
import { LuLayoutDashboard, LuSlidersHorizontal } from 'react-icons/lu'; 

const Profile = () => {
  const { t, i18n } = useTranslation('profile'); // الالتزام باسم ملف الترجمة profile.json
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return <div className="premium-loader">{t('loading')}</div>;

  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const isAdmin = user.role === 'admin';

  return (
    <div className="premium-profile-page" dir={currentDir}>
      <div className="premium-glass-card">
        
        {/* الجزء الأيمن: كارد الهوية البصري */}
        <div className="premium-profile-identity">
          <div className="premium-avatar-container">
            <div className="circle-pulse-glow"></div>
            <img 
              src={user.image || 'https://via.placeholder.com/150'} 
              alt={user.username} 
              className="premium-circle-avatar" 
            />
            <span className="premium-online-indicator"></span>
          </div>

          <div className="premium-user-info">
            <h2 className="premium-display-name">{user.username}</h2>
            <div className="premium-role-badge">
              {isAdmin ? <RiAdminLine /> : <RiUserSharedLine />}
              <span>{isAdmin ? t('roles.admin') : t('roles.user')}</span>
            </div>
          </div>

          {/* زر التوجيه الذكي بناءً على الصلاحية */}
          {isAdmin ? (
            <button className="premium-dashboard-btn admin-mode-btn" onClick={() => navigate('/admin/system-status')}>
              <LuSlidersHorizontal className="dashboard-icon" />
              <span>{t('buttons.system_control') || 'لوحة تحكم النظام'}</span>
            </button>
          ) : (
            <button className="premium-dashboard-btn" onClick={() => navigate('/dashb')}>
              <LuLayoutDashboard className="dashboard-icon" />
              <span>{t('buttons.dashboard')}</span>
            </button>
          )}

          <div className="premium-status-banner">
            <span className="static-active-text">{t('status_active')}</span>
          </div>
        </div>

        {/* الجزء الأوسط: كروت البيانات الشخصية */}
        <div className="premium-profile-details">
          <h3 className="premium-title-context">{t('sections.basic_info')}</h3>
          
          <div className="premium-data-stack">
            <div className="premium-data-item">
              <div className="premium-item-icon mail-color"><HiOutlineMail /></div>
              <div className="premium-item-texts">
                <span className="data-label">{t('labels.email')}</span>
                <span className="data-value">{user.email}</span>
              </div>
            </div>

            <div className="premium-data-item">
              <div className="premium-item-icon company-color"><BiBuildingHouse /></div>
              <div className="premium-item-texts">
                <span className="data-label">{t('labels.company')}</span>
                <span className="data-value">{user.company}</span>
              </div>
            </div>

            <div className="premium-data-item">
              <div className="premium-item-icon location-color"><HiOutlineLocationMarker /></div>
              <div className="premium-item-texts">
                <span className="data-label">{t('labels.governorate')}</span>
                <span className="data-value">{user.governorate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* الجزء الأيسر: الإجراءات ومحيط العمل الديناميكي */}
        <div className="premium-profile-actions">
          <div className="premium-project-box">
            {isAdmin ? (
              /* واجهة صندوق العمل المخصصة للـ Admin */
              <>
                <div className="project-box-header">
                  <RiShieldFlashLine className="box-main-icon admin-color" />
                  <h4>{t('workspace.admin_title') || 'الإدارة المركزية'}</h4>
                  <p>{t('workspace.admin_description') || 'التحكم وتعديل بنك المخاطر العام المتاح لكافة مهندسي المشاريع.'}</p>
                </div>

                <a style={{cursor:'pointer'}} className="premium-project-link" onClick={() => navigate('/admin/central-risks')}>
                  <div className="link-text-group">
                    <span>{t('workspace.admin_link_title') || 'قاعدة بيانات المخاطر'}</span>
                    <small>{t('workspace.admin_link_subtitle') || 'إدخال وتعديل محاور الخطر'}</small>
                  </div>
                  <div className="link-circle-arrow" style={{ transform: i18n.language === 'en' ? 'rotate(90deg)' : 'none' }}>
                    <FiArrowUpLeft />
                  </div>
                </a>
              </>
            ) : (
              /* واجهة صندوق العمل الافتراضية للمستخدم العادي */
              <>
                <div className="project-box-header">
                  <HiOutlineFolderOpen className="box-main-icon" />
                  <h4>{t('workspace.title')}</h4>
                  <p>{t('workspace.description')}</p>
                </div>

                <a style={{cursor:'pointer'}} className="premium-project-link" onClick={() => navigate('/projects')}>
                  <div className="link-text-group">
                    <span>{t('workspace.link_title')}</span>
                    <small>{t('workspace.link_subtitle')}</small>
                  </div>
                  <div className="link-circle-arrow" style={{ transform: i18n.language === 'en' ? 'rotate(90deg)' : 'none' }}>
                    <FiArrowUpLeft />
                  </div>
                </a>
              </>
            )}
          </div>

          <button className="premium-logout-trigger" onClick={() => {
            logout();
            navigate('/login');
          }}>
            <FiLogOut /> {t('buttons.logout')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;