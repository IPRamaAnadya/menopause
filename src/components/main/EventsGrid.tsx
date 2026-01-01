"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Video, Users, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePublicEvents } from '@/features/event/hooks/usePublicEvents';

interface EventsGridProps {
  timeFilter?: string;
  locationFilter?: string;
  paymentFilter?: string;
  search?: string;
}

export function EventsGrid({ timeFilter, locationFilter, paymentFilter, search }: EventsGridProps) {
  const t = useTranslations('MainSite.events');
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const pageSize = 12;
  
  const { events, pagination, loading, error } = usePublicEvents({ 
    locale,
    page,
    pageSize,
    search: search || undefined,
    timeFilter: timeFilter || 'upcoming',
    locationFilter: locationFilter || 'all',
    paymentFilter: paymentFilter || 'all',
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return timeString;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-20 py-12">
      {/* Events Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Loading Skeletons
          Array.from({ length: pageSize }).map((_, index) => (
            <div key={index} className="group">
              <Skeleton className="h-[260px] w-full rounded-3xl" />
              <Skeleton className="mt-5 h-6 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-4 h-9 w-24 rounded-full" />
            </div>
          ))
        ) : error ? (
          // Error State
          <div className="col-span-full text-center py-20">
            <div className="mx-auto max-w-md">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <Calendar className="h-10 w-10 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('errorTitle')}</h3>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          // Empty State
          <div className="col-span-full text-center py-20">
            <div className="mx-auto max-w-md">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('noEvents')}
              </h3>
              {search ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    {t('noSearchResults', { search })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {t('searchSuggestion')}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {t('noEventsDescription')}
                </p>
              )}
            </div>
          </div>
        ) : (
          // Events List
          events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group block"
            >
              {/* Event Image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-gray-100">
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                    <Calendar className="h-20 w-20 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className="mt-5">
                {/* Badges/Labels */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {event.is_online && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      <Video className="w-3 h-3 mr-1" />
                      Online
                    </span>
                  )}
                  {!event.is_paid && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      Free
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors">
                  {event.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {event.short_description}
                </p>

                {/* Price Information for Paid Events */}
                {event.is_paid && event.price_range && (
                  <div className="mt-3 mb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(event.price_range.min)}
                        {event.price_range.min !== event.price_range.max && ` - ${formatPrice(event.price_range.max)}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {event.has_member_price 
                        ? t('pricingWithMembership')
                        : t('pricingPublic')
                      }
                    </p>
                  </div>
                )}

                {/* Event Meta */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      {formatDate(event.start_date)}
                      {event.start_time && ` • ${formatTime(event.start_time)}`}
                    </span>
                  </div>
                  {!event.is_online && event.place_name && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{event.place_name}</span>
                    </div>
                  )}
                  {event.capacity > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{t('capacity')}: {event.capacity}</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-pink-600 hover:text-pink-700 hover:bg-pink-50 p-0 h-auto font-medium"
                >
                  {t('readMore')} →
                </Button>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && events.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          <div className="text-sm text-gray-600">
            {t('showing')} {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t('of')} {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
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
              disabled={page === pagination.totalPages}
            >
              {t('next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
