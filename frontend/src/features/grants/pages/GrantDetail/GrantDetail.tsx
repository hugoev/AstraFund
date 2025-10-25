import React, { useState } from 'react';
import { apiService } from '../../../../api';
import { ExpenseForm } from '../../../expenses';
import { LoadingSpinner, ErrorMessage } from '../../../../components/common';
import { useGrant } from '../../hooks';
import styles from './GrantDetail.module.css';

interface GrantDetailProps {
  grantId: number;
}

const GrantDetail: React.FC<GrantDetailProps> = ({ grantId }) => {
  const { grant, loading, error, refetch } = useGrant(grantId);
  const [currentUserId] = useState(1); // Mock user ID

  const handleComplianceCheck = async (expense: { description: string; amount: number }) => {
    if (!grant) return { is_compliant: false, justification: 'Grant not loaded' };

    try {
      const result = await apiService.checkCompliance({
        grant_rules: grant.rules_text,
        expense_description: expense.description,
        expense_amount: expense.amount
      });
      return result;
    } catch (error) {
      console.error('Compliance check failed:', error);
      return { is_compliant: false, justification: 'Compliance check failed' };
    }
  };

  const handleExpenseSubmit = async (expense: { description: string; amount: number; submitter_id: number }) => {
    try {
      // First run compliance check
      const complianceResult = await handleComplianceCheck({
        description: expense.description,
        amount: expense.amount
      });

      // Submit expense with compliance check result
      await apiService.createExpense(grantId, {
        ...expense,
        ai_compliance_check: complianceResult
      });

      // Reload grant to show new expense
      await refetch();
    } catch (error) {
      console.error('Failed to submit expense:', error);
      alert('Failed to submit expense. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading grant details..." />;
  }

  if (error || !grant) {
    return <ErrorMessage message={error || 'Grant not found'} onRetry={refetch} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => window.history.back()} className={styles.backButton}>
          ← Back to Dashboard
        </button>
        <h1 className={styles.title}>{grant.name}</h1>
        <div className={styles.grantInfo}>
          <div className={styles.amount}>${grant.total_amount.toLocaleString()}</div>
          <div className={styles.status}>Active Grant</div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.rules}>
          <h3>Grant Rules</h3>
          <p className={styles.rulesText}>{grant.rules_text}</p>
        </div>

        <ExpenseForm
          grant={grant}
          onSubmit={handleExpenseSubmit}
          onComplianceCheck={handleComplianceCheck}
          currentUserId={currentUserId}
        />

        <div className={styles.expenses}>
          <h3>Recent Expenses</h3>
          {grant.expenses.length === 0 ? (
            <div className={styles.emptyExpenses}>
              <p>No expenses submitted yet.</p>
            </div>
          ) : (
            <div className={styles.expensesList}>
              {grant.expenses.map((expense) => (
                <div key={expense.id} className={styles.expenseItem}>
                  <div className={styles.expenseHeader}>
                    <h4 className={styles.expenseDescription}>{expense.description}</h4>
                    <div className={styles.expenseAmount}>${expense.amount.toLocaleString()}</div>
                  </div>
                  <div className={styles.expenseStatus}>
                    Status: <span className={`${styles.status} ${styles[expense.status]}`}>
                      {expense.status}
                    </span>
                  </div>
                  {expense.ai_compliance_check && (
                    <div className={`${styles.compliance} ${expense.ai_compliance_check.is_compliant ? styles.compliant : styles.nonCompliant}`}>
                      <div className={styles.complianceStatus}>
                        {expense.ai_compliance_check.is_compliant ? '✅ AI Approved' : '❌ AI Rejected'}
                      </div>
                      <p className={styles.justification}>{expense.ai_compliance_check.justification}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrantDetail;
