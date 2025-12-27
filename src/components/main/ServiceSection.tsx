'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useFetch } from '@/hooks/useFetch';
import type { Service } from '@/features/services/types';

export function ServiceSection() {

  const t = useTranslations('MainSite.services');
  const locale = typeof window !== 'undefined' ? (navigator.language || 'en') : 'en';
  const { data: servicesRaw = [], loading, fetchData } = useFetch<Service[]>('/api/public/services', { headers: { locale } });
  const services: Service[] = Array.isArray(servicesRaw) ? servicesRaw : [];
  const [activeService, setActiveService] = useState<number>(services[0]?.id || 1);
  const [isImageFading, setIsImageFading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (services.length > 0) setActiveService(services[0].id);
  }, [services]);

  const activeServiceData = services.length > 0 ? services.find((s: Service) => s.id === activeService) || services[0] : undefined;

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full border border-muted-foreground/30 mb-2">
            <span className="text-sm text-muted-foreground">{t('badge')}</span>
          </div>
          <h2 className="mt-2 text-2xl tracking-tight text-gray-900 md:text-3xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500">
            {t('subtitle')}
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:items-center">
          {/* Left - Services List */}
          <div className="relative flex order-1 lg:order-1">
            {/* Continuous vertical line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full" />
            <div className="space-y-8 flex-1">
              {loading || services.length === 0 ? (
                <div className="space-y-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 w-full">
                      <div className="relative z-10">
                        <div className="h-12 w-1 rounded-full bg-gray-200 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <div className="h-5 w-1/3 mb-2 bg-gray-200 animate-pulse rounded" />
                        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                services.map((service: Service) => (
                  <button
                    key={service.id}
                    onClick={() => setActiveService(service.id)}
                    className="flex gap-4 relative w-full text-left transition-all hover:opacity-80"
                  >
                    {/* Highlighted dot/line for active item */}
                    <div className="relative z-10">
                      <div
                        className={`h-12 w-1 rounded-full transition-colors ${
                          activeService === service.id ? "bg-pink-600" : "bg-transparent"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-base font-semibold transition-colors ${
                        activeService === service.id ? "text-pink-600" : "text-gray-900"
                      }`}>
                        {service.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {service.description}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative h-80 w-full overflow-hidden rounded-2xl md:h-95 order-2 lg:order-2">
            <Image
              src={activeServiceData?.image_url || ""}
              alt={t('imageAlt')}
              fill
              className={`object-cover transition-opacity duration-300 ${
                isImageFading ? 'opacity-0' : 'opacity-100'
              }`}
              key={activeService}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gray-50 px-6 py-8 md:flex md:items-center md:justify-between">
          <p className="max-w-xl text-sm text-gray-600">
            {t('cta.description')}
          </p>
          <Button 
            size="lg"
            className="mt-6 rounded-full bg-pink-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-pink-700 md:mt-0"
          >
            {t('cta.button')}
          </Button>
        </div>
      </div>
    </section>
  );
}
