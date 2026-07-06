import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import RightBar from '../../components/rightBar/rightBar';
import { 
  FaScaleBalanced, 
  FaDollarSign, 
  FaShieldHalved,
  FaLink,
  FaChevronRight,
  FaChevronLeft,
  FaAnglesRight,
  FaAnglesLeft,
  FaFolderOpen,
  FaCircleCheck, 
  FaCircleExclamation, 
  FaXmark
} from 'react-icons/fa6';
import { HiOutlineDocumentDuplicate } from "react-icons/hi2";
import './sjlmacater.css';

const Sjlmacater = () => {
  const { t } = useTranslation('sjlmacater'); // تفعيل التابع وتحديد الـ Namespace
  const { projectId: urlProjectId } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]); 
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [activeSelectRowId, setActiveSelectRowId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // حالة لإدارة نظام الـ Toast الجديد الفاخر
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const token = localStorage.getItem('token') || "";
  const currentProjectId = urlProjectId || localStorage.getItem('projectId') || "";

  // دالة مخصصة لإظهار التوست
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000); // يختفي بعد 4 ثوانٍ تلقائياً
  };

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/user/myprojects', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    if (token) fetchMyProjects();
  }, [token]);

  useEffect(() => {
    if (urlProjectId) {
      localStorage.setItem('projectId', urlProjectId);
    }
  }, [urlProjectId]);

  useEffect(() => {
    const fetchRegisterData = async () => {
      if (!currentProjectId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`https://ahmedpr5002-irs-hvtl.hf.space/dang/project/${currentProjectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const processedRisks = data.map(risk => {
              if (risk.type === 'ثابت' || risk.type === 'fixed') {
                return {
                  ...risk,
                  operationalStatus: 'مغلقة بقرار مؤسسي',
                  closedDate: risk.closedDate || new Date().toISOString().split('T')[0]
                };
              }
              return risk;
            });
            setRisks(processedRisks);
          }
        } else {
          setRisks([]);
        }
      } catch (error) {
        console.error("Error fetching risks:", error);
        setRisks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegisterData();
  }, [currentProjectId, token]);

  const counts = React.useMemo(() => {
    const stats = { total: 0, open: 0, processing: 0, technicalClose: 0, institutionalClose: 0 };
    if (!Array.isArray(risks)) return stats;

    risks.forEach(risk => {
      stats.total++;
      if (risk?.operationalStatus === 'مفتوحة') stats.open++;
      if (risk?.operationalStatus === 'قيد المعالجة') stats.processing++;
      if (risk?.operationalStatus === 'مغلقة بحل فني') stats.technicalClose++;
      if (risk?.operationalStatus === 'مغلقة بقرار مؤسسي') stats.institutionalClose++;
    });
    return stats;
  }, [risks]);

  const handleStatusChange = async (riskId, newStatus) => {
    setUpdatingId(riskId);
    try {
      const response = await fetch(`https://ahmedpr5002-irs-hvtl.hf.space/dang/risk-entry/${riskId}/operational-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ operationalStatus: newStatus })
      });

      if (response.ok) {
        setRisks(prevRisks => 
          prevRisks.map(risk => 
            risk._id === riskId 
              ? { 
                  ...risk, 
                  operationalStatus: newStatus, 
                  closedDate: (newStatus.includes('مغلقة') ? new Date().toISOString().split('T')[0] : '') 
                } 
              : risk
          )
        );
        setActiveSelectRowId(null);
        showToast(t('toast_status_success'), "success");
      } else {
        const errData = await response.json();
        showToast(`${t('toast_error_prefix')}: ${errData.message}`, "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast(t('toast_server_error'), "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProjectChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      localStorage.setItem('projectId', selectedId);
      navigate(`/register/${selectedId}`); 
      setCurrentPage(1);
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = Array.isArray(risks) ? risks.slice(indexOfFirstRow, indexOfLastRow) : [];
  const totalPages = Math.ceil((risks?.length || 0) / rowsPerPage) || 1;

  const renderAxisBadge = (axis) => {
    switch (axis) {
      case 'مالي':
      case 'المالي':
        return <span className="axis-badge axis-financial" style={{color:"#10b981",background:"rgba(16, 185, 129, 0.1)"}}><FaDollarSign /> {t('axis_financial')}</span>;
      case 'قانوني':
      case 'القانوني':
        return <span className="axis-badge axis-legal" style={{color:"#8b5cf6",background:"rgba(139, 92, 246, 0.1)"}}><FaScaleBalanced /> {t('axis_legal')}</span>;
      case 'فني':
      case 'الفني':
        return <span className="axis-badge axis-technical" style={{color:'#3b82f6',background:'rgba(59, 130, 246, 0.1)'}}><FaShieldHalved /> {t('axis_technical')}</span>;
      case 'تكاملي':
      case 'التكاملي':
        return <span className="axis-badge axis-integrative"><FaLink /> {t('axis_integrative')}</span>;
      default:
        return <span className="axis-badge">{axis}</span>;
    }
  };

  const getCodeColorStyle = (axis) => {
    if (axis === 'فني' || axis === 'الفني') return { color: '#3b82f6', fontWeight: 'bold' };
    if (axis === 'مالي' || axis === 'المالي') return { color: '#10b981', fontWeight: 'bold' };
    if (axis === 'قانوني' || axis === 'القانوني') return { color: '#8b5cf6', fontWeight: 'bold' };
    return { fontWeight: 'bold' };
  };

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
    <>
      <RightBar/>
      
      {/* مكون الـ Toast العائم والإشعارات الفاخرة */}
      {toast.show && (
        <div className={`luxury-toast toast-${toast.type}`} dir="rtl">
          <div className="toast-content">
            {toast.type === 'success' && <FaCircleCheck className="toast-icon" />}
            {toast.type === 'warning' && <FaCircleExclamation className="toast-icon text-amber-500" />}
            {toast.type === 'error' && <FaCircleExclamation className="toast-icon" />}
            <span className="toast-text">{toast.message}</span>
          </div>
          <button className="toast-close-btn" onClick={() => setToast({ show: false, message: '', type: 'info' })}>
            <FaXmark />
          </button>
        </div>
      )}

      <div className="luxury-register-container" dir="rtl">
        
        <div className="register-top-bar">
          <div className="project-selector-wrapper">
            <label htmlFor="project-select" style={{color:"#3b82f6"}}><FaFolderOpen /> {t('active_project_label')}</label>
            <select id="project-select" value={currentProjectId} onChange={handleProjectChange} className="luxury-select">
              <option value="" disabled>{t('select_project_placeholder')}</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name || proj.projectName || t('unnamed_project')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* كروت الإحصائيات */}
        <div className="register-stats-grid">
          <div className="stat-card total-risks">
            <div className="stat-icon"><HiOutlineDocumentDuplicate /></div>
            <div className="stat-info">
              <span className="stat-label">{t('stat_total')}</span>
              <h2 className="stat-value">{counts.total}</h2>
            </div>
          </div>
          <div className="stat-card open-risks">
            <div className="stat-icon-indicator open-dot">!</div>
            <div className="stat-info">
              <span className="stat-label">{t('status_open')}</span>
              <h2 className="stat-value">{counts.open}</h2>
            </div>
          </div>
          <div className="stat-card processing-risks">
            <div className="stat-icon-indicator processing-dot">⚙</div>
            <div className="stat-info">
              <span className="stat-label">{t('status_processing')}</span>
              <h2 className="stat-value">{counts.processing}</h2>
            </div>
          </div>
          <div className="stat-card technical-close-risks">
            <div className="stat-icon-indicator technical-dot" style={{color:"#1e40af"}} >✓</div>
            <div className="stat-info">
              <span className="stat-label" >{t('status_technical_close')}</span>
              <h2 className="stat-value">{counts.technicalClose}</h2>
            </div>
          </div>
          <div className="stat-card institutional-close-risks">
            <div className="stat-icon-indicator institutional-dot" style={{color:"#6b21a8"}}>🏛</div>
            <div className="stat-info">
              <span className="stat-label" >{t('status_institutional_close')}</span>
              <h2 className="stat-value">{counts.institutionalClose}</h2>
            </div>
          </div>
        </div>

        {/* الجدول الفاخر */}
        <div className="register-table-wrapper">
          <div className="register-table-header">
            <h3>{t('table_main_title')}</h3>
          </div>
          
          <table className="luxury-register-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th style={{ width: '70px' }}>{t('th_code')}</th>
                <th>{t('th_axis')}</th>
                <th style={{ width: '140px' }}>{t('th_risk_score')}</th>
                <th style={{ width: '80px' }}>{t('th_rii')}</th>
                <th>{t('th_operational_status')}</th>
                <th style={{ width: '110px' }}>{t('th_created_at')}</th>
                <th style={{ width: '110px' }}>{t('th_closed_at')}</th>
                <th style={{ width: '100px' }}>{t('th_action_codes')}</th>
                <th style={{ width: '240px' }}>{t('th_engineer_notes')}</th>
                <th>{t('th_lessons_learned')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="11" className="table-status-text">{t('table_loading')}</td></tr>
              ) : !currentProjectId ? (
                <tr><td colSpan="11" className="table-status-text">{t('table_select_project_hint')}</td></tr>
              ) : currentRows.length === 0 ? (
                <tr><td colSpan="11" className="table-status-text">{t('table_empty_risks')}</td></tr>
              ) : currentRows.map((risk, index) => {
                const isFixedRisk = risk.type === 'ثابت' || risk.type === 'fixed';
                
                return (
                  <tr key={risk._id}>
                    <td className="row-index">{indexOfFirstRow + index + 1}</td>
                    <td className="row-code" style={getCodeColorStyle(risk.axis)}>{risk.riskCode}</td>
                    <td>{renderAxisBadge(risk.axis)}</td>
                    <td>
                      <div className={`score-progress-container ${risk.riskScore >= 70 ? 'score-high' : risk.riskScore >= 40 ? 'score-medium' : 'score-low'}`}>
                        <span className="score-text">{risk.riskScore}%</span>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${Math.min(risk.riskScore, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="text-rii">{risk.riiPercentage}%</td>
                    
                    <td>
                      {!isFixedRisk && activeSelectRowId === risk._id ? (
                        <select 
                          value={risk.operationalStatus || 'مفتوحة'} 
                          onChange={(e) => handleStatusChange(risk._id, e.target.value)}
                          onBlur={() => setActiveSelectRowId(null)}
                          disabled={updatingId === risk._id}
                          className="status-select-inline-luxury"
                          autoFocus
                        >
                          <option value="مفتوحة">{t('status_open')}</option>
                          <option value="قيد المعالجة">{t('status_processing')}</option>
                          <option value="مغلقة بحل فني">{t('status_technical_close')}</option>
                          <option value="مغلقة بقرار مؤسسي">{t('status_institutional_close')}</option>
                        </select>
                      ) : (
                        <span 
                          className={`clickable-status-badge ${getStatusClassName(risk)}`}
                          onClick={() => {
                            if (isFixedRisk) {
                              showToast(t('toast_fixed_risk_warning'), "warning");
                              return;
                            }
                            setActiveSelectRowId(risk._id);
                          }}
                          title={isFixedRisk ? t('title_fixed_immutable') : t('title_click_to_edit')}
                          style={isFixedRisk ? { cursor: 'not-allowed', color:"#6b21a8" } : {}}
                        >
                          {isFixedRisk ? t('status_institutional_close') : (
                            risk.operationalStatus === 'مفتوحة' ? t('status_open') :
                            risk.operationalStatus === 'قيد المعالجة' ? t('status_processing') :
                            risk.operationalStatus === 'مغلقة بحل فني' ? t('status_technical_close') :
                            risk.operationalStatus === 'مغلقة بقرار مؤسسي' ? t('status_institutional_close') : (risk.operationalStatus || t('status_open'))
                          )}
                        </span>
                      )}
                    </td>

                    <td className="text-date">{risk.createdAt ? risk.createdAt.split('T')[0] : (risk.time || '—')}</td>
                    <td className="text-date">{risk.closedDate || '—'}</td>
                    <td>
                      <div className="action-links-cell">
                        {risk.actionIds && risk.actionIds.length > 0 ? (
                          risk.actionIds.map((act, i) => (
                            <span key={i} className="action-code-link" onClick={() => navigate(`/add-action/${risk._id}`, { state: { risk } })}>
                              {act.actionId?.code || 'ACT'} <FaLink className="tiny-link-icon" />
                              {i < risk.actionIds.length - 1 && ', '}
                            </span>
                          ))
                        ) : (
                          <span className="no-actions-dash" onClick={() => navigate(`/add-action/${risk._id}`, { state: { risk } })}>—</span>
                        )}
                      </div>
                    </td>

                    <td className="text-notes text-right-align">
                      {risk.riskDescription || risk.riskText || '—'}
                    </td>

                    <td className="text-notes text-right-align">{risk.riskNotes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* الباجينيشن */}
          <div className="register-pagination-footer">
            <div className="rows-per-page-selector">
              <span>{t('pagination_show')}</span>
              <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <span>{t('pagination_rows')}</span>
            </div>

            <div className="pagination-info-text">
              {t('pagination_info', { from: indexOfFirstRow + 1, to: Math.min(indexOfLastRow, (risks?.length || 0)), total: (risks?.length || 0) })}
            </div>

            <div className="pagination-navigation-buttons">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><FaAnglesRight /></button>
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><FaChevronRight /></button>
              <div className="page-numbers-list">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i+1} className={`page-number-btn ${currentPage === i + 1 ? 'active-page' : ''}`} onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><FaChevronLeft /></button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><FaAnglesLeft /></button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sjlmacater;