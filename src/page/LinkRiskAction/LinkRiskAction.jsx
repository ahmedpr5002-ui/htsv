import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RightBar from '../../components/rightBar/rightBar';
import { 
  FaTriangleExclamation, 
  FaShieldHalved, 
  FaPenToSquare, 
  FaCircleCheck, 
  FaCircleXmark,
  FaMagnifyingGlass 
} from 'react-icons/fa6';
import './LinkRiskAction.css';

const LinkRiskAction = () => {
  const { t } = useTranslation('linkRiskAction');
  
  // المخازن الأساسية للبيانات
  const [risks, setRisks] = useState([]);
  const [actions, setActions] = useState([]);
  
  // حالات حقول الإدخال والاختيار
  const [selectedRisk, setSelectedRisk] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [notes, setNotes] = useState('');
  
  // حالات الفلترة الفورية
  const [riskSearch, setRiskSearch] = useState('');
  const [actionSearch, setActionSearch] = useState('');
  
  // حالات النظام (التحميل والرسائل)
  const [loadingRisks, setLoadingRisks] = useState(true);
  const [loadingActions, setLoadingActions] = useState(true);
  const [message, setMessage] = useState({ text: '', isError: false, show: false });

  const token = localStorage.getItem('token') || "";

  // جلب المخاطر والإجراءات عند تحميل المكون
  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/risk/risk', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setRisks(data);
        }
      } catch (error) {
        console.error('Error fetching risks:', error);
      } finally {
        setLoadingRisks(false);
      }
    };

    const fetchActions = async () => {
      try {
        const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/rmaction', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setActions(data);
        }
      } catch (error) {
        console.error('Error fetching actions:', error);
      } finally {
        setLoadingActions(false);
      }
    };

    fetchRisks();
    fetchActions();
  }, [token]);

  // تصفية المخاطر محلياً بناءً على نص البحث
  const filteredRisks = risks.filter(risk => {
    const code = (risk.riskCode || '').toLowerCase();
    const text = (risk.riskText || '').toLowerCase();
    const search = riskSearch.toLowerCase().trim();
    return code.includes(search) || text.includes(search);
  });

  // تصفية الإجراءات محلياً بناءً على نص البحث
  const filteredActions = actions.filter(action => {
    const code = (action.code || '').toLowerCase();
    const text = (action.actionText || '').toLowerCase();
    const search = actionSearch.toLowerCase().trim();
    return code.includes(search) || text.includes(search);
  });

  // معالجة إرسال طلب الربط
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRisk || !selectedAction) {
      setMessage({
        text: t('msg_required_fields'),
        isError: true,
        show: true
      });
      return;
    }

    const bodyData = {
      riskId: selectedRisk,
      actionId: selectedAction,
      status: "قيد التنفيذ",
      notes: notes
    };

    try {
      const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/racon', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          text: t('msg_success'),
          isError: false,
          show: true
        });
        // تماشياً مع الكود الأصلي، تبقى قيم الاختيار والبحث محفوظة ومثبتة أمام المستخدم بعد النجاح
      } else {
        setMessage({
          text: result.message || t('msg_server_error'),
          isError: true,
          show: true
        });
      }
    } catch (error) {
      setMessage({
        text: t('msg_network_error'),
        isError: true,
        show: true
      });
    }
  };

  return (
    <div className="link-risk-action-wrapper">
      <RightBar/>
      <div className="link-container">
        
        <header className="link-header">
          <h2>{t('page_title')}</h2>
          <p>{t('page_subtitle')}</p>
        </header>

        <form onSubmit={handleSubmit} className="link-form">
          
          {/* حقل البحث واختيار الخطر الأساسي */}
          <div className="link-form-group">
            <label htmlFor="riskSearchInput">
              <FaTriangleExclamation className="icon-accent" /> {t('label_search_risk')}
            </label>
            <div className="search-wrapper">
              <FaMagnifyingGlass className="search-inline-icon" />
              <input
                type="text"
                id="riskSearchInput"
                className="link-search-input"
                placeholder={t('placeholder_search_risk')}
                value={riskSearch}
                onChange={(e) => setRiskSearch(e.target.value)}
              />
            </div>
            <select
              id="riskSelectField"
              className="link-select"
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
            >
              <option value="">
                {loadingRisks ? t('loading_risks') : t('select_risk_default')}
              </option>
              {filteredRisks.map((risk) => (
                <option key={risk._id} value={risk._id}>
                  {risk.riskCode ? `[${risk.riskCode}] ` : ''}{risk.riskText || t('no_text')}
                </option>
              ))}
            </select>
          </div>

          {/* حقل البحث واختيار إجراء التخفيف */}
          <div className="link-form-group">
            <label htmlFor="actionSearchInput">
              <FaShieldHalved className="icon-accent" /> {t('label_search_action')}
            </label>
            <div className="search-wrapper">
              <FaMagnifyingGlass className="search-inline-icon" />
              <input
                type="text"
                id="actionSearchInput"
                className="link-search-input"
                placeholder={t('placeholder_search_action')}
                value={actionSearch}
                onChange={(e) => setActionSearch(e.target.value)}
              />
            </div>
            <select
              id="actionSelectField"
              className="link-select"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="">
                {loadingActions ? t('loading_actions') : t('select_action_default')}
              </option>
              {filteredActions.map((action) => (
                <option key={action._id} value={action._id}>
                  {action.code ? `[${action.code}] ` : ''}{action.actionText || t('no_text')}
                </option>
              ))}
            </select>
          </div>

          {/* حقل الملاحظات */}
          <div className="link-form-group">
            <label htmlFor="notesInputField">
              <FaPenToSquare className="icon-accent" /> {t('label_notes')}
            </label>
            <textarea
              id="notesInputField"
              className="link-textarea"
              rows="3"
              placeholder={t('placeholder_notes')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* زر التأكيد والربط */}
          <button type="submit" className="link-submit-btn">
            {t('btn_submit')}
          </button>

        </form>

        {/* صندوق رسائل الاستجابة */}
        {message.show && (
          <div className={`link-message-box ${message.isError ? 'error-box' : 'success-box'}`}>
            {message.isError ? <FaCircleXmark className="msg-icon" /> : <FaCircleCheck className="msg-icon" />}
            <span>{message.text}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default LinkRiskAction;