import React, { useState } from 'react';
import type { Expense } from '../../../../types';
import styles from './ApprovalQueue.module.css';
import { ConfirmDialog } from '/src/components/common';

interface ApprovalQueueProps {
  expenses: Expense[];
  onApprove: (expenseId: number) => void;
  onReject: (expenseId: number) => void;
  currentUserId: number;
}

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ expenses, onApprove, onReject }) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject';
    expenseId: number | null;
    expenseName: string;
  }>({
    isOpen: false,
    type: 'approve',
    expenseId: null,
    expenseName: ''
  });

  const handleApproveClick = (expense: Expense) => {
    setConfirmDialog({
      isOpen: true,
      type: 'approve',
      expenseId: expense.id,
      expenseName: expense.description
    });
  };

  const handleRejectClick = (expense: Expense) => {
    setConfirmDialog({
      isOpen: true,
      type: 'reject',
      expenseId: expense.id,
      expenseName: expense.description
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.expenseId) {
      if (confirmDialog.type === 'approve') {
        onApprove(confirmDialog.expenseId);
      } else {
        onReject(confirmDialog.expenseId);
      }
    }
    setConfirmDialog({ isOpen: false, type: 'approve', expenseId: null, expenseName: '' });
  };

  const handleCancel = () => {
    setConfirmDialog({ isOpen: false, type: 'approve', expenseId: null, expenseName: '' });
  };

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
    <>
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
                  onClick={() => handleRejectClick(expense)}
                  className={styles.rejectButton}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApproveClick(expense)}
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'approve' ? 'Approve Expense' : 'Reject Expense'}
        message={
          confirmDialog.type === 'approve'
            ? `Are you sure you want to approve "${confirmDialog.expenseName}"?`
            : `Are you sure you want to reject "${confirmDialog.expenseName}"? This action cannot be undone.`
        }
        confirmText={confirmDialog.type === 'approve' ? 'Approve' : 'Reject'}
        confirmVariant={confirmDialog.type === 'approve' ? 'primary' : 'danger'}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default ApprovalQueue;
