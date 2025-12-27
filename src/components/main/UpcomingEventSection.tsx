"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function UpcomingEventSection() {
  const t = useTranslations('MainSite.upcomingEvent');
  
  // Set the event date (example: January 15, 2026)
  const eventDate = new Date('2026-01-15T19:00:00').getTime();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = eventDate - now;

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
  }, [eventDate]);

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
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200"
                alt={t('imageAlt')}
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
                {t('title')}
              </h2>

              <p className="mt-4 max-w-md text-sm text-gray-600">
                {t('description')}
              </p>

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

              <p className="mt-4 text-xs text-gray-500">
                {t('date')}
              </p>

              {/* CTA */}
              <div className="mt-20 flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="rounded-full bg-pink-600 px-6 py-2 text-sm font-medium text-white hover:bg-pink-700"
                >
                  {t('cta.button')}
                </Button>

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
