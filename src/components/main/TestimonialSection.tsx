"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function TestimonialSection() {
  const t = useTranslations('MainSite.testimonial');
  const [active, setActive] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: t('items.alice.quote'),
      name: t('items.alice.name'),
      role: t('items.alice.role'),
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800",
    },
    {
      id: 2,
      quote: t('items.michelle.quote'),
      name: t('items.michelle.name'),
      role: t('items.michelle.role'),
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800",
    },
  ];

  const testimonial = testimonials[active];

  const handlePrevious = () => {
    setActive((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActive((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full border-1 border-muted-foreground/30 mb-2">
            <span className="text-sm text-muted-foreground">{t('badge')}</span>
          </div>
          <h2 className="mt-2 text-2xl uppercase text-gray-900 md:text-3xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500">
            {t('subtitle')}
          </p>
        </div>

        {/* Content */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Quote */}
          <div>
            <div className="-mb-10 text-pink-600 text-8xl leading-none font-quote font-bold -mb-4" style={{ fontFamily: 'var(--font-quote)' }}>"</div>
            <p className="max-w-xl text-xl font-medium text-teal-700">
              {testimonial.quote}
            </p>

            {/* Navigation */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handlePrevious}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative h-[360px] overflow-hidden rounded-2xl">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                fill
                className="object-cover"
                key={active}
              />
            </div>

            <div className="absolute bottom-4 left-4 rounded-xl bg-white px-4 py-2 shadow">
              <p className="text-sm font-semibold text-gray-900">
                {testimonial.name}
              </p>
              <p className="text-xs text-gray-500">{testimonial.role}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
