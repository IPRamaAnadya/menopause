'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Users, 
  Search, 
  UserPlus,
  Mail,
  Shield,
  Calendar,
  Crown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUsers, useUserStats } from '@/features/user-management';
import { UserActionsMenu } from '@/features/user-management/components/UserActionsMenu';
import { AddUserDialog } from '@/features/user-management/components/AddUserDialog';

const getRoleTranslationKey = (role: string) => {
  const roleMap: { [key: string]: string } = {
    'Administrator': 'roles.administrator',
    'Moderator': 'roles.moderator',
    'Content Creator': 'roles.contentCreator',
    'Member': 'roles.member',
  };
  return roleMap[role] || role;
};

const getStatusTranslationKey = (status: string) => {
  return status === 'ACTIVE' ? 'status.active' : 'status.suspended';
};

const getMembershipTranslationKey = (level: string | null) => {
  if (!level) return 'membership.free';
  const membershipMap: { [key: string]: string } = {
    'Platinum': 'membership.platinum',
    'Gold': 'membership.gold',
    'Silver': 'membership.silver',
    'Free': 'membership.free',
  };
  return membershipMap[level] || 'membership.free';
};

const getTimeTranslation = (t: any, timeStr: string | null) => {
  return timeStr || t('time.unknown');
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'Administrator':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'Moderator':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'Content Creator':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'SUSPENDED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getMembershipColor = (level: string | null) => {
  switch (level) {
    case 'Platinum':
      return 'text-purple-600 dark:text-purple-400';
    case 'Gold':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'Silver':
      return 'text-gray-600 dark:text-gray-400';
    default:
      return 'text-gray-500 dark:text-gray-500';
  }
};

export default function UsersManagementPage() {
  const t = useTranslations('UsersManagement');
  
  // State for filters
  const [searchInput, setSearchInput] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // State for add user dialog
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  
  // Ref for debounce timeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch users with filters
  const {
    users,
    total,
    page,
    totalPages,
    loading,
    error,
    updateFilters,
    nextPage,
    previousPage,
    refresh,
  } = useUsers({
    limit: 10,
  });

  // Fetch user statistics
  const { stats, loading: statsLoading } = useUserStats();

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchInput(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      updateFilters({ search: value || undefined });
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle role filter
  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    updateFilters({ role: value || undefined });
  };

  // Handle status filter
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    updateFilters({ status: value ? (value as 'ACTIVE' | 'SUSPENDED') : undefined });
  };

  // Stats configuration
  const statsConfig = [
    { label: 'stats.totalUsers', value: statsLoading ? '...' : stats.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-600' },
    { label: 'stats.activeToday', value: statsLoading ? '...' : stats.activeToday.toLocaleString(), icon: Calendar, color: 'text-green-600' },
    { label: 'stats.premiumMembers', value: statsLoading ? '...' : stats.premiumMembers.toLocaleString(), icon: Crown, color: 'text-yellow-600' },
    { label: 'stats.administrators', value: statsLoading ? '...' : stats.administrators.toLocaleString(), icon: Shield, color: 'text-purple-600' },
  ];
  
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Button 
          className="gap-2 w-full md:w-auto"
          onClick={() => setAddUserDialogOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          {t('addUserButton')}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-4 md:p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  {t(stat.label)}
                </p>
                <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2">{stat.value}</p>
              </div>
              <div className={`rounded-full bg-muted p-2 md:p-3 ${stat.color} self-start md:self-center`}>
                <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            className="pl-9"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="flex-1 md:flex-none h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            <option value="">{t('allRoles')}</option>
            <option value="Administrator">{t('roles.administrator')}</option>
            <option value="Moderator">{t('roles.moderator')}</option>
            <option value="Content Creator">{t('roles.contentCreator')}</option>
            <option value="Member">{t('roles.member')}</option>
          </select>
          <select 
            className="flex-1 md:flex-none h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">{t('allStatus')}</option>
            <option value="ACTIVE">{t('status.active')}</option>
            <option value="SUSPENDED">{t('status.suspended')}</option>
          </select>
        </div>
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">{t('table.user')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">{t('table.role')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">{t('table.status')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">{t('table.membership')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">{t('table.joined')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">{t('table.lastActive')}</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-600">
                    Error: {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{user.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {t(getRoleTranslationKey(user.role))}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(
                        user.status
                      )}`}
                    >
                      {t(getStatusTranslationKey(user.status))}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${getMembershipColor(user.membershipLevel)}`}>
                      {t(getMembershipTranslationKey(user.membershipLevel))}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.joinedDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {getTimeTranslation(t, user.lastActive)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <UserActionsMenu user={user} onSuccess={refresh} />
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('pagination.showing', { 
              from: users.length > 0 ? (page - 1) * 10 + 1 : 0, 
              to: Math.min(page * 10, total), 
              total: total.toLocaleString() 
            })}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1 || loading}
              onClick={previousPage}
            >
              {t('pagination.previous')}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={nextPage}
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>
      </div>

      {/* Users Cards - Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-12">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading users...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">
            Error: {error}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No users found
          </div>
        ) : (
          users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{user.name || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                </div>
              </div>
              <UserActionsMenu user={user} onSuccess={refresh} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('table.role')}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {t(getRoleTranslationKey(user.role))}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('table.status')}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(
                    user.status
                  )}`}
                >
                  {t(getStatusTranslationKey(user.status))}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('table.membership')}</span>
                <span className={`text-sm font-medium ${getMembershipColor(user.membershipLevel)}`}>
                  {t(getMembershipTranslationKey(user.membershipLevel))}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{t('table.joined')}</span>
                  <span className="text-sm">{user.joinedDate}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-muted-foreground">{t('table.lastActive')}</span>
                  <span className="text-sm">{getTimeTranslation(t, user.lastActive)}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
        
        {/* Pagination - Mobile */}
        {!loading && users.length > 0 && (
          <div className="flex flex-col gap-3 mt-2">
            <div className="text-sm text-muted-foreground text-center">
              {t('pagination.showing', { 
                from: (page - 1) * 10 + 1, 
                to: Math.min(page * 10, total), 
                total: total.toLocaleString() 
              })}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1" 
                disabled={page === 1 || loading}
                onClick={previousPage}
              >
                {t('pagination.previous')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                disabled={page >= totalPages || loading}
                onClick={nextPage}
              >
                {t('pagination.next')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Dialog */}
      <AddUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onSuccess={refresh}
      />
    </div>
  );
}
