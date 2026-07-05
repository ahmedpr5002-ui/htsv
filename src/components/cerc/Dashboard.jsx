import React from 'react';
import RiskCard from './RiskCard';
/* 1. التأكد من الاستيراد الصحيح هنا */
import { IoScaleOutline, IoLogoUsd, IoShieldCheckmarkOutline } from "react-icons/io5"; 

function Dashboard() {
  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', flexWrap: 'wrap' }}>
      
      {/* كارت الخطر القانوني */}
      <RiskCard 
        title="نسبة الخطر القانوني" 
        percentage={72} 
        color="#7c3aed" 
        icon={IoScaleOutline} 
        average="3.92" 
      />

      {/* كارت الخطر المالي */}
      <RiskCard 
        title="نسبة الخطر المالي" 
        percentage={64} 
        color="#10b981" 
        /* 2. التأكد من تعديل الاسم هنا أيضاً ليطابق الاستيراد */
        icon={IoLogoUsd} 
        average="3.87" 
      />

      {/* كارت الخطر الفني */}
      <RiskCard 
        title="نسبة الخطر الفني" 
        percentage={71} 
        color="#0284c7" 
        icon={IoShieldCheckmarkOutline} 
        average="3.80" 
      />

    </div>
  );
}

export default Dashboard;