import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import RightBar from '../../components/rightBar/rightBar';
import { 
  FaScaleBalanced, 
  FaCalendarDays,
  FaDollarSign,    
  FaShieldHalved,
  FaMagnifyingGlass,
  FaFilter,
  FaArrowLeft,
  FaLink,
  FaClock 
} from 'react-icons/fa6';
import { HiOutlineDocumentText } from "react-icons/hi2";
import './ViewActions.css'; 

const ViewActions = () => {
  const { t } = useTranslation('viewActions'); // تفعيل التابع وتحديد الـ Namespace
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const token = localStorage.getItem('token') || "";

  useEffect(() => {
    const fetchAllActions = async () => {
      try {
        const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/rmaction', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setActions(data);
        }
      } catch (error) {
        console.error('حدث خطأ في الاتصال بالخادم:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllActions();
  }, [token]);

  // دالة تحديد كلاس السطر
  const getActionRowClass = (category) => {
    if (!category) return '';
    const cat = category.toLowerCase();
    if (cat.includes('مالي')) return 'row-financial';
    if (cat.includes('قانوني') || cat.includes('القانوني')) return 'row-legal';
    if (cat.includes('فني')) return 'row-technical';
    if (cat.includes('تكامل') || cat.includes('تكاملي')) return 'row-integrative';
    return '';
  };

  // دالة تحديد كلاس لون كود الإجراء بناءً على المحور
  const getCodeColorClass = (category) => {
    if (!category) return '';
    const cat = category.toLowerCase();
    if (cat.includes('مالي')) return 'cell-financial';
    if (cat.includes('قانوني') || cat.includes('القانوني')) return 'cell-legal';
    if (cat.includes('فني')) return 'cell-technical';
    if (cat.includes('تكامل') || cat.includes('تكاملي')) return 'cell-integrative';
    return '';
  };

 
  const renderCategoryBadge = (category) => {
    if (!category) return <span className="badge-category-axis badge-assignee-default">{t('axis_unclassified')}</span>;
    
    if (category.includes('مالي')) {
      return <span className="badge-category-axis axis-financial-badge"><FaDollarSign /> {t('axis_financial')}</span>;
    }
    if (category.includes('قانوني') || category.includes('القانوني')) {
      return <span className="badge-category-axis axis-legal-badge"><FaScaleBalanced /> {t('axis_legal')}</span>;
    }
    if (category.includes('فني')) {
      return <span className="badge-category-axis axis-technical-badge"><FaShieldHalved /> {t('axis_technical')}</span>;
    }
    if (category.includes('تكامل') || category.includes('تكاملي')) {
      return <span className="badge-category-axis axis-integrative-badge"><FaLink /> {t('axis_integrative')}</span>;
    }
    return <span className="badge-category-axis badge-assignee-default">{category}</span>;
  };

  // دالة عرض بادج المرحلة (Phase)
  const renderPhaseBadge = (phase) => {
    if (!phase) return <span className="phase-badge phase-default">-</span>;
    return (
      <span className="phase-badge">
        <FaClock className="phase-icon" /> {phase}
      </span>
    );
  };

  const filteredActions = actions.filter(action => {
    const matchesSearch = 
      action.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.actionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action._id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || (action.category && action.category.includes(categoryFilter));

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <RightBar/>
      
      <div className="view-actions-layout-wrapper">
        <div className="risk-action-page-container framework-82-width">
          
          {/* بنر الهيدر العريض المدمج */}
          <div className="racon-blue-banner header-banner-flex">
            <div className="banner-text-side">
              <h2 className="banner-title">{t('banner_title')}</h2>
              <p className="banner-subtitle">{t('banner_subtitle')}</p>
            </div>
            <button type="button" className="btn-back-header" onClick={() => navigate(-1)}>
              {t('btn_back')}<FaArrowLeft /> 
            </button>
          </div>

          {/* شريط الفلترة والبحث السريع */}
          <div className="action-dropdown-selection-card filter-wrapper-layout">
            <div className="search-box-container">
              <label className="dropdown-main-label"><FaMagnifyingGlass /> {t('label_search')}</label>
              <div className="input-icon-wrapper">
                <FaMagnifyingGlass className="inner-icon" />
                <input 
                  type="text" 
                  placeholder={t('placeholder_search')} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-field"
                />
              </div>
            </div>

            <div className="filter-item">
              <label className="dropdown-main-label"><FaFilter /> {t('label_filter_axis')}</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select-control">
                <option value="all">{t('opt_all_axes')}</option>
                <option value="مالي">{t('opt_financial')}</option>
                <option value="قانوني">{t('opt_legal')}</option>
                <option value="فني">{t('opt_technical')}</option>
                <option value="تكامل">{t('opt_integrative')}</option>
              </select>
            </div>
          </div>

          {/* الجدول الرئيسي */}
          <div className="actions-list-main-card elevated-table-card">
            <div className="card-header-inline">
              <h3><HiOutlineDocumentText /> {t('table_main_title')}</h3>
              <span className="subtitle-hint">{t('total_actions_hint', { count: filteredActions.length })}</span>
            </div>

            <div className="table-responsive">
              <table className="custom-action-table image-style-table blueprint-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th style={{ width: '130px' }}>{t('th_action_code')}</th>
                    <th style={{ width: '110px' }}>{t('th_axis')}</th>
                    <th style={{ width: '120px' }}>{t('th_phase')}</th>
                    <th>{t('th_action_text')}</th>
                    <th style={{ width: '110px' }}>{t('th_rii')}</th>
                    <th style={{ width: '120px' }}>{t('th_created_at')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="text-center table-status-msg">{t('table_loading')}</td></tr>
                  ) : filteredActions.length === 0 ? (
                    <tr><td colSpan="7" className="text-center no-data-inside-table">{t('table_no_data')}</td></tr>
                  ) : filteredActions.map((action, index) => {
                    const rowClass = getActionRowClass(action.category);
                    const codeColorClass = getCodeColorClass(action.category);
                    const formattedDate = action.createdAt ? action.createdAt.split('T')[0] : '2026-06-15';

                    return (
                      <tr key={action._id || index} className={rowClass}>
                        <td className="index-cell-style">{index + 1}</td>
                        <td className={`code-cell-dynamic-styled ${codeColorClass}`}>
                          {action.code || `ACT-${index + 1}`}
                        </td>
                        <td>{renderCategoryBadge(action.category)}</td>
                        <td>{renderPhaseBadge(action.phase)}</td>
                        <td className="text-right action-text-bold-style">{action.actionText}</td>
                        <td className="rii-cell-styled">{action.riiPercentage ? action.riiPercentage.toFixed(2) : '85.30'}%</td>
                        <td>
                          <span className="badge-date-styled">
                            <FaCalendarDays className="calendar-icon-table" /> {formattedDate}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ViewActions;