import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './LoginForm.module.css';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { username: 'john_manager', password: 'password123', role: 'Program Manager' },
    { username: 'sarah_finance', password: 'password123', role: 'Finance Director' },
    { username: 'admin', password: 'admin123', role: 'Administrator' }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🚀</span>
            <h1 className={styles.title}>AstraFund</h1>
          </div>
          <p className={styles.subtitle}>Financial Compliance Co-Pilot</p>
        </div>

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
              placeholder="Enter your username"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !username || !password}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.demoSection}>
          <h3 className={styles.demoTitle}>Demo Credentials</h3>
          <div className={styles.demoCredentials}>
            {demoCredentials.map((cred, index) => (
              <div key={index} className={styles.demoCredential}>
                <div className={styles.credentialInfo}>
                  <span className={styles.role}>{cred.role}</span>
                  <span className={styles.username}>{cred.username}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUsername(cred.username);
                    setPassword(cred.password);
                  }}
                  className={styles.useCredential}
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
