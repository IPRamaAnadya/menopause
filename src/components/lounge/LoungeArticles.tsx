"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image_url: string | null;
  category?: {
    name: string;
  };
}

export function LoungeArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Lounge.articles');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/public/articles', {
          headers: { 'locale': locale }
        });
        const data = await response.json();
        // Get first 5 articles only
        setArticles(data.data?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [locale]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">{t('title')}</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="min-w-[280px] md:min-w-[320px]">
              <div className="h-[220px] md:h-[260px] bg-muted animate-pulse rounded-3xl" />
              <div className="mt-3 h-6 w-24 bg-muted animate-pulse rounded-full" />
              <div className="mt-2 h-5 w-3/4 bg-muted animate-pulse rounded" />
              <div className="mt-2 h-4 w-full bg-muted animate-pulse rounded" />
              <div className="mt-4 h-8 w-24 bg-muted animate-pulse rounded-full" />
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
            <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            {t('title')}
          </h2>
          <p className="text-sm text-muted-foreground hidden md:block">
            {t('description')}
          </p>
        </div>
        <Link href={`/${locale}/member/articles`}>
          <Button variant="ghost" size="sm">
            {t('viewAll')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">
          {articles.map((article) => (
            <Link 
              key={article.id} 
              href={`/${locale}/member/articles/${article.slug}`}
              className="snap-start group"
            >
              <article className="min-w-[280px] md:min-w-[320px]">
                {/* Article Image */}
                <div className="relative h-[220px] md:h-[260px] overflow-hidden rounded-3xl bg-gray-100">
                  {article.image_url ? (
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-gray-400 text-4xl">📄</span>
                    </div>
                  )}
                </div>

                {/* Category Badge */}
                {article.category && (
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                      {article.category.name}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="mt-2 text-base font-semibold text-gray-900 line-clamp-2">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Read More Button */}
                <button className="mt-4 inline-block rounded-full border border-teal-600 px-4 py-1.5 text-sm font-medium text-teal-600 transition hover:bg-teal-600 hover:text-white">
                  {t('readMore')}
                </button>
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
