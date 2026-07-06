import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/Auth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { IoBuildOutline, IoCloudDownloadOutline, IoAlertCircleOutline } from "react-icons/io5";
import '../i18n.js';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة

// استيراد المكونات والصفحات
import DB from './page/DashB/DB';
import ForgotPassword from './page/ForgotPassword/ForgotPassword';
import RiskMitigation from './page/RiskMitigationPage/RiskMitigationPage.jsx';
import LinkRiskAction from './page/LinkRiskAction/LinkRiskAction.jsx';
import ResetPassword from './page/ResetPassword/ResetPassword';
import ViewActions from './page/ViewActions/ViewActions.jsx';
import ManualRisksPage from './page/ManualRisksPage/ManualRisksPage.jsx';
import MyProjects from './page/MyProjects/MyProjects.jsx';
import SystemStatusDashboard from './page/SystemStatusDashboard/SystemStatusDashboard.jsx';
import Home from './page/Home/Home.jsx';
import Login from './page/login/Login';
import RiskPage from './page/RisksPage/RisksPage.jsx';
import Register from './page/register/register';
import Profile from './page/profile/Profile';
import Sjlmacater from './page/sjlmacater/sjlmacater';
import Post from './page/Post/postPage';
import ReportsDashboard from './page/ReportsDashboard/ReportsDashboard';
import ReportPreviewPage from './page/ReportsDashboard/ReportPreviewPage.jsx';
import RR from './page/DashB/RiskRegistry';
import Risk from './page/RiskAssessmentForm/RiskAssessmentForm';
import RiskActionPage from './page/RiskActionPage/RiskActionPage';
import Project from './page/project/project';
import AddAction from './page/AddAction/addAction';
import './App.css';

