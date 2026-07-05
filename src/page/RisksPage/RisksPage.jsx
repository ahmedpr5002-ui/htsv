import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaPlus, FaUndo, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import NavBar from '../../components/rightBar/rightBar';
import './RisksPage.css';

export default function RisksPage() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskToDelete, setRiskToDelete] = useState(null);

  // حالة الفورم للإضافة والتعديل
  const [formData, setFormData] = useState({
    riskCode: '',
    riskText: '',
    axis: 'الفني', // الافتراضي حسب السكيما
    nature: 'متغير',
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
      showNotification("فشل جلب قائمة المخاطر من السيرفر", "error");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.riskCode.trim() || !formData.riskText.trim()) {
      return showNotification("يرجى ملء كافة الحقول الأساسية", "error");
    }

    try {
      if (isEditing) {
        // عملية التعديل
        const response = await axios.put(`https://ahmedpr5002-irs-hvtl.hf.space/advrisk/update/${editId}`, formData, config);
        showNotification(response.data.message, "success");
        setIsEditing(false);
        setEditId(null);
      } else {
        // عملية الإضافة
        const response = await axios.post('https://ahmedpr5002-irs-hvtl.hf.space/advrisk/create', formData, config);
        showNotification(response.data.message, "success");
      }

      // تصفير الفورم وجلب البيانات مجدداً
      setFormData({ riskCode: '', riskText: '', axis: 'الفني', nature: 'متغير', stage: '', riiValue: '' });
      fetchRisks();
    } catch (error) {
      const msg = error.response?.data?.message || "حدث خطأ أثناء معالجة الطلب";
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
      showNotification(response.data.message, "success");
      setRisks(prev => prev.filter(r => r._id !== id));
      setRiskToDelete(null);
    } catch (error) {
      showNotification("فشل حذف السجل المطلوب", "error");
    }
  };

  return (
    <div className="risk-management-page">
      <NavBar title="لوحة التحكم بالمخاطر" subtitle="إضافة، تعديل، وحصر سجلات مخاطر المحاور الاستراتيجية (أدمن)" />

      {toast.show && <div className={`custom-toast dynamic-toast-animation ${toast.type}`}>{toast.message}</div>}

      {/* شق التحكم والإضافة */}
      <div className="risk-form-card animate-pop">
        <div className="card-header-title">
          <FaShieldAlt className="header-icon-main" />
          <h3>{isEditing ? "تحديث بيانات الخطر الحالي" : "إدراج خطر جديد"}</h3>
        </div>

        <form onSubmit={handleSubmit} className="modern-risk-form">
          <div className="form-grid-three">
            <div className="risk-input-group">
              <label>كود الخطر (فريد)</label>
              <input 
                type="text" 
                name="riskCode" 
                placeholder="مثال: L01, F03" 
                value={formData.riskCode} 
                onChange={handleInputChange} 
                required 
                disabled={isEditing}
              />
            </div>

            <div className="risk-input-group">
              <label>المحور الاستراتيجي</label>
              <select name="axis" value={formData.axis} onChange={handleInputChange}>
                <option value="الفني">المحور الفني</option>
                <option value="المالي">المحور المالي</option>
                <option value="القانوني">المحور القانوني</option>
              </select>
            </div>

            <div className="risk-input-group">
              <label>طبيعة الخطر</label>
              <select name="nature" value={formData.nature} onChange={handleInputChange}>
                <option value="متغير">متغير (قابل للمعالجة)</option>
                <option value="ثابت">ثابت</option>
              </select>
            </div>
          </div>

          <div className="form-grid-two">
            <div className="risk-input-group">
              <label>المرحلة / الـ Stage</label>
              <input 
                type="text" 
                name="stage" 
                placeholder="مثال: مرحلة التخطيط أو التنفيذ" 
                value={formData.stage} 
                onChange={handleInputChange} 
                required
              />
            </div>

            <div className="risk-input-group">
              <label>قيمة المؤشر RII (0 - 100)</label>
              <input 
                type="number" 
                name="riiValue" 
                step="0.01" 
                min="0" 
                max="100" 
                placeholder="مثال: 90.33" 
                value={formData.riiValue} 
                onChange={handleInputChange} 
                required
              />
            </div>
          </div>

          <div className="risk-input-group full-width-input">
            <label>نص وتوصيف الخطر البديل</label>
            <textarea 
              name="riskText" 
              rows="3" 
              placeholder="اكتب التوصيف الدقيق للخطر هنا..." 
              value={formData.riskText} 
              onChange={handleInputChange} 
              required
            />
          </div>

          <div className="form-action-buttons">
            <button type="submit" className={`btn-submit-risk ${isEditing ? 'btn-edit-mode' : ''}`}>
              <FaPlus /> {isEditing ? "حفظ التعديلات الحالية" : "إدراج الخطر بالنظام"}
            </button>
            {isEditing && (
              <button type="button" className="btn-cancel-risk" onClick={cancelEdit}>
                إلغاء التعديل
              </button>
            )}
          </div>
        </form>
      </div>

      {/* شق عرض الجدول المالي والفني */}
      <div className="risk-table-card">
        <div className="table-header-bar">
          <h4>سجل المخاطر المدرجة حالياً ({risks.length})</h4>
        </div>

        {loading ? (
          <div className="table-loading-status">جاري قراءة مصفوفة المخاطر...</div>
        ) : risks.length === 0 ? (
          <div className="no-risks-status">
            <FaExclamationTriangle /> لا توجد مخاطر مدرجة في هذا المحور بعد.
          </div>
        ) : (
          <div className="responsive-table-wrapper">
            <table className="modern-data-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>توصيف الخطر</th>
                  <th>المحور</th>
                  <th>الطبيعة</th>
                  <th>المرحلة</th>
                  <th>مؤشر RII</th>
                  <th>التحكم والإجراء</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk) => (
                  <tr key={risk._id} className="table-row-hover">
                    <td className="code-badge-cell"><span>{risk.riskCode}</span></td>
                    <td className="text-desc-cell">{risk.riskText}</td>
                    <td>
                      <span className={`axis-pill ${risk.axis === 'الفني' ? 'tech' : risk.axis === 'المالي' ? 'finance' : 'legal'}`}>
                        {risk.axis}
                      </span>
                    </td>
                    <td>{risk.nature}</td>
                    <td>{risk.stage || 'غير محدد'}</td>
                    <td className="rii-cell-bold">{Number(risk.riiValue).toFixed(2)}%</td>
                    <td>
                      <div className="table-control-actions">
                        <button type="button" className="action-row-edit" onClick={() => startEdit(risk)} title="تعديل">
                          <FaEdit />
                        </button>

                        {/* نظام الحذف الاحترافي المدمج في السطر */}
                        <div className="inline-action-zone">
                          {riskToDelete === risk._id ? (
                            <div className="modern-inline-confirm animate-pop">
                              <button type="button" className="confirm-yes-btn tiny" onClick={() => executeDelete(risk._id)}>احذف</button>
                              <button type="button" className="confirm-no-btn tiny" onClick={() => setRiskToDelete(null)}><FaUndo /></button>
                            </div>
                          ) : (
                            <button type="button" className="action-row-delete" onClick={() => setRiskToDelete(risk._id)} title="حذف">
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