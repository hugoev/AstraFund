import React from 'react';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, trend }) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.header}>
        <div className={styles.icon}>{icon}</div>
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.value}>{formatValue(value)}</div>
        </div>
      </div>
      {trend && (
        <div className={`${styles.trend} ${trend.isPositive ? styles.positive : styles.negative}`}>
          <span className={styles.trendIcon}>
            {trend.isPositive ? '↗' : '↘'}
          </span>
          <span className={styles.trendValue}>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
