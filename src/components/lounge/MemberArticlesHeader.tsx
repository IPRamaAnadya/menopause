"use client";

import { useTranslations } from 'next-intl';

export function MemberArticlesHeader() {
  const t = useTranslations('Lounge.articles');

  return (
    <section className="w-full bg-gradient-to-br from-teal-50 via-white to-pink-50 px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-teal-600/30">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Member Exclusive
          </span>

          {/* Main heading */}
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t('pageTitle') || 'Articles & Resources'}
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-2xl text-base text-gray-600">
            {t('pageDescription') || 'Access exclusive articles, research, and insights curated for our valued members.'}
          </p>
        </div>
      </div>
    </section>
  );
}
