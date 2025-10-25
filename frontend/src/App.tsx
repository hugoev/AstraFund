import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import styles from './App.module.css';
import { GalaxyBackground } from './components/common';
import { Header } from './components/layout';
import { ApprovalsPage, PaymentsPage } from './features/expenses';
import { Dashboard, GrantDetail } from './features/grants';

function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <GalaxyBackground />
        <Header />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/grant/:id" element={<GrantDetail />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(15, 10, 30, 0.95)',
              color: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 80px rgba(139, 92, 246, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#8B5CF6',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
