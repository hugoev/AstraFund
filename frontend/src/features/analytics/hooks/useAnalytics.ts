import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../../../api';

interface AnalyticsData {
  overview: {
    total_grants: number;
    total_users: number;
    total_expenses: number;
    total_payments: number;
    total_grant_amount: number;
    total_spent: number;
    remaining_budget: number;
    recent_expenses: number;
    recent_payments: number;
    avg_expense_amount: number;
    avg_payment_amount: number;
    compliance_rate: number;
  };
  expense_breakdown: Record<string, number>;
  payment_breakdown: Record<string, number>;
}

interface TrendsData {
  expense_trends: Array<{
    date: string;
    count: number;
    total_amount: number;
  }>;
  payment_trends: Array<{
    date: string;
    count: number;
    total_amount: number;
  }>;
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (days: number = 30) => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, trendsData] = await Promise.all([
        apiService.getAnalyticsOverview(),
        apiService.getAnalyticsTrends(days)
      ]);

      setAnalytics(overviewData);
      setTrends(trendsData);
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

  return { 
    analytics, 
    trends, 
    loading, 
    error, 
    refetch: fetchAnalytics 
  };
}
