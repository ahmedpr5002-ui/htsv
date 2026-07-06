import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import RightBar from '../../components/rightBar/rightBar';
import NavBar from '../../components/navBar/PageHeade';
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
  const { t, i18n } = useTranslation('reportsDash'); // استخدام ملف الترجمة المخصص للتقارير
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
      console.error("Error fetching projects:", error);
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
        alert(t('messages.export_failed'));
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
      console.error("Export error:", error);
    }
  };

  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
    <div className="reports-dashboard-content" dir={currentDir}>
      
      <RightBar/>
      <header className="reports-header">
        <div className="header-title-zone">
          <div>
            <h1>{t('dashboard.title')}</h1>
            <p>{t('dashboard.subtitle')}</p>
          </div>
        </div>
        
        <div className="header-controls-zone">
          <div className="project-select-box">
            <label>{t('dashboard.target_project')}</label>
            <select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={loading}
            >
              <option value="all">{t('dashboard.all_projects')}</option>
              {projects.map((proj) => (
                <option key={proj._id || proj.id} value={proj._id || proj.id}>
                  {proj.name || proj.title || proj.projectName || t('labels.under_development')}
                </option>
              ))}
            </select>
          </div>
          
          <button className="btn-refresh" onClick={fetchUserProjects} title={t('buttons.refresh_projects')}>
            <FaArrowRotateRight />
          </button>
        </div>
      </header>

      <section className="reports-cards-grid">
        {/* 1. سجل المخاطر */}
        <div className="report-spec-card theme-blue">
          <div className="card-top-info">
            <div className="icon-wrapper"><FaClipboardList /></div>
            <h3>{t('reportCards.risk_register.title')}</h3>
            <p className="card-desc">{t('reportCards.risk_register.desc')}</p>
          </div>
          <div className="card-include-section">
            <h4>{t('dashboard.report_includes')}</h4>
            <ul>
              <li>{t('reportCards.risk_register.include_1')}</li>
              <li>{t('reportCards.risk_register.include_2')}</li>
            </ul>
          </div>
          <div className="card-footer-actions">
            <span className="file-format-lbl">{t('dashboard.export_options')}</span>
            <div className="action-buttons-fix">
              <button className="btn-export-solid btn-pdf" onClick={() => handleExportFile('risk_register', 'pdf')}><FaFilePdf /> PDF</button>
              <button className="btn-export-solid btn-excel" onClick={() => handleExportFile('risk_register', 'excel')}><FaFileExcel /> Excel</button>
              <button className="btn-preview-outline" onClick={() => handlePreviewNavigation('risk_register')}><FaEye /> {t('buttons.preview')}</button>
            </div>
          </div>
        </div>

        {/* 2. تقرير مقارنة المشاريع والأخطار الأكثر تكراراً */}
        <div className="report-spec-card theme-green">
          <div className="card-top-info">
            <div className="icon-wrapper"><FaChartBar /></div>
            <h3>{t('reportCards.project_comparison.title')}</h3>
            <p className="card-desc">{t('reportCards.project_comparison.desc')}</p>
          </div>
          <div className="card-include-section">
            <h4>{t('dashboard.report_includes')}</h4>
            <ul>
              <li>{t('reportCards.project_comparison.include_1')}</li>
              <li>{t('reportCards.project_comparison.include_2')}</li>
            </ul>
          </div>
          <div className="card-footer-actions">
            <span className="file-format-lbl">{t('dashboard.export_options')}</span>
            <div className="action-buttons-fix">
              <button className="btn-export-solid btn-pdf" onClick={() => handleExportFile('project_comparison', 'pdf')}><FaFilePdf /> PDF</button>
              <button className="btn-export-solid btn-excel" onClick={() => handleExportFile('project_comparison', 'excel')}><FaFileExcel /> Excel</button>
              <button className="btn-preview-outline" onClick={() => handlePreviewNavigation('project_comparison')}><FaEye /> {t('buttons.preview')}</button>
            </div>
          </div>
        </div>

        {/* 3. تقرير الدروس المستفادة */}
        <div className="report-spec-card theme-purple">
          <div className="card-top-info">
            <div className="icon-wrapper"><FaLightbulb /></div>
            <h3>{t('reportCards.lessons_learned.title')}</h3>
            <p className="card-desc">{t('reportCards.lessons_learned.desc')}</p>
          </div>
          <div className="card-include-section">
            <h4>{t('dashboard.report_includes')}</h4>
            <ul>
              <li>{t('reportCards.lessons_learned.include_1')}</li>
              <li>{t('reportCards.lessons_learned.include_2')}</li>
            </ul>
          </div>
          <div className="card-footer-actions">
            <span className="file-format-lbl">{t('dashboard.export_options')}</span>
            <div className="action-buttons-fix">
              <button className="btn-export-solid btn-pdf" onClick={() => handleExportFile('lessons_learned', 'pdf')}><FaFilePdf /> PDF</button>
              <button className="btn-export-solid btn-excel" onClick={() => handleExportFile('lessons_learned', 'excel')}><FaFileExcel /> Excel</button>
              <button className="btn-preview-outline" onClick={() => handlePreviewNavigation('lessons_learned')}><FaEye /> {t('buttons.preview')}</button>
            </div>
          </div>
        </div>

        {/* 4. تقرير الإجراءات المتأخرة */}
        <div className="report-spec-card theme-red">
          <div className="card-top-info">
            <div className="icon-wrapper"><FaCircleExclamation /></div>
            <h3>{t('reportCards.overdue_actions.title')}</h3>
            <p className="card-desc">{t('reportCards.overdue_actions.desc')}</p>
          </div>
          <div className="card-include-section">
            <h4>{t('dashboard.report_includes')}</h4>
            <ul>
              <li>{t('reportCards.overdue_actions.include_1')}</li>
              <li>{t('reportCards.overdue_actions.include_2')}</li>
            </ul>
          </div>
          <div className="card-footer-actions">
            <span className="file-format-lbl">{t('dashboard.export_options')}</span>
            <div className="action-buttons-fix">
              <button className="btn-export-solid btn-pdf" onClick={() => handleExportFile('overdue_actions', 'pdf')}><FaFilePdf /> PDF</button>
              <button className="btn-export-solid btn-excel" onClick={() => handleExportFile('overdue_actions', 'excel')}><FaFileExcel /> Excel</button>
              <button className="btn-preview-outline" onClick={() => handlePreviewNavigation('overdue_actions')}><FaEye /> {t('buttons.preview')}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default ReportsDashboard;