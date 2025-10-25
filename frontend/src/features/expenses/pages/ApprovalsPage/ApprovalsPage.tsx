import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ApprovalQueue } from '../../components';
import { usePendingExpenses } from '../../hooks';
import styles from './ApprovalsPage.module.css';

const ApprovalsPage: React.FC = () => {
  const [currentUserId] = useState(1); // Mock user ID
  const { expenses: pendingExpenses, approveExpense, rejectExpense } = usePendingExpenses();

  const handleApproveExpense = async (expenseId: number) => {
    const result = await approveExpense(expenseId, currentUserId);
    if (result.success) {
      toast.success('Expense approved successfully!');
    } else {
      toast.error(`Failed to approve expense: ${result.error}`);
    }
  };

  const handleRejectExpense = async (expenseId: number) => {
    const result = await rejectExpense(expenseId, currentUserId);
    if (result.success) {
      toast.success('Expense rejected successfully!');
    } else {
      toast.error(`Failed to reject expense: ${result.error}`);
    }
  };

  return (
    <div className={styles.container}>
      <ApprovalQueue
        expenses={pendingExpenses}
        onApprove={handleApproveExpense}
        onReject={handleRejectExpense}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default ApprovalsPage;

