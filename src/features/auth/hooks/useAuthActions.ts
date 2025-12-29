'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { toast } from 'react-toastify';
import { SignInFormData, SignUpFormData } from '../types';
import { getAuthErrorMessage, isValidEmail, validatePassword, passwordsMatch } from '../utils/validation';

export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signIn = async (data: SignInFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (!isValidEmail(data.email)) {
        toast.error('Please enter a valid email address.');
        throw new Error('Please enter a valid email address.');
      }

      const result = await nextAuthSignIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success('Successfully signed in!');

      // Fetch user details to check password reset and role
      const response = await fetch('/api/auth/me');
      const userData = await response.json();

      // Check if password reset is required
      if (userData.isResetPassword) {
        router.push('/auth/reset-password');
        router.refresh();
        return { success: true };
      }

      // Redirect based on role
      if (userData.role === 'Administrator' || userData.role === 'Moderator') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
      
      router.refresh();
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Sign in failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (!isValidEmail(data.email)) {
        toast.error('Please enter a valid email address.');
        throw new Error('Please enter a valid email address.');
      }

      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        throw new Error(passwordValidation.message);
      }

      if (!passwordsMatch(data.password, data.confirmPassword)) {
        toast.error('Passwords do not match.');
        throw new Error('Passwords do not match.');
      }

      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Registration failed');
        throw new Error(result.error || 'Registration failed');
      }

      toast.success('Account created successfully!');

      // Auto sign in after registration
      const signInResult = await nextAuthSignIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error('Auto sign-in failed');
        throw new Error('Auto sign-in failed');
      }

      // Redirect to membership page for new free members
      router.push('/');
      router.refresh();
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Sign up failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      await nextAuthSignIn('google', {
        callbackUrl: '/dashboard',
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Google sign in failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await nextAuthSignOut({ callbackUrl: '/' });
      toast.success('Successfully signed out!');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Sign out failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!isValidEmail(email)) {
        toast.error('Please enter a valid email address.');
        throw new Error('Please enter a valid email address.');
      }

      // TODO: Implement password reset endpoint
      toast.error('Password reset not yet implemented');
      throw new Error('Password reset not yet implemented');
    } catch (err: any) {
      const errorMessage = err.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    loading,
    error,
  };
}
