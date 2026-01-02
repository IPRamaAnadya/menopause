"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Article } from '@/features/articles/types';
import { RelatedArticlesSection } from '@/components/main/RelatedArticlesSection';
import { formatLocalDate } from '@/lib/datetime';
import { ReviewsSection, ReviewStats } from '@/features/reviews/components';

export default function MemberArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const t = useTranslations('MainSite.articles');
  const locale = useLocale();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/public/articles/${resolvedParams.slug}`, {
          headers: {
            'locale': locale,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Article not found');
          }
          throw new Error('Failed to fetch article');
        }

        const result = await response.json();
        
        // Handle new API response structure
        if (result.success && result.data) {
          setArticle(result.data);
        } else {
          throw new Error(result.error?.message || 'Failed to fetch article');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [resolvedParams.slug, locale]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <Skeleton className="h-10 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-[400px] w-full rounded-lg mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <Button variant="ghost" size="sm" asChild className="mb-8">
            <Link href="/member/articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToArticles') || 'Back to Articles'}
            </Link>
          </Button>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error === 'Article not found' ? 'Article Not Found' : 'Error Loading Article'}
            </h1>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const translation = article.translations?.find(t => t.locale === locale) || article.translations?.[0];
  const formattedDate = formatLocalDate(
    article.published_at,
    { year: 'numeric', month: 'long', day: 'numeric' },
    locale === 'zh-HK' ? 'zh-HK' : 'en-US'
  );

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/member/articles">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToArticles') || 'Back to Articles'}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <header className="mx-auto max-w-4xl px-6 pt-8 pb-8 text-center">
        {/* Title */}
        <h1 className="text-xl md:text-2xl lg:text-3xl leading-tight text-gray-900 sm:text-4xl">
          {translation?.title}
        </h1>

        {/* Category & Tags */}
        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          {article.category && (
            <span className="rounded-full border border-teal-200 px-3 py-1 text-xs text-teal-600">
              {article.category.name}
            </span>
          )}
          {article.tags && article.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="rounded-full border border-blue-200 px-3 py-1 text-xs text-blue-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Featured Image - Full Width */}
      {article.image_url && (
        <div className="w-full px-6 md:px-20 lg:px-48">
          <Image
            src={article.image_url}
            alt={translation?.title || ''}
            width={1920}
            height={800}
            className="w-full h-auto rounded-2xl"
            priority
          />
        </div>
      )}

      {/* Content Section with Sidebar */}
      <div className="mx-auto w-full px-6 md:px-20 lg:px-48 py-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar - Metadata */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-6">
              {/* Author Info */}
              <div className="flex lg:flex-col items-start gap-3">
                <div className="flex items-center gap-3">
                  {article.author ? (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-primary text-base font-semibold shrink-0">
                        {article.author.name?.substring(0, 2).toUpperCase() || 'AU'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{article.author.name}</p>
                        <p className="text-xs text-gray-500">{formattedDate}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-700 text-base font-semibold shrink-0">
                        HK
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">The Hong Kong Menopause Society</p>
                        <p className="text-xs text-gray-500">{formattedDate}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Reading Time */}
              {translation?.description && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{Math.ceil(translation.description.length / 1000)} {t('minutesRead') || 'Minutes Read'}</span>
                </div>
              )}

            </div>
          </aside>

          {/* Main Content */}
          <article className="min-w-0 break-words overflow-hidden">
            {/* Article Excerpt */}
            {translation?.excerpt && (
              <div className="text-lg text-gray-600 leading-relaxed mb-8 pb-8 border-b border-gray-200 break-words">
                {translation.excerpt}
              </div>
            )}

            {/* Article Content */}
            {translation?.description && (
              <section 
                className="prose prose-gray max-w-none prose-p:leading-relaxed prose-p:text-gray-700 prose-headings:text-gray-900 prose-h2:mt-10 prose-h2:text-2xl prose-h2:font-semibold prose-h3:mt-8 prose-h3:text-xl prose-h3:font-semibold prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:w-full prose-pre:overflow-x-auto prose-code:break-words"
                dangerouslySetInnerHTML={{ __html: translation.description }}
              />
            )}
          </article>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 space-y-8">
          <ReviewStats articleId={article.id} />
          <ReviewsSection articleId={article.id} />
        </div>

        {/* Related Articles Section */}
        {article && (
          <RelatedArticlesSection
            articleId={String(article.id)}
            tags={article.tags || []}
            limit={3}
          />
        )}
      </div>
    </div>
  );
}
