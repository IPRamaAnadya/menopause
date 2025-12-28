"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart } from 'lucide-react';
import { useReviewActions } from '@/features/reviews/hooks/useReviewActions';
import Link from 'next/link';

interface ReviewFormProps {
  articleId: number;
  parentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  showRating?: boolean;
  placeholder?: string;
  submitText?: string;
}

export function ReviewForm({
  articleId,
  parentId,
  onSuccess,
  onCancel,
  showRating = true,
  placeholder,
  submitText,
}: ReviewFormProps) {
  const t = useTranslations('Reviews');
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [hoveredRating, setHoveredRating] = useState<number | undefined>(undefined);
  const { createReview, loading } = useReviewActions(articleId, onSuccess);

  const actualPlaceholder = placeholder || (parentId ? t('replyPlaceholder') : t('placeholder'));
  const actualSubmitText = submitText || (parentId ? t('postReply') : t('postReview'));

  if (!session) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-600 mb-4">{t('mustLogin')}</p>
        <Button asChild>
          <Link href="/auth/signin">{t('signIn')}</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      await createReview({
        article_id: articleId,
        content: content.trim(),
        rating: showRating ? rating : undefined,
        parent_id: parentId,
      });
      setContent('');
      setRating(undefined);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showRating && !parentId && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t('rating')}</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((heart) => (
              <button
                key={heart}
                type="button"
                onClick={() => setRating(heart)}
                onMouseEnter={() => setHoveredRating(heart)}
                onMouseLeave={() => setHoveredRating(undefined)}
                className="transition-transform hover:scale-110"
              >
                <Heart
                  className={`h-6 w-6 ${
                    heart <= (hoveredRating || rating || 0)
                      ? 'fill-primary text-primary'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating && (
            <span className="text-sm text-gray-600">({rating} {rating !== 1 ? t('heartOther') : t('heartOne')})</span>
          )}
        </div>
      )}
      
      <Textarea
        placeholder={actualPlaceholder}
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        rows={parentId ? 3 : 4}
        required
        disabled={loading}
      />
      
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {t('cancel')}
          </Button>
        )}
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? t('posting') : actualSubmitText}
        </Button>
      </div>
    </form>
  );
}
