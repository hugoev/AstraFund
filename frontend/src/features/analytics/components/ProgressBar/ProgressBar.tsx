import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  showPercentage?: boolean;
  showValues?: boolean;
  formatValue?: (value: number) => string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  total,
  color = 'primary',
  showPercentage = true,
  showValues = true,
  formatValue = (value) => value.toLocaleString()
}) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const isOverBudget = current > total;

  const getColorClass = () => {
    if (isOverBudget) return styles.danger;
    if (percentage >= 90) return styles.warning;
    if (percentage >= 75) return styles.info;
    return styles[color];
  };

  const getStatusText = () => {
    if (isOverBudget) return 'Over Budget';
    if (percentage >= 90) return 'Near Limit';
    if (percentage >= 75) return 'High Usage';
    return 'Normal';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={`${styles.status} ${getColorClass()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className={styles.progressContainer}>
        <div className={styles.progressTrack}>
          <div 
            className={`${styles.progressBar} ${getColorClass()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        {showPercentage && (
          <div className={styles.percentage}>
            {percentage.toFixed(1)}%
          </div>
        )}
      </div>
      
      {showValues && (
        <div className={styles.values}>
          <span className={styles.current}>
            {formatValue(current)}
          </span>
          <span className={styles.separator}>/</span>
          <span className={styles.total}>
            {formatValue(total)}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
