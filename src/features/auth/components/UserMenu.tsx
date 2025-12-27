'use client';

import { useAuth, useAuthActions } from '@/features/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function UserMenu() {
  const { user, loading } = useAuth();
  const { signOut } = useAuthActions();

  if (loading) {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/signin">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button size="sm">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium">{user.name || 'User'}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
      
      {user.image && (
        <img
          src={user.image}
          alt={user.name || 'User'}
          className="h-10 w-10 rounded-full"
        />
      )}
      
      <Button variant="outline" size="sm" onClick={() => signOut()}>
        Sign Out
      </Button>
    </div>
  );
}
