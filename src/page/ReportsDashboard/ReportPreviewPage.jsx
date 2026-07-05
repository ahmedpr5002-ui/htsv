import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTable } from "react-icons/fa6";
import './ReportsDashboard.css'; 
import RightBar from '../../components/rightBar/rightBar';
const ReportPreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reportType, projectId } = location.state || { reportType: 'risk_register', projectId: 'all' };

  const [processedReportData, setProcessedReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // جلب البيانات من الروت العام لضمان وجود الأكواد الحقيقية للمخاطر
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
        
        // فلترة البيانات حسب المشروع إن لم يكن الخيار "جميع المشاريع"
        let filtered = [...risksList];
        if (projectId !== 'all') {
          filtered = filtered.filter(risk => {
            const pId = risk.projectId?._id || risk.projectId;
            return pId === projectId;
          });
        }

        let resultData = [];

        if (reportType === 'project_comparison') {
          // حساب التكرارات والمتوسطات محلياً للحفاظ على الـ riskCode الأصلي
          const groups = {};
          filtered.forEach(r => {
            const txt = r.riskText || "لا يوجد بيان";
            if (!groups[txt]) {
              groups[txt] = {
                riskCode: r.riskCode || "غير محدد",
                riskText: txt,
                type: r.type || "ثابت",
                axis: r.axis || "فني",
                count: 0,
                totalScore: 0
              };
            }
            groups[txt].count += 1;
            groups[txt].totalScore += (r.riskScore || 0);
          });

          // تحويل الكائن إلى مصفوفة وترتيبها تنازلياً حسب التكرار
          const sortedGroups = Object.values(groups).sort((a, b) => b.count - a.count);

          // أخذ أعلى 10 مخاطر تكراراً وتشكيل الأعمدة الـ 6 بدقة
          resultData = sortedGroups.slice(0, 10).map(g => ({
            col1: g.riskCode, // كود الخطر الحقيقي الأصلي من النظام
            col2: g.riskText,
            col3: g.type,
            col4: g.axis,
            col5: `${g.count} مرات اختيار`,
            col6: `${(g.totalScore / g.count).toFixed(2)}%`
          }));

        } else {
          // باقي التقارير الاعتيادية
          switch (reportType) {
            case 'overdue_actions':
              resultData = filtered.filter(r => r.operationalStatus === 'مفتوحة').map(r => ({
                col1: r.riskCode || "غير محدد",
                col2: r.riskText || "لا يوجد بيان للخطر",
                col3: r.actionIds && r.actionIds.length > 0 ? r.actionIds.map(act => act.actionId?.code || 'ACT').join(', ') : '—',
                col4: r.riskOwner || "مدير المشروع",
                col5: r.axis || "فني",
                col6: `${r.riskScore || 0}%`
              }));
              break;

            case 'lessons_learned':
              resultData = filtered.filter(r => r.riskNotes).map(r => ({
                col1: r.riskCode || "غير محدد",
                col2: r.riskText || "لا يوجد بيان للخطر",
                col3: r.actionIds && r.actionIds.length > 0 ? r.actionIds.map(act => act.actionId?.code || 'ACT').join(', ') : '—',
                col4: r.riskNotes || "—",
                col5: r.axis || "فني",
                col6: `${r.riskScore || 0}%`
              }));
              break;

            case 'risk_register':
            default:
              resultData = filtered.map(r => ({
                col1: r.riskCode || "غير محدد",
                col2: r.riskText || "لا يوجد بيان",
                col3: r.time || r.stage || "عام",
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
      console.error("خطأ في جلب ومعالجة بيانات التقرير:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, projectId]);

  const getReportNameArabic = (type) => {
    switch(type) {
      case 'overdue_actions': return 'تقرير الإجراءات المتأخرة والإنذارات المبكرة';
      case 'lessons_learned': return 'تقرير حصر وحفظ الدروس المستفادة والتوصيات (RII)';
      case 'risk_register': return 'تقرير سجل المخاطر الإداري';
      case 'project_comparison': return 'تقرير مقارنة الأنماط والمخاطر الأكثر تكراراً واختياراً من المستخدمين';
      default: return 'المعاينة الحية للتقرير';
    }
  };

  return (
    <div className="reports-dashboard-content">
      <RightBar/>
      <div className="live-preview-section standalone-preview">
        <div className="preview-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaTable /> 
            <span>{getReportNameArabic(reportType)}</span>
          </div>
          <button className="btn-preview-outline" onClick={() => navigate(-1)} style={{ flex: 'none', padding: '6px 12px' }}>
             العودة للتقارير
          </button>
        </div>

        <div className="preview-data-container" style={{ maxHeight: 'none', minHeight: '400px' }}>
          {loading ? (
            <div className="preview-state-msg">جاري معالجة وتوليد السجلات الحية وتحليل أنماط التكرار...</div>
          ) : processedReportData.length === 0 ? (
            <div className="preview-state-msg">لا توجد بيانات مسجلة مطابقة لشروط هذا التقرير حالياً.</div>
          ) : (
            <table className="live-preview-table">
              <thead>
                {reportType === 'overdue_actions' && (
                  <tr>
                    <th style={{ width: '120px' }}>كود الخطر</th>
                    <th>الخطر / الوصف التحليلي</th>
                    <th style={{ width: '180px' }}>أكواد الإجراءات المحددة</th>
                    <th style={{ width: '220px' }}>المسؤول المقترح عن المعالجة</th>
                    <th style={{ width: '100px' }}>المحور</th>
                    <th style={{ width: '100px' }}>درجة الخطر</th>
                  </tr>
                )}
                {reportType === 'lessons_learned' && (
                  <tr>
                    <th style={{ width: '120px' }}>كود الخطر</th>
                    <th>نص الخطر التحليلي</th>
                    <th style={{ width: '180px' }}>أكواد الإجراءات المرتبطة</th>
                    <th>الدروس المستفادة المستخلصة (riskNotes)</th>
                    <th style={{ width: '100px' }}>المحور</th>
                    <th style={{ width: '100px' }}>درجة الخطر</th>
                  </tr>
                )}
                {reportType === 'project_comparison' && (
                  <tr>
                    <th style={{ width: '120px' }}>كود الخطر</th>
                    <th>نص الخطر المتكرر الأكثر اختياراً</th>
                    <th style={{ width: '120px' }}>نوع الخطر</th>
                    <th style={{ width: '120px' }}>التصنيف / المحور</th>
                    <th style={{ width: '160px' }}>معدل التكرار بالنظام</th>
                    <th style={{ width: '160px' }}>متوسط درجة خطورته العامة</th>
                  </tr>
                )}
                {reportType !== 'overdue_actions' && reportType !== 'lessons_learned' && reportType !== 'project_comparison' && (
                  <tr>
                    <th>المعرف / الكود</th>
                    <th>البيان والوصف التحليلي</th>
                    <th>السياق / المرحلة</th>
                    <th>التصنيف والمحور</th>
                    <th>المؤشر / التفاصيل (RII)</th>
                    <th>الوزن النسبي / درجة الخطر</th>
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