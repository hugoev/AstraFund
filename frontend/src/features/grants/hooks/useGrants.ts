import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../api';
import type { Grant, GrantWithExpenses } from '../../../types';

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

export function useGrant(grantId: number | null) {
  const [grant, setGrant] = useState<GrantWithExpenses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrant = useCallback(async () => {
    if (!grantId) {
      setGrant(null);
      setLoading(false);
      return;
    }

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
    fetchGrant();
  }, [fetchGrant]);

  return { grant, loading, error, refetch: fetchGrant };
}

