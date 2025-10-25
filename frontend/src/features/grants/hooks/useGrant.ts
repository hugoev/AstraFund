import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../../../api';
import type { GrantWithExpenses } from '../../../types';

export function useGrant(grantId: number) {
  const [grant, setGrant] = useState<GrantWithExpenses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getGrant(grantId);
      setGrant(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grant');
      console.error('Error fetching grant:', err);
    } finally {
      setLoading(false);
    }
  }, [grantId]);

  useEffect(() => {
    if (grantId) {
      fetchGrant();
    }
  }, [grantId, fetchGrant]);

  return { grant, loading, error, refetch: fetchGrant };
}
