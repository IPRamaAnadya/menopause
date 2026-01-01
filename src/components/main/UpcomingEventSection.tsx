"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Video, Clock } from 'lucide-react';

interface UpcomingEvent {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  is_online: boolean;
  is_paid: boolean;
  place_name?: string;
}

export function UpcomingEventSection() {
  const t = useTranslations('MainSite.upcomingEvent');
  const locale = useLocale();
  const [event, setEvent] = useState<UpcomingEvent | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fetch upcoming event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/upcoming?locale=${locale}`);
        const result = await response.json();
        if (result.success && result.data) {
          setEvent(result.data);
        }
      } catch (error) {
        console.error('Error fetching upcoming event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [locale]);

  // Calculate countdown
  useEffect(() => {
    if (!event) return;

    const eventDateTime = event.start_time 
      ? new Date(`${event.start_date}T${event.start_time}`).getTime()
      : new Date(`${event.start_date}T00:00:00`).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = eventDateTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [event]);

  // Format date for display
  const formatDate = (dateString: string, timeString: string | null) => {
    const date = new Date(dateString + 'T00:00:00');
    const formattedDate = date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    if (timeString) {
      return `${formattedDate} at ${timeString}`;
    }
    return formattedDate;
  };

  if (loading) {
    return (
      <section className="w-full py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-3xl bg-[#FBF7E6] p-6 md:p-10">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!event) {
    return null; // Don't show section if no upcoming events
  }

  const countdown = [
    { label: t('countdown.days'), value: String(timeLeft.days).padStart(2, '0') },
    { label: t('countdown.hours'), value: String(timeLeft.hours).padStart(2, '0') },
    { label: t('countdown.minutes'), value: String(timeLeft.minutes).padStart(2, '0') },
    { label: t('countdown.seconds'), value: String(timeLeft.seconds).padStart(2, '0') },
  ];

  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-3xl bg-[#FBF7E6] p-6 md:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left - Image */}
            <div className="relative h-[350px] overflow-hidden rounded-2xl md:h-[420px]">
              <Image
                src={event.image_url || "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200"}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Right - Content */}
            <div>
              <div className="inline-flex items-center justify-center px-4 py-1 rounded-full border-1 border-muted-foreground/30 mb-2 ">
                <span className="text-sm text-muted-foreground">{t('badge')}</span>
              </div>

              <h2 className="mt-2 text-2xl font-semibold text-gray-900 md:text-3xl">
                {event.title}
              </h2>

              <p className="mt-4 max-w-md text-sm text-gray-600">
                {event.short_description}
              </p>

              {/* Event Details */}
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.start_date, event.start_time)}</span>
                </div>
                {event.is_online ? (
                  <div className="flex items-center gap-1.5">
                    <Video className="w-4 h-4" />
                    <span>Online Event</span>
                  </div>
                ) : event.place_name && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{event.place_name}</span>
                  </div>
                )}
              </div>

              {/* Countdown */}
              <div className="mt-6 flex gap-3">
                {countdown.map((item) => (
                  <div
                    key={item.label}
                    className="flex min-w-[64px] flex-col items-center rounded-xl bg-white px-3 py-2"
                  >
                    <span className="text-base font-semibold text-gray-900">
                      {item.value}
                    </span>
                    <span className="text-[10px] uppercase text-gray-500">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-20 flex flex-wrap items-center gap-4">
                <Link href={`/events/${event.slug}`}>
                  <Button
                    size="lg"
                    className="rounded-full bg-pink-600 px-6 py-2 text-sm font-medium text-white hover:bg-pink-700"
                  >
                    {t('cta.button')}
                  </Button>
                </Link>

                <p className="text-sm text-gray-500">
                  {t('cta.text')}{" "}
                  <Link
                    href="/events"
                    className="font-medium text-teal-600 hover:underline"
                  >
                    {t('cta.link')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
