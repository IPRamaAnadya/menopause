'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Shield, Ban, CheckCircle, Key } from 'lucide-react';
import { User } from '@/features/user-management';
import { useUserActions } from '@/features/user-management';

interface UserActionsMenuProps {
  user: User;
  currentUserRole?: string;
  currentUserId?: number;
  onSuccess: () => void;
}

export function UserActionsMenu({ user, currentUserRole, currentUserId, onSuccess }: UserActionsMenuProps) {
  const t = useTranslations('UsersManagement');
  const { data: session } = useSession();
  const { updateStatus, updateRole, resetPassword, loading } = useUserActions();
  const [open, setOpen] = useState(false);

  // Get current user's role from session or props
  const userRole = currentUserRole || (session?.user as any)?.role || 'Member';
  const userId = currentUserId || (session?.user as any)?.id;
  
  // Check if current user is moderator
  const isModerator = userRole === 'Moderator';
  const isAdmin = userRole === 'Administrator';
  const isSelf = userId === user.id;
  
  // Moderators cannot change roles or suspend moderators, admins, or themselves
  const canChangeRole = !isModerator || (user.role !== 'Moderator' && user.role !== 'Administrator' && !isSelf);
  const canChangeStatus = !isModerator || (user.role !== 'Moderator' && user.role !== 'Administrator' && !isSelf);

  const handleStatusChange = async (status: 'ACTIVE' | 'SUSPENDED') => {
    const success = await updateStatus(user.id, status);
    if (success) {
      setOpen(false);
      onSuccess();
    }
  };

  const handleRoleChange = async (role: string) => {
    const success = await updateRole(user.id, role);
    if (success) {
      setOpen(false);
      onSuccess();
    }
  };

  const handleResetPassword = async () => {
    const success = await resetPassword(user.id);
    if (success) {
      setOpen(false);
      onSuccess();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={loading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('actions.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Change Role */}
        {canChangeRole && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!canChangeRole}>
              <Shield className="mr-2 h-4 w-4" />
              {t('actions.changeRole')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => handleRoleChange('Administrator')}
                disabled={user.role === 'Administrator'}
              >
                {t('roles.administrator')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange('Moderator')}
                disabled={user.role === 'Moderator'}
              >
                {t('roles.moderator')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange('Content Creator')}
                disabled={user.role === 'Content Creator'}
              >
                {t('roles.contentCreator')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange('Member')}
                disabled={user.role === 'Member'}
              >
                {t('roles.member')}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {/* Change Status */}
        {canChangeStatus && (
          user.status === 'ACTIVE' ? (
            <DropdownMenuItem onClick={() => handleStatusChange('SUSPENDED')}>
              <Ban className="mr-2 h-4 w-4" />
              {t('actions.suspendUser')}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleStatusChange('ACTIVE')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('actions.activateUser')}
            </DropdownMenuItem>
          )
        )}

        {/* Reset Password */}
        <DropdownMenuItem onClick={handleResetPassword}>
          <Key className="mr-2 h-4 w-4" />
          {t('actions.resetPassword')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
