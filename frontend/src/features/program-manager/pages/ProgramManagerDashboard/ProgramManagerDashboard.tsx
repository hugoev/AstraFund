import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import BudgetOptimizer from '../../components/BudgetOptimizer';
import SmartExpenseCapture from '../../components/SmartExpenseCapture';
import styles from './ProgramManagerDashboard.module.css';
import { apiService } from '/src/api';
import { useAuth } from '/src/contexts/AuthContext';
import type { Expense, Grant } from '/src/types';

const ProgramManagerDashboard: React.FC = () => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'capture' | 'optimize' | 'insights'>('overview');
  const { user } = useAuth();

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
      setRecentExpenses(expensesData.slice(0, 5)); // Get 5 most recent
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseCreated = () => {
    loadData();
    toast.success('✅ Expense created automatically!');
  };

  const handleOptimizationApplied = () => {
    loadData();
    toast.success('🎯 Budget optimization applied!');
  };

  const getTotalBudget = () => {
    return grants.reduce((sum, grant) => sum + grant.total_amount, 0);
  };

  const getTotalSpent = () => {
    return recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getComplianceRate = () => {
    const compliantExpenses = recentExpenses.filter(expense => 
      expense.ai_compliance_check?.is_compliant
    );
    return recentExpenses.length > 0 ? (compliantExpenses.length / recentExpenses.length) * 100 : 0;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your AI-powered dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1>🤖 AI Program Manager Dashboard</h1>
          <p>Welcome back, {user?.username}! Your AI co-pilot is ready to streamline your workflow.</p>
        </div>
        
        <div className={styles.quickStats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>${getTotalBudget().toLocaleString()}</div>
            <div className={styles.statLabel}>Total Budget</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>${getTotalSpent().toLocaleString()}</div>
            <div className={styles.statLabel}>Spent</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{getComplianceRate().toFixed(0)}%</div>
            <div className={styles.statLabel}>Compliance Rate</div>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {[
          { key: 'overview', label: '📊 Overview', icon: '📊' },
          { key: 'capture', label: '📄 Smart Capture', icon: '📄' },
          { key: 'optimize', label: '🎯 Budget Optimizer', icon: '🎯' },
          { key: 'insights', label: '🧠 AI Insights', icon: '🧠' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            <div className={styles.overviewGrid}>
              <div className={styles.grantsSection}>
                <h3>📋 Your Grants</h3>
                <div className={styles.grantsList}>
                  {grants.map(grant => (
                    <div key={grant.id} className={styles.grantCard}>
                      <div className={styles.grantHeader}>
                        <h4>{grant.name}</h4>
                        <span className={styles.grantAmount}>
                          ${grant.total_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.grantProgress}>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill}
                            style={{ width: '60%' }} // Mock progress
                          ></div>
                        </div>
                        <span className={styles.progressText}>60% utilized</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.recentSection}>
                <h3>⚡ Recent Activity</h3>
                <div className={styles.activityList}>
                  {recentExpenses.map(expense => (
                    <div key={expense.id} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {expense.ai_compliance_check?.is_compliant ? '✅' : '❌'}
                      </div>
                      <div className={styles.activityContent}>
                        <p className={styles.activityDescription}>{expense.description}</p>
                        <div className={styles.activityMeta}>
                          <span className={styles.activityAmount}>
                            ${expense.amount.toLocaleString()}
                          </span>
                          <span className={styles.activityStatus}>
                            {expense.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'capture' && (
          <SmartExpenseCapture 
            grants={grants}
            onExpenseCreated={handleExpenseCreated}
          />
        )}

        {activeTab === 'optimize' && (
          <BudgetOptimizer 
            grants={grants}
            onOptimizationApplied={handleOptimizationApplied}
          />
        )}

        {activeTab === 'insights' && (
          <div className={styles.insights}>
            <h3>🧠 AI Insights & Recommendations</h3>
            <div className={styles.insightsGrid}>
              <div className={styles.insightCard}>
                <div className={styles.insightIcon}>🎯</div>
                <h4>Spending Pattern Analysis</h4>
                <p>Your expenses show a 23% increase in technology purchases. Consider reallocating budget to match this trend.</p>
              </div>
              
              <div className={styles.insightCard}>
                <div className={styles.insightIcon}>⚠️</div>
                <h4>Compliance Alert</h4>
                <p>3 expenses are approaching compliance limits. Review grant rules to avoid violations.</p>
              </div>
              
              <div className={styles.insightCard}>
                <div className={styles.insightIcon}>💡</div>
                <h4>Optimization Opportunity</h4>
                <p>You could save $2,400 by consolidating similar purchases and negotiating bulk discounts.</p>
              </div>
              
              <div className={styles.insightCard}>
                <div className={styles.insightIcon}>📈</div>
                <h4>Performance Trend</h4>
                <p>Your compliance rate has improved 15% this month. Keep up the great work!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramManagerDashboard;

