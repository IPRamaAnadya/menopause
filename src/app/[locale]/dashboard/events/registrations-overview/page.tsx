"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  TrendingUp,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useEventRegistrationStats } from "@/features/event/hooks/useEventRegistrationStats";

export default function EventRegistrationsOverviewPage() {
  const t = useTranslations("EventRegistrationsOverview");
  const router = useRouter();
  const { statistics, topEvents, recentRegistrations, loading } = useEventRegistrationStats();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button 
          onClick={() => router.push("/dashboard/events/registrations")}
          className="w-full sm:w-auto"
        >
          {t("viewAll")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
              {t("statistics.totalRegistrations")}
            </CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
              {t("statistics.paidRegistrations")}
            </CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{statistics.paid}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
              {t("statistics.pendingRegistrations")}
            </CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{statistics.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
              {t("statistics.attendedRegistrations")}
            </CardTitle>
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{statistics.attended}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
              {t("statistics.cancelledRegistrations")}
            </CardTitle>
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{statistics.cancelled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">
              {t("statistics.totalRevenue")}
            </CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{formatPrice(statistics.revenue)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Top Events */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              {t("topEvents.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {topEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("topEvents.noData")}
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {topEvents.map((event, index) => (
                  <div
                    key={event.event_id}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{event.event_title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <span className="font-bold text-sm sm:text-base">{event.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              {t("recentRegistrations.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {recentRegistrations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("recentRegistrations.noData")}
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentRegistrations.slice(0, 5).map((registration) => (
                  <div
                    key={registration.id}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-2 sm:p-3 rounded-lg bg-muted/50 gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {registration.users?.name || registration.guests?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {registration.events.translations[0]?.title || "Untitled Event"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(registration.registered_at)}
                      </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 sm:ml-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${getStatusColor(
                          registration.status
                        )}`}
                      >
                        {t(`status.${registration.status}`)}
                      </span>
                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                        {formatPrice(Number(registration.price))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
