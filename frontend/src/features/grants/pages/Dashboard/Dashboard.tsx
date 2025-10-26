import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { GrantCard, GrantForm } from '../../components';
import { useGrantManagement, useGrants } from '../../hooks';
import styles from './Dashboard.module.css';
import { ErrorMessage, LoadingSpinner } from '/src/components/common';
import { useAuth } from '/src/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { grants, loading, error, refetch } = useGrants();
  const { createGrant } = useGrantManagement();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showGrantForm, setShowGrantForm] = useState(false);

  const handleGrantClick = (grantId: number) => {
    navigate(`/grant/${grantId}`);
  };

  const handleCreateGrant = async (grantData: { name: string; total_amount: number; rules_text: string }) => {
    const result = await createGrant(grantData);
    if (result.success) {
      toast.success(`Grant "${grantData.name}" created successfully!`);
      setShowGrantForm(false);
      await refetch();
    } else {
      toast.error(`Failed to create grant: ${result.error}`);
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
        <div className={styles.titleSection}>
          <h1>Grant Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your grants and track compliance
          </p>
        </div>
        {hasPermission('create_grants') && (
          <button
            onClick={() => setShowGrantForm(true)}
            className={styles.createButton}
          >
            <span className={styles.buttonIcon}>+</span>
            Create Grant
          </button>
        )}
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

      {showGrantForm && (
        <GrantForm
          onSubmit={handleCreateGrant}
          onCancel={() => setShowGrantForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
