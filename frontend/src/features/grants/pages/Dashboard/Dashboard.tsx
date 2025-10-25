import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GrantCard } from '../../components';
import { LoadingSpinner, ErrorMessage } from '../../../../components/common';
import { useGrants } from '../../hooks';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { grants, loading, error, refetch } = useGrants();
  const navigate = useNavigate();

  const handleGrantClick = (grantId: number) => {
    navigate(`/grant/${grantId}`);
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
