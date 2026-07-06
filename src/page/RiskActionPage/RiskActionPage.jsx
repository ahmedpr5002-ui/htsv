import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import './RiskActionPage.css';
import RightBar from '../../components/rightBar/rightBar';
import { GoLaw } from "react-icons/go";
import { MdAttachMoney } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { 
  FaTriangleExclamation,
  FaXmark,
  FaArrowUp91
} from "react-icons/fa6";

export default function RiskActionPage() {
  const { t, i18n } = useTranslation('RiskActionPage'); 
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
        if (!res.ok) throw new Error(t('messages.fetch_error'));
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
  }, [t]);

  // تجميع الإجراءات وتخزين كائن الـ actionId
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
          groups[rCode].actions.push({
            code: item.actionId.code,
            category: item.actionId.category || t('labels.not_specified'),
            phase: item.actionId.phase || t('labels.not_specified'),
            actionText: item.actionId.actionText || t('labels.no_desc'),
            Proposedofficial: item.actionId.Proposedofficial || t('labels.not_specified'),
            riiPercentage: item.actionId.riiPercentage || 0
          });
        }
      }
    });
    return Object.values(groups);
  }, [data, t]);

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

  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  // شاشة التحميل
  if (loading) {
    return (
      <div className="racon-layout-wrapper" dir={currentDir}>
        <div className="racon-main-content state-wrapper" style={{ width: '100%' }}>
          <div className="racon-spinner"></div>
          <p className="state-text">{t('messages.loading')}</p>
        </div>
      </div>
    );
  }

  // شاشة الخطأ
  if (error) {
    return (
      <div className="racon-layout-wrapper" dir={currentDir}>
        <RightBar />
        <div className="racon-main-content state-wrapper" style={{ width: '82%' }}>
          <div className="error-animated-card">
            <div className="error-icon-wrapper">
              <FaTriangleExclamation size={48} color="#ef4444" />
            </div>
            <h2 className="error-title">{t('messages.conn_failed')}</h2>
            <p className="error-message">{t('messages.api_problem')}</p>
            <div className="error-details-box">
              <strong>{t('labels.tech_details')}:</strong> {error}
            </div>
            <button className="error-retry-btn" onClick={() => window.location.reload()}>
              {t('buttons.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="racon-layout-wrapper" dir={currentDir}>
      <RightBar />
      
      {/* تخصيص مساحة المحتوى الأساسية بنسبة 82% لتتوافق مع القائمة الجانبية 18% */}
      <div className="racon-main-content" style={{ width: '82%' }}>
        
        {/* بنر الهيدر الأزرق المودرن */}
        <div className="racon-blue-banner" style={{ marginBottom: '1%' }}>
          <h1 className="banner-title">{t('page.title')}</h1>
          <p className="banner-subtitle">{t('page.subtitle')}</p>
        </div>

        {/* لوحة الفلاتر والجدول السفلي المدمج */}
        <div className="filter-dashboard-card">
          <div className="filter-row-top">
            
            {/* صندوق البحث الذكي */}
            <div className="filter-item search-box-width">
              <label>{t('filters.search_label')}</label>
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder={t('filters.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="search-icon" style={{ direction: "ltr" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
              </div>
            </div>

            {/* أزرار فرز المحاور التفاعلية بالأيقونات الوظيفية القياسية */}
            <div className="filter-item flex-grow-1">
              <label>{t('filters.axis_label')}</label>
              <div className="axis-badge-group">
                <button className={`axis-btn axis-btn-all ${activeAxis === 'الكل' ? 'active' : ''}`} onClick={() => setActiveAxis('الكل')}>
                  <span className="count-badge">{groupedRisks.length}</span> {t('axes.all')}
                </button>
                <button className={`axis-btn axis-btn-legal ${activeAxis === 'قانوني' ? 'active' : ''}`} onClick={() => setActiveAxis('قانوني')}>
                  <GoLaw className="btn-icon" /> {t('axes.legal')}
                </button>
                <button className={`axis-btn axis-btn-financial ${activeAxis === 'مالي' ? 'active' : ''}`} onClick={() => setActiveAxis('مالي')}>
                  <MdAttachMoney className="btn-icon" /> {t('axes.financial')}
                </button>
                <button className={`axis-btn axis-btn-technical ${activeAxis === 'فني' ? 'active' : ''}`} onClick={() => setActiveAxis('فني')}>
                  <IoMdSettings className="btn-icon" /> {t('axes.technical')}
                </button>
              </div>
            </div>

            {/* فرز الطبيعة */}
            <div className="filter-item select-box-width">
              <label>{t('filters.nature_label')}</label>
              <select className="racon-select" value={natureFilter} onChange={(e) => setNatureFilter(e.target.value)}>
                <option value="الكل">{t('natures.all')}</option>
                <option value="ثابت">{t('natures.fixed')}</option>
                <option value="متغير">{t('natures.variable')}</option>
              </select>
            </div>

            {/* مدى الـ RII */}
            <div className="filter-item slider-box-width">
              <div className="slider-label-row">
                <label>{t('filters.priority_label')}</label>
                <span className="slider-hint">{t('filters.greater_than')} {riiRange}%</span>
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
            <div className="total-count">{t('table.matched_count')}: <span className="highlight">{filteredRisks.length}</span></div>
            <div className="sort-wrapper">
              <label>{t('table.sorting')}</label>
              <select className="racon-mini-select" disabled>
                <option>{t('table.rii_desc')}</option>
              </select>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="racon-table">
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>{t('table.th_code')}</th>
                  <th style={{ width: '42%' }}>{t('table.th_text')}</th>
                  <th style={{ width: '12%' }}>{t('table.th_axis')}</th>
                  <th style={{ width: '12%' }}>{t('table.th_nature')}</th>
                  <th style={{ width: '12%' }}>{t('table.th_stage')}</th>
                  <th style={{ width: '10%' }}>{t('table.th_rii')}</th>
                  <th style={{ width: '14%' }}>{t('table.th_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((risk) => (
                  <tr key={risk._id}>
                    <td className="risk-code-cell">{risk.riskCode}</td>
                    <td className="risk-text-cell">{risk.riskText}</td>
                    <td>
                      <span className={`axis-tag axis-${risk.axis}`}>
                        {risk.axis === 'قانوني' ? t('axes.legal') : risk.axis === 'مالي' ? t('axes.financial') : risk.axis === 'فني' ? t('axes.technical') : risk.axis}
                      </span>
                    </td>
                    <td>
                      <span className={`nature-tag ${risk.nature === 'ثابت' ? 'fixed' : 'variable'}`}>
                        {risk.nature === 'ثابت' ? t('natures.fixed_lbl') : t('natures.variable_lbl')}
                      </span>
                    </td>
                    <td>
                      <span className="stage-tag">{risk.stage || t('labels.execution')}</span>
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
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={i18n.language === 'ar' ? { marginRight: '4px' } : { marginLeft: '4px' }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRisks.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      {t('table.no_data')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* النافذة المنبثقة */}
        {isModalOpen && selectedAction && (
          <div className="racon-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="racon-modal-card action-popup-animate" onClick={(e) => e.stopPropagation()}>
              <header className="racon-modal-header">
                <div className="racon-modal-title-group">
                  <h3>{t('modal.title')}</h3>
                  <span className="racon-modal-subtitle">{t('modal.id_label')}: {selectedAction.code}</span>
                </div>
                <button className="racon-modal-close-btn" onClick={() => setIsModalOpen(false)}>
                  <FaXmark />
                </button>
              </header>
              
              <div className="racon-modal-body">
                <div className="racon-modal-grid-details">
                  <div className="detail-item-box">
                    <span className="racon-modal-label">{t('modal.category_lbl')}:</span>
                    <span className="racon-modal-text-value category-highlight">{selectedAction.category}</span>
                  </div>
                  <div className="detail-item-box">
                    <span className="racon-modal-label">{t('modal.phase_lbl')}:</span>
                    <span className="racon-modal-text-value">{selectedAction.phase}</span>
                  </div>
                  <div className="detail-item-box">
                    <span className="racon-modal-label">{t('modal.value_lbl')}:</span>
                    <span className="racon-modal-text-value rii-highlight">{selectedAction.riiPercentage}%</span>
                  </div>
                </div>

                <div className="racon-modal-block" style={{ marginTop: '8px' }}>
                  <span className="racon-modal-label">{t('modal.content_lbl')}:</span>
                  <p className="racon-modal-text-content">{selectedAction.actionText}</p>
                </div>
              </div>
              
              <footer className="racon-modal-footer">
                <button className="racon-modal-btn-close" onClick={() => setIsModalOpen(false)}>{t('buttons.close')}</button>
              </footer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}