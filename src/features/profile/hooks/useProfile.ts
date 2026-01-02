import { useState, useEffect } from 'react';
import { UserProfile } from '../types';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/member/profile');
      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch profile');
      }
    } catch (err) {
      setError('An error occurred while fetching profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    profession?: string;
    is_hidden?: boolean;
  }) => {
    try {
      setError(null);
      const response = await fetch('/api/member/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        return { success: true, data: data.data };
      } else {
        setError(data.error?.message || 'Failed to update profile');
        return { success: false, error: data.error?.message };
      }
    } catch (err) {
      const errorMessage = 'An error occurred while updating profile';
      setError(errorMessage);
      console.error('Error updating profile:', err);
      return { success: false, error: errorMessage };
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    try {
      setError(null);
      const response = await fetch('/api/member/profile/image', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        return { success: true, data: data.data };
      } else {
        setError(data.error?.message || 'Failed to update profile image');
        return { success: false, error: data.error?.message };
      }
    } catch (err) {
      const errorMessage = 'An error occurred while updating profile image';
      setError(errorMessage);
      console.error('Error updating profile image:', err);
      return { success: false, error: errorMessage };
    }
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateProfileImage,
  };
}
