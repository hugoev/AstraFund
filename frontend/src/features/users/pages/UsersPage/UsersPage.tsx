import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { UserCard, UserForm } from '../../components';
import { useUsers } from '../../hooks';
import styles from './UsersPage.module.css';
import { ErrorMessage, LoadingSpinner } from '/src/components/common';

const UsersPage: React.FC = () => {
  const { users, loading, error, refetch, createUser } = useUsers();
  const [showUserForm, setShowUserForm] = useState(false);

  const handleCreateUser = async (userData: { username: string; role: string }) => {
    const result = await createUser(userData);
    if (result.success) {
      toast.success(`User "${userData.username}" created successfully!`);
      setShowUserForm(false);
    } else {
      toast.error(`Failed to create user: ${result.error}`);
    }
  };

  const handleUserClick = (user: any) => {
    // Future: Navigate to user detail page
    console.log('User clicked:', user);
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>
            Manage system users and their roles
          </p>
        </div>
        <button
          onClick={() => setShowUserForm(true)}
          className={styles.createButton}
        >
          <span className={styles.buttonIcon}>+</span>
          Create User
        </button>
      </div>

      {users.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>👥</div>
          <h2>No Users Yet</h2>
          <p>Create your first user to get started.</p>
          <button
            onClick={() => setShowUserForm(true)}
            className={styles.emptyButton}
          >
            Create First User
          </button>
        </div>
      ) : (
        <div className={styles.usersGrid}>
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onClick={() => handleUserClick(user)}
            />
          ))}
        </div>
      )}

      {showUserForm && (
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowUserForm(false)}
        />
      )}
    </div>
  );
};

export default UsersPage;
