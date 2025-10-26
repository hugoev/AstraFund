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
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            color="primary"
          />
          <MetricCard
            title="Total Users"
            value={analytics.overview.total_users}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            color="info"
          />
          <MetricCard
            title="Total Expenses"
            value={analytics.overview.total_expenses}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 8H10.5C10.1022 8 9.72064 8.15804 9.43934 8.43934C9.15804 8.72064 9 9.10218 9 9.5C9 9.89782 9.15804 10.2794 9.43934 10.5607C9.72064 10.842 10.1022 11 10.5 11H13.5C13.8978 11 14.2794 11.158 14.5607 11.4393C14.842 11.7206 15 12.1022 15 12.5C15 12.8978 14.842 13.2794 14.5607 13.5607C14.2794 13.842 13.8978 14 13.5 14H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
            color="success"
          />
          <MetricCard
            title="Total Payments"
            value={analytics.overview.total_payments}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
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
