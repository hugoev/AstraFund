import React, { useState } from 'react';
import toast from 'react-hot-toast';
import styles from './FinancialWorkflowPage.module.css';
import { apiService } from '/src/api';
import { useAuth } from '/src/contexts/AuthContext';
import { usePayments, usePendingExpenses } from '/src/features/expenses/hooks';

const FinancialWorkflowPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  
  const { 
    pendingExpenses, 
    loading: expensesLoading, 
    error: expensesError,
    approveExpense,
    rejectExpense,
    refetch: refetchExpenses
  } = usePendingExpenses();

  const {
    payments,
    loading: paymentsLoading,
    error: paymentsError,
    processPayment,
    cancelPayment,
    refetch: refetchPayments
  } = usePayments();

  // Get completed expenses (approved and paid)
  const completedExpenses = payments?.filter(payment => payment.status === 'completed') || [];

  // One-click approve and pay - reduces steps from 2 to 1
  const handleApproveAndPay = async (expenseId: number) => {
    try {
      // First approve the expense
      await approveExpense(expenseId);
      
      // Then immediately create and process payment
      const expense = pendingExpenses?.find(e => e.id === expenseId);
      if (expense) {
        // Create payment
        await apiService.createPayment({
          expense_id: expenseId,
          amount: expense.amount,
          payment_method: 'bank_transfer',
          status: 'pending'
        });
        
        // Process payment immediately
        const payments = await apiService.getExpensePayments(expenseId);
        if (payments.length > 0) {
          await processPayment(payments[0].id);
        }
      }
      
      toast.success('Expense approved and payment processed!');
      await refetchExpenses();
      await refetchPayments();
    } catch (error) {
      console.error('Failed to approve and pay expense:', error);
      toast.error('Failed to process expense');
    }
  };

  const handleReject = async (expenseId: number) => {
    try {
      await rejectExpense(expenseId);
      await refetchExpenses();
      toast.success('Expense rejected');
    } catch (error) {
      console.error('Failed to reject expense:', error);
      toast.error('Failed to reject expense');
    }
  };

  if (expensesLoading || paymentsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading financial workflow...</div>
      </div>
    );
  }

  if (expensesError || paymentsError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Error loading financial data: {expensesError || paymentsError}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Financial Workflow</h1>
        <p className={styles.subtitle}>
          Streamlined: One-click approve and pay for faster processing
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'pending' ? styles.active : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span className={styles.tabIcon}>⏳</span>
          Pending Review
          <span className={styles.count}>{pendingExpenses?.length || 0}</span>
        </button>
        
        <button
          className={`${styles.tab} ${activeTab === 'completed' ? styles.active : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <span className={styles.tabIcon}>✅</span>
          Completed
          <span className={styles.count}>{completedExpenses.length}</span>
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'pending' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Expenses Pending Review</h2>
              <p>One-click approve and pay for faster processing</p>
            </div>
            <div className={styles.streamlinedQueue}>
              {pendingExpenses?.map(expense => (
                <div key={expense.id} className={styles.expenseCard}>
                  <div className={styles.expenseHeader}>
                    <h4>{expense.description}</h4>
                    <span className={styles.amount}>${expense.amount.toLocaleString()}</span>
                  </div>
                  <div className={styles.expenseDetails}>
                    <p><strong>Grant:</strong> {expense.grant?.name || 'Unknown Grant'}</p>
                    <p><strong>Submitted by:</strong> {expense.submitter?.username || 'Unknown User'}</p>
                    <div className={styles.complianceStatus}>
                      {expense.ai_compliance_check?.is_compliant ? (
                        <span className={styles.compliant}>✅ AI Approved</span>
                      ) : (
                        <span className={styles.nonCompliant}>❌ AI Flagged</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleApproveAndPay(expense.id)}
                      className={styles.approveAndPayButton}
                      disabled={!expense.ai_compliance_check?.is_compliant}
                    >
                      Approve & Pay
                    </button>
                    <button
                      onClick={() => handleReject(expense.id)}
                      className={styles.rejectButton}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )) || []}
            </div>
          </div>
        )}

        {activeTab === 'completed' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Completed Transactions</h2>
              <p>Expenses that have been approved and paid</p>
            </div>
            {completedExpenses.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✅</div>
                <h3>No completed transactions</h3>
                <p>Completed expenses will appear here</p>
              </div>
            ) : (
              <div className={styles.expenseList}>
                {completedExpenses.map(payment => (
                  <div key={payment.id} className={styles.expenseCard}>
                    <div className={styles.expenseHeader}>
                      <h4>Payment #{payment.id}</h4>
                      <span className={styles.amount}>${payment.amount.toLocaleString()}</span>
                    </div>
                    <div className={styles.expenseDetails}>
                      <p><strong>Status:</strong> <span className={styles.statusCompleted}>Completed</span></p>
                      <p><strong>Method:</strong> {payment.payment_method}</p>
                      <p><strong>Date:</strong> {new Date(payment.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialWorkflowPage;
