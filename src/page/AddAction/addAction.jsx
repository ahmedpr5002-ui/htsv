import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../components/navBar/PageHeade'
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
          setMessage({ text: 'فشل في جلب الإجراءات المتاحة.', type: 'error' });
        }
      } catch (error) {
        console.error(error);
        setMessage({ text: 'حدث خطأ في الاتصال بالخادم عند تحميل البيانات.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [token, currentRisk]);

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
      setMessage({ text: 'يرجى اختيار إجراء واحد على الأقل قبل الحفظ.', type: 'error' });
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
        })
      });

      if (response.ok) {
        setMessage({ text: 'تمت مزامنة وحفظ جميع التعديلات والإجراءات بنجاح!', type: 'success' });
        setTimeout(() => navigate(-1), 1500);
      } else {
        const errData = await response.json();
        setMessage({ text: errData.message || 'فشل في حفظ تفاصيل الارتباط بالسيرفر.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'حدث خطأ أثناء الاتصال بالسيرفر لحفظ التغييرات.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getActionRowClass = (category) => {
    if (!category) return '';
    const cat = category.toLowerCase();
    if (cat.includes('مالي')) return 'row-financial';
    if (cat.includes('قانوني')) return 'row-legal';
    if (cat.includes('فني')) return 'row-technical';
    return '';
  };

  const renderAxisBadge = (axisName) => {
    switch (axisName) {
      case 'مالي':
        return <div className="info-value-box axis-financial-badge"><FaDollarSign className="icon-gap" /> مالي</div>;
      case 'قانوني':
      case 'القانوني':
        return <div className="info-value-box axis-legal-badge"><FaScaleBalanced className="icon-gap" /> القانوني</div>;
      case 'فني':
        return <div className="info-value-box axis-technical-badge"><FaGears className="icon-gap" /> فني</div>;
      default:
        return <div className="info-value-box code-purple-badge">{axisName}</div>;
    }
  };

  const selectedActionsData = availableActions.filter(action => selectedActionIds.includes(action._id));

  const unselectedActions = availableActions.filter(action => !selectedActionIds.includes(action._id));
  const legalActions = unselectedActions.filter(a => a.category === 'قانوني' || a.category === 'القانوني');
  const financialActions = unselectedActions.filter(a => a.category === 'مالي');
  const technicalActions = unselectedActions.filter(a => a.category === 'فني');
  const sharedActions = unselectedActions.filter(a => !['قانوني', 'القانوني', 'مالي', 'فني'].includes(a.category));

  return (
    <>
    <NavBar title='ربط الاجراءات' subtitle='نظره عامة على المخاطر واجراءاتها'/>
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

        /* تنسيقات الألوان والمجموعات الجديدة للسلكت بدلاً من الإيموجي */
        .optgroup-legal { color: #805ad5; font-weight: bold; background: #faf5ff; }
        .optgroup-financial { color: #38a169; font-weight: bold; background: #f0fff4; }
        .optgroup-technical { color: #3182ce; font-weight: bold; background: #ebf8ff; }
        .optgroup-shared { color: #dd6b20; font-weight: bold; background: #fffaf0; }
        .custom-beautiful-dropdown option { color: #2d3748; font-weight: normal; }

        /* حل جذري وإخفاء أيقونة المتصفح الغريبة العشوائية */
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
        .modern-date-picker-wrapper:hover {
          border-color: #cbd5e1;
        }
        .modern-date-picker-wrapper:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }
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
        /* إخفاء السهم والـ Indicator الافتراضي الذي سبب التداخل بالصورة */
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
        .modern-date-picker-wrapper:focus-within .modern-date-icon {
          color: #3b82f6;
        }
      `}</style>

      {/* كارت معلومات الخطر العلوي */}
      <div className="risk-header-info-card" >
        <div className="info-column-item text-center">
          <span className="info-label">كود الخطر</span>
          <div className="info-value-box code-purple-badge">{currentRisk.riskCode}</div>
        </div>
        
        <div className="info-column-item flex-grow-text text-right">
          <span className="info-label text-center-label">نص الخطر</span>
          <div className="info-value-text">{currentRisk.riskText}</div>
        </div>

        <div className="info-column-item text-center">
          <span className="info-label">المحور</span>
          {renderAxisBadge(currentRisk.axis)}
        </div>

        <div className="info-column-item text-center">
          <span className="info-label">نوع الخطر</span>
          {isFixedRisk ? (
            <div className="info-value-box nature-red-badge"><FaLock className="icon-gap" /> ثابت</div>
          ) : (
            <div className="info-value-box nature-blue-badge"><FaUnlock className="icon-gap" /> متغير</div>
          )}
        </div>
      </div>

      {/* بنر التنبيه الأصفر */}
      {isFixedRisk && (
        <div className="structural-alert-banner">
          <div className="alert-icon-wrapper"><FaTriangleExclamation /></div>
          <div className="alert-text-wrapper">
            <strong>هذا الخطر هيكلي، يُسجّل ويُتابع ولا يُغلق إلا بقرار مؤسسي رسمي.</strong>
            <p>المسؤوليات المقترحة أدناه تتبع لإجراءات السيطرة الفردية الخاصة بكل سطر في الجدول بشكل منفصل.</p>
          </div>
        </div>
      )}

      {/* كارت اختيار واستدعاء الإجراءات مع الرموز التعبيرية المطابقة للأيقونات والألوان المستهدفة */}
      <div className="action-dropdown-selection-card">
        <label className="dropdown-main-label">اختر الإجراء المطلوب إضافته إلى جدول المتابعة:</label>
        <div className="dropdown-wrapper-layout">
          <select 
            className="custom-beautiful-dropdown" 
            onChange={handleSelectActionFromDropdown}
            defaultValue=""
          >
            <option value="" disabled>-- اضغط هنا لاختيار واستدعاء إجراء معين --</option>
            
            {legalActions.length > 0 && (
              <optgroup label="⚖  الإجراءات القانونية" className="optgroup-legal">
                {legalActions.map(action => (
                  <option key={action._id} value={action._id}>
                    {action.code} - {action.actionText}
                  </option>
                ))}
              </optgroup>
            )}

            {financialActions.length > 0 && (
              <optgroup label="⛁  الإجراءات المالية" className="optgroup-financial">
                {financialActions.map(action => (
                  <option key={action._id} value={action._id}>
                    {action.code} - {action.actionText}
                  </option>
                ))}
              </optgroup>
            )}

            {technicalActions.length > 0 && (
              <optgroup label="⚙  الإجراءات الفنية" className="optgroup-technical">
                {technicalActions.map(action => (
                  <option key={action._id} value={action._id}>
                    {action.code} - {action.actionText}
                  </option>
                ))}
              </optgroup>
            )}

            {sharedActions.length > 0 && (
              <optgroup label="🔗  إجراءات تكاملية / عامة" className="optgroup-shared">
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

      {/* الجدول الرئيسي */}
      <div className="main-sections-grid" style={{ display: 'block' }}>
        <div className="actions-list-main-card">
          <div className="card-header-inline">
            <h3><HiOutlineDocumentText /> جدول الإجراءات المرتبطة بالحالة</h3>
            <span className="subtitle-hint">تعديل المسؤول المقترح يتم بشكل مباشر ومستقل تماماً لكل سطر على حدة</span>
          </div>

          <div className="table-responsive">
            <table className="custom-action-table image-style-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th style={{ width: '120px' }}>كود الإجراء</th>
                  <th>نص الإجراء</th>
                  <th style={{ width: '100px' }}>RII (%)</th>
                  <th style={{ width: '220px' }}>المسؤول المقترح للإجراء (`assignee`)</th>
                  <th style={{ width: '160px' }}>المهلة المقترحة</th>
                  <th style={{ width: '80px' }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center">جاري تحميل قائمة الإجراءات...</td></tr>
                ) : selectedActionsData.length === 0 ? (
                  <tr><td colSpan="7" className="text-center no-data-inside-table">قم باختيار إجراء من القائمة المنسدلة بالأعلى ليتم بناؤه داخل الجدول فوراً.</td></tr>
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
                          <option value="مدير المشروع">مدير المشروع</option>
                          <option value="مهندس الموقع">مهندس الموقع</option>
                          <option value="الجهة المالكة">الجهة المالكة</option>
                          <option value="جهة خارجية">جهة خارجية</option>
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

      {/* الكارت السفلي للتوثيق الإجمالي */}
      <div className="bottom-details-form-card">
        <h3>البيانات الإجمالية والتوثيق للخطر:</h3>
        <div className="form-fields-layout">
          
          <div className="form-group-item textarea-width">
            <label>الملاحظة عن الخطر والدروس المستفادة</label>
            <textarea 
              placeholder="اكتب الملاحظات الإجمالية حول ربط هذا الخطر بالمشروع "
              value={riskNotes}
              onChange={(e) => setRiskNotes(e.target.value)}
              maxLength={500}
            />
            <span className="char-count">{riskNotes.length}/500</span>
          </div>

          <div className="form-inputs-side-column">
            <div className="form-group-item">
              <label>المسؤول عن الخطر </label>
              <div className="input-icon-wrapper">
                <FaUser className="inner-icon" />
                <select 
                  className="table-inline-select"
                  value={riskOwner} 
                  onChange={(e) => setRiskOwner(e.target.value)}
                >
                  <option value="مدير المشروع">مدير المشروع</option>
                  <option value="مهندس الموقع">مهندس الموقع</option>
                  <option value="الجهة المالكة">الجهة المالكة</option>
                  <option value="جهة خارجية">جهة خارجية</option>
                </select>
              </div>
            </div>

            {!isFixedRisk && (
              <div className="form-group-item" style={{ marginTop: '15px' }}>
                <label>المهلة الزمنية الكلية لإغلاق الخطر </label>
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
            <FaFloppyDisk /> {saving ? 'جاري الحفظ والتحديث...' : 'حفظ ربط الإجراء'}
          </button>
          <button type="button" className="btn-cancel-action-main" onClick={() => navigate(-1)}>
            <FaXmark /> إلغاء
          </button>
        </div>
        <p className="system-footer-hint"><FaCircleInfo /> تم تحديد ({selectedActionIds.length}) إجراء مضاف للربط الإجمالي.</p>
      </div>

    </div>
    </>
  );
};

export default AddAction;