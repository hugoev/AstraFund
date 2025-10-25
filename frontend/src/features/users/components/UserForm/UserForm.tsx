import React, { useState } from 'react';
import styles from './UserForm.module.css';
import { ConfirmDialog } from '/src/components/common';

interface UserFormProps {
  onSubmit: (user: { username: string; role: string }) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, onCancel }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Program Manager');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = () => {
    onSubmit({ username: username.trim(), role });
    setShowConfirm(false);
  };

  const roles = [
    'Program Manager',
    'Finance Director',
    'Executive Director',
    'Project Coordinator',
    'Administrator'
  ];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Create New User</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>
              Role
            </label>
            <select
              id="role"
              className={styles.select}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {roles.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!username.trim()}
            >
              Create User
            </button>
          </div>
        </form>

        <ConfirmDialog
          isOpen={showConfirm}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          title="Create User"
          message={`Are you sure you want to create user "${username}" with role "${role}"?`}
          confirmText="Create"
          cancelText="Back"
          confirmButtonClass={styles.confirmCreate}
        />
      </div>
    </div>
  );
};

export default UserForm;
