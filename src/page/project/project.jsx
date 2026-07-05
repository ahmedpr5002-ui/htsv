import { 
  FolderPlus, FileText, Hash, Building2, 
  MapPin, Zap, Calendar, Flag, X, Save, Activity 
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; 
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './project.css';
import RightBar from '../../components/rightBar/rightBar';
import PageHeade from '../../components/navBar/PageHeade';

export default function ProjectForm() {
  const companiesList = [
    { id: 'NO', name: 'شمال', region: 'شمال' },
    { id: 'SO', name: 'جنوب', region: 'جنوب' },
    { id: 'MI', name: 'وسط', region: 'وسط' },
    { id: 'ME', name: 'فرات أوسط', region: 'فرات أوسط' }
  ];

  const governoratesByRegion = {
    'شمال': ['نينوى', 'كركوك', 'صلاح الدين'],
    'وسط': ['بغداد', 'ديالى', 'واسط', 'الأنبار'],
    'فرات أوسط': ['بابل', 'النجف', 'كربلاء', 'الديوانية'],
    'جنوب': ['البصرة', 'ذي قار', 'ميسان', 'المثنى']
  };

  const voltages = ['400 KV', '132 KV'];
  const stages = ['التخطيط واعداد المناقصة', 'قيد الإحالة', 'قيد التنفيذ', 'مكتمل'];

  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    company: '',
    governorate: '',
    voltage: '',
    referralDate: '',
    expectedCompletionDate: '',
    currentStage: '',
    commonline: '', // إضافة الحقل الجديد في الـ state
    notes: ''
  });
  const navigate = useNavigate();
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

    if (!formData.projectName) validationErrors.projectName = 'اسم المشروع مطلوب';
    if (!formData.company) validationErrors.company = 'يرجى اختيار الشركة المالكة';
    if (!formData.governorate) validationErrors.governorate = 'يرجى اختيار المحافظة';
    if (!formData.voltage) validationErrors.voltage = 'يرجى اختيار الجهد الكهربائي';
    if (!formData.referralDate) validationErrors.referralDate = 'تاريخ الإحالة مطلوب';
    if (!formData.expectedCompletionDate) validationErrors.expectedCompletionDate = 'تاريخ الإنجاز المتوقع مطلوب';
    if (!formData.currentStage) validationErrors.currentStage = 'يرجى تحديد المرحلة الحالية';
    if (!formData.commonline) validationErrors.commonline = 'حقل الخط المشترك مطلوب'; // نظام التحقق للحقل الجديد

    if (formData.referralDate && formData.expectedCompletionDate) {
      if (new Date(formData.expectedCompletionDate) <= new Date(formData.referralDate)) {
        validationErrors.expectedCompletionDate = 'يجب أن يكون تاريخ الإنجاز بعد تاريخ الإحالة';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('يرجى تصحيح الأخطاء في الحقول المطلوبة');
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
        toast.success('تم حفظ البيانات بنجاح.');
        setTimeout(() => {
          navigate('/dashb')
        }, 2000);
      } else {
        toast.error('حدث خطأ أثناء حفظ البيانات، يرجى المحاولة لاحقاً');
      }
    } catch (error) {
      console.error('فشل في إرسال الطلب:', error);
      toast.error('فشل في الاتصال بالسيرفر');
    }
  };

  return (
    <div className="app-layout">
      <ToastContainer position="top-left" autoClose={3000} rtl={true} />
      
      <RightBar />

      <div className="page-wrapper">
        <div className="main-content-area">
          <div className="form-container">
            <div className="form-header">
              <div className="header-icon-box">
                <FolderPlus size={22} />
              </div>
              <div>
                <h2>بيانات المشروع</h2>
                <p>يرجى إدخال المعلومات المطلوبة لإنشاء مشروع جديد في النظام</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                
                {/* اسم المشروع */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>اسم المشروع</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><FileText size={16} /></div>
                    <input 
                      type="text" 
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      placeholder="مثال: خط 400kV نينوى - الموصل" 
                      className="form-control"
                    />
                  </div>
                  {errors.projectName && <span className="error-message">{errors.projectName}</span>}
                </div>

                {/* رقم المشروع / الكود */}
                <div className="form-group">
                  <label className="label-wrapper">رقم المشروع / الكود</label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Hash size={16} /></div>
                    <input 
                      type="text" 
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleChange}
                      placeholder="يولد تلقائياً عند اختيار الشركة" 
                      className="form-control"
                    />
                  </div>
                  <span className="field-hint">يُولد تلقائياً ويقبل التعديل اليدوي</span>
                </div>

                {/* الشركة المالكة */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>الشركة المالكة</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Building2 size={16} /></div>
                    <select name="company" value={formData.company} onChange={handleChange} className="form-control">
                      <option value="">اختر الشركة</option>
                      {companiesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {errors.company && <span className="error-message">{errors.company}</span>}
                </div>

                {/* المحافظة */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>المحافظة</span>
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
                      <option value="">{formData.company ? "اختر المحافظة" : "يرجى اختيار الشركة أولاً"}</option>
                      {availableGovernorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                    </select>
                  </div>
                  {errors.governorate && <span className="error-message">{errors.governorate}</span>}
                </div>

                {/* الجهد الكهربائي */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>الجهد الكهربائي</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Zap size={16} /></div>
                    <select name="voltage" value={formData.voltage} onChange={handleChange} className="form-control">
                      <option value="">اختر الجهد الكهربائي</option>
                      {voltages.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  {errors.voltage && <span className="error-message">{errors.voltage}</span>}
                </div>

                {/* المرحلة الحالية */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>المرحلة الحالية</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Flag size={16} /></div>
                    <select name="currentStage" value={formData.currentStage} onChange={handleChange} className="form-control">
                      <option value="">اختر المرحلة الحالية</option>
                      {stages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {errors.currentStage && <span className="error-message">{errors.currentStage}</span>}
                </div>

                {/* تاريخ الإحالة */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>تاريخ الإحالة</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Calendar size={16} /></div>
                    <input type="date" name="referralDate" value={formData.referralDate} onChange={handleChange} className="form-control" />
                  </div>
                  {errors.referralDate && <span className="error-message">{errors.referralDate}</span>}
                </div>

                {/* تاريخ الإنجاز المتوقع */}
                <div className="form-group">
                  <label className="label-wrapper">
                    <span>تاريخ الإنجاز المتوقع</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Calendar size={16} /></div>
                    <input type="date" name="expectedCompletionDate" value={formData.expectedCompletionDate} onChange={handleChange} className="form-control" />
                  </div>
                  {errors.expectedCompletionDate && <span className="error-message">{errors.expectedCompletionDate}</span>}
                </div>

                
                <div className="form-group full-width">
                  <label className="label-wrapper">
                    <span>الخط</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon"><Activity size={16} /></div>
                    <input 
                      type="text" 
                      name="commonline"
                      value={formData.commonline}
                      onChange={handleChange}
                      placeholder="مثال: موصل-صلاح الدين" 
                      className="form-control"
                    />
                  </div>
                  {errors.commonline && <span className="error-message">{errors.commonline}</span>}
                </div>

                {/* ملاحظات عامة */}
                <div className="form-group full-width">
                  <div className="label-wrapper" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <span>ملاحظات عامة (اختياري)</span>
                    <span className="char-counter">{formData.notes.length} / 500</span>
                  </div>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    maxLength="500"
                    placeholder="اكتب أي معلومات إضافية عن تفاصيل المشروع هنا..." 
                    className="form-control"
                    rows="2" // تم تقليصه لضمان عدم حدوث سكرول نهائياً
                  ></textarea>
                </div>

              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-submit">
                  <Save size={16} /> حفظ بيانات المشروع
                </button>
                <button type="button" className="btn btn-cancel" onClick={() => window.location.reload()}>
                  <X size={16} /> إلغاء التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}