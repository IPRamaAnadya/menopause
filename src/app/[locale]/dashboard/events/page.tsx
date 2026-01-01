"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Calendar,
  MapPin,
  Video,
  Users,
  DollarSign,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

import { EventCardData } from "@/features/event/types";
import { useEvents } from "@/features/event/hooks/useEvents";
import { useEventActions } from "@/features/event/hooks/useEventActions";

export default function EventsManagementPage() {
  const t = useTranslations('EventsManagement');
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "PUBLISHED" | "DRAFT" | "CANCELLED">("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "ongoing" | "passed">("all");
  const [locationFilter, setLocationFilter] = useState<"all" | "online" | "offline">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "free">("all");
  const [highlightFilter, setHighlightFilter] = useState<"all" | "highlighted" | "normal">("all");
  const [page, setPage] = useState(1);
  const pageSize = 12; // Show 12 events per page
  const { events, pagination, loading, refresh } = useEvents({ 
    locale,
    page,
    pageSize,
    timeFilter,
    locationFilter,
    visibilityFilter,
    paymentFilter,
    highlighted: highlightFilter === "highlighted" ? true : highlightFilter === "normal" ? false : undefined,
  });
  const { deleteEvent, loading: actionLoading } = useEventActions(refresh);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.short_description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, timeFilter, locationFilter, visibilityFilter, paymentFilter, highlightFilter]);

  const handleEdit = (id: number) => {
    router.push(`/dashboard/events/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('actions.deleteConfirm'))) {
      await deleteEvent(id);
    }
  };

  const handleCreate = () => {
    router.push('/dashboard/events/create');
  };

  const handleViewRegistrations = (id: number) => {
    router.push(`/dashboard/events/${id}/registrations`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Handle string dates in format "2025-12-31"
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // Handle time strings in format "14:30"
    return timeString;
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('addButton')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm sm:text-base"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatus')}</SelectItem>
              <SelectItem value="PUBLISHED">{t('status.published')}</SelectItem>
              <SelectItem value="DRAFT">{t('status.draft')}</SelectItem>
              <SelectItem value="CANCELLED">{t('status.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Additional Filters Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {/* Time Filter */}
          <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('filters.time')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allTime')}</SelectItem>
              <SelectItem value="upcoming">{t('filters.upcoming')}</SelectItem>
              <SelectItem value="ongoing">{t('filters.ongoing')}</SelectItem>
              <SelectItem value="passed">{t('filters.passed')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Location Filter */}
          <Select value={locationFilter} onValueChange={(value: any) => setLocationFilter(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('filters.location')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allLocation')}</SelectItem>
              <SelectItem value="online">{t('filters.online')}</SelectItem>
              <SelectItem value="offline">{t('filters.offline')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Visibility Filter */}
          <Select value={visibilityFilter} onValueChange={(value: any) => setVisibilityFilter(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('filters.visibility')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allVisibility')}</SelectItem>
              <SelectItem value="public">{t('filters.public')}</SelectItem>
              <SelectItem value="private">{t('filters.private')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Filter */}
          <Select value={paymentFilter} onValueChange={(value: any) => setPaymentFilter(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('filters.payment')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allPayment')}</SelectItem>
              <SelectItem value="paid">{t('filters.paid')}</SelectItem>
              <SelectItem value="free">{t('filters.free')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Highlight Filter */}
          <Select value={highlightFilter} onValueChange={(value: any) => setHighlightFilter(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('filters.highlight')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allHighlight')}</SelectItem>
              <SelectItem value="highlighted">{t('filters.highlighted')}</SelectItem>
              <SelectItem value="normal">{t('filters.normal')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('noEvents')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('getStarted')}
          </p>
          <Button onClick={handleCreate} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            {t('addButton')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              {event.image_url && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 space-y-3">
                {/* Status & Type Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      event.status === 'PUBLISHED'
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : event.status === 'CANCELLED'
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {event.status === 'PUBLISHED' ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        {t('status.published')}
                      </>
                    ) : event.status === 'CANCELLED' ? (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        {t('status.cancelled')}
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        {t('status.draft')}
                      </>
                    )}
                  </span>
                  {event.is_online && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      <Video className="w-3 h-3 mr-1" />
                      {t('type.online')}
                    </span>
                  )}
                  {event.is_paid && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {t('type.paid')}
                    </span>
                  )}
                  {event.is_highlighted && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <Star className="w-3 h-3 mr-1" />
                      {t('type.highlighted')}
                    </span>
                  )}
                </div>

                {/* Event Info */}
                <div className="min-w-0">
                  <h3 className="font-semibold text-base mb-1 line-clamp-2">
                    {event.title}
                  </h3>
                  {event.short_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.short_description}
                    </p>
                  )}
                  <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(event.start_date)}</span>
                      {event.start_time && (
                        <span className="ml-1">• {formatTime(event.start_time)}</span>
                      )}
                    </div>
                    {!event.is_online && event.place_name && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{event.place_name}</span>
                      </div>
                    )}
                    {event.capacity && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{t('capacity')}: {event.capacity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRegistrations(event.id)}
                    disabled={actionLoading}
                    className="flex-1 text-xs"
                  >
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    {t('actions.registrations')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(event.id)}
                    disabled={actionLoading}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                    disabled={actionLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filteredEvents.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {t('showing')} {(pagination.page - 1) * pagination.pageSize + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} {t('of')} {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              {t('previous')}
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages || loading}
            >
              {t('next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
