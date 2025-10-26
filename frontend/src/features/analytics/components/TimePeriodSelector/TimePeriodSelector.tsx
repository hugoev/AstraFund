import React from 'react';
import styles from './TimePeriodSelector.module.css';

interface TimePeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange
}) => {
  const periods = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
    { value: '365', label: '1 Year' }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.label}>Time Period:</div>
      <div className={styles.buttons}>
        {periods.map((period) => (
          <button
            key={period.value}
            className={`${styles.button} ${
              selectedPeriod === period.value ? styles.active : ''
            }`}
            onClick={() => onPeriodChange(period.value)}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimePeriodSelector;
