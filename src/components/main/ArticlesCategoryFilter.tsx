"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePublicCategories } from "@/features/articles/hooks/usePublicCategories";
import { useTranslations, useLocale } from "next-intl";

interface ArticlesCategoryFilterProps {
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function ArticlesCategoryFilter({
  selectedCategoryId,
  onCategoryChange,
  search,
  onSearchChange,
}: ArticlesCategoryFilterProps) {
  const t = useTranslations('MainSite.articles');
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
    }, 500); // 500ms delay
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Calculate the initial offset of the filter
    const updateOffset = () => {
      if (filterRef.current) {
        const rect = filterRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        setFilterOffset(rect.top + scrollTop);
      }
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const navbarHeight = 64; // h-16 = 64px
      
      // Make sticky when the filter would scroll past the navbar
      setIsSticky(scrollPosition + navbarHeight >= filterOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filterOffset]);

  return (
    <>
      {/* Spacer to prevent layout jump when filter becomes fixed */}
      {isSticky && <div style={{ height: filterRef.current?.offsetHeight || 0 }} />}
      
      <div
        ref={filterRef}
        className={`
          transition-all duration-300 z-40
          ${isSticky 
            ? 'relative bg-transparent py-8' 
            : 'relative bg-transparent py-8'
          }
        `}
      >
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide border-b border-gray-200">
              {/* All Categories Button */}
              <button
                onClick={() => onCategoryChange(null)}
                className={`
                  relative whitespace-nowrap px-6 py-3 font-medium text-sm transition-all
                  ${selectedCategoryId === null
                    ? 'text-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {t('all')}
                {selectedCategoryId === null && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
                )}
              </button>

              {/* Category Buttons */}
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 w-24 bg-gray-200 animate-pulse"
                  />
                ))
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`
                      relative whitespace-nowrap px-6 py-3 font-medium text-sm transition-all
                      ${selectedCategoryId === category.id
                        ? 'text-teal-600'
                        : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    {category.name}
                    {selectedCategoryId === category.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Search Field */}
          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder') || 'Search articles...'}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-11 pr-4 rounded-full border-gray-300 focus:border-teal-500 focus:ring-teal-500 h-11"
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
