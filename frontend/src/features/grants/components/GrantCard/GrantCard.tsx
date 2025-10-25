import React from 'react';
import type { Grant } from '../../../../types';
import styles from './GrantCard.module.css';

interface GrantCardProps {
  grant: Grant;
  onClick: () => void;
}

const GrantCard: React.FC<GrantCardProps> = ({ grant, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <h3 className={styles.title}>{grant.name}</h3>
        <div className={styles.amount}>
          ${grant.total_amount.toLocaleString()}
        </div>
      </div>
      <div className={styles.content}>
        <p className={styles.rules}>
          {grant.rules_text.length > 100 
            ? `${grant.rules_text.substring(0, 100)}...` 
            : grant.rules_text
          }
        </p>
      </div>
      <div className={styles.footer}>
        <span className={styles.status}>Active Grant</span>
        <span className={styles.arrow}>→</span>
      </div>
    </div>
  );
};

export default GrantCard;
