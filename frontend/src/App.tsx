import { useEffect, useState } from 'react';
import { apiService } from './api';
import styles from './App.module.css';
import ApprovalQueue from './components/ApprovalQueue';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import GrantDetail from './pages/GrantDetail';
import type { Expense } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [grantId, setGrantId] = useState<number | null>(null);
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [currentUserId] = useState(1); // Mock user ID

  useEffect(() => {
    // Handle URL routing
    const path = window.location.pathname;
    if (path.startsWith('/grant/')) {
      const id = parseInt(path.split('/grant/')[1]);
      if (!isNaN(id)) {
        setGrantId(id);
        setCurrentPage('grant-detail');
      }
    } else if (path === '/approvals') {
      setCurrentPage('approvals');
    } else {
      setCurrentPage('dashboard');
    }

    // Load pending expenses for approval queue
    loadPendingExpenses();
  }, []);

  const loadPendingExpenses = async () => {
    try {
      const expenses = await apiService.getPendingExpenses();
      setPendingExpenses(expenses);
    } catch (error) {
      console.error('Failed to load pending expenses:', error);
    }
  };

  const handleGrantClick = (id: number) => {
    setGrantId(id);
    setCurrentPage('grant-detail');
    window.history.pushState({}, '', `/grant/${id}`);
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setGrantId(null);
    window.history.pushState({}, '', '/');
  };

  const handleApproveExpense = async (expenseId: number) => {
    try {
      await apiService.approveExpense(expenseId, currentUserId);
      // Reload pending expenses
      await loadPendingExpenses();
      alert('Expense approved successfully!');
    } catch (error) {
      console.error('Failed to approve expense:', error);
      alert('Failed to approve expense. Please try again.');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'grant-detail':
        return grantId ? (
          <GrantDetail grantId={grantId} />
        ) : (
          <div className={styles.error}>
            <h2>Grant not found</h2>
            <button onClick={handleBackToDashboard} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        );
      case 'approvals':
        return (
          <div className={styles.container}>
            <ApprovalQueue
              expenses={pendingExpenses}
              onApprove={handleApproveExpense}
              currentUserId={currentUserId}
            />
          </div>
        );
      default:
        return <Dashboard onGrantClick={handleGrantClick} />;
    }
  };

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