function App() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation(['app']); // تهيئة ملف ترجمة مخصص للـ App
  
  // حالة تخزين إعدادات النظام القادمة من الباك إند
  const [systemConfig, setSystemConfig] = useState({ 
    isActive: false, 
    statusType: 'announcement', 
    message: '', 
    downloadLink: '',
    isBlocking: false 
  });
  const [sysLoading, setSysLoading] = useState(true);

  // مراقبة لغة التطبيق لتحديث الاتجاه ديناميكياً للويندوز
  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // دالة جلب حالة النظام
  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/system/status');
      const data = await response.json();
      if (data.success) {
        setSystemConfig(data);
      }
    } catch (error) {
      console.error("خطأ في الاتصال بسيرفر الحالة:", error);
    } finally {
      setSysLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();

    // الاستماع لحدث التحديث الفوري
    window.addEventListener('systemStatusUpdated', fetchSystemStatus);
    
    return () => {
      window.removeEventListener('systemStatusUpdated', fetchSystemStatus);
    };
  }, []);

  // 1. الانتظار حتى تنتهي عمليات التحقق والتحميل
  if (loading || sysLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--energy-gradient-bg)', color: 'var(--energy-blue-dark)', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
        {t('app:initializing_system')}
      </div>
    );
  }

  // 2. واجهة الحجب المحسنة بالكامل (تعتمد ديناميكياً على اتجاه الـ HTML)
  if (systemConfig.isActive && systemConfig.isBlocking && user?.role !== 'admin') {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: 'var(--energy-gradient-bg)', 
        color: 'var(--energy-text-dark)', 
        padding: '24px', 
        textAlign: 'center', 
        fontFamily: 'sans-serif',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* خلفية هندسية ناعمة تحاكي الطابع التقني للموقع */}
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(94, 205, 245, 0.1) 0%, rgba(47, 92, 158, 0) 70%)',
          top: '-10%',
          right: '-10%',
          zIndex: 0
        }} />

        {/* الكارت المركزي لمحتوى الصيانة */}
        <div style={{
          background: 'var(--energy-plug-white)',
          padding: '40px 32px',
          borderRadius: '16px',
          boxShadow: 'var(--energy-shadow-glow), 0 20px 25px -5px rgba(0, 0, 0, 0.05)',
          maxWidth: '540px',
          width: '100%',
          zIndex: 1,
          borderTop: '5px solid var(--energy-blue-medium)',
          transition: 'var(--energy-transition)'
        }}>
          
          {/* حاوية الأيقونة الاحترافية */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'var(--energy-gradient-linear)',
            borderRadius: 'var(--energy-radius-circle)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 24px auto',
            boxShadow: '0 0 20px rgba(94, 205, 245, 0.4)'
          }}>
            {systemConfig.statusType === 'maintenance' ? (
              <IoBuildOutline style={{ fontSize: '36px', color: 'var(--energy-plug-white)', animation: 'spin 4s linear infinite' }} />
            ) : systemConfig.statusType === 'update' ? (
              <IoCloudUploadOutline style={{ fontSize: '36px', color: 'var(--energy-plug-white)' }} />
            ) : (
              <IoAlertCircleOutline style={{ fontSize: '36px', color: 'var(--energy-plug-white)' }} />
            )}
          </div>

          {/* العنوان الرئيسي الهيكلي */}
          <h1 style={{ 
            fontSize: '1.8rem', 
            fontWeight: '700',
            color: 'var(--energy-blue-dark)', 
            marginBottom: '16px',
            letterSpacing: '-0.5px'
          }}>
            {systemConfig.statusType === 'maintenance' && t('app:status_maintenance')}
            {systemConfig.statusType === 'update' && t('app:status_update')}
            {systemConfig.statusType === 'announcement' && t('app:status_restricted')}
          </h1>

          {/* نص الرسالة الإدارية القادم من الباك إند */}
          <p style={{ 
            fontSize: '1.05rem', 
            color: 'var(--energy-text-dark)', 
            lineHeight: '1.7',
            margin: '0 0 24px 0',
            opacity: 0.9
          }}>
            {systemConfig.message || t('app:default_maintenance_message')}
          </p>

          {/* زر تحميل التحديث الذكي - يظهر فقط في وضع الـ update */}
          {systemConfig.statusType === 'update' && systemConfig.downloadLink && (
            <a 
              href={systemConfig.downloadLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px', 
                background: 'var(--energy-gradient-linear)', 
                color: 'var(--energy-plug-white)', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                fontWeight: '600', 
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(71, 159, 215, 0.3)',
                transition: 'var(--energy-transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <IoCloudUploadOutline style={{ fontSize: '18px' }} />
              <span>{t('app:download_update_btn')}</span>
            </a>
          )}
        </div>

        {/* كود CSS جانبي ومحلي لتأثير الدوران الخاص بأيقونة الصيانة عبر الـ JSX */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      {/* 1. مسار الصفحة الرئيسية */}
      <Route 
        path="/" 
        element={
          user ? (
            user.role === 'admin' ? (
              <Navigate to="/admin/system-status" replace />
            ) : (
              <Navigate to="/dashb" replace />
            )
          ) : (
            <Home />
          )
        } 
      />

      {/* 2. مسارات تسجيل الدخول والصفحات العامة */}
      <Route 
        path="/login" 
        element={
          user ? (
            user.role === 'admin' ? <Navigate to="/admin/system-status" replace /> : <Navigate to="/dashb" replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route path="/register" element={user ? <Navigate to="/dashb" replace /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashb" replace /> : <ForgotPassword />} />
      <Route path="/reset-password" element={user ? <Navigate to="/dashb" replace /> : <ResetPassword />} />

      {/* 3. مسارات مدير النظام */}
      <Route 
        path="/admin/system-status" 
        element={user && user.role === 'admin' ? <SystemStatusDashboard /> : <Navigate to="/dashb" replace />} 
      />
      <Route 
        path="/admin/central-risks" 
        element={user && user.role === 'admin' ? <RiskPage /> : <Navigate to="/dashb" replace />} 
      />
      <Route 
        path="/admin/manualriskspage" 
        element={user && user.role === 'admin' ? <ManualRisksPage /> : <Navigate to="/dashb" replace />} 
      />
      <Route 
        path="/admin/RiskMitigationPage" 
        element={user && user.role === 'admin' ? <RiskMitigation/> : <Navigate to="/dashb" replace />} 
      />
      <Route 
        path="/admin/LinkRiskAction" 
        element={user && user.role === 'admin' ? <LinkRiskAction /> : <Navigate to="/dashb" replace />} 
      />

      {/* 4. المسارات المحمية للمخدمين العاديين */}
      <Route path="/ViewActions" element={user ? <ViewActions /> : <Navigate to="/" replace />} />
      <Route path="/dashb" element={user ? <DB /> : <Navigate to="/" replace />} />
      <Route path="/projects" element={user ? <MyProjects /> : <Navigate to="/" replace />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" replace />} />
      <Route path="/sjlmacater" element={user ? <Sjlmacater /> : <Navigate to="/" replace />} />
      <Route path="/register/:projectId" element={user ? <Sjlmacater /> : <Navigate to="/" replace />} />
      <Route path="/post" element={user ? <Post /> : <Navigate to="/" replace />} />
      <Route path="/ReportsDashboard" element={user ? <ReportsDashboard /> : <Navigate to="/" replace />} />
      <Route path="/report-preview" element={user ? <ReportPreviewPage /> : <Navigate to="/" replace />} />
      <Route path="/riskregistry" element={user ? <RR /> : <Navigate to="/" replace />} />
      <Route path="/add-risk" element={user ? <Risk /> : <Navigate to="/" replace />} />
      <Route path="/riskActionpage" element={user ? <RiskActionPage /> : <Navigate to="/" replace />} />
      <Route path="/createproject" element={user ? <Project /> : <Navigate to="/" replace />} />
      <Route path="/add-action/:riskId" element={user ? <AddAction /> : <Navigate to="/" replace />} />

      {/* 5. مسار إعادة التوجيه الافتراضي لأي مسار خاطئ */}
      <Route path="*" element={user ? (user.role === 'admin' ? <Navigate to="/admin/system-status" replace /> : <Navigate to="/dashb" replace />) : <Home />} />
    </Routes>
  );
}

export default App;