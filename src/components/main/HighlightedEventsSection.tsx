"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { usePublicEvents } from '@/features/event/hooks/usePublicEvents';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Video, Users } from 'lucide-react';

export function HighlightedEventsSection() {
  const t = useTranslations('MainSite.highlightedEvents');
  const tEvents = useTranslations('MainSite.events');
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { events, loading, error } = usePublicEvents({ 
    locale,
    timeFilter: 'upcoming',
    highlighted: true,
    limit: 5,
  });

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

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
      <section className="w-full bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          {/* Header Skeleton */}
          <div className="mb-8 text-center">
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          {/* Card Skeleton */}
          <Skeleton className="h-[500px] md:h-[600px] w-full rounded-3xl" />
        </div>
      </section>
    );
  }

  if (error || events.length === 0) {
    return null; // Don't show section if no highlighted events
  }

  const currentEvent = events[currentIndex];

  return (
    <section className="w-full bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Carousel Card */}
        <div className="relative">
          <Link
            href={`/events/${currentEvent.slug}`}
            className="group relative block overflow-hidden rounded-[2.5rem] bg-black"
          >
            {/* Image */}
            <div className="relative h-[500px] md:h-[600px] w-full">
              {currentEvent.image_url ? (
                <Image
                  src={currentEvent.image_url}
                  alt={currentEvent.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                  <Calendar className="h-20 w-20 text-gray-400" />
                </div>
              )}
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-12 lg:p-16">
              <div className="max-w-4xl">
                {/* Event Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentEvent.is_online && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
                      <Video className="w-4 h-4" />
                      Online Event
                    </span>
                  )}
                  {!currentEvent.is_paid && (
                    <span className="inline-flex items-center rounded-full bg-green-500/90 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
                      Free Event
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl leading-tight text-white md:text-2xl lg:text-3xl mb-4">
                  {currentEvent.title}
                </h3>

                {/* Description */}
                {currentEvent.short_description && (
                  <p className="mt-4 text-base md:text-base text-gray-200 line-clamp-3 max-w-3xl">
                    {currentEvent.short_description}
                  </p>
                )}

                {/* Meta Information */}
                <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-300">
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(currentEvent.start_date)}
                      {currentEvent.start_time && ` • ${currentEvent.start_time}`}
                    </span>
                  </div>

                  {/* Location */}
                  {!currentEvent.is_online && currentEvent.place_name && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{currentEvent.place_name}</span>
                    </div>
                  )}

                  {/* Capacity */}
                  {currentEvent.capacity > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{tEvents('capacity')}: {currentEvent.capacity}</span>
                    </div>
                  )}
                </div>

                {/* Price Information */}
                {currentEvent.is_paid && currentEvent.price_range && (
                  <div className="mt-4 inline-block">
                    <div className="rounded-full bg-white/15 px-6 py-2 backdrop-blur">
                      <span className="text-lg font-semibold text-white">
                        {formatPrice(currentEvent.price_range.min)}
                        {currentEvent.price_range.min !== currentEvent.price_range.max && 
                          ` - ${formatPrice(currentEvent.price_range.max)}`}
                      </span>
                      <span className="ml-2 text-sm text-gray-300">
                        {currentEvent.has_member_price 
                          ? tEvents('pricingWithMembership')
                          : tEvents('pricingPublic')
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow icon */}
            <div className="absolute right-8 top-8 z-10 rounded-full bg-white/10 p-3 backdrop-blur transition group-hover:bg-white/20">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
              </svg>
            </div>
          </Link>

          {/* Navigation Buttons - Only show if more than 1 event */}
          {events.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur transition hover:bg-white hover:scale-110"
                aria-label="Previous event"
              >
                <ChevronLeft className="h-6 w-6 text-gray-900" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur transition hover:bg-white hover:scale-110"
                aria-label="Next event"
              >
                <ChevronRight className="h-6 w-6 text-gray-900" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {events.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'bg-white w-8' 
                        : 'bg-white/40 w-2 hover:bg-white/60'
                    }`}
                    aria-label={`Go to event ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
