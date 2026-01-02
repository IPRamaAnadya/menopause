"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Video, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

interface Event {
  id: number;
  public_id: string;
  slug: string;
  title: string;
  short_description: string;
  image_url: string | null;
  start_date: string;
  start_time: string | null;
  is_online: boolean;
  is_paid: boolean;
  place_name: string | null;
  capacity: number;
  price_range?: {
    min: number;
    max: number;
  };
}

export function LoungeEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();
  const t = useTranslations('Lounge.events');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events?locale=${locale}&limit=5`);
        const data = await response.json();
        // Get first 5 events only
        setEvents(data.data?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [locale]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">{t('title')}</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="min-w-[280px] md:min-w-[320px]">
              <div className="h-[180px] md:h-[200px] bg-muted animate-pulse rounded-3xl" />
              <div className="mt-3 h-6 w-24 bg-muted animate-pulse rounded-full" />
              <div className="mt-2 h-5 w-3/4 bg-muted animate-pulse rounded" />
              <div className="mt-2 h-4 w-full bg-muted animate-pulse rounded" />
              <div className="mt-4 h-8 w-full bg-muted animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            {t('title')}
          </h2>
          <p className="text-sm text-muted-foreground hidden md:block">
            {t('description')}
          </p>
        </div>
        <Link href={`/${locale}/member/events`}>
          <Button variant="ghost" size="sm">
            {t('viewAll')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">
          {events.map((event) => (
            <Link 
              key={event.id} 
              href={`/${locale}/member/events/${event.slug}`}
              className="snap-start group"
            >
              <article className="min-w-[280px] md:min-w-[320px]">
                {/* Event Image */}
                <div className="relative aspect-video overflow-hidden rounded-3xl bg-gray-100">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                      <Calendar className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Event Info */}
                <div className="mt-4">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.is_online && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        <Video className="w-3 h-3 mr-1" />
                        Online
                      </span>
                    )}
                    {!event.is_paid && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Free
                      </span>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {event.short_description}
                  </p>

                  {/* Price for Paid Events */}
                  {event.is_paid && event.price_range && (
                    <div className="mt-3">
                      <span className="text-base font-semibold text-gray-900">
                        {formatPrice(event.price_range.min)}
                        {event.price_range.min !== event.price_range.max && ` - ${formatPrice(event.price_range.max)}`}
                      </span>
                    </div>
                  )}

                  {/* Event Meta */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        {formatDate(event.start_date)}
                        {event.start_time && ` • ${event.start_time}`}
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
                        <span>{event.capacity} {t('spotsLeft')}</span>
                      </div>
                    )}
                  </div>

                  {/* Register Button */}
                  <button className="mt-4 w-full inline-block rounded-full border border-teal-600 px-4 py-2 text-sm font-medium text-teal-600 transition hover:bg-teal-600 hover:text-white text-center">
                    {t('registerNow')}
                  </button>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* Scroll indicator for mobile */}
      <p className="text-xs text-center text-muted-foreground md:hidden">
        {t('swipeToSeeMore')}
      </p>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
