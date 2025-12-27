"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function ArticlesSection() {
  const t = useTranslations('MainSite.articles');

  const articles = [
    {
      id: 1,
      title: t('items.menopause.title'),
      description: t('items.menopause.description'),
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1200",
      href: "/articles/menopause-importance",
    },
    {
      id: 2,
      title: t('items.healthy.title'),
      description: t('items.healthy.description'),
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200",
      href: "/articles/healthy-happy",
    },
    {
      id: 3,
      title: t('items.mindfulness.title'),
      description: t('items.mindfulness.description'),
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200",
      href: "/articles/control-mind",
    },
  ];

  return (
    <section className="w-full bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full border-1 border-muted-foreground/30 mb-2">
            <span className="text-sm text-muted-foreground">{t('badge')}</span>
          </div>
          <h2 className="mt-2 text-2xl text-gray-900 md:text-3xl uppercase">
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500">
            {t('subtitle')}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article.id} className="group">
              <div className="relative h-[260px] overflow-hidden rounded-3xl">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <h3 className="mt-5 text-base font-semibold text-gray-900">
                {article.title}
              </h3>

              <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                {article.description}
              </p>

              <Link
                href={article.href}
                className="mt-4 inline-block rounded-full border border-teal-600 px-4 py-1.5 text-sm font-medium text-teal-600 transition hover:bg-teal-600 hover:text-white"
              >
                {t('readMore')}
              </Link>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/articles">{t('viewAll')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
