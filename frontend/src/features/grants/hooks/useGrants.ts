import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../../../api';
import type { Grant } from '../../../types';

export function useGrants() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getGrants();
      setGrants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grants');
      console.error('Error fetching grants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  return { grants, loading, error, refetch: fetchGrants };
}


