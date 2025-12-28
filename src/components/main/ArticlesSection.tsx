"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicArticles } from '@/features/articles/hooks/usePublicArticles';
import { usePublicMembershipLevels } from '@/features/membership/hooks/usePublicMembershipLevels';
import { Article } from '@/features/articles/types';
import { MembershipDialog } from '@/components/main/MembershipDialog';

export function ArticlesSection() {
  const t = useTranslations('MainSite.articles');
  const locale = useLocale();
  const { articles, loading, error } = usePublicArticles({ locale, limit: 6 });
  const { membershipLevels } = usePublicMembershipLevels();
  const [showMembershipDialog, setShowMembershipDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const handleArticleClick = (article: Article, e: React.MouseEvent) => {
    if (article.hide) {
      e.preventDefault();
      setSelectedArticle(article);
      setShowMembershipDialog(true);
    }
  };

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
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="group">
                <Skeleton className="h-[260px] w-full rounded-3xl" />
                <Skeleton className="mt-5 h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <Skeleton className="mt-4 h-9 w-24 rounded-full" />
              </div>
            ))
          ) : error ? (
            // Error State
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">{error}</p>
            </div>
          ) : articles.length === 0 ? (
            // Empty State
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">{t('noArticles') || 'No articles available'}</p>
            </div>
          ) : (
            // Articles
            articles.map((article) => {
              const ArticleWrapper = article.hide ? 'div' : Link;
              const wrapperProps = article.hide
                ? { onClick: (e: React.MouseEvent) => handleArticleClick(article, e), className: "cursor-pointer" }
                : { href: `/articles/${article.slug}` };

              const membershipLevel = article.required_priority
                ? membershipLevels.find(level => level.priority === article.required_priority)
                : null;

              return (
                <ArticleWrapper key={article.id} {...(wrapperProps as any)}>
                  <article className="group">

                    <div className="relative h-[260px] overflow-hidden rounded-3xl bg-gray-100">
                      {article.image_url ? (
                        <Image
                          src={article.image_url}
                          alt={article.title || ''}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <span className="text-gray-400 text-4xl">📄</span>
                        </div>
                      )}
                    </div>


                    {/* Membership Badge */}
                    {article.hide && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {membershipLevel?.name || t('membersOnly') || 'Members Only'}
                        </span>
                      </div>
                    )}

                    <h3 className=" text-base font-semibold text-gray-900 line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                      {article.excerpt}
                    </p>

                    {!article.hide && (
                      <div className="mt-4 inline-block rounded-full border border-teal-600 px-4 py-1.5 text-sm font-medium text-teal-600 transition hover:bg-teal-600 hover:text-white">
                        {t('readMore')}
                      </div>
                    )}
                  </article>
                </ArticleWrapper>
              );
            })
          )}
        </div>

        {/* View All Button */}
        {!loading && articles.length > 0 && (
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/articles">{t('viewAll')}</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Membership Dialog */}
      <MembershipDialog
        open={showMembershipDialog}
        onOpenChange={setShowMembershipDialog}
        title={selectedArticle?.title}
        description={selectedArticle?.excerpt}
      />
    </section>
  );
}
