"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicArticles } from '@/features/articles/hooks/usePublicArticles';
import { usePublicMembershipLevels } from '@/features/membership/hooks/usePublicMembershipLevels';
import { MembershipDialog } from '@/components/main/MembershipDialog';

interface MemberArticlesGridProps {
  categoryId?: number | null;
  search?: string;
}

export function MemberArticlesGrid({ categoryId, search }: MemberArticlesGridProps) {
  const t = useTranslations('MainSite.articles');
  const locale = useLocale();
  const [showMembershipDialog, setShowMembershipDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const { articles, loading, error } = usePublicArticles({ 
    locale, 
    search: search || undefined,
    categoryId: categoryId || undefined
  });
  const { membershipLevels } = usePublicMembershipLevels();

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-20 py-12">
      {/* Articles Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 3 }).map((_, index) => (
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
          <div className="col-span-full text-center py-20">
            <div className="mx-auto max-w-md">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <svg
                  className="h-10 w-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('errorTitle')}</h3>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        ) : articles.length === 0 ? (
          // Empty State
          <div className="col-span-full text-center py-20">
            <div className="mx-auto max-w-md">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('noArticles') || 'No articles found'}
              </h3>
              {search ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    {t('noSearchResults', { search })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {t('searchSuggestion')}
                  </p>
                </div>
              ) : categoryId ? (
                <p className="text-sm text-gray-500">
                  {t('noArticlesInCategory')}
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  {t('noArticlesAvailable')}
                </p>
              )}
            </div>
          </div>
        ) : (
          // Articles
          articles.map((article) => {
            const handleArticleClick = (e: React.MouseEvent) => {
              if (article.hide) {
                e.preventDefault();
                setSelectedArticle(article);
                setShowMembershipDialog(true);
              }
            };

            const ArticleWrapper = article.hide ? 'div' : Link;
            const wrapperProps = article.hide 
              ? { onClick: handleArticleClick, className: "cursor-pointer" }
              : { href: `/member/articles/${article.slug}` };

            return (
              <article key={article.id} className="group relative">
                <ArticleWrapper {...(wrapperProps as any)}>
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
                {article.visibility !== 'PUBLIC' && (
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      {article.visibility === 'MEMBER' 
                        ? 'Members Only' 
                        : membershipLevels.find(level => level.priority === article.required_priority)?.name || `Priority Level ${article.required_priority || 1}+`
                      }
                    </span>
                  </div>
                )}

                <h3 className="mt-2 text-base font-semibold text-gray-900 line-clamp-2">
                  {article.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                  {article.excerpt}
                </p>

                {!article.hide && (
                  <Link
                    href={`/member/articles/${article.slug}`}
                    className="mt-4 inline-block rounded-full border border-teal-600 px-4 py-1.5 text-sm font-medium text-teal-600 transition hover:bg-teal-600 hover:text-white"
                  >
                    {t('readMore')}
                  </Link>
                )}
                </ArticleWrapper>

                {article.hide && (
                  <button
                    onClick={() => {
                      setSelectedArticle(article);
                      setShowMembershipDialog(true);
                    }}
                    className="mt-4 inline-block rounded-full border border-teal-600 px-4 py-1.5 text-sm font-medium text-teal-600 transition hover:bg-teal-600 hover:text-white"
                  >
                    {t('readMore')}
                  </button>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Membership Dialog */}
      <MembershipDialog
        open={showMembershipDialog}
        onOpenChange={setShowMembershipDialog}
        title={selectedArticle?.title}
        description={selectedArticle?.excerpt}
      />
    </div>
  );
}
