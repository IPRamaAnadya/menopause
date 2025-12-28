"use client";

import { useState } from 'react';
import { ArticlesPageHeader } from '@/components/main/ArticlesPageHeader';
import { ArticlesGrid } from '@/components/main/ArticlesGrid';
import { HighlightedArticlesSection } from '@/components/main/HighlightedArticlesSection';
import { ArticlesCategoryFilter } from '@/components/main/ArticlesCategoryFilter';
import { RelatedArticlesSection } from '@/components/main/RelatedArticlesSection';

export default function ArticlesPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-white">
      <ArticlesPageHeader />
      <HighlightedArticlesSection />
      <ArticlesCategoryFilter
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        search={search}
        onSearchChange={setSearch}
      />
      <ArticlesGrid categoryId={selectedCategoryId} search={search} />
    </div>
  );
}
