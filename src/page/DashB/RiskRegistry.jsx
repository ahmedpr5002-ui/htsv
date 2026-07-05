
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   FaScaleBalanced, 
//   FaDollarSign, 
//   FaShieldHalved, 
//   FaTriangleExclamation,
//   FaArrowRight,
//   FaMagnifyingGlass,
//   FaFilter,
//   FaFolderOpen,
//   FaPlus,
//   FaXmark,
//   FaCircleCheck,
//   FaCircleExclamation,
//   FaCircleInfo
// } from "react-icons/fa6";
// import RightBar from '../../components/rightBar/rightBar';
// import './RiskRegistry.css';

// const RiskRegistry = () => {
//   const navigate = useNavigate();
//   const [risks, setRisks] = useState([]);
//   const [suggestedActionsMap, setSuggestedActionsMap] = useState({}); // لحفظ الإجراءات المقترحة لكل كود خطر
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterAxis, setFilterAxis] = useState('all');
//   const [filterStage, setFilterStage] = useState('all');
  
//   // حالات التحكم في تعديل الحالة والتوست الإشعاري
//   const [activeSelectRowId, setActiveSelectRowId] = useState(null);
//   const [updatingId, setUpdatingId] = useState(null);
//   const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

//   // ⭐ حالات التحكم في النافذة المنبثقة (Modal) لتفاصيل الإجراء
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedActionDetails, setSelectedActionDetails] = useState(null);

//   const token = localStorage.getItem('token') || "";
//   const selectedProjectId = localStorage.getItem('projectId') || "";

//   const showToast = (message, type = 'info') => {
//     setToast({ show: true, message, type });
//     setTimeout(() => {
//       setToast({ show: false, message: '', type: 'info' });
//     }, 4000);
//   };

//   // جلب البيانات: مخاطر المشروع الحالية + الإجراءات المقترحة الحوكمية
//   useEffect(() => {
//     if (!selectedProjectId) {
//       setLoading(false);
//       return;
//     }

//     const fetchRegistryAndSuggestedData = async () => {
//       try {
//         const [projectRisksRes, suggestedActionsRes] = await Promise.all([
//           fetch(`https://ahmedpr5002-irs-hvtl.hf.space/dang/project/${selectedProjectId}`, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${token}`
//             }
//           }),
//           fetch('https://ahmedpr5002-irs-hvtl.hf.space/racon').catch(err => console.log("Racon fetch error fallback", err))
//         ]);

//         let processedRisks = [];
//         if (projectRisksRes.ok) {
//           const data = await projectRisksRes.json();
//           const risksData = Array.isArray(data) ? data : (data.risks || []);
          
//           processedRisks = risksData.map(risk => {
//             if (risk.type === 'ثابت' || risk.type === 'fixed') {
//               return {
//                 ...risk,
//                 operationalStatus: 'مغلقة بقرار مؤسسي',
//                 closedDate: risk.closedDate || new Date().toISOString().split('T')[0]
//               };
//             }
//             return risk;
//           });
//         }

//         const actionsMapping = {};
//         if (suggestedActionsRes && suggestedActionsRes.ok) {
//           const raconData = await suggestedActionsRes.json();
//           raconData.forEach(item => {
//             if (!item.riskId || !item.riskId.riskCode) return;
//             const rCode = item.riskId.riskCode;
            
//             if (!actionsMapping[rCode]) {
//               actionsMapping[rCode] = [];
//             }
//             if (item.actionId) {
//               const isExist = actionsMapping[rCode].some(act => act.code === item.actionId.code);
//               if (!isExist) {
//                 actionsMapping[rCode].push({
//                   code: item.actionId.code,
//                   actionText: item.actionId.actionText,
//                   riskTitle: item.riskId.riskText || ""
//                 });
//               }
//             }
//           });
//         }

//         setSuggestedActionsMap(actionsMapping);
//         setRisks(processedRisks);

//       } catch (error) {
//         console.error("Error fetching all registry assets:", error);
//         showToast("حدث خطأ أثناء جلب بعض البيانات المقترحة", "error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRegistryAndSuggestedData();
//   }, [selectedProjectId, token]);

//   // تحديث الحالة التشغيلية عبر الـ API
//   const handleStatusChange = async (riskId, newStatus) => {
//     setUpdatingId(riskId);
//     try {
//       const response = await fetch(`https://ahmedpr5002-irs-hvtl.hf.space/dang/risk-entry/${riskId}/operational-status`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ operationalStatus: newStatus })
//       });

