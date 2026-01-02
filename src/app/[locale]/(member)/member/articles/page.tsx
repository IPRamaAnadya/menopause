"use client";

import { useState } from 'react';
import { ArticlesPageHeader } from '@/components/main/ArticlesPageHeader';
import { MemberArticlesGrid } from '@/components/lounge/MemberArticlesGrid';
import { HighlightedArticlesSection } from '@/components/main/HighlightedArticlesSection';
import { ArticlesCategoryFilter } from '@/components/main/ArticlesCategoryFilter';

export default function MemberArticlesPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen">
      <ArticlesPageHeader />
      <HighlightedArticlesSection />
      <ArticlesCategoryFilter
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        search={search}
        onSearchChange={setSearch}
      />
      <MemberArticlesGrid categoryId={selectedCategoryId} search={search} />
    </div>
  );
}
