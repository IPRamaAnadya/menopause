'use client';

import { useState, useEffect } from 'react';

interface UserStats {
  totalUsers: number;
  activeToday: number;
  premiumMembers: number;
  administrators: number;
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeToday: 0,
    premiumMembers: 0,
    administrators: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      const result = await response.json();
      
      // Handle new API response structure with data wrapper
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch user stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
