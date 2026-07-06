import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../components/navBar/PageHeade';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import { 
  FaTriangleExclamation, 
  FaLock, 
  FaUnlock,
  FaScaleBalanced, 
  FaFloppyDisk,
  FaXmark,
  FaCalendarDays,
  FaUser,
  FaCircleInfo,
  FaDollarSign,    
  FaShieldHalved, 
  FaTrashCan,
  FaGears,
  FaLink
} from 'react-icons/fa6';
import { HiOutlineDocumentText } from "react-icons/hi2";
import './AddAction.css';

const AddAction = () => {
  const { riskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['addAction']); // تهيئة ملف الترجمة الخاص بالصفحة

  const currentRisk = location.state?.risk || {
    riskCode: "L01",
    riskText: "تأخر استحصال الموافقات من الجهات الرسمية ذات العلاقة",
    axis: "القانوني",
    type: "ثابت",
    actionIds: [],
    riskNotes: "",
    riskDueDate: "2026-06-15",
    riskOwner: "مدير المشروع" 
  };

  const [availableActions, setAvailableActions] = useState([]);
  const [selectedActionIds, setSelectedActionIds] = useState([]);
  const [actionDetails, setActionDetails] = useState({});
  const [riskOwner, setRiskOwner] = useState(currentRisk.riskOwner || 'مدير المشروع');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [riskNotes, setRiskNotes] = useState(currentRisk.riskNotes || '');
  const [riskDueDate, setRiskDueDate] = useState(
    currentRisk.riskDueDate ? currentRisk.riskDueDate.split('T')[0] : '2026-06-15'
  );

  const token = localStorage.getItem('token') || "";
  const isFixedRisk = currentRisk.type === 'ثابت';

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/rmaction', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const allActions = await response.json();
          setAvailableActions(allActions);

          const savedActionsRaw = currentRisk.actionIds || [];
          
          if (savedActionsRaw.length > 0) {
            const savedIds = [];
            const savedDetails = {};

            savedActionsRaw.forEach(item => {
              const id = item.actionId?._id || item.actionId || item._id;
              if (id) {
                savedIds.push(id);
                
                let formattedDate = '';
                if (item.actionDueDate) {
                  formattedDate = item.actionDueDate.split('T')[0];
                }

                savedDetails[id] = {
                  assignee: item.assignee || 'مدير المشروع',
                  actionDueDate: formattedDate, 
                  actionStatus: item.actionStatus || 'قيد التنفيذ'
                };
              }
            });

            setSelectedActionIds(savedIds);
            setActionDetails(savedDetails);
          }
        } else {
          setMessage({ text: t('msg_fetch_failed'), type: 'error' });
        }
      } catch (error) {
        console.error(error);
        setMessage({ text: t('msg_connection_error'), type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [token, currentRisk, t]);

  const handleSelectActionFromDropdown = (e) => {
    const actionId = e.target.value;
    if (!actionId) return;

    if (!selectedActionIds.includes(actionId)) {
      setSelectedActionIds(prev => [...prev, actionId]);
      
      setActionDetails(prev => ({
        ...prev,
        [actionId]: {
          assignee: 'مدير المشروع', 
          actionDueDate: riskDueDate || '', 
          actionStatus: 'قيد التنفيذ'
        }
      }));
    }
    e.target.value = "";
  };

  const handleInlineDetailChange = (actionId, field, value) => {
    setActionDetails(prev => ({
      ...prev,
      [actionId]: {
        ...prev[actionId],
        [field]: value
      }
    }));
  };

  const handleRemoveAction = (id, e) => {
    e.stopPropagation();
    setSelectedActionIds(prev => prev.filter(item => item !== id));
    setActionDetails(prev => {
      const updatedDetails = { ...prev };
      delete updatedDetails[id];
      return updatedDetails;
    });
  };

  const handleSaveActionRelation = async () => {
    if (selectedActionIds.length === 0) {
      setMessage({ text: t('msg_select_at_least_one'), type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });
    
    const actionData = selectedActionIds.map(id => ({
      actionId: id,
      assignee: actionDetails[id]?.assignee || 'مدير المشروع', 
      actionDueDate: actionDetails[id]?.actionDueDate || '', 
      actionStatus: actionDetails[id]?.actionStatus || 'قيد التنفيذ'
    }));

    try {
      const response = await fetch(`https://ahmedpr5002-irs-hvtl.hf.space/dang/risk-entry/${riskId}/actions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          riskNotes,
          riskOwner, 
          riskDueDate: isFixedRisk ? "" : riskDueDate,
          actionData
        }
      )});

      if (response.ok) {
        setMessage({ text: t('msg_save_success'), type: 'success' });
        setTimeout(() => navigate(-1), 1500);
      } else {
        const errData = await response.json();
        setMessage({ text: errData.message || t('msg_save_failed'), type: 'error' });
      }
    } catch (error) {
      setMessage({ text: t('msg_server_save_error'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getActionRowClass = (category) => {
    if (!category) return '';
    const cat = category.toLowerCase();
    if (cat.includes('مالي') || cat.includes('financial')) return 'row-financial';
    if (cat.includes('قانوني') || cat.includes('legal')) return 'row-legal';
    if (cat.includes('فني') || cat.includes('technical')) return 'row-technical';
    return '';
  };

  const renderAxisBadge = (axisName) => {
    if (axisName === 'مالي' || axisName === 'financial') {
      return <div className="info-value-box axis-financial-badge"><FaDollarSign className="icon-gap" /> {t('axis_financial')}</div>;
    }
    if (axisName === 'قانوني' || axisName === 'القانوني' || axisName === 'legal') {
      return <div className="info-value-box axis-legal-badge"><FaScaleBalanced className="icon-gap" /> {t('axis_legal')}</div>;
    }
    if (axisName === 'فني' || axisName === 'technical') {
      return <div className="info-value-box axis-technical-badge"><FaGears className="icon-gap" /> {t('axis_technical')}</div>;
    }
    return <div className="info-value-box code-purple-badge">{axisName}</div>;
  };

  const selectedActionsData = availableActions.filter(action => selectedActionIds.includes(action._id));
  const unselectedActions = availableActions.filter(action => !selectedActionIds.includes(action._id));
  
  const legalActions = unselectedActions.filter(a => a.category === 'قانوني' || a.category === 'القانوني' || a.category?.toLowerCase() === 'legal');
  const financialActions = unselectedActions.filter(a => a.category === 'مالي' || a.category?.toLowerCase() === 'financial');
  const technicalActions = unselectedActions.filter(a => a.category === 'فني' || a.category?.toLowerCase() === 'technical');
  const sharedActions = unselectedActions.filter(a => !['قانوني', 'القانوني', 'legal', 'مالي', 'financial', 'فني', 'technical'].includes(a.category?.toLowerCase()));

  return (
    <>
    <NavBar title={t('nav_title')} subtitle={t('nav_subtitle')}/>
    <div className="risk-action-page-container">
      
      <style>{`
        .table-inline-select {
          width: 100%;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          color: #2d3748;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease-in-out;
          font-family: inherit;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .table-inline-select:hover { border-color: #94a3b8; background-color: #f8fafc; }
        .table-inline-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
        .table-inline-date-input {
          width: 100%;
          padding: 5px 10px;
          font-size: 13px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          color: #4a5568;
          outline: none;
        }
        .optgroup-legal { color: #805ad5; font-weight: bold; background: #faf5ff; }
        .optgroup-financial { color: #38a169; font-weight: bold; background: #f0fff4; }
        .optgroup-technical { color: #3182ce; font-weight: bold; background: #ebf8ff; }
        .optgroup-shared { color: #dd6b20; font-weight: bold; background: #fffaf0; }
        .custom-beautiful-dropdown option { color: #2d3748; font-weight: normal; }
        .modern-date-picker-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .modern-date-picker-wrapper:hover { border-color: #cbd5e1; }
        .modern-date-picker-wrapper:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
        .modern-date-picker-input {
          width: 100%;
          padding: 12px 42px 12px 12px;
          font-size: 14px;
          font-weight: 600;
          color: #1a202c;
          border: none;
          background: transparent;
          outline: none;
          cursor: pointer;
          font-family: inherit;
          z-index: 2;
        }
        .modern-date-picker-input::-webkit-calendar-picker-indicator {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          color: transparent;
          cursor: pointer;
          z-index: 3;
        }
        .modern-date-icon {
          position: absolute;
          right: 14px;
          color: #4a5568;
          font-size: 18px;
          pointer-events: none;
          z-index: 1;
          transition: color 0.2s;
        }
        .modern-date-picker-wrapper:focus-within .modern-date-icon { color: #3b82f6; }
      `}</style>

      {/* كارت معلومات الخطر العلوي */}
      <div className="risk-header-info-card" >
        <div className="info-column-item text-center">
          <span className="info-label">{t('lbl_risk_code')}</span>
          <div className="info-value-box code-purple-badge">{currentRisk.riskCode}</div>
        </div>
        
        <div className="info-column-item flex-grow-text text-right">
          <span className="info-label text-center-label">{t('lbl_risk_text')}</span>
          <div className="info-value-text">{currentRisk.riskText}</div>
        </div>

        <div className="info-column-item text-center">
          <span className="info-label">{t('lbl_axis')}</span>
          {renderAxisBadge(currentRisk.axis)}
        </div>

        <div className="info-column-item text-center">
          <span className="info-label">{t('lbl_risk_type')}</span>
          {isFixedRisk ? (
            <div className="info-value-box nature-red-badge"><FaLock className="icon-gap" /> {t('type_fixed')}</div>
          ) : (
            <div className="info-value-box nature-blue-badge"><FaUnlock className="icon-gap" /> {t('type_variable')}</div>
          )}
        </div>
      </div>

      {/* بنر التنبيه الإنشائي الأصفر */}
      {isFixedRisk && (
        <div className="structural-alert-banner">
          <div className="alert-icon-wrapper"><FaTriangleExclamation /></div>
          <div className="alert-text-wrapper">
            <strong>{t('alert_title')}</strong>
            <p>{t('alert_desc')}</p>
          </div>
        </div>
      )}

      {/* كارت اختيار واستدعاء الإجراءات دون إيموجيات عشوائية */}
      <div className="action-dropdown-selection-card">
        <label className="dropdown-main-label">{t('lbl_dropdown_select')}</label>
        <div className="dropdown-wrapper-layout">
          <select 
            className="custom-beautiful-dropdown" 
            onChange={handleSelectActionFromDropdown}
            defaultValue=""
          >
            <option value="" disabled>-- {t('dropdown_placeholder')} --</option>
            
            {legalActions.length > 0 && (
              <optgroup label={t('group_legal')} className="optgroup-legal">
                {legalActions.map(action => (
                  <option key={action._id} value={action._id}>
                    {action.code} - {action.actionText}
                  </option>
                ))}
              </optgroup>
            )}

            {financialActions.length > 0 && (
              <optgroup label={t('group_financial')} className="optgroup-financial">
                {financialActions.map(action => (
                  <option key={action._id} value={action._id}>
                    {action.code} - {action.actionText}
                  </option>
                ))}
              </optgroup>
            )}

            {technicalActions.length > 0 && (
              <optgroup label={t('group_technical')} className="optgroup-technical">
                {technicalActions.map(action => (
                  <option key={action._id} value={action._id}>
                    {action.code} - {action.actionText}
                  </option>
                ))}
              </optgroup>
            )}

            {sharedActions.length > 0 && (
              <optgroup label={t('group_shared')} className="optgroup-shared">
                {sharedActions.map(action => (
                  <option key={action._id} value={action._id}>
                    {action.code} - {action.actionText}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* الجدول الرئيسي للتحكم بالإجراءات المرتبطة */}
      <div className="main-sections-grid" style={{ display: 'block' }}>
        <div className="actions-list-main-card">
          <div className="card-header-inline">
            <h3><HiOutlineDocumentText /> {t('table_title')}</h3>
            <span className="subtitle-hint">{t('table_subtitle')}</span>
          </div>

          <div className="table-responsive">
            <table className="custom-action-table image-style-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th style={{ width: '120px' }}>{t('th_action_code')}</th>
                  <th>{t('th_action_text')}</th>
                  <th style={{ width: '100px' }}>RII (%)</th>
                  <th style={{ width: '220px' }}>{t('th_assignee')}</th>
                  <th style={{ width: '160px' }}>{t('th_due_date')}</th>
                  <th style={{ width: '80px' }}>{t('th_control')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center">{t('table_loading')}</td></tr>
                ) : selectedActionsData.length === 0 ? (
                  <tr><td colSpan="7" className="text-center no-data-inside-table">{t('table_no_data')}</td></tr>
                ) : selectedActionsData.map((action, index) => {
                  const rowClass = getActionRowClass(action.category);
                  const currentAssignee = actionDetails[action._id]?.assignee || 'مدير المشروع';
                  const currentActionDate = actionDetails[action._id]?.actionDueDate || '';

                  return (
                    <tr key={action._id} className={rowClass}>
                      <td className="index-cell-style">{index + 1}</td>
                      <td className="code-cell-dynamic-styled">{action.code}</td>
                      <td className="text-right action-text-bold-style">{action.actionText}</td>
                      <td className="rii-cell-styled">{action.riiPercentage || '85.30'}%</td>
                      
                      <td>
                        <select
                          className="table-inline-select"
                          value={currentAssignee}
                          onChange={(e) => handleInlineDetailChange(action._id, 'assignee', e.target.value)}
                        >
                          <option value="مدير المشروع">{t('opt_pm')}</option>
                          <option value="مهندس الموقع">{t('opt_se')} </option>
                          <option value="الجهة المالكة">{t('opt_owner')}</option>
                          <option value="جهة خارجية">{t('opt_external')}</option>
                        </select>
                      </td>

                      <td>
                        {currentActionDate === '' ? (
                          <input
                            type="date"
                            className="table-inline-date-input"
                            onChange={(e) => handleInlineDetailChange(action._id, 'actionDueDate', e.target.value)}
                          />
                        ) : (
                          <span className="badge-date-styled" onClick={() => handleInlineDetailChange(action._id, 'actionDueDate', '')} style={{cursor: 'pointer'}}>
                            <FaCalendarDays className="calendar-icon-table" /> {currentActionDate}
                          </span>
                        )}
                      </td>

                      <td>
                        <button 
                          type="button"
                          className="delete-action-row-btn" 
                          onClick={(e) => handleRemoveAction(action._id, e)}
                        >
                          <FaTrashCan />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* التوثيق الإجمالي السفلي */}
      <div className="bottom-details-form-card">
        <h3>{t('form_section_title')}</h3>
        <div className="form-fields-layout">
          
          <div className="form-group-item textarea-width">
            <label>{t('lbl_risk_notes')}</label>
            <textarea 
              placeholder={t('placeholder_notes')}
              value={riskNotes}
              onChange={(e) => setRiskNotes(e.target.value)}
              maxLength={500}
            />
            <span className="char-count">{riskNotes.length}/500</span>
          </div>

          <div className="form-inputs-side-column">
            <div className="form-group-item">
              <label>{t('lbl_risk_owner')}</label>
              <div className="input-icon-wrapper">
                <FaUser className="inner-icon" />
                <select 
                  className="table-inline-select"
                  value={riskOwner} 
                  onChange={(e) => setRiskOwner(e.target.value)}
                >
                  <option value="مدير المشروع">{t('opt_pm')}</option>
                  <option value="مهندس الموقع">{t('opt_se')}</option>
                  <option value="الجهة المالكة">{t('opt_owner')}</option>
                  <option value="جهة خارجية">{t('opt_external')}</option>
                </select>
              </div>
            </div>

            {!isFixedRisk && (
              <div className="form-group-item" style={{ marginTop: '15px' }}>
                <label>{t('lbl_overall_due_date')}</label>
                <div className="modern-date-picker-wrapper">
                  <FaCalendarDays className="modern-date-icon" />
                  <input 
                    type="date" 
                    className="modern-date-picker-input"
                    value={riskDueDate} 
                    onChange={(e) => setRiskDueDate(e.target.value)} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {message.text && <div className={`form-msg ${message.type}`}>{message.text}</div>}
        
        <div className="form-actions-footer-bar">
          <button type="button" className="btn-save-action-main" onClick={handleSaveActionRelation} disabled={saving}>
            <FaFloppyDisk /> {saving ? t('btn_saving') : t('btn_save')}
          </button>
          <button type="button" className="btn-cancel-action-main" onClick={() => navigate(-1)}>
            <FaXmark /> {t('btn_cancel')}
          </button>
        </div>
        <p className="system-footer-hint">
          <FaCircleInfo /> {t('footer_hint', { count: selectedActionIds.length })}
        </p>
      </div>

    </div>
    </>
  );
};

export default AddAction;