import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import { FaTrash, FaEdit, FaPlus, FaUndo, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import NavBar from '../../components/rightBar/rightBar';
import './RisksPage.css';

export default function RisksPage() {
  const { t } = useTranslation('risksPage'); // تفعيل التابع t وتحديد الـ Namespace
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskToDelete, setRiskToDelete] = useState(null);

  // حالة الفورم للإضافة والتعديل
  const [formData, setFormData] = useState({
    riskCode: '',
    riskText: '',
    axis: 'الفني', // القيمة البرمجية الثابتة للسيرفر عند الإرسال من الـ select
    nature: 'متغير', // القيمة البرمجية الثابتة للسيرفر عند الإرسال من الـ select
    stage: '',
    riiValue: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // التنبيهات الاحترافية المدمجة
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      const response = await axios.get('https://ahmedpr5002-irs-hvtl.hf.space/advrisk/all', config);
      setRisks(response.data.risks || []);
      setLoading(false);
    } catch (error) {
      showNotification(t('error_fetch_risks'), "error");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.riskCode.trim() || !formData.riskText.trim()) {
      return showNotification(t('error_required_fields'), "error");
    }

    try {
      if (isEditing) {
        // عملية التعديل
        const response = await axios.put(`https://ahmedpr5002-irs-hvtl.hf.space/advrisk/update/${editId}`, formData, config);
        showNotification(response.data.message || t('success_update'), "success");
        setIsEditing(false);
        setEditId(null);
      } else {
        // عملية الإضافة
        const response = await axios.post('https://ahmedpr5002-irs-hvtl.hf.space/advrisk/create', formData, config);
        showNotification(response.data.message || t('success_create'), "success");
      }

      // تصفير الفورم وجلب البيانات مجدداً
      setFormData({ riskCode: '', riskText: '', axis: 'الفني', nature: 'متغير', stage: '', riiValue: '' });
      fetchRisks();
    } catch (error) {
      const msg = error.response?.data?.message || t('error_process_request');
      showNotification(msg, "error");
    }
  };

  const startEdit = (risk) => {
    setIsEditing(true);
    setEditId(risk._id);
    setFormData({
      riskCode: risk.riskCode,
      riskText: risk.riskText,
      axis: risk.axis,
      nature: risk.nature,
      stage: risk.stage || '',
      riiValue: risk.riiValue
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ riskCode: '', riskText: '', axis: 'الفني', nature: 'متغير', stage: '', riiValue: '' });
  };

  const executeDelete = async (id) => {
    try {
      const response = await axios.delete(`https://ahmedpr5002-irs-hvtl.hf.space/advrisk/delete/${id}`, config);
      showNotification(response.data.message || t('success_delete'), "success");
      setRisks(prev => prev.filter(r => r._id !== id));
      setRiskToDelete(null);
    } catch (error) {
      showNotification(t('error_delete_failed'), "error");
    }
  };

  return (
    <div className="risk-management-page">
      <NavBar title={t('nav_title')} subtitle={t('nav_subtitle')} />

      {toast.show && <div className={`custom-toast dynamic-toast-animation ${toast.type}`}>{toast.message}</div>}

      {/* شق التحكم والإضافة */}
      <div className="risk-form-card animate-pop">
        <div className="card-header-title">
          <FaShieldAlt className="header-icon-main" />
          <h3>{isEditing ? t('form_title_edit') : t('form_title_add')}</h3>
        </div>

        <form onSubmit={handleSubmit} className="modern-risk-form">
          <div className="form-grid-three">
            <div className="risk-input-group">
              <label>{t('label_risk_code')}</label>
              <input 
                type="text" 
                name="riskCode" 
                placeholder={t('placeholder_risk_code')} 
                value={formData.riskCode} 
                onChange={handleInputChange} 
                required 
                disabled={isEditing}
              />
            </div>

            <div className="risk-input-group">
              <label>{t('label_axis')}</label>
              <select name="axis" value={formData.axis} onChange={handleInputChange}>
                <option value="الفني">{t('axis_technical')}</option>
                <option value="المالي">{t('axis_financial')}</option>
                <option value="القانوني">{t('axis_legal')}</option>
              </select>
            </div>

            <div className="risk-input-group">
              <label>{t('label_nature')}</label>
              <select name="nature" value={formData.nature} onChange={handleInputChange}>
                <option value="متغير">{t('nature_dynamic')}</option>
                <option value="ثابت">{t('nature_static')}</option>
              </select>
            </div>
          </div>

          <div className="form-grid-two">
            <div className="risk-input-group">
              <label>{t('label_stage')}</label>
              <input 
                type="text" 
                name="stage" 
                placeholder={t('placeholder_stage')} 
                value={formData.stage} 
                onChange={handleInputChange} 
                required
              />
            </div>

            <div className="risk-input-group">
              <label>{t('label_rii_value')}</label>
              <input 
                type="number" 
                name="riiValue" 
                step="0.01" 
                min="0" 
                max="100" 
                placeholder={t('placeholder_rii_value')} 
                value={formData.riiValue} 
                onChange={handleInputChange} 
                required
              />
            </div>
          </div>

          <div className="risk-input-group full-width-input">
            <label>{t('label_risk_text')}</label>
            <textarea 
              name="riskText" 
              rows="3" 
              placeholder={t('placeholder_risk_text')} 
              value={formData.riskText} 
              onChange={handleInputChange} 
              required
            />
          </div>

          <div className="form-action-buttons">
            <button type="submit" className={`btn-submit-risk ${isEditing ? 'btn-edit-mode' : ''}`}>
              <FaPlus /> {isEditing ? t('btn_save_changes') : t('btn_insert_risk')}
            </button>
            {isEditing && (
              <button type="button" className="btn-cancel-risk" onClick={cancelEdit}>
                {t('btn_cancel_edit')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* شق عرض الجدول المالي والفني والقانوني */}
      <div className="risk-table-card">
        <div className="table-header-bar">
          <h4>{t('table_title', { count: risks.length })}</h4>
        </div>

        {loading ? (
          <div className="table-loading-status">{t('table_loading')}</div>
        ) : risks.length === 0 ? (
          <div className="no-risks-status">
            <FaExclamationTriangle /> {t('no_risks_found')}
          </div>
        ) : (
          <div className="responsive-table-wrapper">
            <table className="modern-data-table">
              <thead>
                <tr>
                  <th>{t('th_code')}</th>
                  <th>{t('th_description')}</th>
                  <th>{t('th_axis')}</th>
                  <th>{t('th_nature')}</th>
                  <th>{t('th_stage')}</th>
                  <th>{t('th_rii')}</th>
                  <th>{t('th_action')}</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk) => (
                  <tr key={risk._id} className="table-row-hover">
                    <td className="code-badge-cell"><span>{risk.riskCode}</span></td>
                    <td className="text-desc-cell">{risk.riskText}</td>
                    <td>
                      {/* التعديل الجوهري: يدعم الفحص بوجود "الـ" التعريف أو بدونها ليتطابق مع الـ API بنجاح */}
                      <span className={`axis-pill ${
                        (risk.axis === 'الفني' || risk.axis === 'فني') ? 'tech' : 
                        (risk.axis === 'المالي' || risk.axis === 'مالي') ? 'finance' : 'legal'
                      }`}>
                        {(risk.axis === 'الفني' || risk.axis === 'فني') ? t('axis_technical') : 
                         (risk.axis === 'المالي' || risk.axis === 'مالي') ? t('axis_financial') : 
                         t('axis_legal')}
                      </span>
                    </td>
                    <td>
                      {/* دعم فحص طبيعة الخطر بـ "الـ" التعريف وبدونها */}
                      {(risk.nature === 'متغير' || risk.nature === 'المتغير') ? t('nature_dynamic_short') : t('nature_static')}
                    </td>
                    <td>{risk.stage || t('not_specified')}</td>
                    <td className="rii-cell-bold">{Number(risk.riiValue).toFixed(2)}%</td>
                    <td>
                      <div className="table-control-actions">
                        <button type="button" className="action-row-edit" onClick={() => startEdit(risk)} title={t('title_edit')}>
                          <FaEdit />
                        </button>

                        {/* نظام الحذف الاحترافي المدمج في السطر */}
                        <div className="inline-action-zone">
                          {riskToDelete === risk._id ? (
                            <div className="modern-inline-confirm animate-pop">
                              <button type="button" className="confirm-yes-btn tiny" onClick={() => executeDelete(risk._id)}>{t('btn_confirm_delete')}</button>
                              <button type="button" className="confirm-no-btn tiny" onClick={() => setRiskToDelete(null)} title={t('title_undo')}><FaUndo /></button>
                            </div>
                          ) : (
                            <button type="button" className="action-row-delete" onClick={() => setRiskToDelete(risk._id)} title={t('title_delete')}>
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}