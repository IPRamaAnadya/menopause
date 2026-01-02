"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { usePublicArticles } from '@/features/articles/hooks/usePublicArticles';
import { usePublicMembershipLevels } from '@/features/membership/hooks/usePublicMembershipLevels';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MembershipDialog } from '@/components/main/MembershipDialog';
import { formatLocalDate } from '@/lib/datetime';

export function HighlightedArticlesSection() {
  const t = useTranslations('MainSite.highlightedArticles');
  const tArticles = useTranslations('MainSite.articles');
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMembershipDialog, setShowMembershipDialog] = useState(false);
  const { articles, loading, error } = usePublicArticles({ 
    locale, 
    limit: 5,
    highlighted: true 
  });
  const { membershipLevels } = usePublicMembershipLevels();

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <section className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-4">
          {/* Header Skeleton */}
          <div className="mb-8 text-center">
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          {/* Card Skeleton */}
          <Skeleton className="h-[500px] md:h-[600px] w-full rounded-3xl" />
        </div>
      </section>
    );
  }

  if (error || articles.length === 0) {
    return null; // Don't show section if no highlighted articles
  }

  const currentArticle = articles[currentIndex];
  const formattedDate = formatLocalDate(
    currentArticle.published_at,
    { year: 'numeric', month: 'short', day: 'numeric' },
    locale === 'zh-HK' ? 'zh-HK' : 'en-US'
  );

  const handleArticleClick = (e: React.MouseEvent) => {
    if (currentArticle.hide) {
      e.preventDefault();
      setShowMembershipDialog(true);
    }
  };

  const ArticleWrapper = currentArticle.hide ? 'div' : Link;
  const wrapperProps = currentArticle.hide 
    ? { onClick: handleArticleClick, className: "group relative block overflow-hidden rounded-[2.5rem] bg-black cursor-pointer" }
    : { href: `/articles/${currentArticle.slug}`, className: "group relative block overflow-hidden rounded-[2.5rem] bg-black" };

  return (
    <section className="w-full bg-white mb-12">
      <div className="mx-auto max-w-7xl px-4">

        {/* Carousel Card */}
        <div className="relative">
          <ArticleWrapper {...(wrapperProps as any)}>
            {/* Image */}
            <div className="relative h-[500px] md:h-[600px] w-full">
              {currentArticle.image_url ? (
                <Image
                  src={currentArticle.image_url}
                  alt={currentArticle.title || ''}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                  <span className="text-gray-400 text-8xl">📰</span>
                </div>
              )}
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-12 lg:p-16">
              <div className="max-w-4xl">
                {/* Membership Badge */}
                {currentArticle.visibility !== 'PUBLIC' && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      {currentArticle.visibility === 'MEMBER' 
                        ? 'Members Only' 
                        : membershipLevels.find(level => level.priority === currentArticle.required_priority)?.name || `Priority Level ${currentArticle.required_priority || 1}+`
                      }
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl leading-tight text-white md:text-2xl lg:text-3xl mb-4">
                  {currentArticle.title}
                </h3>

                {/* Description */}
                {currentArticle.excerpt && (
                  <p className="mt-4 text-base md:text-base text-gray-200 line-clamp-3 max-w-3xl">
                    {currentArticle.excerpt}
                  </p>
                )}

                {/* Meta */}
                <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-300">
                  <div className="flex items-center gap-4">
                    {currentArticle.category?.name && (
                      <span className="font-semibold text-white text-base">{currentArticle.category.name}</span>
                    )}
                    {formattedDate && (
                      <span className="opacity-80">{formattedDate}</span>
                    )}
                  </div>

                  {/* Tags */}
                  {currentArticle.tags && currentArticle.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {currentArticle.tags.slice(0, 4).map((tag, index) => (
                        <span 
                          key={index}
                          className="rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Arrow icon */}
            <div className="absolute right-8 top-8 z-10 rounded-full bg-white/10 p-3 backdrop-blur transition group-hover:bg-white/20"></div>
            <div className="absolute right-8 top-8 z-10 rounded-full bg-white/10 p-3 backdrop-blur transition group-hover:bg-white/20">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
              </svg>
            </div>
          </ArticleWrapper>

          {/* Navigation Buttons - Only show if more than 1 article */}
          {articles.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 group/btn rounded-full bg-gradient-to-br from-white via-white to-gray-50 p-3 md:p-4 shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:-translate-x-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/20"
                aria-label="Previous article"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-900 transition-transform duration-300 group-hover/btn:-translate-x-0.5" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 group/btn rounded-full bg-gradient-to-br from-white via-white to-gray-50 p-3 md:p-4 shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:translate-x-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/20"
                aria-label="Next article"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-gray-900 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {articles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'bg-white w-8' 
                        : 'bg-white/40 w-2 hover:bg-white/60'
                    }`}
                    aria-label={`Go to article ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Membership Dialog */}
      <MembershipDialog
        open={showMembershipDialog}
        onOpenChange={setShowMembershipDialog}
        title={currentArticle.title}
        description={currentArticle.excerpt}
      />
    </section>
  );
}
