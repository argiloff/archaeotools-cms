import './QualityScore.css';

export interface QualityScoreProps {
  score: number;
  maxScore?: number;
  label?: string;
}

export const QualityScore = ({ score, maxScore = 100, label = 'Qualitäts-Score' }: QualityScoreProps) => {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return '#6de3c4';
    if (percentage >= 60) return '#ffc878';
    return '#f78c6c';
  };

  const getGrade = () => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="quality-score">
      <div className="quality-score__label">{label}</div>
      <div className="quality-score__circle-container">
        <svg className="quality-score__svg" viewBox="0 0 120 120">
          <circle
            className="quality-score__circle-bg"
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="8"
          />
          <circle
            className="quality-score__circle"
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="quality-score__content">
          <div className="quality-score__grade" style={{ color: getColor() }}>
            {getGrade()}
          </div>
          <div className="quality-score__percentage">{Math.round(percentage)}%</div>
        </div>
      </div>
    </div>
  );
};
