import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // استيراد الـ Hook الخاص بالترجمة
import { 
  FaScaleBalanced, 
  FaDollarSign, 
  FaShieldHalved, 
  FaTriangleExclamation,
  FaArrowRight,
  FaMagnifyingGlass,
  FaFilter,
  FaFolderOpen,
  FaPlus,
  FaXmark,
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo
} from "react-icons/fa6";
import RightBar from '../../components/rightBar/rightBar';
import './RiskRegistry.css';

const RiskRegistry = () => {
  const { t, i18n } = useTranslation('riskRegistry'); // تحديد ملف الـ JSON الخاص بالصفحة
  const navigate = useNavigate();
  const [risks, setRisks] = useState([]);
  const [suggestedActionsMap, setSuggestedActionsMap] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAxis, setFilterAxis] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  
  const [activeSelectRowId, setActiveSelectRowId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActionDetails, setSelectedActionDetails] = useState(null);

  const token = localStorage.getItem('token') || "";
  const selectedProjectId = localStorage.getItem('projectId') || "";

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  useEffect(() => {
    if (!selectedProjectId) {
      setLoading(false);
      return;
    }

    const fetchRegistryAndSuggestedData = async () => {
      try {
        const [projectRisksRes, suggestedActionsRes] = await Promise.all([
          fetch(`https://ahmedpr5002-irs-hvtl.hf.space/dang/project/${selectedProjectId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('https://ahmedpr5002-irs-hvtl.hf.space/racon').catch(err => console.log("Racon fetch error fallback", err))
        ]);

        let processedRisks = [];
        if (projectRisksRes.ok) {
          const data = await projectRisksRes.json();
          const risksData = Array.isArray(data) ? data : (data.risks || []);
          
          processedRisks = risksData.map(risk => {
            if (risk.type === 'ثابت' || risk.type === 'fixed') {
              return {
                ...risk,
                operationalStatus: 'مغلقة بقرار مؤسسي',
                closedDate: risk.closedDate || new Date().toISOString().split('T')[0]
              };
            }
            return risk;
          });
        }

        const actionsMapping = {};
        if (suggestedActionsRes && suggestedActionsRes.ok) {
          const raconData = await suggestedActionsRes.json();
          raconData.forEach(item => {
            if (!item.riskId || !item.riskId.riskCode) return;
            const rCode = item.riskId.riskCode;
            
            if (!actionsMapping[rCode]) {
              actionsMapping[rCode] = [];
            }
            if (item.actionId) {
              const isExist = actionsMapping[rCode].some(act => act.code === item.actionId.code);
              if (!isExist) {
                actionsMapping[rCode].push({
                  code: item.actionId.code,
                  actionText: item.actionId.actionText || t('no_action_text_available'),
                  category: item.actionId.category || t('not_specified'),
                  phase: item.actionId.phase || t('not_specified'),
                  riiPercentage: item.actionId.riiPercentage !== undefined && item.actionId.riiPercentage !== null ? item.actionId.riiPercentage : (item.actionId.riiValue || 0),
                  Proposedofficial: item.actionId.Proposedofficial || t('not_assigned_yet'),
                  riskTitle: item.riskId.riskText || ""
                });
              }
            }
          });
        }

        setSuggestedActionsMap(actionsMapping);
        setRisks(processedRisks);

      } catch (error) {
        console.error("Error fetching all registry assets:", error);
        showToast(t('toast.fetch_error'), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistryAndSuggestedData();
  }, [selectedProjectId, token, t]);

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
                  closedDate: (newStatus.includes('مغلقة') || newStatus.includes('Closed') ? new Date().toISOString().split('T')[0] : '') 
                } 
              : risk
          )
        );
        setActiveSelectRowId(null);
        showToast(t('toast.status_update_success'), "success");
      } else {
        const errData = await response.json();
        showToast(`${t('toast.error')}: ${errData.message}`, "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast(t('toast.server_connection_failed'), "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getAxisDetails = (risk) => {
    const dbAxis = String(risk.axis || "").trim().toLowerCase();
    if (dbAxis === 'قانوني' || dbAxis === 'law') {
      return { type: 'law', text: t('axis_types.legal'), class: 'law', icon: <FaScaleBalanced /> };
    }
    if (dbAxis === 'مالي' || dbAxis === 'money') {
      return { type: 'money', text: t('axis_types.financial'), class: 'money', icon: <FaDollarSign /> };
    }
    if (dbAxis === 'فني' || dbAxis === 'tech') {
      return { type: 'tech', text: t('axis_types.technical'), class: 'tech', icon: <FaShieldHalved /> };
    }

    const code = String(risk.riskCode || "").toUpperCase();
    const text = String(risk.riskText || risk.description || "").toLowerCase();
    
    if (code.startsWith('L') || text.includes('قانون') || text.includes('تعويض') || text.includes('legal') || text.includes('law')) {
      return { type: 'law', text: t('axis_types.legal'), class: 'law', icon: <FaScaleBalanced /> };
    }
    if (code.startsWith('F') || text.includes('مالي') || text.includes('تمويل') || text.includes('سعر') || text.includes('finance') || text.includes('money')) {
      return { type: 'money', text: t('axis_types.financial'), class: 'money', icon: <FaDollarSign /> };
    }
    return { type: 'tech', text: t('axis_types.technical'), class: 'tech', icon: <FaShieldHalved /> };
  };

  const getRiskLevel = (score) => {
    const val = parseFloat(score) || 0;
    if (val < 50) return { text: t('risk_levels.low'), class: 'level-low' };
    if (val >= 50 && val <= 75) return { text: t('risk_levels.medium'), class: 'level-medium' };
    return { text: t('risk_levels.high'), class: 'level-high' };
  };

  const getStatusClassName = (risk) => {
    if (risk.type === 'ثابت' || risk.type === 'fixed' || risk.operationalStatus === 'مغلقة بقرار مؤسسي' || risk.operationalStatus === 'Institutional Close') {
      return 'status-type-institutional-close';
    }
    if (risk.operationalStatus === 'مغلقة بحل فني' || risk.operationalStatus === 'Technical Close') {
      return 'status-type-technical-close';
    }
    if (risk.operationalStatus === 'قيد المعالجة' || risk.operationalStatus === 'In Progress') {
      return 'status-type-proc';
    }
    return 'status-type-open';
  };

  const filteredRisks = risks.filter(risk => {
    const matchesSearch = 
      String(risk.riskCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(risk.riskText || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const axisInfo = getAxisDetails(risk);
    const matchesAxis = filterAxis === 'all' || axisInfo.type === filterAxis;
    
    const riskStage = risk.stage || 'التنفيذ';
    const matchesStage = filterStage === 'all' || riskStage.trim() === filterStage.trim();

    return matchesSearch && matchesAxis && matchesStage;
  });

  const stats = {
    total: filteredRisks.length,
    critical: filteredRisks.filter(r => (parseFloat(r.riskScore) || parseFloat(r.riiPercentage) || 0) > 75).length,
    medium: filteredRisks.filter(r => {
      const s = parseFloat(r.riskScore) || parseFloat(r.riiPercentage) || 0;
      return s >= 50 && s <= 75;
    }).length,
    low: filteredRisks.filter(r => (parseFloat(r.riskScore) || parseFloat(r.riiPercentage) || 0) < 50).length,
  };

  const openActionModal = (action) => {
    setSelectedActionDetails(action);
    setIsModalOpen(true);
  };

  // لتحديد اتجاه واجهة المستخدم بناءً على اللغة الحالية
  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="registry-wrapper" dir={currentDir}>
      {/* نظام التوست الإشعاري */}
      {toast.show && (
        <div className={`luxury-toast toast-${toast.type}`}>
          <div className="toast-content">
            {toast.type === 'success' && <FaCircleCheck className="toast-icon" />}
            {toast.type === 'warning' && <FaCircleExclamation className="toast-icon" />}
            {toast.type === 'error' && <FaCircleExclamation className="toast-icon" />}
            <span className="toast-text">{toast.message}</span>
          </div>
          <button className="toast-close-btn" onClick={() => setToast({ show: false, message: '', type: 'info' })}>
            <FaXmark />
          </button>
        </div>
      )}

      {/* النافذة المنبثقة */}
      {isModalOpen && selectedActionDetails && (
        <div className="modal-overlay-luxury" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card-luxury animate-popup" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header-luxury">
              <div className="modal-title-group">
                <FaCircleInfo className="modal-header-icon" />
                <div>
                  <h2>{t('modal.title')}</h2>
                  <p>{t('modal.technical_id')}: {selectedActionDetails.code || "N/A"}</p>
                </div>
              </div>
              <button className="modal-close-btn-luxury" onClick={() => setIsModalOpen(false)}>
                <FaXmark />
              </button>
            </header>
            
            <div className="modal-body-luxury">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div className="info-box-item">
                  <span className="info-label">{t('modal.action_code')}</span>
                  <span className="info-value-badge">{selectedActionDetails.code || "N/A"}</span>
                </div>
                
                <div className="info-box-item">
                  <span className="info-label">{t('modal.action_category')}</span>
                  <span className="info-value-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                    {selectedActionDetails.category || t('not_specified')}
                  </span>
                </div>

                <div className="info-box-item">
                  <span className="info-label">{t('modal.time_phase')}</span>
                  <span className="info-value-badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                    {selectedActionDetails.phase || t('not_specified')}
                  </span>
                </div>

                <div className="info-box-item">
                  <span className="info-label">{t('modal.rii_percentage')}</span>
                  <span className="info-value-badge" style={{ backgroundColor: '#fce7f3', color: '#be185d' }}>
                    {selectedActionDetails.riiPercentage || 0}%
                  </span>
                </div>
              </div>

              <div className="info-box-item">
                <span className="info-label">{t('modal.action_content')}</span>
                <p className="info-text-content">{selectedActionDetails.actionText || t('no_text_available')}</p>
              </div>
            </div>
            
            <footer className="modal-footer-luxury">
              <button className="modal-btn-primary" onClick={() => setIsModalOpen(false)}>{t('modal.close_window')}</button>
            </footer>
          </div>
        </div>
      )}

      <div className="registry-content">
        <header className="registry-header">
          <div className="header-right">
            <button className="btn-back" onClick={() => navigate(-1)}>
              <FaArrowRight style={{ transform: i18n.language === 'en' ? 'rotate(180deg)' : 'none' }} /> {t('header.back_btn')}
            </button>
            <div className="title-group">
              <FaFolderOpen className="title-icon" />
              <div>
                <h1>{t('header.title')}</h1>
                <p>{t('header.subtitle')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* بطاقات الإحصاءات */}
        <section className="registry-stats-grid">
          <div className="stat-mini-card total">
            <div className="stat-info"><h3>{stats.total}</h3><p>{t('stats.total_risks')}</p></div>
          </div>
          <div className="stat-mini-card critical">
            <div className="stat-info"><h3>{stats.critical}</h3><p>{t('stats.critical_risks')}</p></div>
          </div>
          <div className="stat-mini-card medium">
            <div className="stat-info"><h3>{stats.medium}</h3><p>{t('stats.medium_risks')}</p></div>
          </div>
          <div className="stat-mini-card low">
            <div className="stat-info"><h3>{stats.low}</h3><p>{t('stats.low_risks')}</p></div>
          </div>
        </section>

        {/* شريط أدوات الفلاتر */}
        <section className="filter-tools-bar">
          <div className="search-box-wrapper">
            
            <input 
              type="text" 
              placeholder={t('filters.search_placeholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-selectors">
            <div className="selector-group">
              <FaFilter className="icon-f" />
              <select value={filterAxis} onChange={(e) => setFilterAxis(e.target.value)}>
                <option value="all">{t('filters.all_axes')}</option>
                <option value="tech">{t('filters.tech_axis')}</option>
                <option value="money">{t('filters.money_axis')}</option>
                <option value="law">{t('filters.law_axis')}</option>
              </select>
            </div>
          </div>
        </section>

        {/* الجدول الشامل */}
        <div className="registry-table-container table-responsive-wrapper">
          {loading ? (
            <div className="registry-loading">{t('table.loading')}</div>
          ) : filteredRisks.length === 0 ? (
            <div className="registry-loading">{t('table.no_data')}</div>
          ) : (
            <table className="registry-table racon-table">
              <thead>
                <tr>
                  <th style={{ width: '25px' }}>#</th>
                  <th style={{ width: '120px' }}>{t('table.th.risk_code')}</th>
                  <th>{t('table.th.risk_description')}</th>
                  <th style={{ width: '100px' }}>{t('table.th.axis')}</th>
                  <th style={{ width: '100px' }}>{t('table.th.stage')}</th>
                  <th style={{ width: '110px' }}>{t('table.th.risk_level')}</th>
                  <th style={{ width: '90px' }}>{t('table.th.risk_score')}</th>
                  <th style={{ width: '130px' }}>{t('table.th.operational_status')}</th>
                  <th style={{ width: '150px' }}>{t('table.th.suggested_actions')}</th>
                  <th style={{ width: '140px' }}>{t('table.th.taken_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((risk, index) => {
                  const axis = getAxisDetails(risk);
                  const score = risk.riskScore || risk.riiPercentage || 0;
                  const level = getRiskLevel(score);
                  const actualRiskId = risk._id || risk.id || `TEMP-${index}`;
                  const isFixedRisk = risk.type === 'ثابت' || risk.type === 'fixed';
                  
                  const suggestedActions = suggestedActionsMap[risk.riskCode] || [];

                  return (
                    <tr key={actualRiskId}>
                      <td className="idx-cell">{index + 1}</td>
                      <td className={`code-cell code-${axis.class} risk-code-cell`}>
                        <code>{risk.riskCode || "N/A"}</code>
                      </td>
                      <td className="text-cell risk-text-cell">{risk.riskText}</td>
                      <td>
                        <span className={`axis-tag axis-${axis.class}`}>
                          {axis.text}
                        </span>
                      </td>
                      <td className="stage-cell">{risk.time || risk.stage}</td>
                      <td>
                        <span className={`level-badge ${level.class}`}>
                          <FaTriangleExclamation /> {level.text}
                        </span>
                      </td>
                      <td className="score-cell rii-value-cell"><strong>{parseFloat(score).toFixed(2)}%</strong></td>
                      
                      <td>
                        {!isFixedRisk && activeSelectRowId === actualRiskId ? (
                          <select 
                            value={risk.operationalStatus || 'مفتوحة'} 
                            onChange={(e) => handleStatusChange(actualRiskId, e.target.value)}
                            onBlur={() => setActiveSelectRowId(null)}
                            disabled={updatingId === actualRiskId}
                            className="status-select-inline-luxury"
                            autoFocus
                          >
                            <option value="مفتوحة">{t('status_options.open')}</option>
                            <option value="قيد المعالجة">{t('status_options.in_progress')}</option>
                            <option value="مغلقة بحل فني">{t('status_options.technical_close')}</option>
                            <option value="مغلقة بقرار مؤسسي">{t('status_options.institutional_close')}</option>
                          </select>
                        ) : (
                          <span 
                            className={`clickable-status-badge ${getStatusClassName(risk)}`}
                            onClick={() => {
                              if (isFixedRisk) {
                                showToast(t('toast.fixed_risk_warning'), "warning");
                                return;
                              }
                              setActiveSelectRowId(actualRiskId);
                            }}
                          >
                            {isFixedRisk ? t('status_options.institutional_close') : (t(`status_options_mapping.${risk.operationalStatus}`) || risk.operationalStatus || t('status_options.open'))}
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="actions-flex-container">
                          {suggestedActions.length > 0 ? (
                            suggestedActions.map((act, idx) => (
                              <button
                                key={idx}
                                className="action-code-badge"
                                onClick={() => openActionModal(act)}
                                title={t('table.action_badge_title')}
                                style={{ cursor: 'pointer', border: '1px solid #BBF7D0', transition: 'all 0.2s' }}
                              >
                                {act.code}
                              </button>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>{t('table.none')}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        {risk.actionIds && risk.actionIds.length > 0 ? (
                          <button 
                            className="action-assigned-badge" 
                            style={{ width: '100%' }}
                            onClick={() => navigate(`/add-action/${actualRiskId}`, { state: { risk } })}
                          >
                            {risk.actionIds.length} {t('table.actions_added')}
                          </button>
                        ) : (
                          <button 
                            className="btn-add-action"
                            style={{ width: '100%' }}
                            onClick={() => navigate(`/add-action/${actualRiskId}`, { state: { risk } })}
                          >
                            <FaPlus /> {t('table.add_action_btn')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskRegistry;