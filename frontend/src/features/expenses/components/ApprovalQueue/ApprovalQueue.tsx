import React from 'react';
import type { Expense } from '../../../../types';
import styles from './ApprovalQueue.module.css';

interface ApprovalQueueProps {
  expenses: Expense[];
  onApprove: (expenseId: number) => void;
  currentUserId: number;
}

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ expenses, onApprove, currentUserId }) => {
  if (expenses.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📋</div>
        <h3 className={styles.emptyTitle}>No Pending Approvals</h3>
        <p className={styles.emptyText}>All expenses have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Pending Approvals</h2>
      <div className={styles.queue}>
        {expenses.map((expense) => (
          <div key={expense.id} className={styles.expenseCard}>
            <div className={styles.header}>
              <h3 className={styles.description}>{expense.description}</h3>
              <div className={styles.amount}>${expense.amount.toLocaleString()}</div>
            </div>
            
            {expense.ai_compliance_check && (
              <div className={`${styles.compliance} ${expense.ai_compliance_check.is_compliant ? styles.compliant : styles.nonCompliant}`}>
                <div className={styles.complianceStatus}>
                  {expense.ai_compliance_check.is_compliant ? '✅ AI Approved' : '❌ AI Rejected'}
                </div>
                <p className={styles.justification}>{expense.ai_compliance_check.justification}</p>
              </div>
            )}
            
            <div className={styles.actions}>
              <button
                onClick={() => onApprove(expense.id)}
                className={styles.approveButton}
                disabled={expense.ai_compliance_check && !expense.ai_compliance_check.is_compliant}
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalQueue;
