"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { useRelatedArticles } from '@/features/articles/hooks/useRelatedArticles';
import { usePublicMembershipLevels } from '@/features/membership/hooks/usePublicMembershipLevels';
import { MembershipDialog } from '@/components/main/MembershipDialog';
import { Button } from "../ui/button";

interface RelatedArticlesSectionProps {
  articleId: string;
  tags: string[];
  limit?: number;
}

export function RelatedArticlesSection({ articleId, tags, limit = 3 }: RelatedArticlesSectionProps) {
  const t = useTranslations('MainSite.articles');
  const locale = useLocale();
  const [showMembershipDialog, setShowMembershipDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  
  const { articles: relatedArticles, loading } = useRelatedArticles({
    articleId,
    tags,
    locale,
    limit,
  });
  const { membershipLevels } = usePublicMembershipLevels();

  // Don't render if loading or no related articles
  if (loading || relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        {t('relatedArticles') || 'Related Articles'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {relatedArticles.map((relatedArticle) => {
          const relatedTranslation = relatedArticle.translations?.find(t => t.locale === locale) || relatedArticle.translations?.[0];
          
          const handleArticleClick = (e: React.MouseEvent) => {
            if (relatedArticle.hide) {
              e.preventDefault();
              setSelectedArticle(relatedArticle);
              setShowMembershipDialog(true);
            }
          };

          const ArticleWrapper = relatedArticle.hide ? 'div' : Link;
          const wrapperProps = relatedArticle.hide 
            ? { onClick: handleArticleClick, className: "group relative block cursor-pointer" }
            : { href: `/articles/${relatedArticle.slug}`, className: "group relative block" };

          return (
            <ArticleWrapper 
              key={relatedArticle.id}
              {...(wrapperProps as any)}
            >
              {/* Image Container */}
              <div className="relative mb-4 overflow-hidden rounded-3xl h-[260px]">
                {relatedArticle.image_url ? (
                  <Image
                    src={relatedArticle.image_url}
                    alt={relatedTranslation?.title || ''}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">📄</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                {/* Membership Badge */}
                {relatedArticle.visibility !== 'PUBLIC' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    {relatedArticle.visibility === 'MEMBER' 
                      ? 'Members Only' 
                      : membershipLevels.find(level => level.priority === relatedArticle.required_priority)?.name || `Priority ${relatedArticle.required_priority || 1}+`
                    }
                  </span>
                )}

                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
                  {relatedTranslation?.title}
                </h3>
                
                {relatedTranslation?.excerpt && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {relatedTranslation.excerpt}
                  </p>
                )}

                <Button 
                  variant="link" 
                  className="p-0 h-auto text-teal-600 hover:text-teal-700"
                >
                  {t('readMore') || 'Read more'}
                </Button>
              </div>
            </ArticleWrapper>
          );
        })}
      </div>

      {/* Membership Dialog */}
      <MembershipDialog
        open={showMembershipDialog}
        onOpenChange={setShowMembershipDialog}
        title={selectedArticle?.translations?.find((t: any) => t.locale === locale)?.title || selectedArticle?.title}
        description={selectedArticle?.excerpt}
      />
    </div>
  );
}
