import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#gradient1)" />
              <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="url(#gradient2)" />
              <defs>
                <linearGradient id="gradient1" x1="2" y1="7" x2="22" y2="7">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="gradient2" x1="2" y1="17" x2="22" y2="17">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className={styles.logoText}>
            <h1 className={styles.title}>AstraFund</h1>
            <p className={styles.subtitle}>★ Financial Compliance Co-Pilot ★</p>
          </div>
        </Link>
        <nav className={styles.nav}>
          <Link 
            to="/" 
            className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
          >
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/approvals" 
            className={`${styles.navLink} ${location.pathname === '/approvals' ? styles.active : ''}`}
          >
            <span>Approvals</span>
          </Link>
          <button className={styles.userButton}>
            <span className={styles.userInitial}>A</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
