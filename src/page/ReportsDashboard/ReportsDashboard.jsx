import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RightBar from '../../components/rightBar/rightBar'
import NavBar from '../../components/navBar/PageHeade'
import { 
  FaClipboardList, 
  FaChartBar, 
  FaLightbulb, 
  FaCircleExclamation,
  FaFilePdf,
  FaFileExcel,
  FaEye,
  FaArrowRotateRight
} from "react-icons/fa6";
import './ReportsDashboard.css';

const ReportsDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUserProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/user/myprojects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : (data.projects || []));
      }
    } catch (error) {
      console.error("خطأ في جلب المشاريع:", error);
    }
  };

  useEffect(() => {
    fetchUserProjects();
  }, []);

  const handlePreviewNavigation = (reportType) => {
    navigate('/report-preview', { 
      state: { reportType, projectId: selectedProject } 
    });
  };

  const handleExportFile = async (reportType, format = 'excel') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ahmedpr5002-irs-hvtl.hf.space/dang/export?reportType=${reportType}&projectId=${selectedProject}&format=${format}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        alert(`فشل التصدير: الخادم أرجع خطأ داخلي (500).`);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `HVTL_IRS_Report_${reportType}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("خطأ في التصدير:", error);
    }
  };

  return (
    <>
    
    <div className="reports-dashboard-content">
      
      <RightBar/>
      <header className="reports-header">
        <div className="header-title-zone">
          <div>
            <h1>أنواع التقارير المتاحة</h1>
            <p>توليد، معاينة، وتحميل التقارير فورياً وبصيغ متعددة باستخدام البيانات المباشرة للمشروع</p>
          </div>
        </div>
        
        <div className="header-controls-zone">
          <div className="project-select-box">
            <label>المشروع المستهدف:</label>
            <select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={loading}
            >
              <option value="all">جميع المشاريع (تقرير مقارن ومستعرض)</option>
              {projects.map((proj) => (
                <option key={proj._id || proj.id} value={proj._id || proj.id}>
                  {proj.name || proj.title || proj.projectName || "مشروع تحت التطوير"}
                </option>
              ))}
            </select>
          </div>
          
          <button className="btn-refresh" onClick={fetchUserProjects} title="تحديث المشاريع">
            <FaArrowRotateRight />
          </button>
        </div>
      </header>

      <section className="reports-cards-grid">
        {/* 1. سجل المخاطر */}
        <div className="report-spec-card theme-blue">
          <div className="card-top-info">
            <div className="icon-wrapper"><FaClipboardList /></div>
            <h3>تقرير سجل المخاطر</h3>
            <p className="card-desc">جميع مخاطر المشروع مع درجاتها وإجراءاتها وحالاتها وتفاصيلها.</p>
          </div>
          <div className="card-include-section">
            <h4>يتضمن التقرير:</h4>
            <ul>
              <li>سجل عناصر المخاطر الكاملة</li>
              <li>مؤشرات التقييم ودرجات RII</li>
            </ul>
          </div>
          <div className="card-footer-actions">
            <span className="file-format-lbl">خيارات التصدير:</span>
            <div className="action-buttons-fix">
              <button className="btn-export-solid btn-pdf" onClick={() => handleExportFile('risk_register', 'pdf')}><FaFilePdf /> PDF</button>
              <button className="btn-export-solid btn-excel" onClick={() => handleExportFile('risk_register', 'excel')}><FaFileExcel /> Excel</button>
              <button className="btn-preview-outline" onClick={() => handlePreviewNavigation('risk_register')}><FaEye /> معاينة</button>
            </div>
          </div>
        </div>

        {/* 2. تقرير مقارنة المشاريع والأخطار الأكثر تكراراً */}
        <div className="report-spec-card theme-green">
          <div className="card-top-info">
            <div className="icon-wrapper"><FaChartBar /></div>
            <h3>تقرير مقارنة وتحليل الأنماط</h3>
            <p className="card-desc">يعرض المخاطر الأكثر تكراراً واختياراً عبر النظام للوقوف على الثغرات العامة.</p>
          </div>
          <div className="card-include-section">
            <h4>يتضمن التقرير:</h4>
            <ul>
              <li>ترتيب الأخطار تنازلياً حسب نسبة التكرار</li>
              <li>متوسط درجة خطورة النمط العام</li>
            </ul>
          </div>
          <div className="card-footer-actions">
            <span className="file-format-lbl">خيارات التصدير:</span>
            <div className="action-buttons-fix">
              <button className="btn-export-solid btn-pdf" onClick={() => handleExportFile('project_comparison', 'pdf')}><FaFilePdf /> PDF</button>
              <button className="btn-export-solid btn-excel" onClick={() => handleExportFile('project_comparison', 'excel')}><FaFileExcel /> Excel</button>
              <button className="btn-preview-outline" onClick={() => handlePreviewNavigation('project_comparison')}><FaEye /> معاينة</button>
            </div>
          </div>
        </div>

        {/* 3. تقرير الدروس المستفادة */}
        <div className="report-spec-card theme-purple">
          <div className="card-top-info">
            <div className="icon-wrapper"><FaLightbulb /></div>
            <h3>تقرير الدروس المستفادة</h3>
            <p className="card-desc">يجمع محتوى حقل الدروس المستفادة وملاحظات المهندسين مصنفة حسب نوع الخطر.</p>
          </div>
          <div className="card-include-section">
            <h4>يتضمن التقرير:</h4>
            <ul>
              <li>سجلات الدروس والتجارب السابقة</li>
              <li>التوصيات المستخلصة للحماية</li>
            </ul>
          </div>
          <div className="card-footer-actions">
            <span className="file-format-lbl">خيارات التصدير:</span>
            <div className="action-buttons-fix">
              <button className="btn-export-solid btn-pdf" onClick={() => handleExportFile('lessons_learned', 'pdf')}><FaFilePdf /> PDF</button>
              <button className="btn-export-solid btn-excel" onClick={() => handleExportFile('lessons_learned', 'excel')}><FaFileExcel /> Excel</button>
              <button className="btn-preview-outline" onClick={() => handlePreviewNavigation('lessons_learned')}><FaEye /> معاينة</button>
            </div>
          </div>
        </div>

        {/* 4. تقرير الإجراءات المتأخرة */}
        <div className="report-spec-card theme-red">
          <div className="card-top-info">
            <div className="icon-wrapper"><FaCircleExclamation /></div>
            <h3>تقرير الإجراءات المتأخرة</h3>
            <p className="card-desc">مخاطر تجاوزت مهلة إجراءاتها دون إغلاق يُرسل تنبيهاً للمدير المعني.</p>
          </div>
          <div className="card-include-section">
            <h4>يتضمن التقرير:</h4>
            <ul>
              <li>قائمة المخاطر المتجاوزة للمدد</li>
              <li>تحديد المسؤولين عن التأخير والإنذارات</li>
            </ul>
          </div>
          <div className="card-footer-actions">
            <span className="file-format-lbl">خيارات التصدير:</span>
            <div className="action-buttons-fix">
              <button className="btn-export-solid btn-pdf" onClick={() => handleExportFile('overdue_actions', 'pdf')}><FaFilePdf /> PDF</button>
              <button className="btn-export-solid btn-excel" onClick={() => handleExportFile('overdue_actions', 'excel')}><FaFileExcel /> Excel</button>
              <button className="btn-preview-outline" onClick={() => handlePreviewNavigation('overdue_actions')}><FaEye /> معاينة</button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default ReportsDashboard;