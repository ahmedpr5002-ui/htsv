import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaTrash, FaEdit, FaPlus, FaUndo, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import NavBar from '../../components/rightBar/rightBar'; 
import './RiskMitigationPage.css';

export default function RiskMitigationPage() {
  const { t } = useTranslation('mitigationPage');
  const [mitigations, setMitigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);

  // حالة الفورم للإضافة والتعديل بما يتطابق مع الـ Schema
  const [formData, setFormData] = useState({
    code: '',
    category: 'فني', // القيمة الافتراضية للـ enum بالخلفية
    phase: '',
    actionText: '',
    Proposedofficial: '',
    riiPercentage: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // نظام التنبيهات المدمج
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchMitigations();
  }, []);

  const fetchMitigations = async () => {
    try {
      const response = await axios.get('https://ahmedpr5002-irs-hvtl.hf.space/rmaction', config);
      setMitigations(response.data || []);
      setLoading(false);
    } catch (error) {
      showNotification(t('error_fetch_data', 'فشل في جلب إجراءات التخفيف'), "error");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.actionText.trim() || !formData.phase.trim()) {
      return showNotification(t('error_required_fields', 'يرجى ملء جميع الحقول الإلزامية'), "error");
    }

    try {
      if (isEditing) {
        const response = await axios.put(`https://ahmedpr5002-irs-hvtl.hf.space/rmaction/update/${editId}`, formData, config);
        showNotification(response.data.message || t('success_update', 'تم التحديث بنجاح'), "success");
        setIsEditing(false);
        setEditId(null);
      } else {
        const response = await axios.post('https://ahmedpr5002-irs-hvtl.hf.space/rmaction/create', formData, config);
        showNotification(response.data.message || t('success_create', 'تمت الإضافة بنجاح'), "success");
      }

      setFormData({ code: '', category: 'فني', phase: '', actionText: '', Proposedofficial: '', riiPercentage: '' });
      fetchMitigations();
    } catch (error) {
      const msg = error.response?.data?.message || t('error_process_request', 'حدث خطأ أثناء معالجة الطلب');
      showNotification(msg, "error");
    }
  };

  const startEdit = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setFormData({
      code: item.code,
      category: item.category,
      phase: item.phase,
      actionText: item.actionText,
      Proposedofficial: item.Proposedofficial || '',
      riiPercentage: item.riiPercentage
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ code: '', category: 'فني', phase: '', actionText: '', Proposedofficial: '', riiPercentage: '' });
  };

  const executeDelete = async (id) => {
    try {
      const response = await axios.delete(`https://ahmedpr5002-irs-hvtl.hf.space/rmaction/delete/${id}`, config);
      showNotification(response.data.message || t('success_delete', 'تم الحذف بنجاح'), "success");
      setMitigations(prev => prev.filter(item => item._id !== id));
      setItemToDelete(null);
    } catch (error) {
      showNotification(t('error_delete_failed', 'فشلت عملية الحذف، تحقق من الصلاحيات'), "error");
    }
  };

  return (
    <div className="mitigation-management-page">
      <NavBar title={t('nav_title', 'إجراءات تخفيف المخاطر')} subtitle={t('nav_subtitle', 'لوحة التحكم والمسؤوليات')} />

      {toast.show && <div className={`custom-toast dynamic-toast-animation ${toast.type}`}>{toast.message}</div>}

      <div className="mitigation-form-card animate-pop">
        <div className="card-header-title">
          <FaShieldAlt className="header-icon-main" />
          <h3>{isEditing ? t('form_title_edit', 'تعديل إجراء التخفيف') : t('form_title_add', 'إدراج إجراء تخفيف جديد')}</h3>
        </div>

        <form onSubmit={handleSubmit} className="modern-mitigation-form">
          <div className="form-grid-three">
            <div className="mitigation-input-group">
              <label>{t('label_code', 'كود الإجراء *')}</label>
              <input 
                type="text" 
                name="code" 
                placeholder={t('placeholder_code', 'مثال: 01')} 
                value={formData.code} 
                onChange={handleInputChange} 
                required 
                disabled={isEditing}
              />
            </div>

            <div className="mitigation-input-group">
              <label>{t('label_category', 'التصنيف *')}</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="فني">{t('cat_tech', 'فني')}</option>
                <option value="مالي">{t('cat_finance', 'مالي')}</option>
                <option value="قانوني">{t('cat_legal', 'قانوني')}</option>
                <option value="تكاملي">{t('cat_integrative', 'تكاملي')}</option>
              </select>
            </div>

            <div className="mitigation-input-group">
              <label>{t('label_rii', 'نسبة RII المئوية *')}</label>
              <input 
                type="number" 
                name="riiPercentage" 
                step="0.01" 
                min="0" 
                max="100" 
                placeholder="0.00" 
                value={formData.riiPercentage} 
                onChange={handleInputChange} 
                required
              />
            </div>
          </div>

          <div className="form-grid-two">
            <div className="mitigation-input-group">
              <label>{t('label_phase', 'المرحلة الزمنية *')}</label>
              <input 
                type="text" 
                name="phase" 
                placeholder={t('placeholder_phase', 'مثال: قبل، اثناء، قبل واثناء')} 
                value={formData.phase} 
                onChange={handleInputChange} 
                required
              />
            </div>

           
          </div>

          <div className="mitigation-input-group full-width-input">
            <label>{t('label_action_text', 'صياغة إجراء التخفيف *')}</label>
            <textarea 
              name="actionText" 
              rows="3" 
              placeholder={t('placeholder_action_text', 'اكتب نص الإجراء الحمائي الكامل والمفصل هنا...')} 
              value={formData.actionText} 
              onChange={handleInputChange} 
              required
            />
          </div>

          <div className="form-action-buttons">
            <button type="submit" className={`btn-submit-mitigation ${isEditing ? 'btn-edit-mode' : ''}`}>
              <FaPlus /> {isEditing ? t('btn_save_changes', 'حفظ التعديلات') : t('btn_insert', 'إدراج الإجراء')}
            </button>
            {isEditing && (
              <button type="button" className="btn-cancel-mitigation" onClick={cancelEdit}>
                {t('btn_cancel', 'إلغاء التعديل')}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mitigation-table-card">
        <div className="table-header-bar">
          <h4>{t('table_title', 'سجل إجراءات التخفيف المعتمدة')} ({mitigations.length})</h4>
        </div>

        {loading ? (
          <div className="table-loading-status">{t('table_loading', 'جاري تحميل السجل البرمجي...')}</div>
        ) : mitigations.length === 0 ? (
          <div className="no-mitigations-status">
            <FaExclamationTriangle /> {t('no_data_found', 'لا يوجد إجراءات مسجلة حالياً.')}
          </div>
        ) : (
          <div className="responsive-table-wrapper">
            <table className="modern-data-table">
              <thead>
                <tr>
                  <th>{t('th_code', 'الكود')}</th>
                  <th>{t('th_action', 'إجراء التخفيف')}</th>
                  <th>{t('th_category', 'التصنيف')}</th>
                  <th>{t('th_phase', 'المرحلة')}</th>
                  
                  <th>{t('th_rii', 'نسبة RII')}</th>
                  <th>{t('th_actions', 'التحكم')}</th>
                </tr>
              </thead>
              <tbody>
                {mitigations.map((item) => (
                  <tr key={item._id} className="table-row-hover">
                    <td className="code-badge-cell"><span>{item.code}</span></td>
                    <td className="text-desc-cell">{item.actionText}</td>
                    <td>
                      <span className={`category-pill ${
                        item.category === 'فني' ? 'tech' : 
                        item.category === 'مالي' ? 'finance' : 
                        item.category === 'قانوني' ? 'legal' : 'integrative'
                      }`}>
                        {item.category === 'فني' ? t('cat_tech', 'فني') :
                         item.category === 'مالي' ? t('cat_finance', 'مالي') :
                         item.category === 'قانوني' ? t('cat_legal', 'قانوني') : t('cat_integrative', 'تكاملي')}
                      </span>
                    </td>
                    <td><span className="phase-text-badge">{item.phase}</span></td>
                    
                    <td className="rii-cell-bold">{Number(item.riiPercentage).toFixed(2)}%</td>
                    <td>
                      <div className="table-control-actions">
                        <button type="button" className="action-row-edit" onClick={() => startEdit(item)} title={t('tooltip_edit', 'تعديل الإجراء')}>
                          <FaEdit />
                        </button>

                        <div className="inline-action-zone">
                          {itemToDelete === item._id ? (
                            <div className="modern-inline-confirm animate-pop">
                              <button type="button" className="confirm-yes-btn tiny" onClick={() => executeDelete(item._id)}>{t('btn_confirm', 'تأكيد')}</button>
                              <button type="button" className="confirm-no-btn tiny" onClick={() => setItemToDelete(null)} title={t('tooltip_cancel', 'تراجع')}><FaUndo /></button>
                            </div>
                          ) : (
                            <button type="button" className="action-row-delete" onClick={() => setItemToDelete(item._id)} title={t('tooltip_delete', 'حذف الإجراء')}>
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