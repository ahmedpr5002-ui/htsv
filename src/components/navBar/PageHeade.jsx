import React, { useState, useEffect } from 'react';
import './PageHeade.css';

function PageHeader({ title = "لوحة التحكم", subtitle = "نظرة عامة على المخاطر للمشروع الحالي" }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // تفعيل الأنيميشن بعد 50 مللي ثانية فقط من دخول الصفحة لضمان وعي المتصفح بالحركة
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, [title]); // يتم إعادة تشغيل الحركة إذا تغير عنوان الصفحة أيضاً

  return (
    <div className={`page-header-banner ${isLoaded ? 'banner-visible' : ''}`}>
      <div className={`header-content ${isLoaded ? 'content-visible' : ''}`}>
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

export default PageHeader;