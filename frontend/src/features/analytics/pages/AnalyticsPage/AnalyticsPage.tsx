import React, { useState } from 'react';
import { Chart, Chatbot, ChatbotToggle, MetricCard, ProgressBar, TimePeriodSelector } from '../../components';
import { useAnalytics } from '../../hooks';
import styles from './AnalyticsPage.module.css';
import { ErrorMessage, LoadingSpinner } from '/src/components/common';

const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const { analytics, trends, loading, error, refetch } = useAnalytics();

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    refetch(parseInt(period));
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => refetch(parseInt(selectedPeriod))} />;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyCompact = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Analytics Dashboard</h1>
          <p className={styles.subtitle}>
            Comprehensive overview of your grant management system
          </p>
        </div>
        <TimePeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {/* Key Metrics Grid */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Key Metrics</h2>
        <div className={styles.metricsGrid}>
          <MetricCard
            title="Total Grants"
            value={analytics.overview.total_grants}
            icon="📊"
            color="primary"
          />
          <MetricCard
            title="Total Users"
            value={analytics.overview.total_users}
            icon="👥"
            color="info"
          />
          <MetricCard
            title="Total Expenses"
            value={analytics.overview.total_expenses}
            icon="💰"
            color="success"
          />
          <MetricCard
            title="Total Payments"
            value={analytics.overview.total_payments}
            icon="💳"
            color="warning"
          />
        </div>
      </div>

      {/* Financial Overview */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Financial Overview</h2>
        <div className={styles.financialGrid}>
          <div className={styles.financialCard}>
            <h3 className={styles.cardTitle}>Budget Utilization</h3>
            <ProgressBar
              label="Total Budget"
              current={analytics.overview.total_spent}
              total={analytics.overview.total_grant_amount}
              color="primary"
              formatValue={formatCurrencyCompact}
            />
          </div>
          
          <div className={styles.financialCard}>
            <h3 className={styles.cardTitle}>Recent Activity</h3>
            <div className={styles.activityMetrics}>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>Recent Expenses:</span>
                <span className={styles.activityValue}>{analytics.overview.recent_expenses}</span>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>Recent Payments:</span>
                <span className={styles.activityValue}>{analytics.overview.recent_payments}</span>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>Compliance Rate:</span>
                <span className={styles.activityValue}>{analytics.overview.compliance_rate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trends Charts */}
      {trends && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Trends & Patterns</h2>
          <p style={{color: '#888', fontSize: '0.9rem', marginBottom: '1rem'}}>
            Expense data points: {trends.expense_trends?.length || 0} | 
            Payment data points: {trends.payment_trends?.length || 0}
          </p>
          <div className={styles.chartsGrid}>
            <Chart
              title="Expense Trends"
              data={trends.expense_trends || []}
              type="bar"
              showAmount={true}
            />
            <Chart
              title="Payment Trends"
              data={trends.payment_trends || []}
              type="bar"
              showAmount={true}
            />
          </div>
        </div>
      )}

      {/* Status Breakdowns */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Status Breakdowns</h2>
        <div className={styles.breakdownGrid}>
          <div className={styles.breakdownCard}>
            <h3 className={styles.cardTitle}>Expense Status</h3>
            <div className={styles.statusList}>
              {Object.entries(analytics.expense_breakdown).map(([status, count]) => (
                <div key={status} className={styles.statusItem}>
                  <span className={styles.statusLabel}>{status}:</span>
                  <span className={styles.statusValue}>{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.breakdownCard}>
            <h3 className={styles.cardTitle}>Payment Status</h3>
            <div className={styles.statusList}>
              {Object.entries(analytics.payment_breakdown).map(([status, count]) => (
                <div key={status} className={styles.statusItem}>
                  <span className={styles.statusLabel}>{status}:</span>
                  <span className={styles.statusValue}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Performance Metrics</h2>
        <div className={styles.metricsGrid}>
          <MetricCard
            title="Average Expense"
            value={formatCurrency(analytics.overview.avg_expense_amount)}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 7H21V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            color="info"
          />
          <MetricCard
            title="Average Payment"
            value={formatCurrency(analytics.overview.avg_payment_amount)}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            color="success"
          />
          <MetricCard
            title="Remaining Budget"
            value={formatCurrency(analytics.overview.remaining_budget)}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            color="warning"
          />
          <MetricCard
            title="Compliance Rate"
            value={`${analytics.overview.compliance_rate}%`}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            color="primary"
          />
        </div>
      </div>

      {/* AI Chatbot */}
      <Chatbot isOpen={isChatbotOpen} onToggle={toggleChatbot} />
      <div className={styles.chatbotToggleWrapper}>
        <ChatbotToggle onClick={toggleChatbot} isOpen={isChatbotOpen} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
