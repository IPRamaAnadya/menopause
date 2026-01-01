"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEventRegistrations } from "@/features/event/hooks/useEventRegistrations";
import { useEvents } from "@/features/event/hooks/useEvents";

export default function EventRegistrationsHistoryPage() {
  const t = useTranslations("EventRegistrationsHistory");
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { registrations, pagination, loading } = useEventRegistrations({
    page,
    limit: pageSize,
    status: statusFilter,
    eventId: eventFilter !== "all" ? parseInt(eventFilter) : undefined,
    search: searchQuery,
  });

  const { events: allEvents } = useEvents({ locale, pageSize: 100 });

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatPrice = (price: number) => {
    return `HK$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-green-600 bg-green-100";
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      case "ATTENDED":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleEventFilterChange = (value: string) => {
    setEventFilter(value);
    setPage(1);
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-3 w-full">
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:gap-4 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full max-w-full [&>span]:truncate">
              <SelectValue placeholder={t("filters.allStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
              <SelectItem value="PENDING">{t("status.PENDING")}</SelectItem>
              <SelectItem value="PAID">{t("status.PAID")}</SelectItem>
              <SelectItem value="ATTENDED">{t("status.ATTENDED")}</SelectItem>
              <SelectItem value="CANCELLED">{t("status.CANCELLED")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eventFilter} onValueChange={handleEventFilterChange}>
            <SelectTrigger className="w-full max-w-full [&>span]:truncate [&>span]:block">
              <SelectValue placeholder={t("filters.allEvents")}>
                <span className="truncate block">
                  {eventFilter !== "all" 
                    ? truncateText(
                        allEvents.find(e => e.id.toString() === eventFilter)?.title || t("filters.allEvents"),
                        25
                      )
                    : t("filters.allEvents")}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allEvents")}</SelectItem>
              {allEvents.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Registrations Table */}
      {registrations.length === 0 ? (
        <Card className="p-6 sm:p-12 text-center">
          <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">{t("noRegistrations")}</h3>
          <p className="text-sm text-muted-foreground">{t("getStarted")}</p>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      {t("table.attendee")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      {t("table.event")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      {t("table.membershipLevel")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      {t("table.price")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      {t("table.status")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      {t("table.registeredAt")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-muted/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {registration.users?.name ||
                                registration.guests?.full_name ||
                                t("guest")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {registration.users?.email ||
                                registration.guests?.email ||
                                ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium">
                          {registration.events.translations[0]?.title || "Untitled Event"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {registration.events.start_date}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm">
                          {registration.membership_levels
                            ? registration.membership_levels.slug
                            : t("membershipLevel.public")}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatPrice(Number(registration.price))}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                            registration.status
                          )}`}
                        >
                          {t(`status.${registration.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {formatDate(registration.registered_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 sm:space-y-4 w-full">
            {registrations.map((registration) => (
              <Card key={registration.id} className="p-3 sm:p-4 space-y-3 w-full overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex-shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {registration.users?.name ||
                          registration.guests?.full_name ||
                          t("guest")}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {registration.users?.email || registration.guests?.email || ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap flex-shrink-0 ${getStatusColor(
                      registration.status
                    )}`}
                  >
                    {t(`status.${registration.status}`)}
                  </span>
                </div>
                <div className="space-y-2 text-sm w-full">
                  <div className="w-full">
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("table.event")}</p>
                    <p className="font-medium text-sm sm:text-base break-words">
                      {registration.events.translations[0]?.title || "Untitled Event"}
                    </p>
                  </div>
                  <div className="flex justify-between gap-4 w-full">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">{t("table.price")}</p>
                      <p className="font-medium text-sm sm:text-base truncate">{formatPrice(Number(registration.price))}</p>
                    </div>
                    <div className="text-right min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">{t("table.registeredAt")}</p>
                      <p className="font-medium text-xs sm:text-sm break-words">
                        {formatDate(registration.registered_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                {t("pagination.showing", {
                  from: (pagination.page - 1) * pagination.limit + 1,
                  to: Math.min(pagination.page * pagination.limit, pagination.total),
                  total: pagination.total,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="text-xs sm:text-sm"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xs:inline">{t("pagination.previous")}</span>
                  <span className="xs:hidden">Prev</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden xs:inline">{t("pagination.next")}</span>
                  <span className="xs:hidden">Next</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
