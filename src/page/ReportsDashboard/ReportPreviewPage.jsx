import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import { FaTable } from "react-icons/fa6";
import './ReportsDashboard.css'; 
import RightBar from '../../components/rightBar/rightBar';

const ReportPreviewPage = () => {
  const { t, i18n } = useTranslation('reports'); // الالتزام بملف الترجمة reports.json
  const location = useLocation();
  const navigate = useNavigate();
  const { reportType, projectId } = location.state || { reportType: 'risk_register', projectId: 'all' };

  const [processedReportData, setProcessedReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://ahmedpr5002-irs-hvtl.hf.space/dang', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const risksList = Array.isArray(data) ? data : (data.risks || []);
        
        let filtered = [...risksList];
        if (projectId !== 'all') {
          filtered = filtered.filter(risk => {
            const pId = risk.projectId?._id || risk.projectId;
            return pId === projectId;
          });
        }

        let resultData = [];

        if (reportType === 'project_comparison') {
          const groups = {};
          filtered.forEach(r => {
            const txt = r.riskText || t('labels.no_data');
            if (!groups[txt]) {
              groups[txt] = {
                riskCode: r.riskCode || t('labels.undefined'),
                riskText: txt,
                type: r.type || "ثابت", // أو اعتمد على مفاتيح ديناميكية إن لزم
                axis: r.axis || "فني",
                count: 0,
                totalScore: 0
              };
            }
            groups[txt].count += 1;
            groups[txt].totalScore += (r.riskScore || 0);
          });

          const sortedGroups = Object.values(groups).sort((a, b) => b.count - a.count);

          resultData = sortedGroups.slice(0, 10).map(g => ({
            col1: g.riskCode, 
            col2: g.riskText,
            col3: g.type,
            col4: g.axis,
            col5: `${g.count} ${t('labels.selection_times')}`, // استخدام صياغة مرنة للترجمة
            col6: `${(g.totalScore / g.count).toFixed(2)}%`
          }));

        } else {
          switch (reportType) {
            case 'overdue_actions':
              resultData = filtered.filter(r => r.operationalStatus === 'مفتوحة').map(r => ({
                col1: r.riskCode || t('labels.undefined'),
                col2: r.riskText || t('labels.no_risk_desc'),
                col3: r.actionIds && r.actionIds.length > 0 ? r.actionIds.map(act => act.actionId?.code || 'ACT').join(', ') : '—',
                col4: r.riskOwner || t('labels.project_manager'),
                col5: r.axis || "فني",
                col6: `${r.riskScore || 0}%`
              }));
              break;

            case 'lessons_learned':
              resultData = filtered.filter(r => r.riskNotes).map(r => ({
                col1: r.riskCode || t('labels.undefined'),
                col2: r.riskText || t('labels.no_risk_desc'),
                col3: r.actionIds && r.actionIds.length > 0 ? r.actionIds.map(act => act.actionId?.code || 'ACT').join(', ') : '—',
                col4: r.riskNotes || "—",
                col5: r.axis || "فني",
                col6: `${r.riskScore || 0}%`
              }));
              break;

            case 'risk_register':
            default:
              resultData = filtered.map(r => ({
                col1: r.riskCode || t('labels.undefined'),
                col2: r.riskText || t('labels.no_data'),
                col3: r.time || r.stage || t('labels.general'),
                col4: r.axis || "فني",
                col5: `${r.riiPercentage || 0}%`,
                col6: `${r.riskScore || 0}%`
              }));
              break;
          }
        }

        setProcessedReportData(resultData);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, projectId]);

  const getReportName = (type) => {
    switch(type) {
      case 'overdue_actions': return t('reportNames.overdue_actions');
      case 'lessons_learned': return t('reportNames.lessons_learned');
      case 'risk_register': return t('reportNames.risk_register');
      case 'project_comparison': return t('reportNames.project_comparison');
      default: return t('reportNames.default_preview');
    }
  };

  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="reports-dashboard-content" dir={currentDir}>
      <RightBar/>
      <div className="live-preview-section standalone-preview">
        <div className="preview-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaTable /> 
            <span>{getReportName(reportType)}</span>
          </div>
          <button className="btn-preview-outline" onClick={() => navigate(-1)} style={{ flex: 'none', padding: '6px 12px' }}>
              {t('buttons.back_to_reports')}
          </button>
        </div>

        <div className="preview-data-container" style={{ maxHeight: 'none', minHeight: '400px' }}>
          {loading ? (
            <div className="preview-state-msg">{t('messages.loading')}</div>
          ) : processedReportData.length === 0 ? (
            <div className="preview-state-msg">{t('messages.no_data_found')}</div>
          ) : (
            <table className="live-preview-table">
              <thead>
                {reportType === 'overdue_actions' && (
                  <tr>
                    <th style={{ width: '120px' }}>{t('headers.risk_code')}</th>
                    <th>{t('headers.risk_description')}</th>
                    <th style={{ width: '180px' }}>{t('headers.action_codes')}</th>
                    <th style={{ width: '220px' }}>{t('headers.suggested_owner')}</th>
                    <th style={{ width: '100px' }}>{t('headers.axis')}</th>
                    <th style={{ width: '100px' }}>{t('headers.risk_score')}</th>
                  </tr>
                )}
                {reportType === 'lessons_learned' && (
                  <tr>
                    <th style={{ width: '120px' }}>{t('headers.risk_code')}</th>
                    <th>{t('headers.risk_text')}</th>
                    <th style={{ width: '180px' }}>{t('headers.linked_actions')}</th>
                    <th>{t('headers.lessons_learned')}</th>
                    <th style={{ width: '100px' }}>{t('headers.axis')}</th>
                    <th style={{ width: '100px' }}>{t('headers.risk_score')}</th>
                  </tr>
                )}
                {reportType === 'project_comparison' && (
                  <tr>
                    <th style={{ width: '120px' }}>{t('headers.risk_code')}</th>
                    <th>{t('headers.frequent_risk_text')}</th>
                    <th style={{ width: '120px' }}>{t('headers.risk_type')}</th>
                    <th style={{ width: '120px' }}>{t('headers.classification_axis')}</th>
                    <th style={{ width: '160px' }}>{t('headers.frequency_rate')}</th>
                    <th style={{ width: '160px' }}>{t('headers.avg_risk_score')}</th>
                  </tr>
                )}
                {reportType !== 'overdue_actions' && reportType !== 'lessons_learned' && reportType !== 'project_comparison' && (
                  <tr>
                    <th>{t('headers.id_code')}</th>
                    <th>{t('headers.description_analysis')}</th>
                    <th>{t('headers.context_stage')}</th>
                    <th>{t('headers.classification_axis')}</th>
                    <th>{t('headers.rii_details')}</th>
                    <th>{t('headers.relative_weight')}</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {processedReportData.map((row, index) => (
                  <tr key={index}>
                    <td className="code-highlight">{row.col1}</td>
                    <td className="text-truncate" title={row.col2}>{row.col2}</td>
                    
                    {reportType === 'overdue_actions' && (
                      <>
                        <td style={{ color: '#ea580c', fontWeight: '600' }}>{row.col3}</td>
                        <td style={{ fontWeight: '600' }}>{row.col4}</td>
                        <td><span className="axis-badge">{row.col5}</span></td>
                        <td className="score-bold">{row.col6}</td>
                      </>
                    )}

                    {reportType === 'lessons_learned' && (
                      <>
                        <td style={{ color: '#7c3aed', fontWeight: '600' }}>{row.col3}</td>
                        <td style={{ color: '#0f172a', fontWeight: '500' }}>{row.col4}</td>
                        <td><span className="axis-badge">{row.col5}</span></td>
                        <td className="score-bold">{row.col6}</td>
                      </>
                    )}

                    {reportType === 'project_comparison' && (
                      <>
                        <td><span className="axis-badge" style={{ backgroundColor: '#10b981', color: '#fff' }}>{row.col3}</span></td>
                        <td><span className="axis-badge">{row.col4}</span></td>
                        <td style={{ color: '#059669', fontWeight: 'bold' }}>{row.col5}</td>
                        <td className="score-bold">{row.col6}</td>
                      </>
                    )}

                    {reportType !== 'overdue_actions' && reportType !== 'lessons_learned' && reportType !== 'project_comparison' && (
                      <>
                        <td>{row.col3}</td>
                        <td><span className="axis-badge">{row.col4}</span></td>
                        <td className="rii-bold">{row.col5}</td>
                        <td className="score-bold">{row.col6}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewPage;