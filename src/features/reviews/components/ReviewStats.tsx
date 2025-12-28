"use client";

import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import { useReviewStats } from '@/features/reviews/hooks/useReviewStats';
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewStatsProps {
  articleId: number;
}

export function ReviewStats({ articleId }: ReviewStatsProps) {
  const t = useTranslations('Reviews');
  const { stats, loading } = useReviewStats(articleId);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h4 className="font-semibold mb-4">{t('ratingOverview')}</h4>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(stats.averageRating)
                    ? 'fill-primary text-primary'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {stats.totalReviews} {stats.totalReviews === 1 ? t('reviewOne') : t('reviewOther')}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.distribution[rating as keyof typeof stats.distribution];
            const percentage = stats.totalReviews > 0 
              ? Math.round((count / stats.totalReviews) * 100) 
              : 0;

            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">{rating}♥</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
