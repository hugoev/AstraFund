import React from 'react';
import type { User } from '../../../../types';
import styles from './UserCard.module.css';

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'finance director':
        return styles.financeDirector;
      case 'program manager':
        return styles.programManager;
      default:
        return styles.defaultRole;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'finance director':
        return '💰';
      case 'program manager':
        return '👨‍💼';
      default:
        return '👤';
    }
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {getRoleIcon(user.role)}
        </div>
        <div className={styles.info}>
          <h3 className={styles.username}>{user.username}</h3>
          <span className={`${styles.role} ${getRoleColor(user.role)}`}>
            {user.role}
          </span>
        </div>
      </div>
      <div className={styles.footer}>
        <span className={styles.createdAt}>
          Created: {new Date(user.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default UserCard;
