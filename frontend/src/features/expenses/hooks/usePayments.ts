import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../../../api';
import type { Payment } from '../../../types';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPayments();
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const processPayment = useCallback(
    async (paymentId: number) => {
      try {
        const result = await apiService.processPayment(paymentId);
        // Refetch to get updated list
        await fetchPayments();
        return { success: true, result };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to process payment';
        console.error('Error processing payment:', err);
        return { success: false, error: message };
      }
    },
    [fetchPayments]
  );

  const cancelPayment = useCallback(
    async (paymentId: number) => {
      try {
        await apiService.cancelPayment(paymentId);
        // Refetch to get updated list
        await fetchPayments();
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cancel payment';
        console.error('Error cancelling payment:', err);
        return { success: false, error: message };
      }
    },
    [fetchPayments]
  );

  const createPayment = useCallback(
    async (payment: Omit<Payment, 'id' | 'status' | 'created_at'>) => {
      try {
        const newPayment = await apiService.createPayment(payment);
        // Refetch to get updated list
        await fetchPayments();
        return { success: true, payment: newPayment };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create payment';
        console.error('Error creating payment:', err);
        return { success: false, error: message };
      }
    },
    [fetchPayments]
  );

  return { 
    payments, 
    loading, 
    error, 
    refetch: fetchPayments, 
    processPayment, 
    cancelPayment,
    createPayment
  };
}
