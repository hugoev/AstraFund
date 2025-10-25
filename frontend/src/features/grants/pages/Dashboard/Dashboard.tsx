import React from 'react';
import { GrantCard } from '../../components';
import { LoadingSpinner, ErrorMessage } from '../../../../components/common';
import { useGrants } from '../../hooks';
import styles from './Dashboard.module.css';

interface DashboardProps {
  onGrantClick?: (grantId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGrantClick }) => {
  const { grants, loading, error, refetch } = useGrants();

  const handleGrantClick = (grantId: number) => {
    if (onGrantClick) {
      onGrantClick(grantId);
    } else {
      // Fallback navigation
      window.location.href = `/grant/${grantId}`;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading grants..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Grant Dashboard</h1>
        <p className={styles.subtitle}>
          Manage your grants and track compliance
        </p>
      </div>

      {grants.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🚀</div>
          <h2>No Grants Yet</h2>
          <p>Create your first grant to get started with AstraFund.</p>
        </div>
      ) : (
        <div className={styles.grantsGrid}>
          {grants.map((grant) => (
            <GrantCard
              key={grant.id}
              grant={grant}
              onClick={() => handleGrantClick(grant.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
