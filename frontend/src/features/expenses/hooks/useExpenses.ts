import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../../../api';
import type { Expense } from '../../../types';

export function usePendingExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPendingExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const approveExpense = useCallback(
    async (expenseId: number, approverId: number) => {
      try {
        await apiService.approveExpense(expenseId, approverId);
        // Refetch to get updated list
        await fetchExpenses();
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to approve expense';
        console.error('Error approving expense:', err);
        return { success: false, error: message };
      }
    },
    [fetchExpenses]
  );

  const rejectExpense = useCallback(
    async (expenseId: number, approverId: number) => {
      try {
        await apiService.rejectExpense(expenseId, approverId);
        // Refetch to get updated list
        await fetchExpenses();
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reject expense';
        console.error('Error rejecting expense:', err);
        return { success: false, error: message };
      }
    },
    [fetchExpenses]
  );

  return { 
    expenses,
    pendingExpenses: expenses, // Alias for compatibility with Financial Workflow page
    loading, 
    error, 
    refetch: fetchExpenses, 
    approveExpense, 
    rejectExpense 
  };
}

