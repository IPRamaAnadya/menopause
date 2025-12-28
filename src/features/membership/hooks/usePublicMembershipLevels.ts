import { useState, useEffect } from 'react';

export interface PublicMembershipLevel {
  id: number;
  name: string;
  priority: number;
  price: number;
  duration_days: number;
  slug: string;
}

export function usePublicMembershipLevels() {
  const [membershipLevels, setMembershipLevels] = useState<PublicMembershipLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembershipLevels = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/public/membership-levels');
        
        if (!response.ok) {
          throw new Error('Failed to fetch membership levels');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setMembershipLevels(result.data);
        } else {
          throw new Error(result.error?.message || 'Failed to fetch membership levels');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipLevels();
  }, []);

  return { membershipLevels, loading, error };
}
