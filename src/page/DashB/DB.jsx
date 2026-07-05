import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsReplyAll } from "react-icons/bs";
import { useAuth } from '../../context/Auth';
import { 
  FaScaleBalanced, 
  FaDollarSign, 
  FaShieldHalved, 
  FaTriangleExclamation,
  FaRegBell,
  FaCalendarDays,
  FaClock,
  FaPlus,
  FaFolderOpen,
  FaArrowLeft,
  FaSignal
} from "react-icons/fa6";

import { HiMiniArrowTrendingUp } from "react-icons/hi2";
import RightBar from '../../components/rightBar/rightBar';
import './DB.css';

const STUDY_AVERAGES = {
  law: 3.8984,
  money: 3.8667,
  tech: 3.8033
};

// دالة موحدة وثابتة لمعالجة حقل time بدقة وحسم أية مسافات أو اختلافات قادمة من قاعدة البيانات
const normalizeTime = (val) => {
  const cleanVal = String(val || "").trim();
  if (cleanVal === 'قبل' || cleanVal === 'ما قبل التنفيذ') return 'ما قبل التنفيذ';
  if (cleanVal === 'اثناء' || cleanVal === 'التنفيذ') return 'التنفيذ';
  if (cleanVal === 'بعد' || cleanVal === 'الاستلام والتشغيل') return 'الاستلام والتشغيل';
  return cleanVal || 'التنفيذ'; 
};
const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(localStorage.getItem('projectId') || '');
  const [allProjectRisks, setAllProjectRisks] = useState([]); 
  
  // المرحلة النشطة الافتراضية عند فتح الصفحة
  const [activeStage, setActiveStage] = useState('التنفيذ'); 
  
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [lastUpdateDate, setLastUpdateDate] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState('');
  
  const token = localStorage.getItem('token') || ""; 

  const formatArabicDateTime = (isoString) => {
    try {
      const dateObj = isoString ? new Date(isoString) : new Date();
      if (isNaN(dateObj.getTime())) throw new Error("Invalid Date");
      
      const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = dateObj.toLocaleDateString('ar-IQ', dateOptions);
      
      const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
      let formattedTime = dateObj.toLocaleTimeString('ar-IQ', timeOptions);
      
      formattedTime = formattedTime.replace('ص', 'صباحاً').replace('م', 'مساءً');

      setLastUpdateDate(formattedDate);
      setLastUpdateTime(formattedTime);
    } catch (e) {
      const fallbackDate = new Date();
      setLastUpdateDate(fallbackDate.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' }));
      setLastUpdateTime(fallbackDate.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', hour12: true }).replace('ص', 'صباحاً').replace('م', 'مساءً'));
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/user/myprojects', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);
        
        if (data && data.length > 0) {
          const savedId = localStorage.getItem('projectId');
          const isSavedIdValid = data.some(p => p._id === savedId);
          
          if (!savedId || !isSavedIdValid) {
            setSelectedProjectId(data[0]._id);
            localStorage.setItem('projectId', data[0]._id);
          }
        } else {
          formatArabicDateTime(null);
        }
        setLoadingProjects(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        formatArabicDateTime(null);
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [token]);

  const handleProjectChange = (id) => {
    setSelectedProjectId(id);
    localStorage.setItem('projectId', id);
  };

  useEffect(() => {
    if (!selectedProjectId) return;
    
    const fetchProjectRisks = async () => {
      setLoadingDetails(true);
      try {
        const response = await fetch(`https://ahmedpr5002-irs-hvtl.hf.space/dang/project/${selectedProjectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const risksData = Array.isArray(data) ? data : (data.risks || []);
          setAllProjectRisks(risksData);
          
          if (risksData.length > 0) {
            const validDatedRisks = risksData.filter(r => r.updatedAt || r.createdAt);
            if (validDatedRisks.length > 0) {
              const latestRisk = validDatedRisks.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0];
              formatArabicDateTime(latestRisk.updatedAt || latestRisk.createdAt);
            } else {
              formatArabicDateTime(null);
            }
          } else {
            formatArabicDateTime(null);
          }
        } else {
          setAllProjectRisks([]);
          formatArabicDateTime(null);
        }
        setLoadingDetails(false);
      } catch (error) {
        console.error("Error fetching project risks:", error);
        setAllProjectRisks([]);
        formatArabicDateTime(null);
        setLoadingDetails(false);
      }
    };
    fetchProjectRisks();
  }, [selectedProjectId, token]);

  // ==========================================
  // الفلترة الصارمة بالاعتماد على دالة normalizeTime المشتركة لحقل time فقط
  // ==========================================
  const filteredRisks = allProjectRisks.filter(risk => {
    return normalizeTime(risk.time) === activeStage;
  });

  const getAxisType = (risk) => {
    const code = String(risk.riskCode || "").toUpperCase();
    const text = String(risk.riskText || risk.description || "").toLowerCase();
    const axisField = String(risk.axis || "").toLowerCase();
    
    if (code.startsWith('L') || text.includes('قانون') || text.includes('تعويض') || axisField.includes('قانوني')) return 'law';
    if (code.startsWith('F') || text.includes('مالي') || text.includes('تمويل') || text.includes('سعر') || axisField.includes('مالي')) return 'money';
    
    return 'tech';
  };

  const calculateAxisMetrics = (axisType) => {
    const axisRisks = filteredRisks.filter(r => getAxisType(r) === axisType);
    
    if (axisRisks.length === 0) {
      return { avg: "0.00", percentage: 0, colorClass: 'green-chart' };
    }
    
    const sum = axisRisks.reduce((acc, curr) => {
      const value = parseFloat(curr.riiPercentage) || parseFloat(curr.riskScore) || 0;
      return acc + value;
    }, 0);
    
    const avgScore = sum / axisRisks.length;
    
    let colorClass = 'green-chart';
    if (avgScore >= 60 && avgScore < 80) colorClass = 'yellow-chart';
    if (avgScore >= 80) colorClass = 'red-chart';

    return {
      avg: (avgScore / 20).toFixed(4), 
      percentage: Math.min(Math.round(avgScore), 100),
      colorClass
    };
  };

  const lawMetrics = calculateAxisMetrics('law');
  const moneyMetrics = calculateAxisMetrics('money');
  const techMetrics = calculateAxisMetrics('tech');

  const getEarlyWarning = () => {
    const criticalRisk = filteredRisks.find(r => {
      const score = parseFloat(r.riiPercentage) || parseFloat(r.riskScore) || 0;
      const statusStr = String(r.operationalStatus || "").toLowerCase();
      return score >= 85 && (statusStr === 'مفتوحة' || statusStr === ''); 
    });

    if (criticalRisk) {
      return {
        hasWarning: true,
        text: `خطر نشط: ${criticalRisk.riskText}`
      };
    }
    return {
      hasWarning: false,
      text: "جميع المخاطر الحالية تقع ضمن الحدود الآمنة."
    };
  };
  
  const warningSystem = getEarlyWarning();

  const topFiveRisks = [...filteredRisks]
    .sort((a, b) => (parseFloat(b.riskScore) || parseFloat(b.riiPercentage) || 0) - (parseFloat(a.riskScore) || parseFloat(a.riiPercentage) || 0))
    .slice(0, 5);

  const getAxisBadgeDetails = (risk) => {
    const type = getAxisType(risk);
    if (type === 'law') return { text: 'قانوني', class: 'law' };
    if (type === 'money') return { text: 'مالي', class: 'money' };
    return { text: 'فني', class: 'tech' };
  };
  const { user } = useAuth();

  // دالة لجلب كلاس الحالة بناءً على الملف السابق لتنسيق الألوان لو أردت
  const getStatusClassName = (risk) => {
    if (risk.type === 'ثابت' || risk.type === 'fixed' || risk.operationalStatus === 'مغلقة بقرار مؤسسي') {
      return 'status-type-institutional-close';
    }
    if (risk.operationalStatus === 'مغلقة بحل فني') {
      return 'status-type-technical-close';
    }
    if (risk.operationalStatus === 'قيد المعالجة') {
      return 'status-type-proc';
    }
    return 'status-type-open';
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content-area">
        
        <header className="dashboard-filters">
          <div className="filter-group project-select">
            <label>المشروع الحالي</label>
            {loadingProjects ? (
              <select disabled><option>جاري تحميل قائمة المشاريع...</option></select>
            ) : (
              <select 
                value={selectedProjectId} 
                onChange={(e) => handleProjectChange(e.target.value)}
              >
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.projectName || `مشروع خط 400kV الموصل - كركوك`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="last-update">
            <div className="update-title">
              <FaClock className="icon-time" />
              <span>توقيت التحديث الفعال</span>
            </div>
            <strong>{lastUpdateDate || "جاري المعالجة..."}</strong>
            <small>{lastUpdateTime || "..."}</small>
          </div>
        </header>

        <section className="metrics-grid">
          <div className="metric-card">
            <div className="card-header">
              <span>نسبة الخطر القانوني</span>
              <FaScaleBalanced className="icon-law-badge" />
            </div>
            <div className="progress-gauge">
              <svg viewBox="0 0 36 36" className={`circular-chart ${lawMetrics.colorClass}`}>
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray={`${lawMetrics.percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.3" className="percentage">{lawMetrics.percentage}%</text>
                <text x="18" y="27" className="sub-text">Risk Score حالي</text>
              </svg>
            </div>
            <div className="card-footer">
              <span>المعيار الثابت: {STUDY_AVERAGES.law}</span>
              <span className="chart-bar-icon isn"><FaSignal/></span>
            </div>
          </div>

          <div className="metric-card">
            <div className="card-header">
              <span>نسبة الخطر المالي</span>
              <FaDollarSign className="icon-money-badge" />
            </div>
            <div className="progress-gauge">
              <svg viewBox="0 0 36 36" className={`circular-chart ${moneyMetrics.colorClass}`}>
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray={`${moneyMetrics.percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.3" className="percentage">{moneyMetrics.percentage}%</text>
                <text x="18" y="27" className="sub-text">Risk Score حالي</text>
              </svg>
            </div>
            <div className="card-footer">
              <span>المعيار الثابت: {STUDY_AVERAGES.money}</span>
              <span className="chart-bar-icon isn"><FaSignal/></span>
            </div>
          </div>

          <div className="metric-card">
            <div className="card-header">
              <span>نسبة الخطر الفني</span>
              <FaShieldHalved className="icon-tech-badge" />
            </div>
            <div className="progress-gauge">
              <svg viewBox="0 0 36 36" className={`circular-chart ${techMetrics.colorClass}`}>
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray={`${techMetrics.percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.3" className="percentage">{techMetrics.percentage}%</text>
                <text x="18" y="27" className="sub-text">Risk Score حالي</text>
              </svg>
            </div>
            <div className="card-footer">
              <span>المعيار الثابت: {STUDY_AVERAGES.tech}</span>
              <span className="chart-bar-icon isn"><FaSignal/></span>
            </div>
          </div>

          <div className={`alert-card ${warningSystem.hasWarning ? 'trigger-active' : ''}`}>
            <div className="alert-header">
              <span>مؤشر الإنذار المبكر</span>
              <FaRegBell className="bell-icon" />
            </div>
            <div className="alert-content">
              <FaTriangleExclamation className="warning-tri" />
              <h3>{warningSystem.hasWarning ? "رصد خطر غير مستقر" : "الوضعية آمنة"}</h3>
              <p>(RII ≥ 85%)</p>
              <small className="warning-desc-text" title={warningSystem.text}>
                {warningSystem.text}
              </small>
            </div>
          </div>
        </section>

        <section className="timeline-filter-section">
          <div className="timeline-title">
            <FaCalendarDays className="calendar-icon" />
            <span>فلتر المرحلة الزمنية الحالي </span>
          </div>
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeStage === 'ما قبل التنفيذ' ? 'active' : ''}`}
              onClick={() => setActiveStage('ما قبل التنفيذ')}
            >
              ما قبل التنفيذ
            </button>
            <button 
              className={`tab-btn ${activeStage === 'التنفيذ' ? 'active' : ''}`}
              onClick={() => setActiveStage('التنفيذ')}
            >
              التنفيذ
            </button>
            <button 
              className={`tab-btn ${activeStage === 'الاستلام والتشغيل' ? 'active' : ''}`}
              onClick={() => setActiveStage('الاستلام والتشغيل')}
            >
              الاستلام والتشغيل
            </button>
          </div>
        </section>

        <div className="dashboard-bottom-split">
          
          <div className="table-section-container">
            <div className="table-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="trend-icon"><HiMiniArrowTrendingUp /></span>
                <h2>أعلى المخاطر لمرحلة "{activeStage}" (أعلى 5)</h2>
              </div>
              <h5 style={{color:"blue",cursor:"pointer"}} onClick={()=>{
                navigate('/RiskRegistry')
              }}> 
                كل المخاطر   
                ... <BsReplyAll size={15} />
              </h5>
            </div>
            
            <div className="custom-table-wrapper">
              {loadingDetails ? (
                <div className="table-loading">جاري معالجة مصفوفة البيانات...</div>
              ) : topFiveRisks.length === 0 ? (
                <div className="table-loading">لا توجد سجلات مخاطر مضافة تحت هذه المرحلة حالياً.</div>
              ) : (
                <table className="energy-modern-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th style={{ width: '90px' }}>كود الخطر</th>
                      <th>وصف الخطر</th>
                      <th style={{ width: '80px' }}>المحور</th>
                      <th style={{ width: '120px' }}>المرحلة الزمنية</th>
                      <th style={{ width: '100px' }}>Risk Score (%)</th>
                      <th style={{ width: '140px' }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFiveRisks.map((risk, idx) => {
                      const axis = getAxisBadgeDetails(risk);
                      const isFixedRisk = risk.type === 'ثابت' || risk.type === 'fixed';
                      
                      return (
                        <tr key={risk._id || idx}>
                          <td className="cell-index">{idx + 1}</td>
                          <td className="cell-code">{risk.riskCode || `TEMP-${idx}`}</td>
                          <td className="cell-text" title={risk.riskText}>
                            {risk.riskText}
                          </td>
                          <td>
                            <span className={`axis-pill-new ${axis.class}`}>
                              {axis.text}
                            </span>
                          </td>
                          <td className="cell-stage">
                            {normalizeTime(risk.time)}
                          </td>
                          <td>
                            <span className="cell-score-badge text-danger-score">
                              {risk.riskScore || risk.riiPercentage}
                            </span>
                          </td>
                          <td >
                            {/* تم استبدال الحالة القديمة بالنظام الحقيقي للملف السابق بالتفصيل */}
                            <span style={{textAlign:"center"}} className={`status-tag-new ${getStatusClassName(risk)}`}>
                              <span style={{textAlign:"center"}} className="status-dot"></span>
                              {isFixedRisk ? 'مغلقة بقرار مؤسسي' : (risk.operationalStatus || 'مفتوحة')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="action-cards-sidebar">
            <div className="action-card-btn blue-action" onClick={() => navigate('/add-risk')}>
              <div className="action-card-content">
                <h3>إضافة خطر جديد</h3>
                <p>إرسال خطر مباشر ومكثف إلى السيرفر</p>
              </div>
              <div className="action-card-icon-circle"><FaPlus /></div>
              <FaArrowLeft className="action-arrow-hover" />
            </div>

            <div className="action-card-btn green-action" onClick={() => navigate('/sjlmacater')}>
              <div className="action-card-content">
                <h3>عرض سجل المخاطر</h3>
                <p>استعراض وتحليل الملفات الشاملة</p>
              </div>
              <div className="action-card-icon-circle"><FaFolderOpen /></div>
              <FaArrowLeft className="action-arrow-hover" />
            </div>
          </div>

        </div>

      </div>
      <RightBar/>
    </div>
  );
};

export default Dashboard;