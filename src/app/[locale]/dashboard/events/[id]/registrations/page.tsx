"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Mail, User, CheckCircle, Clock, XCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function EventRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const t = useTranslations('EventsManagement');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [eventTitle, setEventTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch event details
        const eventResponse = await fetch(`/api/admin/events/${resolvedParams.id}`);
        const eventResult = await eventResponse.json();
        if (eventResult.success && eventResult.data) {
          const translation = eventResult.data.translations.find((t: any) => t.locale === 'en');
          setEventTitle(translation?.title || 'Event');
        }

        // Fetch registrations with filters and pagination
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
        });
        
        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }
        
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }

        const regResponse = await fetch(`/api/admin/events/${resolvedParams.id}/registrations?${params.toString()}`);
        const regResult = await regResponse.json();
        if (regResult.success && regResult.data) {
          setRegistrations(regResult.data.data || []);
          setTotalCount(regResult.data.pagination?.total || 0);
          setTotalPages(regResult.data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, page, debouncedSearch, statusFilter, page, debouncedSearch, statusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleMarkAsAttended = async (registrationId: number, name: string) => {
    if (!confirm(`Mark ${name}'s registration as attended?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/registrations/${registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ATTENDED' }),
      });

      if (response.ok) {
        setRegistrations(registrations.map(r => 
          r.id === registrationId ? { ...r, status: 'ATTENDED' } : r
        ));
      } else {
        alert('Failed to update registration status');
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      alert('Error updating registration status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      case 'ATTENDED':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Attended
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/events')}
          className="rounded-full border-2 border-accent flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
            {t('registrations.title')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground break-words">
            {eventTitle}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('registrations.searchPlaceholder') || 'Search by name or email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full [&>span]:truncate [&>span]:block">
            <SelectValue placeholder={t('registrations.filterByStatus') || 'Filter by status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('registrations.allStatuses') || 'All Statuses'}</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="ATTENDED">Attended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold">{totalCount}</div>
          <p className="text-xs text-muted-foreground truncate">{t('registrations.total')}</p>
        </div>
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {registrations.filter(r => r.status === 'PAID').length}
          </div>
          <p className="text-xs text-muted-foreground truncate">{t('registrations.paid')}</p>
        </div>
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">
            {registrations.filter(r => r.status === 'PENDING').length}
          </div>
          <p className="text-xs text-muted-foreground truncate">{t('registrations.pending')}</p>
        </div>
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {registrations.filter(r => r.status === 'ATTENDED').length}
          </div>
          <p className="text-xs text-muted-foreground truncate">{t('registrations.attended')}</p>
        </div>
      </div>

      {/* Registrations Table */}
      {registrations.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 sm:p-12 text-center">
          <User className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">{t('registrations.noRegistrations')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('registrations.noRegistrationsDescription')}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('registrations.name')}</TableHead>
                    <TableHead>{t('registrations.email')}</TableHead>
                    <TableHead>{t('registrations.price')}</TableHead>
                    <TableHead>{t('registrations.status')}</TableHead>
                    <TableHead>{t('registrations.registeredAt')}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration: any) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {registration.users?.name || registration.guests?.full_name || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {registration.users?.email || registration.guests?.email || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">
                          {registration.price === 0 ? 'Free' : `$${registration.price}`}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(registration.registered_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {registration.status !== 'ATTENDED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsAttended(
                              registration.id,
                              registration.users?.name || registration.guests?.full_name || 'this user'
                            )}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Attended
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 sm:space-y-4 w-full">
            {registrations.map((registration: any) => (
              <div key={registration.id} className="rounded-lg border bg-card p-3 sm:p-4 space-y-3 w-full overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {registration.users?.name || registration.guests?.full_name || 'N/A'}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {registration.users?.email || registration.guests?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(registration.status)}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm w-full">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{t('registrations.price')}</p>
                    <p className="font-medium text-sm sm:text-base truncate">
                      {registration.price === 0 ? 'Free' : `$${registration.price}`}
                    </p>
                  </div>
                  <div className="text-right min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('registrations.registeredAt')}</p>
                    <p className="font-medium text-xs sm:text-sm break-words">
                      {formatDate(registration.registered_at)}
                    </p>
                  </div>
                </div>
                {registration.status !== 'ATTENDED' && (
                  <div className="flex justify-end pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsAttended(
                        registration.id,
                        registration.users?.name || registration.guests?.full_name || 'this user'
                      )}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Mark Attended</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}  
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Showing page {page} of {totalPages} ({totalCount} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
