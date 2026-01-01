"use client";

import { useTranslations } from 'next-intl';

export function EventsPageHeader() {
  const t = useTranslations('MainSite.events');

  return (
    <section className="w-full bg-white px-6 py-2 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl">
          {/* Small label */}
          <span className="inline-block rounded-full bg-pink-50 px-4 py-1 text-xs font-medium text-pink-600">
            {t('page.badge')}
          </span>

          {/* Main heading */}
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t('page.heading')}
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-2xl text-base text-gray-500">
            {t('page.description')}
          </p>
        </div>
      </div>
    </section>
  );
}
