import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../../../api';

interface AnalyticsData {
  totalGrants: number;
  totalExpenses: number;
  totalPayments: number;
  totalUsers: number;
  totalSpent: number;
  pendingExpenses: number;
  pendingPayments: number;
  approvedExpenses: number;
  rejectedExpenses: number;
  completedPayments: number;
  failedPayments: number;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [grants, expenses, payments, users] = await Promise.all([
        apiService.getGrants(),
        apiService.getPendingExpenses(),
        apiService.getPayments(),
        apiService.getUsers()
      ]);

      const allExpenses = expenses; // This would need to be expanded to get all expenses
      const totalSpent = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const analyticsData: AnalyticsData = {
        totalGrants: grants.length,
        totalExpenses: allExpenses.length,
        totalPayments: payments.length,
        totalUsers: users.length,
        totalSpent,
        pendingExpenses: allExpenses.filter(e => e.status === 'pending').length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        approvedExpenses: allExpenses.filter(e => e.status === 'approved').length,
        rejectedExpenses: allExpenses.filter(e => e.status === 'rejected').length,
        completedPayments: payments.filter(p => p.status === 'completed').length,
        failedPayments: payments.filter(p => p.status === 'failed').length,
      };

      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}
