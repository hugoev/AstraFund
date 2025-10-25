import React, { useEffect, useState } from 'react';
import { apiService } from '../api';
import GrantCard from '../components/GrantCard';
import { Grant } from '../types';
import styles from './Dashboard.module.css';

interface DashboardProps {
  onGrantClick?: (grantId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGrantClick }) => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGrants();
  }, []);

  const loadGrants = async () => {
    try {
      setLoading(true);
      const grantsData = await apiService.getGrants();
      setGrants(grantsData);
    } catch (err) {
      setError('Failed to load grants');
      console.error('Error loading grants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantClick = (grantId: number) => {
    if (onGrantClick) {
      onGrantClick(grantId);
    } else {
      // Fallback navigation
      window.location.href = `/grant/${grantId}`;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading grants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={loadGrants} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
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
