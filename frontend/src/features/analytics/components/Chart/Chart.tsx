import React from 'react';
import styles from './Chart.module.css';

interface ChartData {
  date: string;
  count: number;
  total_amount: number;
}

interface ChartProps {
  title: string;
  data: ChartData[];
  type: 'line' | 'bar';
  height?: number;
  showAmount?: boolean;
}

const Chart: React.FC<ChartProps> = ({ 
  title, 
  data, 
  type = 'line', 
  height = 200, 
  showAmount = true 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.container} style={{ height }}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📊</div>
          <p className={styles.emptyText}>No data available</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const maxAmount = Math.max(...data.map(d => d.total_amount));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={styles.container} style={{ height }}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          {data.map((item, index) => {
            const countHeight = (item.count / maxCount) * 100;
            const amountHeight = showAmount ? (item.total_amount / maxAmount) * 100 : 0;
            
            return (
              <div key={index} className={styles.chartItem}>
                <div className={styles.bars}>
                  <div 
                    className={`${styles.bar} ${styles.countBar}`}
                    style={{ height: `${countHeight}%` }}
                    title={`Count: ${item.count}`}
                  />
                  {showAmount && (
                    <div 
                      className={`${styles.bar} ${styles.amountBar}`}
                      style={{ height: `${amountHeight}%` }}
                      title={`Amount: ${formatCurrency(item.total_amount)}`}
                    />
                  )}
                </div>
                <div className={styles.label}>{formatDate(item.date)}</div>
              </div>
            );
          })}
        </div>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.countColor}`}></div>
            <span>Count</span>
          </div>
          {showAmount && (
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.amountColor}`}></div>
              <span>Amount</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chart;
