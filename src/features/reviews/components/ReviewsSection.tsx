"use client";

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { useArticleReviews } from '@/features/reviews/hooks/useArticleReviews';
import { ReviewForm } from './ReviewForm';
import { ReviewItem } from './ReviewItem';
import { useTranslations } from 'next-intl';

interface ReviewsSectionProps {
  articleId: number;
}

export function ReviewsSection({ articleId }: ReviewsSectionProps) {
  const t = useTranslations('Reviews');
  const { reviews, loading, error, total, hasMore, loadMore, refresh } = useArticleReviews(articleId);

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">{t('title')}</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          {/* <MessageSquare className="h-6 w-6" /> */}
          {t('title')} {total > 0 && `(${total})`}
        </h3>
      </div>

      {/* Review Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6">
        <h4 className="font-semibold mb-4">{t('writeReview')}</h4>
        <ReviewForm articleId={articleId} onSuccess={refresh} />
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-gray-200 bg-gray-50">
          {/* <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" /> */}
          <p className="text-gray-600">{t('noReviews')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-gray-200 bg-white p-4 md:p-6">
              <ReviewItem review={review} articleId={articleId} onUpdate={refresh} />
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? t('loading') : t('loadMore')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
