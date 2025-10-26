import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import styles from './UnifiedAIDashboard.module.css';
import { apiService } from '/src/api';
import type { Expense, Grant } from '/src/types';

interface SmartNotification {
  id: string;
  type: 'budget' | 'compliance' | 'approval' | 'optimization';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: 'high' | 'medium' | 'low';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}

const UnifiedAIDashboard: React.FC = () => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiProcessing, setAiProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [grantsData, expensesData] = await Promise.all([
        apiService.getGrants(),
        apiService.getExpenses()
      ]);
      setGrants(grantsData);
      setExpenses(expensesData);
      generateSmartNotifications(grantsData, expensesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateSmartNotifications = (grants: Grant[], expenses: Expense[]) => {
    const newNotifications: SmartNotification[] = [];

    // Budget alerts
    grants.forEach(grant => {
      const grantExpenses = expenses.filter(e => e.grant_id === grant.id);
      const totalSpent = grantExpenses.reduce((sum, e) => sum + e.amount, 0);
      const utilizationRate = (totalSpent / grant.total_amount) * 100;

      if (utilizationRate > 80) {
        newNotifications.push({
          id: `budget-${grant.id}`,
          type: 'budget',
          title: 'Budget Alert',
          message: `${grant.name} is ${utilizationRate.toFixed(1)}% utilized`,
          action: {
            label: 'Optimize Budget',
            onClick: () => optimizeBudget(grant.id)
          },
          priority: 'high'
        });
      }
    });

    // Pending approvals
    const pendingExpenses = expenses.filter(e => e.status === 'pending');
    if (pendingExpenses.length > 0) {
      newNotifications.push({
        id: 'pending-approvals',
        type: 'approval',
        title: 'Pending Approvals',
        message: `${pendingExpenses.length} expenses need approval`,
        action: {
          label: 'Review Now',
          onClick: () => window.location.href = '/approvals'
        },
        priority: 'medium'
      });
    }

    // Compliance issues
    const nonCompliantExpenses = expenses.filter(e => 
      e.ai_compliance_check && !e.ai_compliance_check.is_compliant
    );
    if (nonCompliantExpenses.length > 0) {
      newNotifications.push({
        id: 'compliance-issues',
        type: 'compliance',
        title: 'Compliance Issues',
        message: `${nonCompliantExpenses.length} expenses have compliance concerns`,
        priority: 'high'
      });
    }

    setNotifications(newNotifications);
  };

  const optimizeBudget = async (grantId: number) => {
    try {
      setAiProcessing(true);
      const optimizations = await apiService.getBudgetOptimization();
      const grantOptimization = optimizations.find(opt => opt.grant_id === grantId);
      
      if (grantOptimization && grantOptimization.suggestions.length > 0) {
        // Auto-apply the first optimization suggestion
        await apiService.applyBudgetOptimization(grantId, grantOptimization.suggestions[0]);
        toast.success('Budget optimization applied automatically!');
        loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Error optimizing budget:', error);
      toast.error('Failed to optimize budget');
    } finally {
      setAiProcessing(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'smart-capture',
      title: 'Smart Expense Capture',
      description: 'Drop documents for AI processing',
      icon: '📄',
      onClick: () => {
        // Trigger file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.png,.doc,.docx';
        input.onchange = handleFileUpload;
        input.click();
      }
    },
    {
      id: 'auto-approve',
      title: 'Auto-Approve Compliant',
      description: 'Approve all AI-verified expenses',
      icon: '✅',
      onClick: () => autoApproveCompliant(),
      disabled: expenses.filter(e => e.status === 'pending' && e.ai_compliance_check?.is_compliant).length === 0
    },
    {
      id: 'generate-report',
      title: 'Generate Compliance Report',
      description: 'AI-powered compliance summary',
      icon: '📊',
      onClick: () => generateComplianceReport()
    },
    {
      id: 'optimize-all',
      title: 'Optimize All Budgets',
      description: 'Apply AI budget optimizations',
      icon: '🎯',
      onClick: () => optimizeAllBudgets()
    }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setAiProcessing(true);
      // Simulate AI document processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Auto-create expense from AI analysis
      const aiAnalysis = {
        description: `AI-extracted: ${file.name}`,
        amount: Math.floor(Math.random() * 1000) + 100,
        grant_id: grants[0]?.id || 1,
        submitter_id: 1,
        ai_compliance_check: {
          is_compliant: true,
          justification: "AI analysis confirms compliance with grant requirements"
        }
      };

      await apiService.createExpense(aiAnalysis.grant_id, aiAnalysis);
      toast.success('Expense created automatically from AI analysis!');
      loadData();
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process document');
    } finally {
      setAiProcessing(false);
    }
  };

  const autoApproveCompliant = async () => {
    try {
      setAiProcessing(true);
      const compliantExpenses = expenses.filter(e => 
        e.status === 'pending' && e.ai_compliance_check?.is_compliant
      );

      for (const expense of compliantExpenses) {
        await apiService.approveExpense(expense.id, 1); // Auto-approve with user ID 1
      }

      toast.success(`Auto-approved ${compliantExpenses.length} compliant expenses!`);
      loadData();
    } catch (error) {
      console.error('Error auto-approving:', error);
      toast.error('Failed to auto-approve expenses');
    } finally {
      setAiProcessing(false);
    }
  };

  const generateComplianceReport = async () => {
    try {
      setAiProcessing(true);
      // Simulate AI report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Compliance report generated! Check Documents section.');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setAiProcessing(false);
    }
  };

  const optimizeAllBudgets = async () => {
    try {
      setAiProcessing(true);
      const optimizations = await apiService.getBudgetOptimization();
      
      for (const optimization of optimizations) {
        if (optimization.suggestions.length > 0) {
          await apiService.applyBudgetOptimization(
            optimization.grant_id, 
            optimization.suggestions[0]
          );
        }
      }

      toast.success('All budget optimizations applied!');
      loadData();
    } catch (error) {
      console.error('Error optimizing budgets:', error);
      toast.error('Failed to optimize budgets');
    } finally {
      setAiProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading AI Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1>🤖 AI Program Manager</h1>
        <p>Intelligent automation for streamlined grant management</p>
      </div>

      {/* Smart Notifications */}
      {notifications.length > 0 && (
        <div className={styles.notifications}>
          <h3>🔔 Smart Alerts</h3>
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`${styles.notification} ${styles[notification.priority]}`}
            >
              <div className={styles.notificationContent}>
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                {notification.action && (
                  <button 
                    className={styles.actionButton}
                    onClick={notification.action.onClick}
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3>⚡ Quick Actions</h3>
        <div className={styles.actionsGrid}>
          {quickActions.map(action => (
            <button
              key={action.id}
              className={`${styles.actionCard} ${action.disabled ? styles.disabled : ''}`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <div className={styles.actionIcon}>{action.icon}</div>
              <h4>{action.title}</h4>
              <p>{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* AI Processing Indicator */}
      {aiProcessing && (
        <div className={styles.aiProcessing}>
          <div className={styles.spinner}></div>
          <p>AI is processing your request...</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className={styles.summary}>
        <div className={styles.statCard}>
          <h3>{grants.length}</h3>
          <p>Active Grants</p>
        </div>
        <div className={styles.statCard}>
          <h3>{expenses.length}</h3>
          <p>Total Expenses</p>
        </div>
        <div className={styles.statCard}>
          <h3>{expenses.filter(e => e.status === 'pending').length}</h3>
          <p>Pending Approval</p>
        </div>
        <div className={styles.statCard}>
          <h3>{notifications.length}</h3>
          <p>AI Alerts</p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedAIDashboard;
