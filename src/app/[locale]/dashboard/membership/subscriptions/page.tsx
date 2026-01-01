"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Search, TrendingUp, Users, XCircle, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { SubscriptionActivity, SubscriptionStats } from "@/features/membership/types";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SubscriptionsPage() {
  const t = useTranslations("Subscriptions");
  const [activities, setActivities] = useState<SubscriptionActivity[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageLimit.toString());
      if (activityFilter !== 'all') params.append('status', activityFilter.toUpperCase());
      if (debouncedSearch) params.append('search', debouncedSearch);

      const activityRes = await fetch(`/api/admin/subscriptions/activity?${params.toString()}`);
      const activityData = await activityRes.json();

      if (activityData.data) {
        setActivities(activityData.data.data || []);
        setPagination(activityData.data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await fetch('/api/admin/subscriptions/stats');
        const statsData = await statsRes.json();
        if (statsData.data) {
          setStats(statsData.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [currentPage, activityFilter, debouncedSearch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, activityFilter]);

  const getActivityBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      CREATED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      RENEWED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      EXPIRED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      UPDATED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    };
    return colors[type] || colors.CREATED;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      EXPIRED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };
    return colors[status] || colors.ACTIVE;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `HK$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t("description")}</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
                {t("stats.total")}
              </CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.total_subscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
                {t("stats.active")}
              </CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.active_subscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
                {t("stats.expired")}
              </CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.expired_subscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
                {t("stats.cancelled")}
              </CardTitle>
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-gray-600">{stats.cancelled_subscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
                {t("stats.totalRevenue")}
              </CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
                {t("stats.monthlyRevenue")}
              </CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={activityFilter} onValueChange={setActivityFilter}>
          <SelectTrigger className="w-full sm:w-45">
            <SelectValue placeholder={t("filter.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filter.all")}</SelectItem>
            <SelectItem value="created">{t("filter.created")}</SelectItem>
            <SelectItem value="renewed">{t("filter.renewed")}</SelectItem>
            <SelectItem value="cancelled">{t("filter.cancelled")}</SelectItem>
            <SelectItem value="expired">{t("filter.expired")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Grid View */}
      <div className="grid gap-4 sm:hidden">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("loading")}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("noData")}
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityBadgeColor(activity.activity_type)}`}>
                      {t(`activity.type.${activity.activity_type}`)}
                    </span>
                    {activity.membership?.status && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(activity.membership.status)}`}>
                        {activity.membership.status}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold">{activity.user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{activity.user?.email}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("table.membership")}</span>
                  <span className="font-medium">{activity.membership?.membership_level.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("table.price")}</span>
                  <span className="font-medium">{formatCurrency(activity.membership?.membership_level.price || 0)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(activity.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.date")}</TableHead>
              <TableHead>{t("table.user")}</TableHead>
              <TableHead>{t("table.activity")}</TableHead>
              <TableHead>{t("table.membership")}</TableHead>
              <TableHead>{t("table.status")}</TableHead>
              <TableHead className="text-right">{t("table.price")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {t("noData")}
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(activity.created_at)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{activity.user?.name}</div>
                      <div className="text-sm text-muted-foreground">{activity.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityBadgeColor(activity.activity_type)}`}>
                      {t(`activity.type.${activity.activity_type}`)}
                    </span>
                  </TableCell>
                  <TableCell>{activity.membership?.membership_level.name}</TableCell>
                  <TableCell>
                    {activity.membership?.status && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(activity.membership.status)}`}>
                        {activity.membership.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(activity.membership?.membership_level.price || 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
          totalItems={pagination.total}
          itemsPerPage={pageLimit}
        />
      )}
    </div>
  );
}
