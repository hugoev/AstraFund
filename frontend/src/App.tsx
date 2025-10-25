import { useEffect, useState } from 'react';
import styles from './App.module.css';
import ApprovalQueue from './components/ApprovalQueue';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import GrantDetail from './pages/GrantDetail';
import { usePendingExpenses } from './hooks/useExpenses';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [grantId, setGrantId] = useState<number | null>(null);
  const [currentUserId] = useState(1); // Mock user ID
  const { expenses: pendingExpenses, approveExpense } = usePendingExpenses();

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
  }, []);

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
    const result = await approveExpense(expenseId, currentUserId);
    if (result.success) {
      alert('Expense approved successfully!');
    } else {
      alert(`Failed to approve expense: ${result.error}`);
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
