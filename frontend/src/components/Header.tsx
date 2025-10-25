import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1 className={styles.title}>AstraFund</h1>
          <p className={styles.subtitle}>Financial Compliance Co-Pilot</p>
        </div>
        <nav className={styles.nav}>
          <a href="/" className={styles.navLink}>Dashboard</a>
          <a href="/approvals" className={styles.navLink}>Approvals</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
