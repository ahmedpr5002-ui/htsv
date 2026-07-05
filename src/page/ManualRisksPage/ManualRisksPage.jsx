import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
          setError("فشل في قراءة بنية البيانات");
        }
      } catch (err) {
        setError(err.response?.data?.message || "فشل جلب قائمة المخاطر");
      } finally {
        setLoading(false);
      }
    };

    fetchManualRisks();
  }, []);

  // الألوان الصارمة للمحاور بالأيقونات وبدون إيموجي
  const getAxisBadge = (axis) => {
    switch (axis) {
      case 'فني': 
        return <span className="axis-badge tech"><IoMdSettings /> فني</span>;
      case 'مالي': 
        return <span className="axis-badge financial"><MdAttachMoney /> مالي</span>;
      case 'قانوني': 
        return <span className="axis-badge legal"><GoLaw /> قانوني</span>;
      default: 
        return <span className="axis-badge">{axis}</span>;
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 70) return <span className="score-badge high"><IoAlertCircleOutline /> مرتفع ({score}%)</span>;
    if (score >= 50) return <span className="score-badge medium"><IoAlertCircleOutline /> متوسط ({score}%)</span>;
    return <span className="score-badge low"><IoCheckmarkCircleOutline /> منخفض ({score}%)</span>;
  };

  const getStatusBadge = (status) => {
    if (status === 'مفتوحة') {
      return <span className="operational-status-tag open"><IoTimeOutline /> مفتوحة</span>;
    }
    return <span className="operational-status-tag processed"><IoEllipsisHorizontalCircleOutline /> {status}</span>;
  };

  if (loading) return <div className="loading-container">جاري تحميل وترتيب المخاطر...</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="admin-dashboard-wrapper">
        <RightBar/>
      <div className="table-header-section">
        <h3>سجل المخاطر المركزي</h3>
      </div>
      
      <div className="custom-table-responsive">
        <table className="hvl-irs-table">
          <thead>
            <tr>
              <th>المعرف / الكود</th>
              <th>نص الخطر</th>
              <th>المرحلة</th>
              <th>المحور</th>
              <th>درجة الخطورة العامة</th>
              <th>الحالة التشغيلية</th>
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