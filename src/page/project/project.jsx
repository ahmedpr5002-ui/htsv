import { 
  FolderPlus, FileText, Hash, Building2, 
  MapPin, Zap, Calendar, Flag, X, Save, Activity 
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; 
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './project.css';
import RightBar from '../../components/rightBar/rightBar';
import PageHeade from '../../components/navBar/PageHeade';

export default function ProjectForm() {
  const { t, i18n } = useTranslation('projectForm'); // الالتزام باسم ملف الترجمة projectForm.json
  const navigate = useNavigate();

  const companiesList = [
    { id: 'NO', name: t('companies.NO'), region: 'شمال' },
    { id: 'SO', name: t('companies.SO'), region: 'جنوب' },
    { id: 'MI', name: t('companies.MI'), region: 'وسط' },
    { id: 'ME', name: t('companies.ME'), region: 'فرات أوسط' }
  ];

  const governoratesByRegion = {
    'شمال': [t('governorates.nineveh'), t('governorates.kirkuk'), t('governorates.saladin')],
    'وسط': [t('governorates.baghdad'), t('governorates.diyala'), t('governorates.wasit'), t('governorates.anbar')],
    'فرات أوسط': [t('governorates.babylon'), t('governorates.najaf'), t('governorates.karbala'), t('governorates.diwaniyah')],
    'جنوب': [t('governorates.basra'), t('governorates.dhi_qar'), t('governorates.maysan'), t('governorates.muthanna')]
  };

  const voltages = ['400 KV', '132 KV'];
  const stages = [
    t('stages.planning'),
    t('stages.referral_pending'),
    t('stages.under_execution'),
    t('stages.completed')
  ];

  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    company: '',
    governorate: '',
    voltage: '',
    referralDate: '',
    expectedCompletionDate: '',
    currentStage: '',
    commonline: '', 
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [availableGovernorates, setAvailableGovernorates] = useState([]);

  // توليد كود المشروع تلقائياً وتصفية المحافظات حسب الشركة المختارة
  useEffect(() => {
    if (formData.company) {
      const selectedCompany = companiesList.find(c => c.id === formData.company);
      if (selectedCompany) {
        setAvailableGovernorates(governoratesByRegion[selectedCompany.region] || []);
      }

      const currentYear = new Date().getFullYear();
      const randomSequence = Math.floor(100 + Math.random() * 900); 
      setFormData(prev => ({ 
        ...prev, 
        projectId: `${formData.company}-${currentYear}-N${randomSequence}` 
      }));
    } else {
      setFormData(prev => ({ ...prev, projectId: '', governorate: '' }));
      setAvailableGovernorates([]);
    }
  }, [formData.company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    if (!formData.projectName) validationErrors.projectName = t('validation.projectName');
    if (!formData.company) validationErrors.company = t('validation.company');
    if (!formData.governorate) validationErrors.governorate = t('validation.governorate');
    if (!formData.voltage) validationErrors.voltage = t('validation.voltage');
    if (!formData.referralDate) validationErrors.referralDate = t('validation.referralDate');
    if (!formData.expectedCompletionDate) validationErrors.expectedCompletionDate = t('validation.expectedCompletionDate');
    if (!formData.currentStage) validationErrors.currentStage = t('validation.currentStage');
    if (!formData.commonline) validationErrors.commonline = t('validation.commonline'); 

    if (formData.referralDate && formData.expectedCompletionDate) {
      if (new Date(formData.expectedCompletionDate) <= new Date(formData.referralDate)) {
        validationErrors.expectedCompletionDate = t('validation.dateOrder');
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error(t('notifications.form_error'));
      return;
    }

    const TOKEN = localStorage.getItem('token');

    try {
      const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/user/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(t('notifications.save_success'));
        setTimeout(() => {
          navigate('/dashb');
        }, 2000);
      } else {
        toast.error(t('notifications.save_error'));
      }
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast.error(t('notifications.server_error'));
    }
  };

  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="app-layout" dir={currentDir}>
      <ToastContainer position="top-left" autoClose={3000} rtl={i18n.language === 'ar'} />
      
      <RightBar />

      <div className="page-wrapper">
        <div className="main-content-area">
          <div className="form-container">
            <div className="form-header">
              <div className="header-icon-box">
                <FolderPlus size={22} />
              </div>
              <div>
                <h2>{t('header.title')}</h2>
                <p>{t('header.subtitle')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                
                {/* اسم المشروع */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>{t('labels.projectName')}</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><FileText size={16} /></div>
                    <input 
                      type="text" 
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      placeholder={t('placeholders.projectName')} 
                      className="form-control"
                    />
                  </div>
                  {errors.projectName && <span className="error-message">{errors.projectName}</span>}
                </div>

                {/* رقم المشروع / الكود */}
                <div className="form-group">
                  <label className="label-wrapper">{t('labels.projectId')}</label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Hash size={16} /></div>
                    <input 
                      type="text" 
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleChange}
                      placeholder={t('placeholders.projectId')} 
                      className="form-control"
                    />
                  </div>
                  <span className="field-hint">{t('hints.projectId')}</span>
                </div>

                {/* الشركة المالكة */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>{t('labels.company')}</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Building2 size={16} /></div>
                    <select name="company" value={formData.company} onChange={handleChange} className="form-control">
                      <option value="">{t('placeholders.select_company')}</option>
                      {companiesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {errors.company && <span className="error-message">{errors.company}</span>}
                </div>

                {/* المحافظة */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>{t('labels.governorate')}</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><MapPin size={16} /></div>
                    <select 
                      name="governorate" 
                      value={formData.governorate} 
                      onChange={handleChange} 
                      className="form-control"
                      disabled={!formData.company}
                    >
                      <option value="">{formData.company ? t('placeholders.select_governorate') : t('placeholders.awaiting_company')}</option>
                      {availableGovernorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                    </select>
                  </div>
                  {errors.governorate && <span className="error-message">{errors.governorate}</span>}
                </div>

                {/* الجهد الكهربائي */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>{t('labels.voltage')}</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Zap size={16} /></div>
                    <select name="voltage" value={formData.voltage} onChange={handleChange} className="form-control">
                      <option value="">{t('placeholders.select_voltage')}</option>
                      {voltages.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  {errors.voltage && <span className="error-message">{errors.voltage}</span>}
                </div>

                {/* المرحلة الحالية */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>{t('labels.currentStage')}</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Flag size={16} /></div>
                    <select name="currentStage" value={formData.currentStage} onChange={handleChange} className="form-control">
                      <option value="">{t('placeholders.select_stage')}</option>
                      {stages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {errors.currentStage && <span className="error-message">{errors.currentStage}</span>}
                </div>

                {/* تاريخ الإحالة */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>{t('labels.referralDate')}</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Calendar size={16} /></div>
                    <input type="date" name="referralDate" value={formData.referralDate} 
                   
                    onChange={handleChange} className="form-control form-control hide-date-icon" />
                  </div>
                  {errors.referralDate && <span className="error-message">{errors.referralDate}</span>}
                </div>

                {/* تاريخ الإنجاز المتوقع */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>{t('labels.expectedCompletionDate')}</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Calendar size={16} /></div>
                    <input type="date" name="expectedCompletionDate" value={formData.expectedCompletionDate} onChange={handleChange} className="form-control form-control hide-date-icon" />
                  </div>
                  {errors.expectedCompletionDate && <span className="error-message">{errors.expectedCompletionDate}</span>}
                </div>

                {/* الخط المشترك */}
                <div className="form-group full-width">
                  <label className="label-wrapper">
                    <span>{t('labels.commonline')}</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Activity size={16} /></div>
                    <input 
                      type="text" 
                      name="commonline"
                      value={formData.commonline}
                      onChange={handleChange}
                      placeholder={t('placeholders.commonline')} 
                      className="form-control"
                    />
                  </div>
                  {errors.commonline && <span className="error-message">{errors.commonline}</span>}
                </div>

                {/* ملاحظات عامة */}
                <div className="form-group full-width">
                  <div className="label-wrapper" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <span>{t('labels.notes')}</span>
                    <span className="char-counter">{formData.notes.length} / 500</span>
                  </div>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    maxLength="500"
                    placeholder={t('placeholders.notes')} 
                    className="form-control"
                    rows="2"
                  ></textarea>
                </div>

              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-submit">
                  <Save size={16} /> {t('buttons.save')}
                </button>
                <button type="button" className="btn btn-cancel" onClick={() => window.location.reload()}>
                  <X size={16} /> {t('buttons.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}