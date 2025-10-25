import React from 'react';
import { MetricCard } from '../../components';
import { useAnalytics } from '../../hooks';
import styles from './AnalyticsPage.module.css';
import { ErrorMessage, LoadingSpinner } from '/src/components/common';

const AnalyticsPage: React.FC = () => {
  const { analytics, loading, error, refetch } = useAnalytics();

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics Dashboard</h1>
        <p className={styles.subtitle}>
          Comprehensive overview of your grant management system
        </p>
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard
          title="Total Grants"
          value={analytics.totalGrants}
          icon="📊"
          color="primary"
        />
        <MetricCard
          title="Total Users"
          value={analytics.totalUsers}
          icon="👥"
          color="info"
        />
        <MetricCard
          title="Total Expenses"
          value={analytics.totalExpenses}
          icon="💰"
          color="success"
        />
        <MetricCard
          title="Total Payments"
          value={analytics.totalPayments}
          icon="💳"
          color="warning"
        />
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard
          title="Total Spent"
          value={formatCurrency(analytics.totalSpent)}
          icon="💸"
          color="danger"
        />
        <MetricCard
          title="Pending Expenses"
          value={analytics.pendingExpenses}
          icon="⏳"
          color="warning"
        />
        <MetricCard
          title="Pending Payments"
          value={analytics.pendingPayments}
          icon="🔄"
          color="info"
        />
        <MetricCard
          title="Approved Expenses"
          value={analytics.approvedExpenses}
          icon="✅"
          color="success"
        />
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard
          title="Rejected Expenses"
          value={analytics.rejectedExpenses}
          icon="❌"
          color="danger"
        />
        <MetricCard
          title="Completed Payments"
          value={analytics.completedPayments}
          icon="🎉"
          color="success"
        />
        <MetricCard
          title="Failed Payments"
          value={analytics.failedPayments}
          icon="⚠️"
          color="danger"
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