//       if (response.ok) {
//         setRisks(prevRisks => 
//           prevRisks.map(risk => 
//             risk._id === riskId 
//               ? { 
//                   ...risk, 
//                   operationalStatus: newStatus, 
//                   closedDate: (newStatus.includes('مغلقة') ? new Date().toISOString().split('T')[0] : '') 
//                 } 
//               : risk
//           )
//         );
//         setActiveSelectRowId(null);
//         showToast("تم تحديث الحالة التشغيلية الفنية بنجاح", "success");
//       } else {
//         const errData = await response.json();
//         showToast(`خطأ: ${errData.message}`, "error");
//       }
//     } catch (error) {
//       console.error("خطأ في تحديث الحالة:", error);
//       showToast("فشل الاتصال بالسيرفر لتعديل الحالة", "error");
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   const getAxisDetails = (risk) => {
//     const dbAxis = String(risk.axis || "").trim();
//     if (dbAxis === 'قانوني' || dbAxis === 'law') {
//       return { type: 'law', text: 'قانوني', class: 'law', icon: <FaScaleBalanced /> };
//     }
//     if (dbAxis === 'مالي' || dbAxis === 'money') {
//       return { type: 'money', text: 'مالي', class: 'money', icon: <FaDollarSign /> };
//     }
//     if (dbAxis === 'فني' || dbAxis === 'tech') {
//       return { type: 'tech', text: 'فني', class: 'tech', icon: <FaShieldHalved /> };
//     }

//     const code = String(risk.riskCode || "").toUpperCase();
//     const text = String(risk.riskText || risk.description || "").toLowerCase();
    
//     if (code.startsWith('L') || text.includes('قانون') || text.includes('تعويض')) {
//       return { type: 'law', text: 'قانوني', class: 'law', icon: <FaScaleBalanced /> };
//     }
//     if (code.startsWith('F') || text.includes('مالي') || text.includes('تمويل') || text.includes('سعر')) {
//       return { type: 'money', text: 'مالي', class: 'money', icon: <FaDollarSign /> };
//     }
//     return { type: 'tech', text: 'فني', class: 'tech', icon: <FaShieldHalved /> };
//   };

//   const getRiskLevel = (score) => {
//     const val = parseFloat(score) || 0;
//     if (val < 50) return { text: 'منخفض', class: 'level-low' };
//     if (val >= 50 && val <= 75) return { text: 'مرتفع', class: 'level-medium' };
//     return { text: 'حرج جداً', class: 'level-high' };
//   };

//   const getStatusClassName = (risk) => {
//     if (risk.type === 'ثابت' || risk.type === 'fixed' || risk.operationalStatus === 'مغلقة بقرار مؤسسي') {
//       return 'status-type-institutional-close';
//     }
//     if (risk.operationalStatus === 'مغلقة بحل فني') {
//       return 'status-type-technical-close';
//     }
//     if (risk.operationalStatus === 'قيد المعالجة') {
//       return 'status-type-proc';
//     }
//     return 'status-type-open';
//   };

//   const filteredRisks = risks.filter(risk => {
//     const matchesSearch = 
//       String(risk.riskCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
//       String(risk.riskText || "").toLowerCase().includes(searchTerm.toLowerCase());
    
//     const axisInfo = getAxisDetails(risk);
//     const matchesAxis = filterAxis === 'all' || axisInfo.type === filterAxis;
    
//     const riskStage = risk.stage || 'التنفيذ';
//     const matchesStage = filterStage === 'all' || riskStage.trim() === filterStage.trim();

//     return matchesSearch && matchesAxis && matchesStage;
//   });

//   const stats = {
//     total: filteredRisks.length,
//     critical: filteredRisks.filter(r => (parseFloat(r.riskScore) || parseFloat(r.riiPercentage) || 0) > 75).length,
//     medium: filteredRisks.filter(r => {
//       const s = parseFloat(r.riskScore) || parseFloat(r.riiPercentage) || 0;
//       return s >= 50 && s <= 75;
//     }).length,
//     low: filteredRisks.filter(r => (parseFloat(r.riskScore) || parseFloat(r.riiPercentage) || 0) < 50).length,
//   };

//   // فتح نافذة التفاصيل المقترحة
//   const openActionModal = (action) => {
//     setSelectedActionDetails(action);
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="registry-wrapper">
    

//       {/* نظام التوست الإشعاري */}
//       {toast.show && (
//         <div className={`luxury-toast toast-${toast.type}`} dir="rtl">
//           <div className="toast-content">
//             {toast.type === 'success' && <FaCircleCheck className="toast-icon" />}
//             {toast.type === 'warning' && <FaCircleExclamation className="toast-icon" />}
//             {toast.type === 'error' && <FaCircleExclamation className="toast-icon" />}
//             <span className="toast-text">{toast.message}</span>
//           </div>
//           <button className="toast-close-btn" onClick={() => setToast({ show: false, message: '', type: 'info' })}>
//             <FaXmark />
//           </button>
//         </div>
//       )}

//       {/* ⭐ النافذة المنبثقة الفاخرة المعتمدة على تصميم الـ CSS الخاص بك */}
//       {isModalOpen && selectedActionDetails && (
//         <div className="modal-overlay-luxury" onClick={() => setIsModalOpen(false)}>
//           <div className="modal-card-luxury animate-popup" onClick={(e) => e.stopPropagation()}>
//             <header className="modal-header-luxury">
//               <div className="modal-title-group">
//                 <FaCircleInfo className="modal-header-icon" />
//                 <div>
//                   <h2>تفاصيل الإجراء المقترح</h2>
//                   <p>الرمز التعريفي الفني: {selectedActionDetails.code}</p>
//                 </div>
//               </div>
//               <button className="modal-close-btn-luxury" onClick={() => setIsModalOpen(false)}>
//                 <FaXmark />
//               </button>
//             </header>
            
//             <div className="modal-body-luxury">
//               <div className="info-box-item">
//                 <span className="info-label">كود الإجراء</span>
//                 <span className="info-value-badge">{selectedActionDetails.code}</span>
//               </div>
             
//               <div className="info-box-item">
//                 <span className="info-label">مضمون ونص الإجراء المقترح</span>
//                 <p className="info-text-content">{selectedActionDetails.actionText}</p>
//               </div>
//             </div>
            
//             <footer className="modal-footer-luxury">
//               <button className="modal-btn-primary" onClick={() => setIsModalOpen(false)}>إغلاق النافذة</button>
//             </footer>
//           </div>
//         </div>
//       )}

//       <div className="registry-content">
//         <header className="registry-header">
//           <div className="header-right">
//             <button className="btn-back" onClick={() => navigate(-1)}>
//               <FaArrowRight /> رجوع للوحة التحكم
//             </button>
//             <div className="title-group">
//               <FaFolderOpen className="title-icon" />
//               <div>
//                 <h1>سجل المخاطر الشامل</h1>
//                 <p>استعراض، تصفية وتحليل كافة المخاطر المدرجة للمشروع الحالي</p>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* بطاقات الإحصاءات */}
//         <section className="registry-stats-grid">
//           <div className="stat-mini-card total">
//             <div className="stat-info"><h3>{stats.total}</h3><p>إجمالي المخاطر</p></div>
//           </div>
//           <div className="stat-mini-card critical">
//             <div className="stat-info"><h3>{stats.critical}</h3><p>مخاطر حرجة جداً</p></div>
//           </div>
//           <div className="stat-mini-card medium">
//             <div className="stat-info"><h3>{stats.medium}</h3><p>مخاطر مرتفعة</p></div>
//           </div>
//           <div className="stat-mini-card low">
//             <div className="stat-info"><h3>{stats.low}</h3><p>مخاطر منخفضة</p></div>
//           </div>
//         </section>

//         {/* شريط أدوات الفلاتر */}
//         <section className="filter-tools-bar">
//           <div className="search-box-wrapper">
//             <FaMagnifyingGlass className="search-icon" />
//             <input 
//               type="text" 
//               placeholder="ابحث بكود الخطر أو الوصف..." 
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>

//           <div className="filter-selectors">
//             <div className="selector-group">
//               <FaFilter className="icon-f" />
//               <select value={filterAxis} onChange={(e) => setFilterAxis(e.target.value)}>
//                 <option value="all">كل المحاور</option>
//                 <option value="tech">المحور الفني</option>
//                 <option value="money">المحور المالي</option>
//                 <option value="law">المحور القانوني</option>
//               </select>
//             </div>
//           </div>
//         </section>

//         {/* الجدول الشامل بعد التعديل */}
//         <div className="registry-table-container table-responsive-wrapper">
//           {loading ? (
//             <div className="registry-loading">جاري سحب وتدقيق البيانات من السيرفر السحابي...</div>
//           ) : filteredRisks.length === 0 ? (
//             <div className="registry-loading">لم يتم العثور على أي مخاطر تطابق الفلاتر المحددة.</div>
//           ) : (
//             <table className="registry-table racon-table">
//               <thead>
//                 <tr>
//                   <th style={{ width: '25px' }}>#</th>
//                   <th style={{ width: '120px' }}>كود الخطر</th>
//                   <th>وصف ومضمون الخطر</th>
//                   <th style={{ width: '100px' }}>المحور</th>
//                   <th style={{ width: '100px', }}>المرحلة الزمنية</th>
//                   <th style={{ width: '110px' }}>مستوى الخطورة</th>
//                   <th style={{ width: '90px' }}>Risk Score</th>
//                   <th style={{ width: '130px' }}>الحالة التشغيلية</th>
                
//                   <th style={{ width: '150px' }}>الإجراءات المقترحة</th>
//                   <th style={{ width: '140px' }}>الإجراءات المتخذة</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredRisks.map((risk, index) => {
//                   const axis = getAxisDetails(risk);
//                   const score = risk.riskScore || risk.riiPercentage || 0;
//                   const level = getRiskLevel(score);
//                   const actualRiskId = risk._id || risk.id || `TEMP-${index}`;
//                   const isFixedRisk = risk.type === 'ثابت' || risk.type === 'fixed';
                  
//                   const suggestedActions = suggestedActionsMap[risk.riskCode] || [];

//                   return (
//                     <tr key={actualRiskId}>
//                       <td className="idx-cell">{index + 1}</td>
//                       <td className={`code-cell code-${axis.class} risk-code-cell`}>
//                         <code>{risk.riskCode || "N/A"}</code>
//                       </td>
//                       <td className="text-cell risk-text-cell">{risk.riskText}</td>
//                       <td>
//                         <span className={`axis-tag axis-${axis.text}`}>
//                           {axis.text}
//                         </span>
//                       </td>
//                       <td  className="stage-cell ">{risk.time || risk.stage}</td>
//                       <td>
//                         <span className={`level-badge ${level.class}`}>
//                           <FaTriangleExclamation /> {level.text}
//                         </span>
//                       </td>
//                       <td className="score-cell rii-value-cell"><strong>{parseFloat(score).toFixed(2)}%</strong></td>
                      
//                       <td>
//                         {!isFixedRisk && activeSelectRowId === actualRiskId ? (
//                           <select 
//                             value={risk.operationalStatus || 'مفتوحة'} 
//                             onChange={(e) => handleStatusChange(actualRiskId, e.target.value)}
//                             onBlur={() => setActiveSelectRowId(null)}
//                             disabled={updatingId === actualRiskId}
//                             className="status-select-inline-luxury"
//                             autoFocus
//                           >
//                             <option value="مفتوحة">مفتوحة</option>
//                             <option value="قيد المعالجة">قيد المعالجة</option>
//                             <option value="مغلقة بحل فني">مغلقة بحل فني</option>
//                             <option value="مغلقة بقرار مؤسسي">مغلقة بقرار مؤسسي</option>
//                           </select>
//                         ) : (
//                           <span 
//                             className={`clickable-status-badge ${getStatusClassName(risk)}`}
//                             onClick={() => {
//                               if (isFixedRisk) {
//                                 showToast("هذا الخطر ثابت ومغلق مؤسسياً بشكل دائم ولا يمكن تغيير حالته.", "warning");
//                                 return;
//                               }
//                               setActiveSelectRowId(actualRiskId);
//                             }}
//                           >
//                             {isFixedRisk ? 'مغلقة بقرار مؤسسي' : (risk.operationalStatus || 'مفتوحة')}
//                           </span>
//                         )}
//                       </td>

//                       {/* ⭐ خلية أكواد الإجراءات المقترحة التفاعلية (أفقية، مرنة، ومقاومة للمظهر العمودي) */}
//                       <td>
//                         <div className="actions-flex-container">
//                           {suggestedActions.length > 0 ? (
//                             suggestedActions.map((act, idx) => (
//                               <button
//                                 key={idx}
//                                 className="action-code-badge"
//                                 onClick={() => openActionModal(act)}
//                                 title="اضغط لاستعراض تفاصيل الإجراء الحوكمي الكامله"
//                                 style={{ cursor: 'pointer', border: '1px solid #BBF7D0', transition: 'all 0.2s' }}
//                               >
//                                 {act.code}
//                               </button>
//                             ))
//                           ) : (
//                             <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>لا يوجد حاليا</span>
//                           )}
//                         </div>
//                       </td>

//                       <td>
//                         {risk.actionIds && risk.actionIds.length > 0 ? (
//                           <button 
//                             className="action-assigned-badge" 
//                             style={{ width: '100%' }}
//                             onClick={() => navigate(`/add-action/${actualRiskId}`, { state: { risk } })}
//                           >
//                             {risk.actionIds.length} إجراءات مضافة
//                           </button>
//                         ) : (
//                           <button 
//                             className="btn-add-action"
//                             style={{ width: '100%' }}
//                             onClick={() => navigate(`/add-action/${actualRiskId}`, { state: { risk } })}
//                           >
//                             <FaPlus /> إضافة إجراء
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RiskRegistry;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaScaleBalanced, 
  FaDollarSign, 
  FaShieldHalved, 
  FaTriangleExclamation,
  FaArrowRight,
  FaMagnifyingGlass,
  FaFilter,
  FaFolderOpen,
  FaPlus,
  FaXmark,
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo
} from "react-icons/fa6";
import RightBar from '../../components/rightBar/rightBar';
import './RiskRegistry.css';

