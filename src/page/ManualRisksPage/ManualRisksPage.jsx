import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import RightBar from '../../components/rightBar/rightBar';
import { GoLaw } from "react-icons/go";
import { MdAttachMoney } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { 
  IoBuildOutline, 
  IoCashOutline, 
  IoScaleOutline, 
  IoAlertCircleOutline, 
  IoCheckmarkCircleOutline, 
  IoTimeOutline,
  IoEllipsisHorizontalCircleOutline
} from "react-icons/io5";
import './ManualRisksPage.css';

function ManualRisksPage() {
  const { t, i18n } = useTranslation('ManualRisksPage'); 
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManualRisks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token'); 
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const response = await axios.get('https://ahmedpr5002-irs-hvtl.hf.space/dang/admin/manual-risks', config);
        
        if (response.data && response.data.success) {
          setRisks(response.data.risks); 
        } else {
          setError(t('manual_risks.errors.structure_fail'));
        }
      } catch (err) {
        setError(err.response?.data?.message || t('manual_risks.errors.fetch_fail'));
      } finally {
        setLoading(false);
      }
    };

    fetchManualRisks();
  }, [t]);

  // الألوان الصارمة للمحاور بالأيقونات وبدون إيموجي يدعم الترجمة
  const getAxisBadge = (axis) => {
    // التحقق من القيمة القادمة من السيرفر (سواء كانت عربية أو إنجليزية أو قيم مرجعية)
    const normalizedAxis = axis?.trim();

    if (normalizedAxis === 'فني' || normalizedAxis === 'Technical') {
      return <span className="axis-badge tech"><IoMdSettings /> {t('manual_risks.axes.technical')}</span>;
    }
    if (normalizedAxis === 'مالي' || normalizedAxis === 'Financial') {
      return <span className="axis-badge financial"><MdAttachMoney /> {t('manual_risks.axes.financial')}</span>;
    }
    if (normalizedAxis === 'قانوني' || normalizedAxis === 'Legal') {
      return <span className="axis-badge legal"><GoLaw /> {t('manual_risks.axes.legal')}</span>;
    }
    return <span className="axis-badge">{axis}</span>;
  };

  const getScoreBadge = (score) => {
    if (score >= 70) return <span className="score-badge high"><IoAlertCircleOutline /> {t('manual_risks.scores.high')} ({score}%)</span>;
    if (score >= 50) return <span className="score-badge medium"><IoAlertCircleOutline /> {t('manual_risks.scores.medium')} ({score}%)</span>;
    return <span className="score-badge low"><IoCheckmarkCircleOutline /> {t('manual_risks.scores.low')} ({score}%)</span>;
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.trim();
    if (normalizedStatus === 'مفتوحة' || normalizedStatus === 'Open') {
      return <span className="operational-status-tag open"><IoTimeOutline /> {t('manual_risks.status.open')}</span>;
    }
    // إذا كانت الحالة قادمة كترجمة أخرى من السيرفر، يتم عرضها أو ترجمة الـ Fallback
    return (
      <span className="operational-status-tag processed">
        <IoEllipsisHorizontalCircleOutline /> {normalizedStatus === 'Processed' || normalizedStatus === 'معالجة' ? t('manual_risks.status.processed') : status}
      </span>
    );
  };

  // تحديد الاتجاه الحالي للمكون
  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  if (loading) return <div className="loading-container">{t('manual_risks.loading')}</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="admin-dashboard-wrapper" dir={currentDir}>
      <RightBar/>
      <div className="table-header-section">
        <h3>{t('manual_risks.page_title')}</h3>
      </div>
      
      <div className="custom-table-responsive">
        <table className="hvl-irs-table">
          <thead>
            <tr>
              <th>{t('manual_risks.table.code')}</th>
              <th>{t('manual_risks.table.text')}</th>
              <th>{t('manual_risks.table.stage')}</th>
              <th>{t('manual_risks.table.axis')}</th>
              <th>{t('manual_risks.table.score')}</th>
              <th>{t('manual_risks.table.status')}</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => (
              <tr key={risk._id}>
                <td><span className="manual-code-badge">{risk.riskCode}</span></td>
                <td className="risk-text-cell">{risk.riskText}</td>
                <td className="stage-text-cell">{risk.time || risk.stage}</td>
                <td>{getAxisBadge(risk.axis)}</td>
                <td>{getScoreBadge(risk.riskScore)}</td>
                <td>{getStatusBadge(risk.operationalStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManualRisksPage;