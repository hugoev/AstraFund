import { useCallback, useState } from 'react';
import { apiService } from '../../../api';
import type { Grant } from '../../../types';

export function useGrantManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGrant = useCallback(
    async (grant: Omit<Grant, 'id'>) => {
      try {
        setLoading(true);
        setError(null);
        const newGrant = await apiService.createGrant(grant);
        return { success: true, grant: newGrant };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create grant';
        setError(message);
        console.error('Error creating grant:', err);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createGrant, loading, error };
}