const RiskRegistry = () => {
  const navigate = useNavigate();
  const [risks, setRisks] = useState([]);
  const [suggestedActionsMap, setSuggestedActionsMap] = useState({}); // لحفظ الإجراءات المقترحة لكل كود خطر
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAxis, setFilterAxis] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  
  // حالات التحكم في تعديل الحالة والتوست الإشعاري
  const [activeSelectRowId, setActiveSelectRowId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // حالات التحكم في النافذة المنبثقة (Modal) لتفاصيل الإجراء
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActionDetails, setSelectedActionDetails] = useState(null);

  const token = localStorage.getItem('token') || "";
  const selectedProjectId = localStorage.getItem('projectId') || "";

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  // جلب البيانات: مخاطر المشروع الحالية + الإجراءات المقترحة الحوكمية
  useEffect(() => {
    if (!selectedProjectId) {
      setLoading(false);
      return;
    }

    const fetchRegistryAndSuggestedData = async () => {
      try {
        const [projectRisksRes, suggestedActionsRes] = await Promise.all([
          fetch(`https://ahmedpr5002-irs-hvtl.hf.space/dang/project/${selectedProjectId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('https://ahmedpr5002-irs-hvtl.hf.space/racon').catch(err => console.log("Racon fetch error fallback", err))
        ]);

        let processedRisks = [];
        if (projectRisksRes.ok) {
          const data = await projectRisksRes.json();
          const risksData = Array.isArray(data) ? data : (data.risks || []);
          
          processedRisks = risksData.map(risk => {
            if (risk.type === 'ثابت' || risk.type === 'fixed') {
              return {
                ...risk,
                operationalStatus: 'مغلقة بقرار مؤسسي',
                closedDate: risk.closedDate || new Date().toISOString().split('T')[0]
              };
            }
            return risk;
          });
        }

        const actionsMapping = {};
        if (suggestedActionsRes && suggestedActionsRes.ok) {
          const raconData = await suggestedActionsRes.json();
          raconData.forEach(item => {
            if (!item.riskId || !item.riskId.riskCode) return;
            const rCode = item.riskId.riskCode;
            
            if (!actionsMapping[rCode]) {
              actionsMapping[rCode] = [];
            }
            if (item.actionId) {
              const isExist = actionsMapping[rCode].some(act => act.code === item.actionId.code);
              if (!isExist) {
                // تدوين كافة الحقول مع معالجة حقول الـ null والـ undefined بدقة بحسب الـ JSON
                actionsMapping[rCode].push({
                  code: item.actionId.code,
                  actionText: item.actionId.actionText || "لا يوجد نص وصفي متوفر للإجراء",
                  category: item.actionId.category || "غير محدد",
                  phase: item.actionId.phase || "غير محدد",
                  riiPercentage: item.actionId.riiPercentage !== undefined && item.actionId.riiPercentage !== null ? item.actionId.riiPercentage : (item.actionId.riiValue || 0),
                  Proposedofficial: item.actionId.Proposedofficial || "لم يتم التعيين بعد",
                  riskTitle: item.riskId.riskText || ""
                });
              }
            }
          });
        }

        setSuggestedActionsMap(actionsMapping);
        setRisks(processedRisks);

      } catch (error) {
        console.error("Error fetching all registry assets:", error);
        showToast("حدث خطأ أثناء جلب بعض البيانات المقترحة", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistryAndSuggestedData();
  }, [selectedProjectId, token]);

  // تحديث الحالة التشغيلية عبر الـ API
  const handleStatusChange = async (riskId, newStatus) => {
    setUpdatingId(riskId);
    try {
      const response = await fetch(`https://ahmedpr5002-irs-hvtl.hf.space/dang/risk-entry/${riskId}/operational-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ operationalStatus: newStatus })
      });

      if (response.ok) {
        setRisks(prevRisks => 
          prevRisks.map(risk => 
            risk._id === riskId 
              ? { 
                  ...risk, 
                  operationalStatus: newStatus, 
                  closedDate: (newStatus.includes('مغلقة') ? new Date().toISOString().split('T')[0] : '') 
                } 
              : risk
          )
        );
        setActiveSelectRowId(null);
        showToast("تم تحديث الحالة التشغيلية الفنية بنجاح", "success");
      } else {
        const errData = await response.json();
        showToast(`خطأ: ${errData.message}`, "error");
      }
    } catch (error) {
      console.error("خطأ في تحديث الحالة:", error);
      showToast("فشل الاتصال بالسيرفر لتعديل الحالة", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getAxisDetails = (risk) => {
    const dbAxis = String(risk.axis || "").trim();
    if (dbAxis === 'قانوني' || dbAxis === 'law') {
      return { type: 'law', text: 'قانوني', class: 'law', icon: <FaScaleBalanced /> };
    }
    if (dbAxis === 'مالي' || dbAxis === 'money') {
      return { type: 'money', text: 'مالي', class: 'money', icon: <FaDollarSign /> };
    }
    if (dbAxis === 'فني' || dbAxis === 'tech') {
      return { type: 'tech', text: 'فني', class: 'tech', icon: <FaShieldHalved /> };
    }

    const code = String(risk.riskCode || "").toUpperCase();
    const text = String(risk.riskText || risk.description || "").toLowerCase();
    
    if (code.startsWith('L') || text.includes('قانون') || text.includes('تعويض')) {
      return { type: 'law', text: 'قانوني', class: 'law', icon: <FaScaleBalanced /> };
    }
    if (code.startsWith('F') || text.includes('مالي') || text.includes('تمويل') || text.includes('سعر')) {
      return { type: 'money', text: 'مالي', class: 'money', icon: <FaDollarSign /> };
    }
    return { type: 'tech', text: 'فني', class: 'tech', icon: <FaShieldHalved /> };
  };

  const getRiskLevel = (score) => {
    const val = parseFloat(score) || 0;
    if (val < 50) return { text: 'منخفض', class: 'level-low' };
    if (val >= 50 && val <= 75) return { text: 'مرتفع', class: 'level-medium' };
    return { text: 'حرج جداً', class: 'level-high' };
  };

  const getStatusClassName = (risk) => {
    if (risk.type === 'ثابت' || risk.type === 'fixed' || risk.operationalStatus === 'مغلقة بقرار مؤسسي') {
      return 'status-type-institutional-close';
    }
    if (risk.operationalStatus === 'مغلقة بحل فني') {
      return 'status-type-technical-close';
    }
    if (risk.operationalStatus === 'قيد المعالجة') {
      return 'status-type-proc';
    }
    return 'status-type-open';
  };

  const filteredRisks = risks.filter(risk => {
    const matchesSearch = 
      String(risk.riskCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(risk.riskText || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const axisInfo = getAxisDetails(risk);
    const matchesAxis = filterAxis === 'all' || axisInfo.type === filterAxis;
    
    const riskStage = risk.stage || 'التنفيذ';
    const matchesStage = filterStage === 'all' || riskStage.trim() === filterStage.trim();

    return matchesSearch && matchesAxis && matchesStage;
  });

  const stats = {
    total: filteredRisks.length,
    critical: filteredRisks.filter(r => (parseFloat(r.riskScore) || parseFloat(r.riiPercentage) || 0) > 75).length,
    medium: filteredRisks.filter(r => {
      const s = parseFloat(r.riskScore) || parseFloat(r.riiPercentage) || 0;
      return s >= 50 && s <= 75;
    }).length,
    low: filteredRisks.filter(r => (parseFloat(r.riskScore) || parseFloat(r.riiPercentage) || 0) < 50).length,
  };

  const openActionModal = (action) => {
    setSelectedActionDetails(action);
    setIsModalOpen(true);
  };

  return (
    <div className="registry-wrapper">
      {/* نظام التوست الإشعاري */}
      {toast.show && (
        <div className={`luxury-toast toast-${toast.type}`} dir="rtl">
          <div className="toast-content">
            {toast.type === 'success' && <FaCircleCheck className="toast-icon" />}
            {toast.type === 'warning' && <FaCircleExclamation className="toast-icon" />}
            {toast.type === 'error' && <FaCircleExclamation className="toast-icon" />}
            <span className="toast-text">{toast.message}</span>
          </div>
          <button className="toast-close-btn" onClick={() => setToast({ show: false, message: '', type: 'info' })}>
            <FaXmark />
          </button>
        </div>
      )}

      {/* النافذة المنبثقة المحمية لعرض كافة الحقول بسلامة وتجنب الفراغات */}
      {isModalOpen && selectedActionDetails && (
        <div className="modal-overlay-luxury" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card-luxury animate-popup" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header-luxury">
              <div className="modal-title-group">
                <FaCircleInfo className="modal-header-icon" />
                <div>
                  <h2>تفاصيل الإجراء المقترح</h2>
                  <p>الرمز التعريفي الفني: {selectedActionDetails.code || "N/A"}</p>
                </div>
              </div>
              <button className="modal-close-btn-luxury" onClick={() => setIsModalOpen(false)}>
                <FaXmark />
              </button>
            </header>
            
            <div className="modal-body-luxury">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div className="info-box-item">
                  <span className="info-label">كود الإجراء</span>
                  <span className="info-value-badge">{selectedActionDetails.code || "N/A"}</span>
                </div>
                
                <div className="info-box-item">
                  <span className="info-label">تصنيف الإجراء</span>
                  <span className="info-value-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                    {selectedActionDetails.category || "غير محدد"}
                  </span>
                </div>

                <div className="info-box-item">
                  <span className="info-label">المرحلة الزمنية</span>
                  <span className="info-value-badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                    {selectedActionDetails.phase || "غير محدد"}
                  </span>
                </div>

                <div className="info-box-item">
                  <span className="info-label">نسبة (RII)</span>
                  <span className="info-value-badge" style={{ backgroundColor: '#fce7f3', color: '#be185d' }}>
                    {selectedActionDetails.riiPercentage || 0}%
                  </span>
                </div>
              </div>

             
             
              <div className="info-box-item">
                <span className="info-label">مضمون ونص الإجراء المقترح</span>
                <p className="info-text-content">{selectedActionDetails.actionText || "لا يوجد نص متوفر"}</p>
              </div>
            </div>
            
            <footer className="modal-footer-luxury">
              <button className="modal-btn-primary" onClick={() => setIsModalOpen(false)}>إغلاق النافذة</button>
            </footer>
          </div>
        </div>
      )}

      <div className="registry-content">
        <header className="registry-header">
          <div className="header-right">
            <button className="btn-back" onClick={() => navigate(-1)}>
              <FaArrowRight /> رجوع للوحة التحكم
            </button>
            <div className="title-group">
              <FaFolderOpen className="title-icon" />
              <div>
                <h1>سجل المخاطر الشامل</h1>
                <p>استعراض، تصفية وتحليل كافة المخاطر المدرجة للمشروع الحالي</p>
              </div>
            </div>
          </div>
        </header>

        {/* بطاقات الإحصاءات */}
        <section className="registry-stats-grid">
          <div className="stat-mini-card total">
            <div className="stat-info"><h3>{stats.total}</h3><p>إجمالي المخاطر</p></div>
          </div>
          <div className="stat-mini-card critical">
            <div className="stat-info"><h3>{stats.critical}</h3><p>مخاطر حرجة جداً</p></div>
          </div>
          <div className="stat-mini-card medium">
            <div className="stat-info"><h3>{stats.medium}</h3><p>مخاطر مرتفعة</p></div>
          </div>
          <div className="stat-mini-card low">
            <div className="stat-info"><h3>{stats.low}</h3><p>مخاطر منخفضة</p></div>
          </div>
        </section>

        {/* شريط أدوات الفلاتر */}
        <section className="filter-tools-bar">
          <div className="search-box-wrapper">
            <FaMagnifyingGlass className="search-icon" />
            <input 
              type="text" 
              placeholder="ابحث بكود الخطر أو الوصف..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-selectors">
            <div className="selector-group">
              <FaFilter className="icon-f" />
              <select value={filterAxis} onChange={(e) => setFilterAxis(e.target.value)}>
                <option value="all">كل المحاور</option>
                <option value="tech">المحور الفني</option>
                <option value="money">المحور المالي</option>
                <option value="law">المحور القانوني</option>
              </select>
            </div>
          </div>
        </section>

        {/* الجدول الشامل */}
        <div className="registry-table-container table-responsive-wrapper">
          {loading ? (
            <div className="registry-loading">جاري سحب وتدقيق البيانات من السيرفر السحابي...</div>
          ) : filteredRisks.length === 0 ? (
            <div className="registry-loading">لم يتم العثور على أي مخاطر تطابق الفلاتر المحددة.</div>
          ) : (
            <table className="registry-table racon-table">
              <thead>
                <tr>
                  <th style={{ width: '25px' }}>#</th>
                  <th style={{ width: '120px' }}>كود الخطر</th>
                  <th>وصف ومضمون الخطر</th>
                  <th style={{ width: '100px' }}>المحور</th>
                  <th style={{ width: '100px' }}>المرحلة الزمنية</th>
                  <th style={{ width: '110px' }}>مستوى الخطورة</th>
                  <th style={{ width: '90px' }}>Risk Score</th>
                  <th style={{ width: '130px' }}>الحالة التشغيلية</th>
                  <th style={{ width: '150px' }}>الإجراءات المقترحة</th>
                  <th style={{ width: '140px' }}>الإجراءات المتخذة</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((risk, index) => {
                  const axis = getAxisDetails(risk);
                  const score = risk.riskScore || risk.riiPercentage || 0;
                  const level = getRiskLevel(score);
                  const actualRiskId = risk._id || risk.id || `TEMP-${index}`;
                  const isFixedRisk = risk.type === 'ثابت' || risk.type === 'fixed';
                  
                  const suggestedActions = suggestedActionsMap[risk.riskCode] || [];

                  return (
                    <tr key={actualRiskId}>
                      <td className="idx-cell">{index + 1}</td>
                      <td className={`code-cell code-${axis.class} risk-code-cell`}>
                        <code>{risk.riskCode || "N/A"}</code>
                      </td>
                      <td className="text-cell risk-text-cell">{risk.riskText}</td>
                      <td>
                        <span className={`axis-tag axis-${axis.text}`}>
                          {axis.text}
                        </span>
                      </td>
                      <td className="stage-cell">{risk.time || risk.stage}</td>
                      <td>
                        <span className={`level-badge ${level.class}`}>
                          <FaTriangleExclamation /> {level.text}
                        </span>
                      </td>
                      <td className="score-cell rii-value-cell"><strong>{parseFloat(score).toFixed(2)}%</strong></td>
                      
                      <td>
                        {!isFixedRisk && activeSelectRowId === actualRiskId ? (
                          <select 
                            value={risk.operationalStatus || 'مفتوحة'} 
                            onChange={(e) => handleStatusChange(actualRiskId, e.target.value)}
                            onBlur={() => setActiveSelectRowId(null)}
                            disabled={updatingId === actualRiskId}
                            className="status-select-inline-luxury"
                            autoFocus
                          >
                            <option value="مفتوحة">مفتوحة</option>
                            <option value="قيد المعالجة">قيد المعالجة</option>
                            <option value="مغلقة بحل فني">مغلقة بحل فني</option>
                            <option value="مغلقة بقرار مؤسسي">مغلقة بقرار مؤسسي</option>
                          </select>
                        ) : (
                          <span 
                            className={`clickable-status-badge ${getStatusClassName(risk)}`}
                            onClick={() => {
                              if (isFixedRisk) {
                                showToast("هذا الخطر ثابت ومغلق مؤسسياً بشكل دائم ولا يمكن تغيير حالته.", "warning");
                                return;
                              }
                              setActiveSelectRowId(actualRiskId);
                            }}
                          >
                            {isFixedRisk ? 'مغلقة بقرار مؤسسي' : (risk.operationalStatus || 'مفتوحة')}
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="actions-flex-container">
                          {suggestedActions.length > 0 ? (
                            suggestedActions.map((act, idx) => (
                              <button
                                key={idx}
                                className="action-code-badge"
                                onClick={() => openActionModal(act)}
                                title="اضغط لاستعراض تفاصيل الإجراء الحوكمي الكاملة"
                                style={{ cursor: 'pointer', border: '1px solid #BBF7D0', transition: 'all 0.2s' }}
                              >
                                {act.code}
                              </button>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>لا يوجد حالياً</span>
                          )}
                        </div>
                      </td>

                      <td>
                        {risk.actionIds && risk.actionIds.length > 0 ? (
                          <button 
                            className="action-assigned-badge" 
                            style={{ width: '100%' }}
                            onClick={() => navigate(`/add-action/${actualRiskId}`, { state: { risk } })}
                          >
                            {risk.actionIds.length} إجراءات مضافة
                          </button>
                        ) : (
                          <button 
                            className="btn-add-action"
                            style={{ width: '100%' }}
                            onClick={() => navigate(`/add-action/${actualRiskId}`, { state: { risk } })}
                          >
                            <FaPlus /> إضافة إجراء
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskRegistry;