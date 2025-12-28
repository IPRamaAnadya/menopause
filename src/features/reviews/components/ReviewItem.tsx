"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { formatLocalDate } from '@/lib/datetime';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { ArticleReview } from '@/features/reviews/types';
import { ReviewForm } from './ReviewForm';
import { useReviewActions } from '@/features/reviews/hooks/useReviewActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReviewItemProps {
  review: ArticleReview;
  articleId: number;
  onUpdate: () => void;
  depth?: number;
}

export function ReviewItem({ review, articleId, onUpdate, depth = 0 }: ReviewItemProps) {
  const t = useTranslations('Reviews');
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const { deleteReview, loading } = useReviewActions(articleId, onUpdate);

  const isOwner = session?.user?.id === review.user.id.toString();
  const maxDepth = 2; // Limit reply depth to 2 levels

  const handleDelete = async () => {
    if (confirm(t('confirmDelete'))) {
      await deleteReview(review.id);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onUpdate();
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'} border-l-2 ${depth > 0 ? 'border-gray-200 pl-4' : 'border-transparent'}`}>
      <div className="flex gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {review.user.image ? (
            <Image
              src={review.user.image}
              alt={review.user.name || 'User'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {review.user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900">{review.user.name || 'Anonymous'}</span>
                {review.rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Heart
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating!
                            ? 'fill-primary text-primary'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {formatLocalDate(review.created_at, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Actions Dropdown */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDelete} disabled={loading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Review Text */}
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{review.content}</p>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-4">
            {session && depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-gray-600 hover:text-gray-900"
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                {t('reply')}
              </Button>
            )}

            {review.replies && review.replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="text-gray-600 hover:text-gray-900"
              >
                {showReplies ? t('hide') : t('show')} {review.replies.length} {review.replies.length === 1 ? t('replyOne') : t('replyOther')}
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4">
              <ReviewForm
                articleId={articleId}
                parentId={review.id}
                onSuccess={handleReplySuccess}
                onCancel={() => setShowReplyForm(false)}
                showRating={false}
              />
            </div>
          )}

          {/* Nested Replies */}
          {showReplies && review.replies && review.replies.length > 0 && (
            <div className="mt-2">
              {review.replies.map((reply) => (
                <ReviewItem
                  key={reply.id}
                  review={reply}
                  articleId={articleId}
                  onUpdate={onUpdate}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
