"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePublicCategories } from "@/features/articles/hooks/usePublicCategories";
import { useTranslations, useLocale } from "next-intl";

interface MemberArticlesCategoryFilterProps {
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function MemberArticlesCategoryFilter({
  selectedCategoryId,
  onCategoryChange,
  search,
  onSearchChange,
}: MemberArticlesCategoryFilterProps) {
  const t = useTranslations('Lounge.articles');
  const locale = useLocale();
  const { categories, loading } = usePublicCategories({ locale });
  const [isSticky, setIsSticky] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filterOffset, setFilterOffset] = useState(0);
  const [localSearch, setLocalSearch] = useState(search);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local search with prop when it changes externally
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Track filter position for sticky behavior
  useEffect(() => {
    if (!filterRef.current) return;

    const updateOffset = () => {
      if (filterRef.current) {
        setFilterOffset(filterRef.current.offsetTop);
      }
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);

    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (filterOffset > 0) {
        setIsSticky(window.scrollY > filterOffset - 80);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filterOffset]);

  return (
    <div ref={filterRef} className={`bg-white border-y border-gray-200 ${isSticky ? 'sticky top-0 z-40 shadow-sm' : ''} transition-shadow`}>
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-20 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          {/* Categories Filter */}
          <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide w-full lg:w-auto">
            <button
              onClick={() => onCategoryChange(null)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategoryId === null
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-600/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('allCategories') || 'All Categories'}
            </button>

            {loading ? (
              // Loading state for categories
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 w-24 animate-pulse rounded-full bg-gray-100"
                />
              ))
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategoryId === category.id
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-600/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder') || 'Search articles...'}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-11 pr-4 h-11 rounded-full border-gray-200 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
