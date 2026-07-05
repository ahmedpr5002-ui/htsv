import React from 'react';
import './Profile.css';
import { useAuth } from '../../context/Auth';
import { useNavigate } from 'react-router-dom';

// استيراد الأيقونات (تم إضافة أيقونة لوحة التحكم LuLayoutDashboard)
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlineFolderOpen } from 'react-icons/hi';
import { BiBuildingHouse } from 'react-icons/bi';
import { FiArrowUpLeft, FiLogOut } from 'react-icons/fi';
import { RiUserSharedLine, RiAdminLine } from 'react-icons/ri';
import { LuLayoutDashboard } from 'react-icons/lu'; 

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return <div className="premium-loader">جاري تأمين الحساب...</div>;

  return (
    <div className="premium-profile-page" dir="rtl">
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
              {user.role === 'admin' ? <RiAdminLine /> : <RiUserSharedLine />}
              <span>{user.role === 'admin' ? 'مدير النظام' : 'مستخدم المنصة'}</span>
            </div>
          </div>

          {/* زر العودة إلى لوحة التحكم المضاف حديثاً */}
          <button className="premium-dashboard-btn" onClick={() => navigate('/dashb')}>
            <LuLayoutDashboard className="dashboard-icon" />
            <span>لوحة التحكم</span>
          </button>

          <div className="premium-status-banner">
            <span className="static-active-text">الحساب نشط</span>
          </div>
        </div>

        {/* الجزء الأوسط: كروت البيانات الشخصية الموزعة بذكاء */}
        <div className="premium-profile-details">
          <h3 className="premium-title-context">البيانات الأساسية</h3>
          
          <div className="premium-data-stack">
            <div className="premium-data-item">
              <div className="premium-item-icon mail-color"><HiOutlineMail /></div>
              <div className="premium-item-texts">
                <span className="data-label">البريد الإلكتروني</span>
                <span className="data-value">{user.email}</span>
              </div>
            </div>

            <div className="premium-data-item">
              <div className="premium-item-icon company-color"><BiBuildingHouse /></div>
              <div className="premium-item-texts">
                <span className="data-label">الشركة الملحقة</span>
                <span className="data-value">{user.company}</span>
              </div>
            </div>

            <div className="premium-data-item">
              <div className="premium-item-icon location-color"><HiOutlineLocationMarker /></div>
              <div className="premium-item-texts">
                <span className="data-label">المحافظة / الموقع</span>
                <span className="data-value">{user.governorate}</span>
              </div>
            </div>
          </div>
        </div>

 
        <div className="premium-profile-actions">
          <div className="premium-project-box">
            <div className="project-box-header">
              <HiOutlineFolderOpen className="box-main-icon" />
              <h4>محيط العمل </h4>
              <p>اضغط أدناه للانتقال الفوري إلى مشاريعك الحالية.</p>
            </div>

            <a style={{cursor:'pointer'}} className="premium-project-link" onClick={()=>{
              navigate('/projects')
            }}>
              <div className="link-text-group">
                <span>استعراض مشاريعي</span>
                <small>الانتقال للمعرض</small>
              </div>
              <div className="link-circle-arrow">
                <FiArrowUpLeft />
              </div>
            </a>
          </div>

          <button className="premium-logout-trigger" onClick={() => {
            logout();
            navigate('/login');
          }}>
            <FiLogOut /> تسجيل خروج
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;