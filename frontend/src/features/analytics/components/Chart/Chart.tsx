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
  type: _type = 'line', 
  height = 300, 
  showAmount = true 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📊</div>
          <p className={styles.emptyText}>No data available</p>
        </div>
      </div>
    );
  }

  // Deduplicate data by date
  const uniqueData = data.reduce((acc, item) => {
    if (!acc.find(d => d.date === item.date)) {
      acc.push(item);
    }
    return acc;
  }, [] as ChartData[]);

  const maxCount = Math.max(...uniqueData.map(d => d.count), 1);
  const maxAmount = Math.max(...uniqueData.map(d => d.total_amount), 1);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      
      <div className={styles.chartWrapper}>
        <div className={styles.chart}>
          {uniqueData.map((item, index) => {
            const countPercent = (item.count / maxCount) * 100;
            const amountPercent = showAmount ? (item.total_amount / maxAmount) * 100 : 0;
            
            return (
              <div key={item.date} className={styles.barGroup}>
                <div className={styles.bars}>
                  <div 
                    className={styles.countBar}
                    style={{ height: `${Math.max(countPercent, 2)}%` }}
                    title={`${formatDate(item.date)}\nCount: ${item.count}`}
                  />
                  {showAmount && (
                    <div 
                      className={styles.amountBar}
                      style={{ height: `${Math.max(amountPercent, 2)}%` }}
                      title={`${formatDate(item.date)}\nAmount: ${formatCurrency(item.total_amount)}`}
                    />
                  )}
                </div>
                <div className={styles.label}>
                  {formatDate(item.date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: '#8B5CF6' }} />
          <span>Count ({maxCount} max)</span>
        </div>
        {showAmount && (
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: '#FFB800' }} />
            <span>Amount ({formatCurrency(maxAmount)} max)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;
