import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../../../api';
import type { User } from '../../../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(
    async (user: Omit<User, 'id'>) => {
      try {
        const newUser = await apiService.createUser(user);
        setUsers(prev => [...prev, newUser]);
        return { success: true, user: newUser };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create user';
        console.error('Error creating user:', err);
        return { success: false, error: message };
      }
    },
    []
  );

  return { users, loading, error, refetch: fetchUsers, createUser };
}
