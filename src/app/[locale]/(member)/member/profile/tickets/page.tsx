"use client";

import { useState } from "react";
import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Calendar, MapPin, Globe, Ticket, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTickets } from "@/features/event/hooks/useTickets";

type TicketStatus = "PENDING" | "PAID" | "CANCELLED" | "ATTENDED";

export default function EventTicketsPage() {
  const t = useTranslations("Lounge.profile");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { tickets: allTicketsData, loading, error } = useTickets();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "zh-HK" ? "zh-HK" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusBadge = (status: TicketStatus) => {
    const statusConfig = {
      PENDING: {
        label: locale === "zh-HK" ? "待確認" : "Pending",
        className: "bg-yellow-100 text-yellow-800",
      },
      PAID: {
        label: locale === "zh-HK" ? "已確認" : "Confirmed",
        className: "bg-green-100 text-green-800",
      },
      CANCELLED: {
        label: locale === "zh-HK" ? "已取消" : "Cancelled",
        className: "bg-red-100 text-red-800",
      },
      ATTENDED: {
        label: locale === "zh-HK" ? "已參加" : "Attended",
        className: "bg-blue-100 text-blue-800",
      },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const isUpcoming = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return eventDate >= today;
  };

  const upcomingTickets = allTicketsData.filter(ticket => 
    ticket.event && isUpcoming(ticket.event.start_date) && ticket.status !== "CANCELLED"
  );
  const pastTickets = allTicketsData.filter(ticket => 
    !ticket.event || !isUpcoming(ticket.event.start_date) || ticket.status === "CANCELLED"
  );

  const allTickets = activeTab === "upcoming" ? upcomingTickets : pastTickets;
  
  // Reset to page 1 when switching tabs
  const handleTabChange = (tab: "upcoming" | "past") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(allTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const tickets = allTickets.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b">
          <Link
            href={`/${locale}/member/profile`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon("back")}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">{t("eventTickets")}</h1>
          </div>
          <p className="text-sm text-gray-500">
            {locale === "zh-HK" ? "查看您的活動門票和報名記錄" : "View your event tickets and registration history"}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              {locale === "zh-HK" ? "重試" : "Retry"}
            </Button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Tabs */}
            <div className="mb-6 border-b">
          <div className="flex gap-8">
            <button
              onClick={() => handleTabChange("upcoming")}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === "upcoming"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {locale === "zh-HK" ? "即將舉行" : "Upcoming"}
              {activeTab === "upcoming" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => handleTabChange("past")}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === "past"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {locale === "zh-HK" ? "過往記錄" : "Past"}
              {activeTab === "past" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {activeTab === "upcoming"
                ? locale === "zh-HK" ? "暫無即將舉行的活動" : "No upcoming events"
                : locale === "zh-HK" ? "暫無過往記錄" : "No past events"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/${locale}/member/profile/tickets/${ticket.public_id}`}
                className="block border rounded-xl hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="flex gap-4 p-4 md:p-6">
                  {/* Event Image */}
                  <div className="flex-shrink-0">
                    {ticket.event?.image_url ? (
                      <img
                        src={ticket.event.image_url}
                        alt={ticket.event.title || 'Event'}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                        {ticket.event?.is_online ? (
                          <Globe className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                        ) : (
                          <MapPin className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-base md:text-lg line-clamp-2">
                        {ticket.event?.title || 'Event'}
                      </h3>
                      {getStatusBadge(ticket.status as TicketStatus)}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {ticket.event?.short_description || ''}
                    </p>

                    <div className="space-y-2">
                      {/* Date & Time */}
                      {ticket.event && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {formatDate(ticket.event.start_date)}
                            {ticket.event.start_time && ` • ${formatTime(ticket.event.start_time)}`}
                            {ticket.event.end_time && ` - ${formatTime(ticket.event.end_time)}`}
                          </span>
                        </div>
                      )}

                      {/* Location */}
                      {ticket.event && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {ticket.event.is_online ? (
                            <>
                              <Globe className="h-4 w-4 flex-shrink-0" />
                              <span>{locale === "zh-HK" ? "線上活動" : "Online Event"}</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="line-clamp-1">{ticket.event.place_name}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      {ticket.price > 0 && (
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <span>HK$ {ticket.price.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {tickets.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            {/* Results info */}
            <div className="text-sm text-gray-600">
              {locale === "zh-HK" 
                ? `顯示 ${startIndex + 1}-${Math.min(endIndex, allTickets.length)} 項，共 ${allTickets.length} 項`
                : `Showing ${startIndex + 1}-${Math.min(endIndex, allTickets.length)} of ${allTickets.length} results`
              }
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              {/* Previous button */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === "zh-HK" ? "上一頁" : "Previous"}</span>
              </Button>

              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-1 text-gray-400">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page as number)}
                        className="min-w-[2.5rem]"
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Mobile page indicator */}
              <div className="sm:hidden px-3 py-1 text-sm text-gray-600">
                {currentPage} / {totalPages}
              </div>

              {/* Next button */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                <span className="hidden sm:inline">{locale === "zh-HK" ? "下一頁" : "Next"}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
