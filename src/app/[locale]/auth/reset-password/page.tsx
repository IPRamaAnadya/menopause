'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';

export default function ResetPasswordPage() {
  const t = useTranslations('Auth.resetPassword');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading(t('updating'));

    try {
      // Validate passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error(t('passwordMismatch'));
      }

      // Validate password length
      if (formData.newPassword.length < 6) {
        throw new Error(t('passwordTooShort'));
      }

      // Call API to reset password
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('error'));
      }

      toast.success(t('success'));

      // Redirect based on role
      const userRole = (session?.user as any)?.role || 'Member';
      if (userRole === 'Administrator' || userRole === 'Moderator') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(
        error instanceof Error ? error.message : t('error'),
        
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t('title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('newPassword')}</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder={t('newPasswordPlaceholder')}
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">{t('passwordHint')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('updating') : t('submitButton')}
          </Button>
        </form>
      </div>
    </div>
  );
}
