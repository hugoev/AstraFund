import React from 'react';
import styles from './ComplianceCheck.module.css';

interface ComplianceCheckProps {
  isCompliant: boolean;
  justification: string;
}

const ComplianceCheck: React.FC<ComplianceCheckProps> = ({ isCompliant, justification }) => {
  return (
    <div className={`${styles.container} ${isCompliant ? styles.compliant : styles.nonCompliant}`}>
      <div className={styles.icon}>
        {isCompliant ? '✅' : '❌'}
      </div>
      <div className={styles.content}>
        <div className={styles.status}>
          {isCompliant ? 'Compliant' : 'Non-Compliant'}
        </div>
        <p className={styles.justification}>{justification}</p>
      </div>
    </div>
  );
};

export default ComplianceCheck;
