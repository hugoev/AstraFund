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
          <h1>AI Program Manager Dashboard</h1>
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
          { key: 'overview', label: 'Overview', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
          )},
          { key: 'capture', label: 'Smart Capture', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          )},
          { key: 'optimize', label: 'Budget Optimizer', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
            </svg>
          )},
          { key: 'insights', label: 'AI Insights', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"/>
            </svg>
          )}
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
                <h3>Your Grants</h3>
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
                <h3>Recent Activity</h3>
                <div className={styles.activityList}>
                  {recentExpenses.map(expense => (
                    <div key={expense.id} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {expense.ai_compliance_check?.is_compliant ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                          </svg>
                        )}
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
            <h3>AI Insights & Recommendations</h3>
            <div className={styles.insightsGrid}>
              <div className={styles.insightCard}>
                <div className={styles.insightIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                </div>
                <h4>Spending Pattern Analysis</h4>
                <p>Your expenses show a 23% increase in technology purchases. Consider reallocating budget to match this trend.</p>
              </div>
              
              <div className={styles.insightCard}>
                <div className={styles.insightIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                  </svg>
                </div>
                <h4>Compliance Alert</h4>
                <p>3 expenses are approaching compliance limits. Review grant rules to avoid violations.</p>
              </div>
              
              <div className={styles.insightCard}>
                <div className={styles.insightIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21Z"/>
                  </svg>
                </div>
                <h4>Optimization Opportunity</h4>
                <p>You could save $2,400 by consolidating similar purchases and negotiating bulk discounts.</p>
              </div>
              
              <div className={styles.insightCard}>
                <div className={styles.insightIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                  </svg>
                </div>
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