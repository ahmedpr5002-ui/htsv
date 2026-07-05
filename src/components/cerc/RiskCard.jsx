import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { IoStatsChartOutline } from "react-icons/io5"; // أيقونة الـ chart في الأسفل
import './riskCard.css';

function RiskCard({ title, percentage, color, icon: Icon, average }) {
  return (
    <div className="risk-card">
      {/* الجزء العلوي: العنوان والأيقونة */}
      <div className="risk-card-header">
        <span className="risk-card-title">{title}</span>
        <div className="risk-icon-wrapper" style={{ color: color, backgroundColor: `${color}15` }}>
          <Icon />
        </div>
      </div>

      {/* المنتصف: العداد الدائري النصفي */}
      <div className="risk-gauge-container">
        <div className="gauge-wrapper">
          <CircularProgressbar
            value={percentage}
            text={`${percentage}%`}
            circleRatio={0.7} /* جعل الدائرة نصف دائرية مفتوحة من الأسفل */
            styles={buildStyles({
              rotation: 0.65, /* تدويرها لتبدأ وتنتهي بشكل متناسق في الأسفل */
              strokeLinecap: 'round',
              pathColor: color,
              textColor: '#1E3A60', /* --energy-text-dark */
              trailColor: '#e2e8f0', /* لون الرمادي المتبقي للدائرة */
              textSize: '18px',
            })}
          />
          <span className="gauge-label">Risk Score</span>
          <span className="gauge-status">متوسط</span>
        </div>
      </div>

      {/* الجزء السفلي: المتوسط والمخطط البياني */}
      <div className="risk-card-footer">
        <span className="average-text">متوسط الدراسة: {average}</span>
        <IoStatsChartOutline className="footer-chart-icon" style={{ color: color }} />
      </div>
    </div>
  );
}

export default RiskCard;