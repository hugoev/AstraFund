import React from 'react';
import toast from 'react-hot-toast';
import { ApprovalQueue } from '../../components';
import { usePendingExpenses } from '../../hooks';
import styles from './ApprovalsPage.module.css';
import { useAuth } from '/src/contexts/AuthContext';

const ApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const { expenses: pendingExpenses, approveExpense, rejectExpense } = usePendingExpenses();

  const handleApproveExpense = async (expenseId: number) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    
    const result = await approveExpense(expenseId, user.id);
    if (result.success) {
      toast.success('Expense approved successfully!');
    } else {
      toast.error(`Failed to approve expense: ${result.error}`);
    }
  };

  const handleRejectExpense = async (expenseId: number) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    
    const result = await rejectExpense(expenseId, user.id);
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
        currentUserId={user?.id || 0}
      />
    </div>
  );
};

export default ApprovalsPage;

