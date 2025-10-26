import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../../../api';
import { ExpenseForm, PaymentForm } from '../../../expenses';
import { useGrant } from '../../hooks';
import styles from './GrantDetail.module.css';
import { ErrorMessage, LoadingSpinner } from '/src/components/common';
import { useAuth } from '/src/contexts/AuthContext';

const GrantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const grantId = parseInt(id || '0');
  const { grant, loading, error, refetch } = useGrant(grantId);
  const { user, hasPermission } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<{ id: number; amount: number } | null>(null);
  const [expenseFilter, setExpenseFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');

  const handleExpenseSubmit = async (expense: { description: string; amount: number; submitter_id: number }) => {
    try {
      // Submit expense - compliance checking is handled by ExpenseForm's Co-Pilot Assistant
      await apiService.createExpense(grantId, {
        ...expense,
        grant_id: grantId,
        created_at: new Date().toISOString()
      });

      toast.success('Expense submitted successfully!');

      // Reload grant to show new expense
      await refetch();
    } catch (error) {
      console.error('Failed to submit expense:', error);
      toast.error('Failed to submit expense. Please try again.');
    }
  };

  const handlePaymentClick = (expense: { id: number; amount: number }) => {
    setSelectedExpense(expense);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (payment: { expense_id: number; amount: number; payment_method: string }) => {
    try {
      await apiService.createPayment(payment);
      toast.success('Payment created successfully!');
      setShowPaymentForm(false);
      setSelectedExpense(null);
      await refetch(); // Reload grant to show updated expense status
    } catch (error) {
      console.error('Failed to create payment:', error);
      toast.error('Failed to create payment. Please try again.');
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedExpense(null);
  };

  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    if (!grant) return null;

    const totalSpent = grant.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = grant.total_amount - totalSpent;
    const utilizationPercentage = (totalSpent / grant.total_amount) * 100;
    
    const expensesByStatus = grant.expenses.reduce((acc, expense) => {
      acc[expense.status] = (acc[expense.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const compliantExpenses = grant.expenses.filter(expense => 
      expense.ai_compliance_check?.is_compliant
    ).length;
    const complianceRate = grant.expenses.length > 0 ? (compliantExpenses / grant.expenses.length) * 100 : 0;

    return {
      totalSpent,
      remaining,
      utilizationPercentage,
      expensesByStatus,
      complianceRate,
      totalExpenses: grant.expenses.length
    };
  }, [grant]);

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    if (!grant) return [];
    
    let filtered = grant.expenses;
    
    if (expenseFilter !== 'all') {
      filtered = filtered.filter(expense => expense.status === expenseFilter);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [grant, expenseFilter, sortBy]);

  if (loading) {
    return <LoadingSpinner message="Loading grant details..." />;
  }

  if (error || !grant) {
    return <ErrorMessage message={error || 'Grant not found'} onRetry={refetch} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          ← Back to Dashboard
        </button>
        <h1 className={styles.title}>{grant.name}</h1>
        <div className={styles.grantInfo}>
          <div className={styles.amount}>${grant.total_amount.toLocaleString()}</div>
          <div className={styles.status}>Active Grant</div>
        </div>
      </div>

      {/* Enhanced Analytics Dashboard */}
      {analytics && (
        <div className={styles.analyticsDashboard}>
          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <div className={styles.cardHeader}>
                <h3>Budget Overview</h3>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${Math.min(analytics.utilizationPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Total Budget</span>
                  <span className={styles.metricValue}>${grant.total_amount.toLocaleString()}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Spent</span>
                  <span className={styles.metricValue}>${analytics.totalSpent.toLocaleString()}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Remaining</span>
                  <span className={styles.metricValue}>${analytics.remaining.toLocaleString()}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Utilization</span>
                  <span className={styles.metricValue}>{analytics.utilizationPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className={styles.analyticsCard}>
              <div className={styles.cardHeader}>
                <h3>Expense Status</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.statusGrid}>
                  <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>Total Expenses</span>
                    <span className={styles.statusValue}>{analytics.totalExpenses}</span>
                  </div>
                  <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>Approved</span>
                    <span className={styles.statusValue}>{analytics.expensesByStatus.approved || 0}</span>
                  </div>
                  <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>Pending</span>
                    <span className={styles.statusValue}>{analytics.expensesByStatus.pending || 0}</span>
                  </div>
                  <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>Rejected</span>
                    <span className={styles.statusValue}>{analytics.expensesByStatus.rejected || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.analyticsCard}>
              <div className={styles.cardHeader}>
                <h3>AI Compliance</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.complianceScore}>
                  <div className={styles.scoreCircle}>
                    <span className={styles.scoreValue}>{analytics.complianceRate.toFixed(0)}%</span>
                  </div>
                  <div className={styles.scoreLabel}>Compliance Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.rules}>
          <h3>Grant Rules</h3>
          <p className={styles.rulesText}>{grant.rules_text}</p>
        </div>

        <ExpenseForm
          grant={grant}
          onSubmit={handleExpenseSubmit}
          currentUserId={user?.id || 1}
        />

        <div className={styles.expenses}>
          <div className={styles.expensesHeader}>
            <h3>Expenses</h3>
            <div className={styles.expensesControls}>
              <div className={styles.filterGroup}>
                <label htmlFor="expense-filter">Filter:</label>
                <select 
                  id="expense-filter"
                  value={expenseFilter}
                  onChange={(e) => setExpenseFilter(e.target.value as any)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Expenses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className={styles.sortGroup}>
                <label htmlFor="expense-sort">Sort by:</label>
                <select 
                  id="expense-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={styles.sortSelect}
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
          
          {filteredExpenses.length === 0 ? (
            <div className={styles.emptyExpenses}>
              <p>{expenseFilter === 'all' ? 'No expenses submitted yet.' : `No ${expenseFilter} expenses found.`}</p>
            </div>
          ) : (
            <div className={styles.expensesList}>
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className={styles.expenseItem}>
                  <div className={styles.expenseHeader}>
                    <h4 className={styles.expenseDescription}>{expense.description}</h4>
                    <div className={styles.expenseAmount}>${expense.amount.toLocaleString()}</div>
                  </div>
                  <div className={styles.expenseStatus}>
                    <div className={styles.statusRow}>
                      <span className={styles.statusLabel}>Status:</span>
                      <span className={`${styles.status} ${styles[expense.status]}`}>
                        {expense.status}
                      </span>
                    </div>
                    {expense.ai_compliance_check && (
                      <div className={styles.complianceRow}>
                        <span className={styles.complianceLabel}>AI Compliance:</span>
                        <span className={`${styles.complianceStatus} ${expense.ai_compliance_check.is_compliant ? styles.compliant : styles.nonCompliant}`}>
                          {expense.ai_compliance_check.is_compliant ? '✅ Approved' : '❌ Rejected'}
                        </span>
                      </div>
                    )}
                    {expense.ai_compliance_check?.justification && (
                      <div className={styles.justification}>
                        <span className={styles.justificationLabel}>Reason:</span>
                        <span className={styles.justificationText}>{expense.ai_compliance_check.justification}</span>
                      </div>
                    )}
                  </div>
                  {expense.status === 'approved' && hasPermission('process_payments') && (
                    <div className={styles.paymentActions}>
                      <button
                        onClick={() => handlePaymentClick({ id: expense.id, amount: expense.amount })}
                        className={styles.paymentButton}
                      >
                        💳 Process Payment
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPaymentForm && selectedExpense && (
        <PaymentForm
          expenseId={selectedExpense.id}
          amount={selectedExpense.amount}
          onSubmit={handlePaymentSubmit}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
};

export default GrantDetail;
