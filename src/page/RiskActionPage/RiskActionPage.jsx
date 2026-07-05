import React, { useState, useEffect, useMemo } from 'react';
import './RiskActionPage.css';
import RightBar from '../../components/rightBar/rightBar';
import { GoLaw } from "react-icons/go";
import { MdAttachMoney } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { 
  FaTriangleExclamation,
  FaXmark
} from "react-icons/fa6";

export default function RiskActionPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAxis, setActiveAxis] = useState('الكل');
  const [natureFilter, setNatureFilter] = useState('الكل');
  const [riiRange, setRiiRange] = useState(50);

  // حالات التحكم بالنافذة المنبثقة للإجراء
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  // جلب البيانات من الـ API
  useEffect(() => {
    fetch('https://ahmedpr5002-irs-hvtl.hf.space/racon')
      .then((res) => {
        if (!res.ok) throw new Error('فشل في جلب البيانات من الخادم');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // تجميع الإجراءات وتخزين كائن الـ actionId بالاعتماد الكامل على حقول الـ Schema الخاصة بك
  const groupedRisks = useMemo(() => {
    const groups = {};
    data.forEach(item => {
      if (!item.riskId) return;
      const rCode = item.riskId.riskCode;
      if (!groups[rCode]) {
        groups[rCode] = {
          ...item.riskId,
          actions: []
        };
      }
      if (item.actionId) {
        const isExist = groups[rCode].actions.some(act => act.code === item.actionId.code);
        if (!isExist) {
          // هنا يتم ربط الحقول بدقة طبقاً للـ Schema المرسلة من السيرفر
          groups[rCode].actions.push({
            code: item.actionId.code,
            category: item.actionId.category || 'غير محدد',
            phase: item.actionId.phase || 'غير محدد',
            actionText: item.actionId.actionText || 'لا يوجد نص وصفي متوفر للإجراء',
            Proposedofficial: item.actionId.Proposedofficial || 'غير محدد',
            riiPercentage: item.actionId.riiPercentage || 0
          });
        }
      }
    });
    return Object.values(groups);
  }, [data]);

  // تصفية وفلترة البيانات
  const filteredRisks = useMemo(() => {
    return groupedRisks.filter(risk => {
      const matchesSearch = (risk.riskText || '').includes(searchQuery) || (risk.riskCode || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAxis = activeAxis === 'الكل' || risk.axis === activeAxis;
      const matchesNature = natureFilter === 'الكل' || risk.nature === natureFilter;
      const matchesRii = (risk.riiValue || 0) >= riiRange;
      return matchesSearch && matchesAxis && matchesNature && matchesRii;
    });
  }, [groupedRisks, searchQuery, activeAxis, natureFilter, riiRange]);

  // شاشة التحميل
  if (loading) {
    return (
      <div className="racon-layout-wrapper">
        <div className="racon-main-content state-wrapper">
          <div className="racon-spinner"></div>
          <p className="state-text">جاري تحميل مصفوفة المخاطر والإجراءات...</p>
        </div>
      </div>
    );
  }

  // شاشة الخطأ
  if (error) {
    return (
      <div className="racon-layout-wrapper">
        <RightBar />
        <div className="racon-main-content state-wrapper">
          <div className="error-animated-card">
            <div className="error-icon-wrapper">
              <FaTriangleExclamation size={48} color="#ef4444" />
            </div>
            <h2 className="error-title">عذراً، تعذر الاتصال بالخادم</h2>
            <p className="error-message">لم نتمكن من جلب مصفوفة المخاطر نظراً لوجود مشكلة في الـ API الخاص بالنظام.</p>
            <div className="error-details-box">
              <strong>تفاصيل الخطأ الفني:</strong> {error}
            </div>
            <button className="error-retry-btn" onClick={() => window.location.reload()}>
              إعادة المحاولة الآن
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="racon-layout-wrapper">
      <RightBar />
      
      <div className="racon-main-content">
        
        {/* بنر الهيدر الأزرق المودرن */}
        <div className="racon-blue-banner" style={{marginBottom:'1%'}}>
          <h1 className="banner-title">قاعدة المخاطر الثابته</h1>
          <p className="banner-subtitle">قاعدة المخاطر المستخرجة من البيانات والدراسة</p>
        </div>

        {/* لوحة الفلاتر والجدول السفلي المدمج */}
        <div className="filter-dashboard-card">
          <div className="filter-row-top">
            
            {/* صندوق البحث الذكي */}
            <div className="filter-item search-box-width">
              <label>البحث الذكي</label>
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="ابحث بكود الخطر أو نص الخطر..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="search-icon" style={{direction:"ltr"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
              </div>
            </div>

            {/* أزرار فرز المحاور التفاعلية */}
            <div className="filter-item flex-grow-1">
              <label>المحور المستهدف</label>
              <div className="axis-badge-group">
                <button className={`axis-btn axis-btn-all ${activeAxis === 'الكل' ? 'active' : ''}`} onClick={() => setActiveAxis('الكل')}>
                  <span className="count-badge">{groupedRisks.length}</span> الكل
                </button>
                <button className={`axis-btn axis-btn-legal ${activeAxis === 'قانوني' ? 'active' : ''}`} onClick={() => setActiveAxis('قانوني')}>
                  <GoLaw className="btn-icon" /> قانوني
                </button>
                <button className={`axis-btn axis-btn-financial ${activeAxis === 'مالي' ? 'active' : ''}`} onClick={() => setActiveAxis('مالي')}>
                  <MdAttachMoney className="btn-icon" /> مالي
                </button>
                <button className={`axis-btn axis-btn-technical ${activeAxis === 'فني' ? 'active' : ''}`} onClick={() => setActiveAxis('فني')}>
                  <IoMdSettings className="btn-icon" /> الفني
                </button>
              </div>
            </div>

            {/* فرز الطبيعة */}
            <div className="filter-item select-box-width">
              <label>طبيعة الخطر</label>
              <select className="racon-select" value={natureFilter} onChange={(e) => setNatureFilter(e.target.value)}>
                <option value="الكل">الكل</option>
                <option value="ثابت">ثابت (هيكلي)</option>
                <option value="متغير">متغير (إجرائي)</option>
              </select>
            </div>

            {/* مدى الـ RII */}
            <div className="filter-item slider-box-width">
              <div className="slider-label-row">
                <label>الأولوية (% RII)</label>
                <span className="slider-hint">أكبر من {riiRange}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="100" 
                value={riiRange} 
                onChange={(e) => setRiiRange(Number(e.target.value))}
                className="racon-slider"
              />
              <div className="slider-footer-labels">
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

          </div>
        </div>

        {/* لوحة عرض جدول مصفوفة الحوكمة */}
        <div className="table-dashboard-card">
          <div className="table-header-meta">
            <div className="total-count">المخاطر المطابقة للفلاتر: <span className="highlight">{filteredRisks.length}</span></div>
            <div className="sort-wrapper">
              <label>ترتيب تلقائي</label>
              <select className="racon-mini-select">
                <option>% RII تنازلي</option>
              </select>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="racon-table">
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>كود الخطر</th>
                  <th style={{ width: '42%' }}>نص الخطر المتوقع</th>
                  <th style={{ width: '12%' }}>المحور</th>
                  <th style={{ width: '12%' }}>الطبيعة</th>
                  <th style={{ width: '12%' }}>المرحلة الزمنية</th>
                  <th style={{ width: '10%' }}>قيمة RII</th>
                  <th style={{ width: '14%' }}>أكواد الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((risk) => (
                  <tr key={risk._id}>
                    <td className="risk-code-cell">{risk.riskCode}</td>
                    <td className="risk-text-cell">{risk.riskText}</td>
                    <td>
                      <span className={`axis-tag axis-${risk.axis}`}>
                        {risk.axis}
                      </span>
                    </td>
                    <td>
                      <span className={`nature-tag ${risk.nature === 'ثابت' ? 'fixed' : 'variable'}`}>
                        {risk.nature === 'ثابت' ? 'هيكلي' : 'إجرائي'}
                      </span>
                    </td>
                    <td>
                      <span className="stage-tag">{risk.stage || 'التنفيذ'}</span>
                    </td>
                    <td className="rii-value-cell">{risk.riiValue}%</td>
                    <td>
                      <div className="actions-flex-container">
                        {risk.actions && risk.actions.map((act, idx) => (
                          <span 
                            key={idx} 
                            className="action-code-badge clickable-badge"
                            onClick={() => {
                              setSelectedAction(act);
                              setIsModalOpen(true);
                            }}
                          >
                            {act.code}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRisks.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      لا توجد مخاطر مطابقة لخيارات الفلترة الحالية.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* النافذة المنبثقة المرتبطة بـ حقول الـ Schema الأصلية مباشرة */}
        {isModalOpen && selectedAction && (
          <div className="racon-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="racon-modal-card action-popup-animate" onClick={(e) => e.stopPropagation()}>
              <header className="racon-modal-header">
                <div className="racon-modal-title-group">
                  <h3>تفاصيل الإجراء</h3>
                  <span className="racon-modal-subtitle">المعرف الرقمي للإجراء: {selectedAction.code}</span>
                </div>
                <button className="racon-modal-close-btn" onClick={() => setIsModalOpen(false)}>
                  <FaXmark />
                </button>
              </header>
              
              <div className="racon-modal-body">
                <div className="racon-modal-grid-details">
                  <div className="detail-item-box">
                    <span className="racon-modal-label">تصنيف الإجراء:</span>
                    <span className="racon-modal-text-value category-highlight">{selectedAction.category}</span>
                  </div>
                  <div className="detail-item-box">
                    <span className="racon-modal-label">المرحلة:</span>
                    <span className="racon-modal-text-value">{selectedAction.phase}</span>
                  </div>
                 
                  <div className="detail-item-box">
                    <span className="racon-modal-label">القيمة الرقمية:</span>
                    <span className="racon-modal-text-value rii-highlight">{selectedAction.riiPercentage}%</span>
                  </div>
                </div>

                <div className="racon-modal-block" style={{ marginTop: '8px' }}>
                  <span className="racon-modal-label">نص ومضمون الإجراء:</span>
                  <p className="racon-modal-text-content">{selectedAction.actionText}</p>
                </div>
              </div>
              
              <footer className="racon-modal-footer">
                <button className="racon-modal-btn-close" onClick={() => setIsModalOpen(false)}>إغلاق النافذة</button>
              </footer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}