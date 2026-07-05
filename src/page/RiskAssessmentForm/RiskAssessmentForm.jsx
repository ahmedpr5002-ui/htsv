import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Rightbar from '../../components/rightBar/rightBar';
import { 
  FaDatabase, 
  FaPenToSquare, 
  FaKey, 
  FaClock, 
  FaGears, 
  FaScaleBalanced, 
  FaCircleExclamation,
  FaFloppyDisk,
  FaXmark,
  FaCircleCheck,
  FaTriangleExclamation,
  FaFolderPlus 
} from "react-icons/fa6";
import { HiMiniArrowTrendingUp } from "react-icons/hi2";
import './RiskAssessmentForm.css';

const normalizeTimeValue = (val) => {
  const cleanVal = String(val || "").trim();
  if (cleanVal === 'قبل' || cleanVal === 'ما قبل التنفيذ') return 'ما قبل التنفيذ';
  if (cleanVal === 'اثناء' || cleanVal === 'التنفيذ') return 'التنفيذ';
  if (cleanVal === 'بعد' || cleanVal === 'الاستلام والتشغيل') return 'الاستلام والتشغيل';
  return cleanVal || 'التنفيذ'; 
};

const RiskAssessmentForm = () => {
  const navigate = useNavigate();
  const projId = localStorage.getItem('projectId');

  const [hasProject, setHasProject] = useState(!!projId);
  const [inputType, setInputType] = useState('database'); 
  const [dbRisks, setDbRisks] = useState([]);
  const [loadingRisks, setLoadingRisks] = useState(false);

  const [formData, setFormData] = useState({
    projectId: projId,
    riskId: "",
    riskCode: "",
    riskText: "",
    time: "التنفيذ", 
    probability: 3,
    impact: 4,
    nature: "متغير", 
    axis: "فني",
    riiValue: 50 
  });

  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState({ text: '', colorClass: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [selectedDbRiskCode, setSelectedDbRiskCode] = useState("");

  const showToastMessage = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  useEffect(() => {
    if (!projId) {
      setHasProject(false);
      return;
    }

    const fetchRisks = async () => {
      setLoadingRisks(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/risk/risk', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDbRisks(data);
          
          if (data && data.length > 0) {
            setSelectedDbRiskCode(data[0].riskCode); 
            if (inputType === 'database') {
              applySelectedRisk(data[0]);
            }
          }
        }
      } catch (error) {
        console.error("خطأ في جلب المخاطر:", error);
      } finally {
        setLoadingRisks(false);
      }
    };

    fetchRisks();
  }, [projId]);

  const applySelectedRisk = (risk) => {
    const correctTime = normalizeTimeValue(risk.time || risk.stage);
    const actualRii = risk.riiPercentage !== undefined ? risk.riiPercentage : (risk.riiValue !== undefined ? risk.riiValue : 50); 

    setFormData(prev => ({
      ...prev,
      riskId: risk._id || risk.riskId || "",
      riskCode: risk.riskCode || "",
      riskText: risk.riskText || "",
      time: correctTime,
      nature: risk.nature || "ثابت", 
      axis: risk.axis || "فني",
      riiValue: actualRii 
    }));
  };

  const handleTypeChange = (type) => {
    setInputType(type);
    if (type === 'manual') {
      const timestamp = Math.floor(Date.now() / 1000).toString(16);
      const randomTarget = '9999' + Math.floor(100000000000 + Math.random() * 900000000000).toString(16);
      const validObjectId = (timestamp + randomTarget).substring(0, 24).padEnd(24, '0');

      setFormData(prev => ({
        ...prev,
        riskId: validObjectId, 
        riskCode: "MANUAL-" + Math.floor(100 + Math.random() * 900),
        riskText: "",
        time: "التنفيذ",
        nature: "متغير",
        axis: "فني",
        riiValue: 50 
      }));
    } else {
      const currentRisk = dbRisks.find(r => r.riskCode === selectedDbRiskCode) || dbRisks[0];
      if (currentRisk) {
        applySelectedRisk(currentRisk);
      }
    }
  };

  useEffect(() => {
    const P = formData.probability;
    const I = formData.impact;
    const RII = formData.riiValue; 
    
    const score = ((P * I) / 25) * RII;
    setRiskScore(score.toFixed(2));

    if (score < 50) {
      setRiskLevel({ text: 'منخفض', colorClass: 'level-low' });
    } else if (score >= 50 && score <= 75) {
      setRiskLevel({ text: 'مرتفع', colorClass: 'level-medium' });
    } else {
      setRiskLevel({ text: 'حرج جداً', colorClass: 'level-high' });
    }
  }, [formData.probability, formData.impact, formData.riiValue]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputType === 'manual' && !formData.riskText.trim()) {
      showToastMessage("يرجى إدخال وصف الخطر أولاً للاضافة اليدوية!", 'error');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      // const payload = {
      //   projectId: formData.projectId || localStorage.getItem('projectId'),
      //   riskId: formData.riskId || null, 
      //   riskCode: formData.riskCode,
      //   riskText: formData.riskText, 
      //   time: formData.time, 
      //   stage: formData.time === 'ما قبل التنفيذ' ? 'قبل' : formData.time === 'الاستلام والتشغيل' ? 'بعد' : 'اثناء', 
      //   probability: Number(formData.probability), 
      //   impact: Number(formData.impact),          
      //   type: formData.nature, 
      //   axis: formData.axis,
      //   riiPercentage: Number(formData.riiValue), 
      //   riskScore: Number(riskScore) 
      // };
      const payload = {
  projectId: formData.projectId || localStorage.getItem('projectId'),
  riskId: formData.riskId || null, 
  riskCode: formData.riskCode,
  riskText: formData.riskText, 
  time: formData.time, 
  
  // التعديل الجذري هنا: نرسل نفس القيم الثلاثة الصريحة التي حددتها في الـ Select
  stage: formData.time === 'ما قبل التنفيذ' ? 'ما قبل التنفيذ' : formData.time === 'الاستلام والتشغيل' ? 'الاستلام والتشغيل' : 'التنفيذ', 
  
  probability: Number(formData.probability), 
  impact: Number(formData.impact),          
  type: formData.nature, 
  axis: formData.axis,
  riiPercentage: Number(formData.riiValue), 
  riskScore: Number(riskScore) 
};

      const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/dang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok || response.status === 201) {
        showToastMessage("تم حفظ وإرسال الخطر بنجاح!", 'success');
        if (inputType === 'manual') {
          setFormData(prev => ({ ...prev, riskText: "" }));
        }
      } else {
        showToastMessage(data.message || "فشل الإرسال، تحقق من المدخلات.", 'error');
      }
    } catch (error) {
      showToastMessage("خطأ في الاتصال بالسيرفر.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasProject) {
    return (
      <div className="risk-container">
        <Rightbar />
        <div className="no-project-wrapper">
          <div className="no-project-card">
            <div className="no-project-icon-box">
              <FaFolderPlus />
            </div>
            <h2>لم يتم تحديد مشروع نشط!</h2>
            <p>عذراً، لا يمكنك البدء في عملية تقييم المخاطر دون اختيار مشروع أو إنشائه أولاً لربط البيانات به.</p>
            <button className="btn-redirect-project" onClick={() => navigate('/createproject')}>
              الانتقال لوحدة المشاريع واختيار مشروع
            </button>
          </div>
        </div>
      </div>
    );
  }

  const technicalRisks = dbRisks.filter(r => r.axis === 'فني');
  const financialRisks = dbRisks.filter(r => r.axis === 'مالي');
  const legalRisks = dbRisks.filter(r => r.axis === 'قانوني');

  return (
    <div className="risk-container">
      <Rightbar />
      
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? <FaCircleCheck /> : <FaTriangleExclamation />}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close-btn" onClick={() => setToast({ show: false, message: '', type: '' })}>
            <FaXmark />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="risk-card">
        <div className="section-title">
          <FaGears className="section-icon" /> 1. اختيار نوع الإدخال
        </div>
        <div className="input-type-grid">
          <div 
            className={`type-card ${inputType === 'database' ? 'active' : ''}`}
            onClick={() => handleTypeChange('database')}
          >
            <div className="type-icon-wrapper"><FaDatabase /></div>
            <div className="type-text">
              <strong>قاعدة المخاطر الثابتة</strong>
              <p>جلب تلقائي مسبق لقيم الـ RII</p>
            </div>
          </div>
          
          <div 
            className={`type-card ${inputType === 'manual' ? 'active' : ''}`}
            onClick={() => handleTypeChange('manual')}
          >
            <div className="type-icon-wrapper"><FaPenToSquare /></div>
            <div className="type-text">
              <strong>إضافة خطر يدوي</strong>
              <p>تعديل كامل بمعرف مؤقت</p>
            </div>
          </div>
        </div>

        <hr className="divider" />

        <div className="form-grid">
          {inputType === 'database' && (
            <div className="form-group select-custom-wrapper">
              <label><FaDatabase className="input-field-icon" /> اختيار الخطر من مصفوفة النظام</label>
<select 
                disabled={loadingRisks}
                value={formData.riskCode} 
                className="enhanced-dropdown-select"
                onChange={(e) => {
                  const selectedCode = e.target.value;
                  setSelectedDbRiskCode(selectedCode); 
                  const selected = dbRisks.find(r => r.riskCode === selectedCode);
                  if (selected) applySelectedRisk(selected);
                }}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                {loadingRisks ? <option>جاري تحميل مصفوفة المخاطر الرقمية...</option> : null}
                
                {technicalRisks.length > 0 && (
                  <optgroup label="⚙ ⁩ المخاطر الفنية" style={{ fontWeight: 'bold', color: '#1e40af', background: '#f8fafc' }}>
                    {technicalRisks.map((risk, idx) => (
                      <option key={`tech-${idx}`} value={risk.riskCode} style={{ background: '#e0f2fe', color: '#0369a1' }}>
                         [{risk.riskCode}] (خطر فني) - {risk.riskText}
                      </option>
                    ))}
                  </optgroup>
                )}

                {financialRisks.length > 0 && (
                  <optgroup label="❖ ⁩ المخاطر المالية" style={{ fontWeight: 'bold', color: '#166534', background: '#f8fafc' }}>
                    {financialRisks.map((risk, idx) => (
                      <option key={`fin-${idx}`} value={risk.riskCode} style={{ background: '#dcfce7', color: '#15803d' }}>
                        [{risk.riskCode}] (خطر مالي) - {risk.riskText}
                      </option>
                    ))}
                  </optgroup>
                )}

                {legalRisks.length > 0 && (
                  <optgroup label="⚖ ⁩ المخاطر القانونية" style={{ fontWeight: 'bold', color: '#6b21a8', background: '#f8fafc' }}>
                    {legalRisks.map((risk, idx) => (
                      <option key={`leg-${idx}`} value={risk.riskCode} style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                        [{risk.riskCode}] (خطر قانوني) - {risk.riskText}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}

          <div className="form-group">
            <label><FaKey className="input-field-icon" /> كود الخطر</label>
            <input 
              type="text" 
              value={formData.riskCode} 
              readOnly={inputType === 'database'} 
              className={inputType === 'database' ? 'bg-locked' : ''}
              onChange={(e) => handleInputChange('riskCode', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label><HiMiniArrowTrendingUp className="input-field-icon" /> طبيعة الخطر</label>
            {inputType === 'database' ? (
              <input type="text" value={formData.nature} readOnly className="bg-locked highlighted-text" />
            ) : (
              <select value={formData.nature} onChange={(e) => handleInputChange('nature', e.target.value)}>
                <option value="ثابت">ثابت</option>
                <option value="متغير">متغير</option>
              </select>
            )}
          </div>

          <div className="form-group">
            <label><FaClock className="input-field-icon" /> المرحلة الزمنية (time)</label>
            <select value={formData.time} onChange={(e) => handleInputChange('time', e.target.value)}>
              <option value="ما قبل التنفيذ">ما قبل التنفيذ</option>
              <option value="التنفيذ">التنفيذ</option>
              <option value="الاستلام والتشغيل">الاستلام والتشغيل</option>
            </select>
          </div>

          <div className="form-group">
            <label><FaScaleBalanced className="input-field-icon" /> المحور</label>
            {inputType === 'database' ? (
              <input type="text" value={formData.axis} readOnly className="bg-locked" />
            ) : (
              <select value={formData.axis} onChange={(e) => handleInputChange('axis', e.target.value)}>
                <option value="قانوني">قانوني</option>
                <option value="فني">فني</option>
                <option value="مالي">مالي</option>
              </select>
            )}
          </div>

          <div className="form-group rii-wrapper">
            <label><FaCircleExclamation className="input-field-icon" /> مؤشر RII</label>
            <div className={`rii-display ${inputType === 'manual' ? 'manual-enforced' : ''}`}>
              {Number(formData.riiValue).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="sliders-grid">
          <div className="range-card">
            <label className="range-label"><FaClock className="input-field-icon" /> الاحتمالية P (1-5)</label>
            <div className="range-buttons">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  className={`range-btn ${formData.probability === num ? 'active' : ''}`}
                  onClick={() => handleInputChange('probability', num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="range-card">
            <label className="range-label"><FaCircleExclamation className="input-field-icon" /> التأثير I (1-5)</label>
            <div className="range-buttons">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  className={`range-btn ${formData.impact === num ? 'active' : ''}`}
                  onClick={() => handleInputChange('impact', num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="form-group text-area-group">
            <label>
              <FaPenToSquare className="input-field-icon" /> وصف الخطر الحالي 
              {inputType === 'manual' && <span style={{ color: '#e53e3e', marginRight: '3px' }}>*</span>}
            </label>
            <textarea 
              value={formData.riskText} 
              readOnly={inputType === 'database'}
              className={inputType === 'database' ? 'bg-locked' : ''}
              onChange={(e) => handleInputChange('riskText', e.target.value)}
              placeholder={inputType === 'manual' ? "هذا الحقل مطلوب للاضافة اليدوية..." : "وصف الخطر..."}
            />
          </div>

          <div className="score-panel">
            <div className="score-header" >Risk Score</div>
            <div className="score-value">{riskScore}%</div>
            <div className={`score-badge ${riskLevel.colorClass}`}>
              {riskLevel.text}
            </div>
          </div>
<div className="score-panel">
  {/* الجزء الأول: صندوق المعادلة الرياضية الحيّة */}
  <div className="formula-box">
    
    <div className="formula-math">
      <span className="math-label">Score</span>
      <span className="math-op">=</span>
      <div className="math-fraction">
        <span className="fraction-top">
          {formData.probability}<small>(P)</small> × {formData.impact}<small>(I)</small>
        </span>
        <span className="fraction-bottom">25</span>
      </div>
      <span className="math-op">×</span>
      <span className="fraction-rii">
        {Number(formData.riiValue).toFixed(2)}% <small>(RII)</small>
      </span>
    </div>
  </div>

  {/* الجزء الثاني: بطاقة عرض النتيجة النهائية ومستوى الخطر */}

</div>
        </div>

        <div className="actions-wrapper">
          <button type="submit" className="btn-submit" disabled={submitting}>
            <FaFloppyDisk className="btn-icon" /> {submitting ? "جاري الحفظ..." : "حفظ الخطر"}
          </button>
          <button type="button" className="btn-cancel">
            <FaXmark className="btn-icon" /> إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default RiskAssessmentForm;